const fs = require('fs');
const files = ['en.json', 'hi.json', 'te.json'];
const updates = {
  'en.json': {
    welcomeMsg: "Hello! I'm Swasthya AI Assistant.\nI can help you with patient care, healthcare protocols, symptom guidance, follow-up planning, and health record summaries.",
    suggestedPrompts: [
      "Analyze this patient's symptoms",
      "Summarize patient history",
      "Explain diabetes in simple language",
      "Suggest follow-up actions",
      "Which patients are high risk today?",
      "Vaccination schedule",
      "Pregnancy care guidance",
      "Nutrition advice",
      "Emergency referral checklist"
    ],
    quickActions: {
      analyzeLabel: "Analyze Patient",
      analyzePrompt: "Please help me analyze a patient's symptoms.",
      summarizeLabel: "Summarize Patient",
      summarizePrompt: "Summarize the history of my high-risk patients.",
      explainLabel: "Explain Disease",
      explainPrompt: "Can you explain hypertension in simple terms?",
      followUpLabel: "Follow-up Plan",
      followUpPrompt: "What is the follow-up plan for patients who missed their visit?",
      emergencyLabel: "Emergency Advice",
      emergencyPrompt: "What is the checklist for an emergency referral?",
      transTeluguLabel: "Translate to Telugu",
      transTeluguPrompt: "Translate the last response to Telugu.",
      transHindiLabel: "Translate to Hindi",
      transHindiPrompt: "Translate the last response to Hindi."
    },
    errNoSpeech: "Your browser doesn't support speech recognition.",
    errAiResponse: "Failed to get response from AI",
    listening: "Listening...",
    errSpeech: "Error recognizing speech.",
    aiAssistant: "AI Assistant",
    copilot: "Swasthya Copilot",
    copilotDesc: "Your intelligent medical assistant",
    suggestedQuestions: "Suggested Questions",
    placeholder: "Ask me anything about your patients...",
    disclaimer: "AI can make mistakes. Verify critical medical information."
  },
  'hi.json': {
    welcomeMsg: "नमस्ते! मैं स्वास्थ्य AI असिस्टेंट हूँ।\nमैं रोगी की देखभाल, स्वास्थ्य प्रोटोकॉल, लक्षणों पर मार्गदर्शन, फॉलो-अप योजना और स्वास्थ्य रिकॉर्ड सारांश में आपकी मदद कर सकता हूँ।",
    suggestedPrompts: [
      "इस मरीज के लक्षणों का विश्लेषण करें",
      "रोगी के इतिहास का सारांश दें",
      "सरल भाषा में मधुमेह को समझाएं",
      "फॉलो-अप कार्यों का सुझाव दें",
      "आज कौन से मरीज उच्च जोखिम में हैं?",
      "टीकाकरण अनुसूची",
      "गर्भावस्था देखभाल मार्गदर्शन",
      "पोषण सलाह",
      "आपातकालीन रेफरल चेकलिस्ट"
    ],
    quickActions: {
      analyzeLabel: "विश्लेषण करें",
      analyzePrompt: "कृपया मुझे एक मरीज के लक्षणों का विश्लेषण करने में मदद करें।",
      summarizeLabel: "सारांश दें",
      summarizePrompt: "मेरे उच्च जोखिम वाले रोगियों के इतिहास का सारांश दें।",
      explainLabel: "बीमारी समझाएं",
      explainPrompt: "क्या आप उच्च रक्तचाप को सरल शब्दों में समझा सकते हैं?",
      followUpLabel: "फॉलो-अप योजना",
      followUpPrompt: "उन रोगियों के लिए फॉलो-अप योजना क्या है जो अपनी यात्रा से चूक गए हैं?",
      emergencyLabel: "आपातकालीन सलाह",
      emergencyPrompt: "आपातकालीन रेफरल के लिए चेकलिस्ट क्या है?",
      transTeluguLabel: "तेलुगु में अनुवाद करें",
      transTeluguPrompt: "पिछले उत्तर का तेलुगु में अनुवाद करें।",
      transHindiLabel: "हिंदी में अनुवाद करें",
      transHindiPrompt: "पिछले उत्तर का हिंदी में अनुवाद करें।"
    },
    errNoSpeech: "आपका ब्राउज़र ध्वनि पहचान का समर्थन नहीं करता है।",
    errAiResponse: "AI से प्रतिक्रिया प्राप्त करने में विफल",
    listening: "सुन रहा हूँ...",
    errSpeech: "आवाज़ पहचानने में त्रुटि।",
    aiAssistant: "AI असिस्टेंट",
    copilot: "स्वास्थ्य कोपायलट",
    copilotDesc: "आपका बुद्धिमान चिकित्सा सहायक",
    suggestedQuestions: "सुझाए गए प्रश्न",
    placeholder: "मुझसे अपने मरीजों के बारे में कुछ भी पूछें...",
    disclaimer: "AI गलतियाँ कर सकता है। महत्वपूर्ण चिकित्सा जानकारी को सत्यापित करें।"
  },
  'te.json': {
    welcomeMsg: "నమస్కారం! నేను స్వాస్థ్య AI అసిస్టెంట్‌ని.\nరోగి సంరక్షణ, ఆరోగ్య సంరక్షణ ప్రోటోకాల్స్, లక్షణాల మార్గదర్శకత్వం, ఫాలో-అప్ ప్రణాళిక మరియు ఆరోగ్య రికార్డు సారాంశాలతో నేను మీకు సహాయం చేయగలను.",
    suggestedPrompts: [
      "ఈ రోగి లక్షణాలను విశ్లేషించండి",
      "రోగి చరిత్రను సంగ్రహించండి",
      "మధుమేహాన్ని సరళమైన భాషలో వివరించండి",
      "ఫాలో-అప్ చర్యలను సూచించండి",
      "ఈ రోజు ఏ రోగులకు అధిక ప్రమాదం ఉంది?",
      "టీకా షెడ్యూల్",
      "గర్భధారణ సంరక్షణ మార్గదర్శకత్వం",
      "పోషకాహార సలహా",
      "అత్యవసర రిఫరల్ చెక్‌లిస్ట్"
    ],
    quickActions: {
      analyzeLabel: "రోగిని విశ్లేషించండి",
      analyzePrompt: "రోగి లక్షణాలను విశ్లేషించడంలో దయచేసి నాకు సహాయం చేయండి.",
      summarizeLabel: "రోగి సారాంశం",
      summarizePrompt: "నా అధిక ప్రమాదం ఉన్న రోగుల చరిత్రను సంగ్రహించండి.",
      explainLabel: "వ్యాధిని వివరించండి",
      explainPrompt: "మీరు రక్తపోటును సరళమైన మాటలలో వివరించగలరా?",
      followUpLabel: "ఫాలో-అప్ ప్రణాళిక",
      followUpPrompt: "వారి సందర్శనను కోల్పోయిన రోగులకు ఫాలో-అప్ ప్రణాళిక ఏమిటి?",
      emergencyLabel: "అత్యవసర సలహా",
      emergencyPrompt: "అత్యవసర రిఫరల్ కోసం చెక్‌లిస్ట్ ఏమిటి?",
      transTeluguLabel: "తెలుగులోకి అనువదించండి",
      transTeluguPrompt: "చివరి ప్రతిస్పందనను తెలుగులోకి అనువదించండి.",
      transHindiLabel: "హిందీలోకి అనువదించండి",
      transHindiPrompt: "చివరి ప్రతిస్పందనను హిందీలోకి అనువదించండి."
    },
    errNoSpeech: "మీ బ్రౌజర్ వాయిస్ రికగ్నిషన్‌కు మద్దతు ఇవ్వదు.",
    errAiResponse: "AI నుండి ప్రతిస్పందన పొందడంలో విఫలమైంది",
    listening: "వింటున్నాను...",
    errSpeech: "వాయిస్ గుర్తించడంలో లోపం.",
    aiAssistant: "AI అసిస్టెంట్",
    copilot: "స్వాస్థ్య కోపైలట్",
    copilotDesc: "మీ తెలివైన వైద్య సహాయకుడు",
    suggestedQuestions: "సూచించిన ప్రశ్నలు",
    placeholder: "మీ రోగుల గురించి నన్ను ఏదైనా అడగండి...",
    disclaimer: "AI తప్పులు చేయవచ్చు. క్లిష్టమైన వైద్య సమాచారాన్ని ధృవీకరించండి."
  }
};
files.forEach(f => {
  const path = 'src/i18n/locales/' + f;
  let data = JSON.parse(fs.readFileSync(path, 'utf8'));
  data.ai = data.ai || {};
  Object.assign(data.ai, updates[f]);
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
});
