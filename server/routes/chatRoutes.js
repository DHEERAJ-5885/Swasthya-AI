const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const Patient = require('../models/Patient');
const Screening = require('../models/Screening');

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Fetch high risk patients for context
    const recentScreenings = await Screening.find().sort({ createdAt: -1 }).limit(20).populate('patientId', 'name village');
    const highRisk = recentScreenings.filter(s => s.result?.riskLevel === 'High').map(s => s.patientId?.name).join(', ');

    const prompt = `
      You are Swasthya AI, a medical assistant for ASHA workers in rural India.
      
      CRITICAL INSTRUCTION: You MUST ONLY answer questions related to healthcare, medical topics, patient care, or the Swasthya AI system. 
      If the user asks a question that is NOT related to medical or healthcare topics, you must politely decline and say exactly: "Please ask a valid medical or healthcare related question."
      
      Current system context:
      High Risk Patients needing urgent attention: ${highRisk || 'None currently'}.
      
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
    console.error(err);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

module.exports = router;
