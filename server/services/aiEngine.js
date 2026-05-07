const { OpenAI } = require('openai');

const extractSymptomsFromVoice = (voiceNotes) => {
  if (!voiceNotes) return [];
  const text = voiceNotes.toLowerCase();
  const symptoms = [];
  
  if (text.includes('weak') || text.includes('no energy')) symptoms.push('Weakness');
  if (text.includes('not eating') || text.includes('loss of appetite')) symptoms.push('Low Appetite');
  if (text.includes('cough')) symptoms.push('Cough');
  if (text.includes('fever') || text.includes('hot')) symptoms.push('Fever');
  if (text.includes('stress') || text.includes('worry') || text.includes('overthinking')) symptoms.push('High Stress');
  if (text.includes('pain') || text.includes('hurt')) symptoms.push('Pain');
  
  return symptoms;
};

const analyzePatientData = async (data) => {
  const { 
    fever, bp, sugar, pulse, oxygen, temperature,
    sleep, appetite, energy, stress, waterIntake, workFatigue,
    sadness, anxiety, loneliness, emotionalStress, overthinking,
    swelling, paleSkin, fatigue, cough, weakness, visibleDiscomfort,
    voiceNotes 
  } = data;
  
  data.extractedSymptoms = extractSymptomsFromVoice(voiceNotes);

  const prompt = `
    Analyze this comprehensive patient data for an ASHA worker in rural India:
    Vitals: Fever: ${fever}, BP: ${bp}, Sugar: ${sugar}, Pulse: ${pulse}, O2: ${oxygen}, Temp: ${temperature}
    Lifestyle: Sleep: ${sleep}, Appetite: ${appetite}, Energy: ${energy}, Stress: ${stress}, Water: ${waterIntake}, Work Fatigue: ${workFatigue}
    Mental: Sadness: ${sadness}, Anxiety: ${anxiety}, Loneliness: ${loneliness}, Emotional Stress: ${emotionalStress}, Overthinking: ${overthinking}
    Observation: Swelling: ${swelling}, Pale Skin: ${paleSkin}, Fatigue: ${fatigue}, Cough: ${cough}, Weakness: ${weakness}, Discomfort: ${visibleDiscomfort}
    Voice Notes Transcribed: "${voiceNotes}" (Extracted: ${data.extractedSymptoms.join(', ')})
    
    Return a JSON response with:
    - riskLevel: "Low", "Medium", or "High"
    - confidence: number between 0 and 100
    - reason: brief explanation of the most critical issues detected
    - nextAction: Must be exactly one of: "revisit in 3 days", "refer immediately", "monitor weekly", "home care sufficient"
  `;

  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const groqKey = process.env.GROQ_API_KEY?.trim();

  if (groqKey || (openaiKey && openaiKey.startsWith('gsk_'))) {
    try {
      const groq = new OpenAI({ 
        apiKey: groqKey || openaiKey, 
        baseURL: "https://api.groq.com/openai/v1" 
      });
      const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      return JSON.parse(response.choices[0].message.content);
    } catch (e) {
      console.error("Groq failed, falling back", e);
    }
  } else if (openaiKey && openaiKey !== "") {
    try {
      const openai = new OpenAI({ apiKey: openaiKey });
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      return JSON.parse(response.choices[0].message.content);
    } catch (e) {
      console.error("OpenAI failed, falling back", e);
    }
  }

  return ruleBasedFallback(data);
};

const ruleBasedFallback = (data) => {
  let score = 0;
  let reason = [];
  
  // Vitals
  if (data.fever && ['mild', 'high'].includes(data.fever.toLowerCase())) { score += (data.fever.toLowerCase() === 'high' ? 4 : 2); reason.push(`Fever: ${data.fever}`); }
  if (data.bp && ['high', 'low'].includes(data.bp.toLowerCase())) { score += 3; reason.push(`BP: ${data.bp}`); }
  if (data.sugar && data.sugar.toLowerCase() === 'high') { score += 3; reason.push('High Sugar'); }
  
  // Lifestyle
  if (data.sleep && data.sleep.toLowerCase() === 'poor') { score += 2; reason.push('Poor Sleep'); }
  if (data.appetite && data.appetite.toLowerCase() === 'low') { score += 2; reason.push('Low Appetite'); }
  if (data.stress && data.stress.toLowerCase() === 'high') { score += 2; reason.push('High Stress'); }
  
  // Observations & Mental
  if (data.weakness && ['some', 'severe'].includes(data.weakness.toLowerCase())) { score += (data.weakness.toLowerCase() === 'severe' ? 3 : 1); reason.push(`Weakness: ${data.weakness}`); }
  if (data.swelling && data.swelling.toLowerCase() === 'yes') { score += 3; reason.push('Swelling'); }
  
  // Voice Extracted Symptoms
  if (data.extractedSymptoms && data.extractedSymptoms.length > 0) {
    score += data.extractedSymptoms.length * 1.5;
    reason.push(`Voice reported: ${data.extractedSymptoms.join(', ')}`);
  }
  
  let riskLevel = 'Low';
  let nextAction = 'home care sufficient';

  if (score >= 8) {
    riskLevel = 'High';
    nextAction = 'refer immediately';
  } else if (score >= 5) {
    riskLevel = 'Medium';
    nextAction = 'revisit in 3 days';
  } else if (score >= 2) {
    riskLevel = 'Low';
    nextAction = 'monitor weekly';
  }

  return {
    riskLevel,
    confidence: Math.min(100, 60 + score * 5),
    reason: reason.length > 0 ? `Issues detected: ${reason.slice(0,3).join(', ')}` : 'Patient appears healthy.',
    nextAction
  };
};

module.exports = { analyzePatientData };
