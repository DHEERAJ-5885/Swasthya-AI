const Screening = require('../models/Screening');
const Alert = require('../models/Alert');
const Patient = require('../models/Patient');
const { analyzePatientData } = require('../services/aiEngine');
const { createNotification } = require('./notificationController');

const createScreening = async (req, res) => {
  try {
    const { patientId, data } = req.body;
    const workerId = req.userId; // Use authenticated worker ID, not from body

    const patient = await Patient.findOne({ _id: patientId, worker: workerId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Fetch previous screening BEFORE analysis to send historical data to AI
    const previousScreening = await Screening.findOne({ patientId }).sort({ createdAt: -1 });
    
    // Pass both current and previous data to the new AI engine
    const aiResult = await analyzePatientData(data, previousScreening ? previousScreening.data : null);
    
    // Format final result using AI response directly
    let finalResult = { 
      ...aiResult,
      previousData: previousScreening ? previousScreening.data : null,
      currentData: data
    };
    
    // Backwards compatibility mappings
    finalResult.trend = aiResult.trendDirection || 'No Data';
    finalResult.explanation = aiResult.aiExplanation || finalResult.explanation;
    finalResult.drift = aiResult.previousComparison || [];
    
    const screening = new Screening({
      patientId,
      data,
      result: finalResult
    });
    
    // Generate Blockchain Verification Payload before saving
    try {
      const verificationService = require('../blockchain/services/verificationService');
      const rawData = {
        patientId: patientId,
        screeningId: screening._id,
        ashaWorkerId: workerId,
        screeningTimestamp: screening.createdAt,
        aiResultVersion: 'v1.0',
        reportVersion: '1.0'
      };

      const verificationResult = verificationService.generateHash(rawData);
      
      if (verificationResult.success) {
        screening.verification = {
          version: "1.0",
          status: "READY_FOR_BLOCKCHAIN",
          recordHash: verificationResult.hash,
          payloadVersion: "1.0",
          generatedAt: new Date(),
          blockchainNetwork: process.env.CARDANO_NETWORK || "Preprod",
          verificationPayload: verificationResult.payload
        };
      } else {
        console.warn('Verification hash generation failed. Proceeding without verification metadata.');
      }
    } catch (verifError) {
      console.error('Error generating verification payload:', verifError.message);
      // Non-blocking error: do not crash or abort the healthcare workflow
    }
    
    await screening.save();

    // 1. Create Patient Alert if High Risk or Critical Drift
    if (['High Risk'].includes(finalResult.riskLevel) || finalResult.trendDirection === 'Critical Drift') {
      const alert = new Alert({
        type: 'Emergency',
        title: 'Emergency Referral Required',
        message: `Patient needs immediate attention. ${finalResult.aiExplanation || finalResult.reason}`,
        patientId: patientId
      });
      await alert.save();
      
      // Create notification for worker
      if (workerId) {
        await createNotification(
          workerId,
          patientId,
          'emergency',
          'Emergency Alert',
          `High-risk patient detected. ${finalResult.aiExplanation || finalResult.reason}`,
          'critical'
        );
      }
    }

    // 2. Schedule Follow-up if Declining, Critical, or High Risk
    if (['Declining', 'Critical Drift'].includes(finalResult.trendDirection) || ['High Risk'].includes(finalResult.riskLevel)) {
      const FollowUp = require('../models/FollowUp');
      
      let followUpDays = 7;
      if (finalResult.trendDirection === 'Declining') followUpDays = 3;
      if (finalResult.trendDirection === 'Critical Drift' || ['High Risk'].includes(finalResult.riskLevel)) followUpDays = 1;
      
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + followUpDays);
      
      const followUp = new FollowUp({
        patientId,
        patientName: patient.name,
        village: patient.village,
        workerId: workerId,
        date: followUpDate,
        time: "09:00",
        notes: finalResult.followUpRecommendation || 'Urgent AI Drift Detection Follow-up',
        reason: 'Automated screening follow-up due to high risk/critical drift',
        priority: ['High Risk'].includes(finalResult.riskLevel) ? 'High' : 'Medium',
        riskLevel: finalResult.riskLevel,
        status: 'Pending'
      });
      await followUp.save();
      
      // Create notification for follow-up needed
      if (workerId) {
        await createNotification(
          workerId,
          patientId,
          'high_risk',
          'Follow-up Required',
          `Patient requires follow-up in ${followUpDays} day(s). Risk level: ${finalResult.riskLevel}`,
          'high'
        );
      }
    }
    
    // 3. Asynchronously submit to Cardano (fire-and-forget)
    if (screening.verification && screening.verification.recordHash) {
      // Enforce idempotency: prevent duplicate transaction if already pending, verified or txHash exists
      if (!screening.verification.txHash && screening.verification.status !== 'VERIFIED') {
        const cardanoService = require('../blockchain/services/cardanoService');
        const screeningId = screening._id;
        
        // Fire and forget closure
        (async () => {
          try {
            // Update status to PENDING before submission
            await Screening.updateOne(
              { _id: screeningId }, 
              { $set: { "verification.status": "PENDING" } }
            );

            // Submit transaction
            const result = await cardanoService.anchorHealthRecord(screening.verification.recordHash);
            
            if (result.success) {
              // Update with returned txHash (still PENDING)
              await Screening.updateOne(
                { _id: screeningId }, 
                { $set: { 
                    "verification.txHash": result.txHash,
                    "verification.blockchainNetwork": result.network || "Preprod",
                    "verification.status": "PENDING"
                  } 
                }
              );

              // Wait for confirmation on-chain
              const isConfirmed = await cardanoService.awaitTxConfirmation(result.txHash);
              
              if (isConfirmed) {
                // Permanently verify
                await Screening.updateOne(
                  { _id: screeningId }, 
                  { $set: { 
                      "verification.status": "VERIFIED",
                      "verification.anchoredAt": new Date()
                    } 
                  }
                );
              }
            } else {
              // Revert on failure
              console.error('Cardano submission failed:', result.error);
              await Screening.updateOne(
                { _id: screeningId }, 
                { $set: { "verification.status": "FAILED" } }
              );
            }
          } catch (bgError) {
            console.error('Background Cardano error:', bgError.message);
            await Screening.updateOne(
              { _id: screeningId }, 
              { $set: { "verification.status": "FAILED" } }
            ).catch(() => {});
          }
        })();
      }
    }

    res.json({ 
      success: true, 
      result: finalResult, 
      screeningId: screening._id, 
      verification: screening.verification 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Analysis failed' });
  }
};

const getScreenings = async (req, res) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.patientId, worker: req.userId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const screenings = await Screening.find({ patientId: req.params.patientId }).sort({ createdAt: 1 });
    res.json(screenings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch screenings' });
  }
};

const getAllScreenings = async (req, res) => {
  try {
    const patientIds = await Patient.find({ worker: req.userId }).distinct('_id');
    const screenings = await Screening.find({ patientId: { $in: patientIds } })
      .sort({ createdAt: -1 })
      .populate('patientId', 'name healthId village');
    res.json(screenings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch screenings' });
  }
};

const getScreeningVerification = async (req, res) => {
  try {
    const screening = await Screening.findById(req.params.id);
    if (!screening) {
      return res.status(404).json({ error: 'Screening not found' });
    }
    // Optional: check if patient belongs to worker
    const patient = await Patient.findOne({ _id: screening.patientId, worker: req.userId });
    if (!patient) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json({ verification: screening.verification });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch verification status' });
  }
};

module.exports = {
  createScreening,
  getScreenings,
  getAllScreenings,
  getScreeningVerification
};
