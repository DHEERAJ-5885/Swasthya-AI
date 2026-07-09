const fs = require('fs');
const files = ['en.json', 'hi.json', 'te.json'];
const updates = {
  'en.json': {
    notifications: "Notifications",
    noAlerts: "No new alerts.",
    errLoadDetail: "Failed to load alert details",
    resolvedSuccess: "Alert marked as resolved",
    errResolve: "Failed to resolve alert",
    alertNotFound: "Alert not found",
    alertDetails: "Alert Details",
    patientInfo: "Patient Information",
    years: "years",
    na: "N/A",
    aiHealthInsight: "AI Health Insight",
    aiDefaultExplanation: "Our AI models have detected a deviation in the patient's normal health baseline requiring attention.",
    currentRisk: "Current Risk",
    unknown: "Unknown",
    trend: "Trend",
    stable: "Stable",
    confidence: "Confidence",
    reportedSymptoms: "Reported Symptoms",
    recommendedActions: "Recommended Actions",
    timelineHistory: "Timeline History",
    screeningRisk: "Screening: {{level}} Risk",
    resolving: "Resolving...",
    markResolved: "Mark as Resolved",
    viewProfile: "View Profile",
    call: "Call",
    symptoms: {
      fever: "Fever",
      oxygen: "Oxygen",
      fatigue: "Fatigue",
      bp: "BP",
      sleep: "Sleep",
      appetite: "Appetite",
      stress: "Stress"
    }
  },
  'hi.json': {
    notifications: "सूचनाएं",
    noAlerts: "कोई नया अलर्ट नहीं।",
    errLoadDetail: "अलर्ट विवरण लोड करने में विफल",
    resolvedSuccess: "अलर्ट हल हो गया",
    errResolve: "अलर्ट हल करने में विफल",
    alertNotFound: "अलर्ट नहीं मिला",
    alertDetails: "अलर्ट विवरण",
    patientInfo: "रोगी की जानकारी",
    years: "वर्ष",
    na: "लागू नहीं",
    aiHealthInsight: "AI स्वास्थ्य इनसाइट",
    aiDefaultExplanation: "हमारे AI मॉडल ने रोगी के सामान्य स्वास्थ्य में एक विचलन का पता लगाया है जिस पर ध्यान देने की आवश्यकता है।",
    currentRisk: "वर्तमान जोखिम",
    unknown: "अज्ञात",
    trend: "प्रवृत्ति",
    stable: "स्थिर",
    confidence: "विश्वास",
    reportedSymptoms: "बताए गए लक्षण",
    recommendedActions: "अनुशंसित कार्रवाइयां",
    timelineHistory: "समयरेखा इतिहास",
    screeningRisk: "स्क्रीनिंग: {{level}} जोखिम",
    resolving: "हल कर रहा है...",
    markResolved: "हल के रूप में चिह्नित करें",
    viewProfile: "प्रोफ़ाइल देखें",
    call: "कॉल करें",
    symptoms: {
      fever: "बुखार",
      oxygen: "ऑक्सीजन",
      fatigue: "थकान",
      bp: "रक्तचाप",
      sleep: "नींद",
      appetite: "भूख",
      stress: "तनाव"
    }
  },
  'te.json': {
    notifications: "నోటిఫికేషన్లు",
    noAlerts: "కొత్త హెచ్చరికలు లేవు.",
    errLoadDetail: "హెచ్చరిక వివరాలను లోడ్ చేయడంలో విఫలమైంది",
    resolvedSuccess: "హెచ్చరిక పరిష్కరించబడింది",
    errResolve: "హెచ్చరికను పరిష్కరించడం విఫలమైంది",
    alertNotFound: "హెచ్చరిక కనుగొనబడలేదు",
    alertDetails: "హెచ్చరిక వివరాలు",
    patientInfo: "రోగి సమాచారం",
    years: "సంవత్సరాలు",
    na: "వర్తించదు",
    aiHealthInsight: "AI ఆరోగ్య అంతర్దృష్టి",
    aiDefaultExplanation: "మా AI నమూనాలు రోగి యొక్క సాధారణ ఆరోగ్య స్థాయిలో శ్రద్ధ వహించాల్సిన వ్యత్యాసాన్ని గుర్తించాయి.",
    currentRisk: "ప్రస్తుత ప్రమాదం",
    unknown: "తెలియదు",
    trend: "ధోరణి",
    stable: "స్థిరమైన",
    confidence: "విశ్వాసం",
    reportedSymptoms: "నివేదించబడిన లక్షణాలు",
    recommendedActions: "సిఫార్సు చేయబడిన చర్యలు",
    timelineHistory: "కాలక్రమ చరిత్ర",
    screeningRisk: "స్క్రీనింగ్: {{level}} ప్రమాదం",
    resolving: "పరిష్కరిస్తోంది...",
    markResolved: "పరిష్కరించబడినట్లుగా గుర్తు పెట్టు",
    viewProfile: "ప్రొఫైల్ చూడండి",
    call: "కాల్ చేయండి",
    symptoms: {
      fever: "జ్వరం",
      oxygen: "ఆక్సిజన్",
      fatigue: "అలసట",
      bp: "బీపీ (రక్తపోటు)",
      sleep: "నిద్ర",
      appetite: "ఆకలి",
      stress: "ఒత్తిడి"
    }
  }
};
files.forEach(f => {
  const path = 'src/i18n/locales/' + f;
  let data = JSON.parse(fs.readFileSync(path, 'utf8'));
  data.alerts = data.alerts || {};
  Object.assign(data.alerts, updates[f]);
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
});
