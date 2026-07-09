const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const Patient = require('../models/Patient');
const Screening = require('../models/Screening');
const Alert = require('../models/Alert');
const FollowUp = require('../models/FollowUp');

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Fetch all patients for the worker to provide full context
    const patients = await Patient.find({ worker: req.userId }).select('name healthId age gender village contactNumber riskLevel').lean();
    const patientIds = patients.map(p => p._id);
    
    // Fetch related contextual data
    const recentScreenings = await Screening.find({ patientId: { $in: patientIds } })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('patientId', 'name')
      .lean();
      
    const recentAlerts = await Alert.find({ 
      $or: [{ patientId: { $in: patientIds } }, { village: { $exists: true } }] 
    }).sort({ createdAt: -1 }).limit(15).lean();
    
    const pendingFollowUps = await FollowUp.find({ 
      patientId: { $in: patientIds }, 
      status: 'Pending' 
    }).populate('patientId', 'name').lean();

    // Compress data for prompt context to avoid hitting token limits
    const contextData = {
      patients: patients.map(p => ({ id: p.healthId, name: p.name, age: p.age, gender: p.gender, village: p.village, risk: p.riskLevel })),
      recentScreenings: recentScreenings.map(s => ({ patient: s.patientId?.name, date: s.createdAt, risk: s.result?.riskLevel, aiSummary: s.result?.explanation, action: s.result?.nextAction })),
      alerts: recentAlerts.map(a => ({ type: a.type, title: a.title, msg: a.message, date: a.createdAt })),
      pendingFollowUps: pendingFollowUps.map(f => ({ patient: f.patientId?.name, priority: f.priority, reason: f.notes, due: f.date }))
    };

    const prompt = `
      You are Swasthya AI, an intelligent, empathetic medical assistant and copilot for ASHA (Accredited Social Health Activist) workers in rural India.
      
      CRITICAL INSTRUCTION: 
      - ONLY answer questions related to healthcare, medical topics, patient care, or the Swasthya AI system. 
      - If asked about non-healthcare topics, politely decline: "Please ask a valid medical or healthcare related question."
      - Provide actionable, clear, and concise advice. Use simple language.
      - If asked to summarize a patient or provide history, use the system context provided below.
      
      Current system context (JSON data for your assigned patients, recent screenings, alerts, and pending follow-ups):
      ${JSON.stringify(contextData)}
      
      Worker asks: "${message}"
      
      Response:
    `;

    const openaiKey = process.env.OPENAI_API_KEY?.trim();
    const groqKey = process.env.GROQ_API_KEY?.trim();

    let reply = "I am currently running in offline rule-based mode. Please check the dashboard for high-risk patients.";

    if (groqKey || (openaiKey && openaiKey.startsWith('gsk_'))) {
      const groq = new OpenAI({ apiKey: groqKey || openaiKey, baseURL: "https://api.groq.com/openai/v1" });
      const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }]
      });
      reply = response.choices[0].message.content;
    } else if (openaiKey && openaiKey !== "") {
      const openai = new OpenAI({ apiKey: openaiKey });
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      });
      reply = response.choices[0].message.content;
    }

    res.json({ reply });
  } catch (err) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

module.exports = router;
