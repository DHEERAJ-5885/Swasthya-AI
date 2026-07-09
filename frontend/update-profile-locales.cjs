const fs = require('fs');
const files = ['en.json', 'hi.json', 'te.json'];

const translations = {
  en: {
    profile: {
      profileLoading: 'Loading profile...',
      profileNotFound: 'Profile not found',
      totalPatients: 'Total Patients',
      highRisk: 'High Risk',
      followUpRate: 'Follow-up Rate',
      screensThisMonth: 'Screens (This Month)',
      phone: 'Phone',
      email: 'Email',
      village: 'Village',
      language: 'Language',
      notSet: 'Not set',
      enrolledPatients: 'Enrolled Patients',
      patients: 'patients',
      viewAll: 'View All',
      neverScreened: 'Never screened',
      noEnrolledPatients: 'No patients enrolled yet',
      settings: 'Settings',
      appLanguage: 'App Language',
      saving: 'Saving...',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
      editProfile: 'Edit Profile',
      logout: 'Logout',
      claimPatients: 'Claim Existing Patients',
      profileSuccess: 'Profile updated successfully',
      profileFail: 'Failed to update profile',
      phoneInvalid: 'Phone number must be exactly 10 digits',
      claimSuccess: 'Assigned {{count}} patient(s) to your account',
      claimFail: 'Failed to assign patients',
      newPassword: 'New Password',
      leaveBlank: 'Leave blank to keep current'
    }
  },
  hi: {
    profile: {
      profileLoading: 'प्रोफाइल लोड हो रहा है...',
      profileNotFound: 'प्रोफाइल नहीं मिला',
      totalPatients: 'कुल मरीज',
      highRisk: 'उच्च जोखिम',
      followUpRate: 'फॉलो-अप दर',
      screensThisMonth: 'स्क्रीनिंग (इस महीने)',
      phone: 'फोन',
      email: 'ईमेल',
      village: 'गांव',
      language: 'भाषा',
      notSet: 'सेट नहीं है',
      enrolledPatients: 'नामांकित मरीज',
      patients: 'मरीज',
      viewAll: 'सब देखें',
      neverScreened: 'कभी स्क्रीन नहीं किया गया',
      noEnrolledPatients: 'अभी कोई मरीज नहीं जुड़े हैं',
      settings: 'सेटिंग्स',
      appLanguage: 'ऐप भाषा',
      saving: 'सेव हो रहा है...',
      saveChanges: 'बदलाव सहेजें',
      cancel: 'रद्द करें',
      editProfile: 'प्रोफाइल संपादित करें',
      logout: 'लॉग आउट',
      claimPatients: 'मौजूदा मरीज जोड़ें',
      profileSuccess: 'प्रोफ़ाइल सफलतापूर्वक अद्यतन की गई',
      profileFail: 'प्रोफ़ाइल अपडेट करने में विफल',
      phoneInvalid: 'फ़ोन नंबर ठीक 10 अंकों का होना चाहिए',
      claimSuccess: 'आपके खाते में {{count}} रोगी सौंपे गए',
      claimFail: 'मरीजों को सौंपने में विफल',
      newPassword: 'नया पासवर्ड',
      leaveBlank: 'वर्तमान रखने के लिए खाली छोड़ दें'
    }
  },
  te: {
    profile: {
      profileLoading: 'ప్రొఫైల్ లోడ్ అవుతోంది...',
      profileNotFound: 'ప్రొఫైల్ దొరకలేదు',
      totalPatients: 'మొత్తం రోగులు',
      highRisk: 'అధిక ప్రమాదం',
      followUpRate: 'ఫాలో-అప్ రేటు',
      screensThisMonth: 'ఈ నెల స్క్రీనింగ్‌లు',
      phone: 'ఫోన్',
      email: 'ఈమెయిల్',
      village: 'గ్రామం',
      language: 'భాష',
      notSet: 'సెట్ చేయలేదు',
      enrolledPatients: 'నమోదైన పేషెంట్లు',
      patients: 'పేషెంట్లు',
      viewAll: 'అన్నీ చూడండి',
      neverScreened: 'ఎప్పుడూ స్క్రీన్ చేయలేదు',
      noEnrolledPatients: 'ఇప్పుడే ఎలాంటి రోగులు నమోదు కాలేదు',
      settings: 'సెట్టింగ్స్',
      appLanguage: 'యాప్ భాష',
      saving: 'సేవ్ అవుతోంది...',
      saveChanges: 'మార్పులు సేవ్ చేయండి',
      cancel: 'రద్దు చేయండి',
      editProfile: 'ప్రొఫైల్ సవరించండి',
      logout: 'లాగ్ అవుట్',
      claimPatients: 'ఉన్న రోగులను చేర్చండి',
      profileSuccess: 'ప్రొఫైల్ విజయవంతంగా నవీకరించబడింది',
      profileFail: 'ప్రొఫైల్‌ను నవీకరించడంలో విఫలమైంది',
      phoneInvalid: 'ఫోన్ నంబర్ ఖచ్చితంగా 10 అంకెలు ఉండాలి',
      claimSuccess: 'మీ ఖాతాకు {{count}} రోగులు కేటాయించబడ్డారు',
      claimFail: 'రోగులను కేటాయించడంలో విఫలమైంది',
      newPassword: 'క్రొత్త పాస్వర్డ్',
      leaveBlank: 'ప్రస్తుతాని ఉంచడానికి ఖాళీగా ఉంచండి'
    }
  }
};

files.forEach(f => {
  const lang = f.split('.')[0];
  const path = 'src/i18n/locales/' + f;
  let data = JSON.parse(fs.readFileSync(path, 'utf8'));
  data.profile = data.profile || {};
  Object.assign(data.profile, translations[lang].profile);
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
});
