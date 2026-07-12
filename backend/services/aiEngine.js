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

const analyzePatientData = async (data, previousData = null) => {
  const { 
    fever, bp, sugar, pulse, oxygen, temperature,
    sleep, appetite, energy, stress, waterIntake, workFatigue,
    sadness, anxiety, loneliness, emotionalStress, overthinking,
    swelling, paleSkin, fatigue, cough, weakness, visibleDiscomfort,
    voiceNotes 
  } = data;
  
  data.extractedSymptoms = extractSymptomsFromVoice(voiceNotes);

  let prompt = `
    Analyze this comprehensive patient data for an ASHA worker in rural India:
    Vitals: Fever: ${fever}, BP: ${bp}, Sugar: ${sugar}, Pulse: ${pulse}, O2: ${oxygen}, Temp: ${temperature}
    Lifestyle: Sleep: ${sleep}, Appetite: ${appetite}, Energy: ${energy}, Stress: ${stress}, Water: ${waterIntake}, Work Fatigue: ${workFatigue}
    Mental: Sadness: ${sadness}, Anxiety: ${anxiety}, Loneliness: ${loneliness}, Emotional Stress: ${emotionalStress}, Overthinking: ${overthinking}
    Observation: Swelling: ${swelling}, Pale Skin: ${paleSkin}, Fatigue: ${fatigue}, Cough: ${cough}, Weakness: ${weakness}, Discomfort: ${visibleDiscomfort}
    Voice Notes Transcribed: "${voiceNotes}" (Extracted: ${data.extractedSymptoms.join(', ')})
  `;

  if (previousData) {
    prompt += `
    
    HISTORICAL DATA (for comparison):
    Vitals: Fever: ${previousData.fever}, BP: ${previousData.bp}, Sugar: ${previousData.sugar}, Pulse: ${previousData.pulse}, O2: ${previousData.oxygen}, Temp: ${previousData.temperature}
    Lifestyle: Sleep: ${previousData.sleep}, Appetite: ${previousData.appetite}, Energy: ${previousData.energy}, Stress: ${previousData.stress}, Water: ${previousData.waterIntake}, Work Fatigue: ${previousData.workFatigue}
    Mental: Sadness: ${previousData.sadness}, Anxiety: ${previousData.anxiety}, Loneliness: ${previousData.loneliness}, Emotional Stress: ${previousData.emotionalStress}, Overthinking: ${previousData.overthinking}
    Observation: Swelling: ${previousData.swelling}, Pale Skin: ${previousData.paleSkin}, Fatigue: ${previousData.fatigue}, Cough: ${previousData.cough}, Weakness: ${previousData.weakness}, Discomfort: ${previousData.visibleDiscomfort}
    `;
  }

  prompt += `
    
    Return a JSON response with the following exact keys:
    - riskScore: number between 0 and 100 (where 0 is perfectly healthy, 100 is severe critical danger)
    - confidence: number between 0 and 100
    - reason: brief explanation of the most critical issues detected
    - nextAction: Must be exactly one of: "revisit in 3 days", "refer immediately", "monitor weekly", "home care sufficient"
    - driftStatus: "Stable", "Improving", "Declining", or "Critical Drift" (compare current to historical if available, otherwise 'No Data')
    - trendDirection: "Improving", "Stable", "Declining", or "Critical Drift"
    - previousComparison: Array of strings describing what specifically worsened or improved (e.g., ["Sleep worsened (Good -> Poor)"]). Empty if no previous data.
    - aiExplanation: Detailed paragraph explaining why the drift happened and what behavioral changes lead to this risk level.
    - followUpRecommendation: Short suggestion for when to follow up next based on this drift (e.g., "Urgent doctor referral required").
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
      const aiRes = JSON.parse(response.choices[0].message.content);
      aiRes.riskScore = aiRes.riskScore || 20; // fallback default
      if (aiRes.riskScore < 40) aiRes.riskLevel = 'Low Risk';
      else if (aiRes.riskScore <= 70) aiRes.riskLevel = 'Medium Risk';
      else aiRes.riskLevel = 'High Risk';
      return aiRes;
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
      const aiRes = JSON.parse(response.choices[0].message.content);
      aiRes.riskScore = aiRes.riskScore || 20; // fallback default
      if (aiRes.riskScore < 40) aiRes.riskLevel = 'Low Risk';
      else if (aiRes.riskScore <= 70) aiRes.riskLevel = 'Medium Risk';
      else aiRes.riskLevel = 'High Risk';
      return aiRes;
    } catch (e) {
      console.error("OpenAI failed, falling back", e);
    }
  }

  return ruleBasedFallback(data, previousData);
};

const ruleBasedFallback = (data, previousData) => {
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
  
  let riskLevel = 'Low Risk';
  let nextAction = 'home care sufficient';
  let riskScore = Math.min(100, score * 10);

  const emergencyDetected =
    data.fever?.toLowerCase() === 'high' &&
    data.fatigue?.toLowerCase() === 'severe' &&
    data.appetite?.toLowerCase() === 'low';

  if (emergencyDetected) {
    riskScore = Math.max(riskScore, 85);
  }

  if (riskScore < 40) {
    riskLevel = 'Low Risk';
    nextAction = 'monitor weekly';
  } else if (riskScore <= 70) {
    riskLevel = 'Medium Risk';
    nextAction = 'revisit in 3 days';
  } else {
    riskLevel = 'High Risk';
    nextAction = 'refer immediately';
  }

  let driftStatus = 'Stable';
  let trendDirection = 'Stable';
  let aiExplanation = 'Health trend is stable. Continue monitoring.';
  let previousComparison = [];

    if (previousData) {
     // Basic fallback drift detection
     if (data.sleep === 'poor' && previousData.sleep === 'good') {
        previousComparison.push('Sleep worsened (Good -> Poor)');
        driftStatus = 'Declining';
     }
     if (data.fever === 'high' && previousData.fever === 'none') {
        previousComparison.push('Fever appeared');
        driftStatus = 'Declining';
     }
      if (emergencyDetected) {
        previousComparison.push('Emergency symptom cluster detected');
        driftStatus = 'Critical Drift';
        trendDirection = 'Critical Drift';
        aiExplanation = 'Critical symptoms appeared with a sharp decline compared to previous visit.';
      }
     if (previousComparison.length > 1) {
        trendDirection = 'Declining';
        aiExplanation = 'Patient behavior and symptoms show a decline compared to previous visit.';
     }
  } else {
     driftStatus = 'No Data';
     trendDirection = 'No Data';
     aiExplanation = 'First screening. No historical data to compare.';
  }

  return {
    riskLevel,
    riskScore,
    confidence: Math.min(100, 60 + score * 5),
    reason: reason.length > 0 ? `Issues detected: ${reason.slice(0,3).join(', ')}` : 'Patient appears healthy.',
    nextAction,
    driftStatus,
    trendDirection,
    previousComparison,
    aiExplanation,
    followUpRecommendation: nextAction
  };
};

module.exports = { analyzePatientData };
