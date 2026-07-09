const fs = require('fs');
const files = ['en.json', 'hi.json', 'te.json'];
const updates = {
  'en.json': {
    family: {
      familyIntelligence: "Family Intelligence",
      noMembers: "No family members found. Add patients with a Family ID to see insights.",
      familyId: "Family ID",
      familyInsight: "Family Insight",
      familyMembers: "Family Members",
      highRisk: "High Risk",
      mediumRisk: "Medium Risk",
      lowRisk: "Low Risk",
      y: "Y"
    },
    community: {
      communityRisk: "Community Risk",
      noData: "No community data available yet.",
      outbreakWarning: "Outbreak Warning",
      outbreakDesc: "Multiple cases of Fever/Weakness detected in this cluster. Immediate community screening required.",
      riskLevel: "Risk Level",
      critical: "Critical",
      moderate: "Moderate",
      stable: "Stable",
      score: "Score",
      popSummary: "Population Summary",
      highRisk: "High Risk",
      mediumRisk: "Medium Risk",
      totalScreened: "Total Screened",
      diseaseClusters: "Disease Clusters",
      fever: "Fever",
      weakness: "Weakness",
      stress: "Stress",
      highBp: "High BP"
    }
  },
  'hi.json': {
    family: {
      familyIntelligence: "पारिवारिक बुद्धिमत्ता",
      noMembers: "कोई परिवार का सदस्य नहीं मिला। अंतर्दृष्टि देखने के लिए पारिवारिक आईडी वाले रोगियों को जोड़ें।",
      familyId: "परिवार आईडी",
      familyInsight: "पारिवारिक अंतर्दृष्टि",
      familyMembers: "परिवार के सदस्य",
      highRisk: "उच्च जोखिम",
      mediumRisk: "मध्यम जोखिम",
      lowRisk: "कम जोखिम",
      y: "वर्ष"
    },
    community: {
      communityRisk: "सामुदायिक जोखिम",
      noData: "अभी तक कोई सामुदायिक डेटा उपलब्ध नहीं है।",
      outbreakWarning: "प्रकोप चेतावनी",
      outbreakDesc: "इस क्लस्टर में बुखार/कमजोरी के कई मामले सामने आए हैं। तत्काल सामुदायिक स्क्रीनिंग आवश्यक है।",
      riskLevel: "जोखिम स्तर",
      critical: "गंभीर",
      moderate: "मध्यम",
      stable: "स्थिर",
      score: "स्कोर",
      popSummary: "जनसंख्या सारांश",
      highRisk: "उच्च जोखिम",
      mediumRisk: "मध्यम जोखिम",
      totalScreened: "कुल स्क्रीनिंग",
      diseaseClusters: "रोग क्लस्टर",
      fever: "बुखार",
      weakness: "कमजोरी",
      stress: "तनाव",
      highBp: "उच्च रक्तचाप"
    }
  },
  'te.json': {
    family: {
      familyIntelligence: "కుటుంబ మేధస్సు",
      noMembers: "కుటుంబ సభ్యులు ఎవరూ కనుగొనబడలేదు. అంతర్దృష్టులను చూడటానికి ఫ్యామిలీ ID ఉన్న రోగులను జోడించండి.",
      familyId: "కుటుంబం ID",
      familyInsight: "కుటుంబ అంతర్దృష్టి",
      familyMembers: "కుటుంబ సభ్యులు",
      highRisk: "అధిక ప్రమాదం",
      mediumRisk: "మధ్యస్థ ప్రమాదం",
      lowRisk: "తక్కువ ప్రమాదం",
      y: "సంవత్సరాలు"
    },
    community: {
      communityRisk: "కమ్యూనిటీ ప్రమాదం",
      noData: "కమ్యూనిటీ డేటా ఇంకా అందుబాటులో లేదు.",
      outbreakWarning: "వ్యాప్తి హెచ్చరిక",
      outbreakDesc: "ఈ క్లస్టర్‌లో జ్వరం/బలహీనతకు సంబంధించిన బహుళ కేసులు కనుగొనబడ్డాయి. తక్షణ సంఘం స్క్రీనింగ్ అవసరం.",
      riskLevel: "ప్రమాద స్థాయి",
      critical: "క్లిష్టమైన",
      moderate: "మితమైన",
      stable: "స్థిరమైన",
      score: "స్కోరు",
      popSummary: "జనాభా సారాంశం",
      highRisk: "అధిక ప్రమాదం",
      mediumRisk: "మధ్యస్థ ప్రమాదం",
      totalScreened: "మొత్తం స్క్రీనింగ్ చేయబడింది",
      diseaseClusters: "వ్యాధి క్లస్టర్లు",
      fever: "జ్వరం",
      weakness: "బలహీనత",
      stress: "ఒత్తిడి",
      highBp: "అధిక రక్తపోటు"
    }
  }
};
files.forEach(f => {
  const path = 'src/i18n/locales/' + f;
  let data = JSON.parse(fs.readFileSync(path, 'utf8'));
  data.family = data.family || {};
  Object.assign(data.family, updates[f].family);
  data.community = data.community || {};
  Object.assign(data.community, updates[f].community);
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
});
