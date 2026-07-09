const fs = require('fs');
const files = ['en.json', 'hi.json', 'te.json'];
const updates = {
  'en.json': {
    errLoad: "Failed to load AI Insights",
    aiInsights: "AI Insights",
    aiHealthInsights: "AI Health Insights",
    totalScreenings: "Total Screenings",
    highRiskDetected: "High-Risk Detected",
    followUpsPredicted: "Follow-ups Predicted",
    aiRecommendations: "AI-Generated Recommendations",
    noInsights: "No insights available at the moment.",
    riskLevelDist: "Risk Level Distribution",
    highRiskPatients: "High-Risk Patients",
    unknownVillage: "Unknown Village",
    critical: "Critical",
    noHighRisk: "No High-Risk Patients",
    excellentNoCritical: "Excellent! No critical interventions needed right now.",
    takeAction: "Take Action",
    yrs: "yrs"
  },
  'hi.json': {
    errLoad: "AI इनसाइट्स लोड करने में विफल",
    aiInsights: "AI इनसाइट्स",
    aiHealthInsights: "AI स्वास्थ्य इनसाइट्स",
    totalScreenings: "कुल स्क्रीनिंग",
    highRiskDetected: "उच्च जोखिम का पता चला",
    followUpsPredicted: "पूर्वानुमानित फॉलो-अप",
    aiRecommendations: "AI-जनित अनुशंसाएँ",
    noInsights: "फिलहाल कोई इनसाइट्स उपलब्ध नहीं है।",
    riskLevelDist: "जोखिम स्तर वितरण",
    highRiskPatients: "उच्च जोखिम वाले मरीज़",
    unknownVillage: "अज्ञात गाँव",
    critical: "गंभीर",
    noHighRisk: "कोई उच्च जोखिम वाला मरीज़ नहीं",
    excellentNoCritical: "उत्कृष्ट! अभी किसी महत्वपूर्ण हस्तक्षेप की आवश्यकता नहीं है।",
    takeAction: "कार्रवाई करें",
    yrs: "वर्ष"
  },
  'te.json': {
    errLoad: "AI అంతర్దృష్టులను లోడ్ చేయడంలో విఫలమైంది",
    aiInsights: "AI అంతర్దృష్టులు",
    aiHealthInsights: "AI ఆరోగ్య అంతర్దృష్టులు",
    totalScreenings: "మొత్తం స్క్రీనింగ్‌లు",
    highRiskDetected: "అధిక ప్రమాదం కనుగొనబడింది",
    followUpsPredicted: "అంచనా వేసిన ఫాలో-అప్‌లు",
    aiRecommendations: "AI- రూపొందించిన సిఫార్సులు",
    noInsights: "ప్రస్తుతానికి ఎలాంటి అంతర్దృష్టులు అందుబాటులో లేవు.",
    riskLevelDist: "ప్రమాద స్థాయి పంపిణీ",
    highRiskPatients: "అధిక ప్రమాదం ఉన్న రోగులు",
    unknownVillage: "తెలియని గ్రామం",
    critical: "క్లిష్టమైన",
    noHighRisk: "అధిక ప్రమాదం ఉన్న రోగులు లేరు",
    excellentNoCritical: "అద్భుతం! ఇప్పుడే ఎలాంటి క్లిష్టమైన జోక్యాలు అవసరం లేదు.",
    takeAction: "చర్య తీసుకోండి",
    yrs: "సంవత్సరాలు"
  }
};
files.forEach(f => {
  const path = 'src/i18n/locales/' + f;
  let data = JSON.parse(fs.readFileSync(path, 'utf8'));
  data.insights = data.insights || {};
  Object.assign(data.insights, updates[f]);
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
});
