const fs = require('fs');
const files = ['en.json', 'hi.json', 'te.json'];
const updates = {
  'en.json': {
    errLoad: "Failed to load screenings",
    recentScreenings: "Recent Screenings",
    startNew: "Start New Screening",
    noScreenings: "No screenings available.",
    unknown: "Unknown",
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    unknownPatient: "Unknown Patient",
    idUnknown: "ID Unknown",
    unknownVillage: "Unknown Village",
    assessed: "Assessed",
    aiGenerated: "AI Generated",
    viewResult: "View Result"
  },
  'hi.json': {
    errLoad: "स्क्रीनिंग लोड करने में विफल",
    recentScreenings: "हाल की स्क्रीनिंग",
    startNew: "नई स्क्रीनिंग शुरू करें",
    noScreenings: "कोई स्क्रीनिंग उपलब्ध नहीं है।",
    unknown: "अज्ञात",
    critical: "गंभीर",
    high: "उच्च",
    medium: "मध्यम",
    low: "निम्न",
    unknownPatient: "अज्ञात रोगी",
    idUnknown: "अज्ञात आईडी",
    unknownVillage: "अज्ञात गाँव",
    assessed: "मूल्यांकन किया गया",
    aiGenerated: "AI जनरेटेड",
    viewResult: "परिणाम देखें"
  },
  'te.json': {
    errLoad: "స్క్రీనింగ్‌లను లోడ్ చేయడంలో విఫలమైంది",
    recentScreenings: "ఇటీవలి స్క్రీనింగ్‌లు",
    startNew: "కొత్త స్క్రీనింగ్ ప్రారంభించండి",
    noScreenings: "ఎలాంటి స్క్రీనింగ్‌లు అందుబాటులో లేవు.",
    unknown: "తెలియదు",
    critical: "క్లిష్టమైన",
    high: "ఎక్కువ",
    medium: "మధ్యస్థం",
    low: "తక్కువ",
    unknownPatient: "తెలియని రోగి",
    idUnknown: "తెలియని ID",
    unknownVillage: "తెలియని గ్రామం",
    assessed: "అంచనా వేయబడింది",
    aiGenerated: "AI ద్వారా సృష్టించబడింది",
    viewResult: "ఫలితాన్ని వీక్షించండి"
  }
};
files.forEach(f => {
  const path = 'src/i18n/locales/' + f;
  let data = JSON.parse(fs.readFileSync(path, 'utf8'));
  data.screeningsList = data.screeningsList || {};
  Object.assign(data.screeningsList, updates[f]);
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
});
