const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const Patient = require('../models/Patient');
const Screening = require('../models/Screening');
const Alert = require('../models/Alert');
const FollowUp = require('../models/FollowUp');

// Helper for emergency detection
const isEmergency = (text) => {
  const lower = text.toLowerCase();
  const keywords = ['chest pain', 'difficulty breathing', 'loss of consciousness', 'heavy bleeding', 'seizure', 'heart attack', 'stroke', 'unconscious', 'severe bleeding', 'breathing issue'];
  return keywords.some(kw => lower.includes(kw));
};

router.post('/', async (req, res) => {
  try {
    const { message, history = [], patientId = null } = req.body;
    console.log('\n--- NEW CHAT REQUEST ---');
    console.log('User Message:', message);
    console.log('History Length:', history.length);
    console.log('Patient ID Context:', patientId);
    let contextData = {};
    let systemPromptAdditions = "";
    let emergencyDetected = isEmergency(message);

    if (patientId) {
      // Focus context on specific patient
      const patient = await Patient.findById(patientId).lean();
      if (patient) {
        const recentScreenings = await Screening.find({ patientId }).sort({ createdAt: -1 }).limit(10).lean();
        const pendingFollowUps = await FollowUp.find({ patientId, status: 'Pending' }).lean();
        const recentAlerts = await Alert.find({ patientId }).sort({ createdAt: -1 }).limit(5).lean();

        contextData = {
          patient: { name: patient.name, age: patient.age, gender: patient.gender, village: patient.village, risk: patient.riskLevel, healthId: patient.healthId },
          recentScreenings: recentScreenings.map(s => ({ date: s.createdAt, risk: s.result?.riskLevel, aiSummary: s.result?.explanation, action: s.result?.nextAction, data: s.data })),
          alerts: recentAlerts.map(a => ({ type: a.type, title: a.title, msg: a.message, date: a.createdAt })),
          pendingFollowUps: pendingFollowUps.map(f => ({ priority: f.priority, reason: f.notes, due: f.date }))
        };

        systemPromptAdditions = `
      CURRENT PATIENT CONTEXT:
      You are currently viewing the profile of ${patient.name}. 
      Use the following patient details to provide personalized, highly contextual answers without asking the user for basic information.
      Patient Context JSON:
      ${JSON.stringify(contextData)}
      `;

        // If emergency, generate alerts automatically
        if (emergencyDetected) {
          await Alert.create({
            title: `Emergency: ${patient.name}`,
            message: `Emergency reported via AI Assistant: ${message}`,
            type: 'Emergency',
            riskLevel: 'High Risk',
            patientId: patient._id,
            village: patient.village,
            status: 'New'
          });
          await FollowUp.create({
            patientId: patient._id,
            worker: req.userId,
            date: new Date(),
            priority: 'High',
            type: 'Emergency Referral',
            notes: `AI detected emergency: ${message}`,
            status: 'Pending'
          });
          systemPromptAdditions += `\n\nEMERGENCY PROTOCOL ACTIVATED: The user has reported life-threatening symptoms (chest pain, breathing issues, etc.). You must immediately recommend an emergency referral to the nearest Primary Health Centre or hospital. Inform the user that a High Priority Alert and Follow-Up have been automatically generated for this patient.`;
        }
      }
    } else {
      // Global context (Worker level)
      const patients = await Patient.find({ worker: req.userId }).select('name healthId age gender village riskLevel').lean();
      const patientIds = patients.map(p => p._id);
      
      const recentScreenings = await Screening.find({ patientId: { $in: patientIds } }).sort({ createdAt: -1 }).limit(15).populate('patientId', 'name').lean();
      
      contextData = {
        patients: patients.map(p => ({ id: p.healthId, name: p.name, age: p.age, gender: p.gender, village: p.village, risk: p.riskLevel })),
        recentScreenings: recentScreenings.map(s => ({ patient: s.patientId?.name, date: s.createdAt, risk: s.result?.riskLevel, aiSummary: s.result?.explanation }))
      };

      systemPromptAdditions = `
      CURRENT GLOBAL CONTEXT (Your Assigned Patients):
      Use the following context to answer questions about the worker's population.
      Global Context JSON:
      ${JSON.stringify(contextData)}
      `;

      if (emergencyDetected) {
        systemPromptAdditions += `\n\nEMERGENCY PROTOCOL ACTIVATED: The user has reported life-threatening symptoms. You must immediately advise them to contact emergency services or refer the patient to the nearest hospital.`;
      }
    }

    const systemPrompt = `
      You are Swasthya AI, an intelligent, empathetic medical assistant and copilot for ASHA (Accredited Social Health Activist) workers in rural India.
      
      CRITICAL INSTRUCTIONS: 
      - Behave conversationally, similar to ChatGPT. DO NOT treat every message as a new chat. Remember previous symptoms and context discussed in this conversation.
      - NEVER reject or refuse to answer healthcare statements like "I have fever" or "I have leg pain". If a user states a symptom, act as a doctor: ask for duration, severity, and other symptoms to determine the risk.
      - DO NOT output phrases like "Please ask a valid medical or healthcare-related question" unless the user is explicitly asking you to write code, write essays, or do completely non-medical tasks.
      - Greet the user warmly if they say hello or greet you.
      - Provide actionable, clear, and concise advice. Use simple language.
      - You can discuss symptoms, medication guidance, risk explanations, follow-up advice, pregnancy guidance, child health, diabetes, hypertension, mental health, emergency advice, nutrition, vaccination, first aid, referral guidance, and government healthcare schemes.
      ${systemPromptAdditions}
    `;

    // Map history to OpenAI format
    const messagesPayload = [
      { role: "system", content: systemPrompt },
      ...history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text || msg.content // support both formats
      })),
      { role: "user", content: message }
    ];

    const openaiKey = process.env.OPENAI_API_KEY?.trim();
    const groqKey = process.env.GROQ_API_KEY?.trim();

    console.log('Sending payload to LLM with', messagesPayload.length, 'messages.');
    
    let reply = "I am currently running in offline rule-based mode. Please check the dashboard for high-risk patients.";

    if (groqKey || (openaiKey && openaiKey.startsWith('gsk_'))) {
      const groq = new OpenAI({ apiKey: groqKey || openaiKey, baseURL: "https://api.groq.com/openai/v1" });
      const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: messagesPayload,
        temperature: 0.7
      });
      reply = response.choices[0].message.content;
    } else if (openaiKey && openaiKey !== "") {
      const openai = new OpenAI({ apiKey: openaiKey });
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messagesPayload,
        temperature: 0.7
      });
      reply = response.choices[0].message.content;
    }

    console.log('AI Raw Response:', reply);
    res.json({ reply, isEmergency: emergencyDetected });
  } catch (err) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate response' });
  }
});

module.exports = router;
