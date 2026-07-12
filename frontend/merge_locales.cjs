const fs = require('fs');
const path = require('path');

const newTranslations = [
  // 1. Screening
  {
    "en": {
      "result": {
        "noResult": "No screening result found.",
        "backToPatient": "Back to Patient",
        "title": "Health Intelligence Result",
        "riskLevel": "Risk Level",
        "aiConfidence": "AI Confidence",
        "driftDetector": "Drift Detector",
        "whatChanged": "What Changed:",
        "symptomExtraction": "AI Symptom Extraction",
        "nextAction": "Next Best Action",
        "scheduleFollowUp": "Schedule Follow-up",
        "doneAndSave": "Done & Save to Profile"
      },
      "alerts": {
        "id": "ID"
      },
      "screening": {
        "scanAlt": "Scan"
      }
    },
    "hi": {
      "result": {
        "noResult": "कोई जांच परिणाम नहीं मिला।",
        "backToPatient": "मरीज पर वापस जाएं",
        "title": "स्वास्थ्य बुद्धिमत्ता परिणाम",
        "riskLevel": "जोखिम स्तर",
        "aiConfidence": "एआई आत्मविश्वास",
        "driftDetector": "बदलाव का पता लगाने वाला",
        "whatChanged": "क्या बदला:",
        "symptomExtraction": "एआई लक्षण निष्कर्षण",
        "nextAction": "अगली सबसे अच्छी कार्रवाई",
        "scheduleFollowUp": "फॉलो-अप शेड्यूल करें",
        "doneAndSave": "पूरा हुआ और प्रोफ़ाइल में सहेजें"
      },
      "alerts": {
        "id": "आईडी"
      },
      "screening": {
        "scanAlt": "स्कैन"
      }
    },
    "te": {
      "result": {
        "noResult": "స్క్రీనింగ్ ఫలితం కనుగొనబడలేదు.",
        "backToPatient": "రోగికి తిరిగి వెళ్లండి",
        "title": "ఆరోగ్య ఇంటెలిజెన్స్ ఫలితం",
        "riskLevel": "ప్రమాద స్థాయి",
        "aiConfidence": "AI కాన్ఫిడెన్స్",
        "driftDetector": "డ్రిఫ్ట్ డిటెక్టర్",
        "whatChanged": "ఏమి మారింది:",
        "symptomExtraction": "AI లక్షణాల వెలికితీత",
        "nextAction": "తదుపరి ఉత్తమ చర్య",
        "scheduleFollowUp": "ఫాలో-అప్ షెడ్యూల్ చేయండి",
        "doneAndSave": "పూర్తయింది & ప్రొఫైల్‌కు సేవ్ చేయండి"
      },
      "alerts": {
        "id": "ID"
      },
      "screening": {
        "scanAlt": "స్కాన్"
      }
    }
  },
  // 2. AI Analytics
  {
    "en": {
      "ai": {
        "emergencyAlertToast": "🚨 Emergency Alert Generated! High priority follow-up created.",
        "emergencyAlert": "Emergency Alert"
      },
      "analytics": {
        "timeRange7Days": "7 Days"
      }
    },
    "hi": {
      "ai": {
        "emergencyAlertToast": "🚨 आपातकालीन अलर्ट उत्पन्न हुआ! उच्च प्राथमिकता वाला फॉलो-अप बनाया गया।",
        "emergencyAlert": "आपातकालीन अलर्ट"
      },
      "analytics": {
        "timeRange7Days": "7 दिन"
      }
    },
    "te": {
      "ai": {
        "emergencyAlertToast": "🚨 అత్యవసర హెచ్చరిక సృష్టించబడింది! అధిక ప్రాధాన్యత గల ఫాలో-అప్ సృష్టించబడింది.",
        "emergencyAlert": "అత్యవసర హెచ్చరిక"
      },
      "analytics": {
        "timeRange7Days": "7 రోజులు"
      }
    }
  },
  // 3. Nav Auth
  {
    "en": {
      "auth": {
        "loginFailed": "Login failed",
        "registerFailed": "Registration failed",
        "placeholderName": "Anita Kumari",
        "placeholderEmpId": "ASH-001234",
        "placeholderPhone": "9876543210",
        "placeholderVillage": "Rampur",
        "placeholderDistrict": "Patna",
        "placeholderEmail": "anita@example.com",
        "placeholderPassword": "••••••••",
        "enterCredsErr": "Please enter Employee ID and password",
        "loginSuccess": "Login successful!",
        "fillAllFields": "Please fill all fields",
        "phoneLengthErr": "Phone number must be at least 10 digits",
        "registerSuccess": "Registration successful!",
        "swasthyaAi": "Swasthya AI",
        "tagline": "Healthcare at First Point of Care",
        "signIn": "Sign In",
        "register": "Register",
        "fullName": "Full Name",
        "employeeId": "Employee ID",
        "password": "Password",
        "phoneNum": "Phone Number",
        "village": "Village",
        "emailOpt": "Email (Optional)",
        "signingIn": "Signing in...",
        "registering": "Registering...",
        "createAccount": "Create Account",
        "demoCreds": "Demo Credentials",
        "loadDemo": "Load Demo Account"
      },
      "nav": {
        "calendar": "Calendar",
        "swasthyaAi": "Swasthya AI",
        "tagline": "AI for Rural Healthcare",
        "user": "User",
        "ashaWorker": "ASHA Worker",
        "idUnknown": "ID-UNKNOWN"
      }
    },
    "hi": {
      "auth": {
        "loginFailed": "लॉगिन विफल रहा",
        "registerFailed": "पंजीकरण विफल रहा",
        "placeholderName": "अनिता कुमारी",
        "placeholderEmpId": "ASH-001234",
        "placeholderPhone": "9876543210",
        "placeholderVillage": "रामपुर",
        "placeholderDistrict": "पटना",
        "placeholderEmail": "anita@example.com",
        "placeholderPassword": "••••••••",
        "enterCredsErr": "कृपया कर्मचारी आईडी और पासवर्ड दर्ज करें",
        "loginSuccess": "लॉगिन सफल!",
        "fillAllFields": "कृपया सभी फ़ील्ड भरें",
        "phoneLengthErr": "फ़ोन नंबर कम से कम 10 अंकों का होना चाहिए",
        "registerSuccess": "पंजीकरण सफल!",
        "swasthyaAi": "स्वास्थ्य एआई",
        "tagline": "देखभाल के पहले बिंदु पर स्वास्थ्य सेवा",
        "signIn": "साइन इन करें",
        "register": "रजिस्टर करें",
        "fullName": "पूरा नाम",
        "employeeId": "कर्मचारी आईडी",
        "password": "पासवर्ड",
        "phoneNum": "फ़ोन नंबर",
        "village": "गाँव",
        "emailOpt": "ईमेल (वैकल्पिक)",
        "signingIn": "साइन इन हो रहा है...",
        "registering": "पंजीकरण हो रहा है...",
        "createAccount": "खाता बनाएँ",
        "demoCreds": "डेमो क्रेडेंशियल्स",
        "loadDemo": "डेमो खाता लोड करें"
      },
      "nav": {
        "calendar": "कैलेंडर",
        "swasthyaAi": "स्वास्थ्य एआई",
        "tagline": "ग्रामीण स्वास्थ्य देखभाल के लिए एआई",
        "user": "उपयोगकर्ता",
        "ashaWorker": "आशा कार्यकर्ता",
        "idUnknown": "आईडी-अज्ञात"
      }
    },
    "te": {
      "auth": {
        "loginFailed": "లాగిన్ విఫలమైంది",
        "registerFailed": "నమోదు విఫలమైంది",
        "placeholderName": "అనితా కుమారి",
        "placeholderEmpId": "ASH-001234",
        "placeholderPhone": "9876543210",
        "placeholderVillage": "రాంపూర్",
        "placeholderDistrict": "పాట్నా",
        "placeholderEmail": "anita@example.com",
        "placeholderPassword": "••••••••",
        "enterCredsErr": "దయచేసి ఉద్యోగి ఐడీ మరియు పాస్‌వర్డ్ నమోదు చేయండి",
        "loginSuccess": "లాగిన్ విజయవంతమైంది!",
        "fillAllFields": "దయచేసి అన్ని ఫీల్డ్‌లను పూరించండి",
        "phoneLengthErr": "ఫోన్ నంబర్ కనీసం 10 అంకెలు ఉండాలి",
        "registerSuccess": "నమోదు విజయవంతమైంది!",
        "swasthyaAi": "స్వాస్థ్య AI",
        "tagline": "సంరక్షణ మొదటి పాయింట్ వద్ద ఆరోగ్య సంరక్షణ",
        "signIn": "సైన్ ఇన్ చేయండి",
        "register": "నమోదు చేయండి",
        "fullName": "పూర్తి పేరు",
        "employeeId": "ఉద్యోగి ఐడీ",
        "password": "పాస్‌వర్డ్",
        "phoneNum": "ఫోన్ నంబర్",
        "village": "గ్రామం",
        "emailOpt": "ఇమెయిల్ (ఐచ్ఛికం)",
        "signingIn": "సైన్ ఇన్ అవుతోంది...",
        "registering": "నమోదు అవుతోంది...",
        "createAccount": "ఖాతా సృష్టించండి",
        "demoCreds": "డెమో ఆధారాలు",
        "loadDemo": "డెమో ఖాతాను లోడ్ చేయండి"
      },
      "nav": {
        "calendar": "క్యాలెండర్",
        "swasthyaAi": "స్వాస్థ్య AI",
        "tagline": "గ్రామీణ ఆరోగ్య సంరక్షణ కోసం AI",
        "user": "వినియోగదారు",
        "ashaWorker": "ఆశా కార్యకర్త",
        "idUnknown": "ID-తెలియదు"
      }
    }
  },
  // 4. Dashboard
  {
    "en": {
      "dashboard": {
        "emergencySuccess": "Emergency alert triggered successfully",
        "emergencyFail": "Failed to trigger emergency alert",
        "synced": "SYNCED",
        "offline": "OFFLINE",
        "ashaWorker": "ASHA Worker",
        "heroTitle1": "Empowering Health,",
        "heroTitle2": "Transforming Lives",
        "heroSubtitle": "AI-powered insights for a healthier community",
        "village": "Village",
        "demoDate": "Tue, 20 May 2026",
        "increasing": "Increasing",
        "vsLastWeek": "vs last week",
        "scanCard": "Scan Card",
        "voice": "Voice",
        "upcomingFollowUps": "Upcoming Follow-ups",
        "viewCalendar": "View Calendar",
        "today": "Today",
        "allDay": "All Day",
        "noFollowUpsToday": "No follow-ups today",
        "tomorrow": "Tomorrow",
        "noFollowUpsTomorrow": "No follow-ups tomorrow",
        "overdue": "Overdue",
        "noOverdueFollowUps": "No overdue follow-ups",
        "upcoming": "Upcoming",
        "vsLastMonth": "vs last month"
      },
      "patients": {
        "unknown": "Unknown"
      },
      "profile": {
        "failedToLoadData": "Failed to load patient data",
        "confirmDelete": "Delete patient {{name}}? This action cannot be undone.",
        "patientDeleted": "Patient deleted successfully",
        "deleteFailed": "Failed to delete patient",
        "noDataAvailable": "No data available",
        "schedule": "Schedule",
        "routineFollowUp": "Routine follow-up",
        "observationSaved": "Observation saved",
        "observationFailed": "Failed to save observation",
        "scheduleFollowUp": "Schedule Follow-up"
      },
      "form": {
        "patientPhoto": "Patient Photo"
      }
    },
    "hi": {
      "dashboard": {
        "emergencySuccess": "आपातकालीन अलर्ट सफलतापूर्वक ट्रिगर हुआ",
        "emergencyFail": "आपातकालीन अलर्ट ट्रिगर करने में विफल",
        "synced": "सिंक किया गया",
        "offline": "ऑफ़लाइन",
        "ashaWorker": "आशा कार्यकर्ता",
        "heroTitle1": "स्वास्थ्य को सशक्त बनाना,",
        "heroTitle2": "जीवन बदलना",
        "heroSubtitle": "स्वस्थ समुदाय के लिए एआई संचालित अंतर्दृष्टि",
        "village": "गाँव",
        "demoDate": "मंगल, 20 मई 2026",
        "increasing": "बढ़ रहा है",
        "vsLastWeek": "पिछले सप्ताह की तुलना में",
        "scanCard": "कार्ड स्कैन करें",
        "voice": "आवाज़",
        "upcomingFollowUps": "आगामी फॉलो-अप",
        "viewCalendar": "कैलेंडर देखें",
        "today": "आज",
        "allDay": "पूरा दिन",
        "noFollowUpsToday": "आज कोई फॉलो-अप नहीं",
        "tomorrow": "कल",
        "noFollowUpsTomorrow": "कल कोई फॉलो-अप नहीं",
        "overdue": "बकाया",
        "noOverdueFollowUps": "कोई बकाया फॉलो-अप नहीं",
        "upcoming": "आगामी",
        "vsLastMonth": "पिछले महीने की तुलना में"
      },
      "patients": {
        "unknown": "अज्ञात"
      },
      "profile": {
        "failedToLoadData": "मरीज का डेटा लोड करने में विफल",
        "confirmDelete": "क्या आप मरीज {{name}} को हटाना चाहते हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।",
        "patientDeleted": "मरीज सफलतापूर्वक हटा दिया गया",
        "deleteFailed": "मरीज को हटाने में विफल",
        "noDataAvailable": "कोई डेटा उपलब्ध नहीं",
        "schedule": "निर्धारित करें",
        "routineFollowUp": "नियमित फॉलो-अप",
        "observationSaved": "अवलोकन सहेजा गया",
        "observationFailed": "अवलोकन सहेजने में विफल",
        "scheduleFollowUp": "फॉलो-अप निर्धारित करें"
      },
      "form": {
        "patientPhoto": "मरीज की तस्वीर"
      }
    },
    "te": {
      "dashboard": {
        "emergencySuccess": "అత్యవసర హెచ్చరిక విజయవంతంగా పంపబడింది",
        "emergencyFail": "అత్యవసర హెచ్చరిక పంపడంలో విఫలమైంది",
        "synced": "సింక్ చేయబడింది",
        "offline": "ఆఫ్‌లైన్",
        "ashaWorker": "ఆశా వర్కర్",
        "heroTitle1": "ఆరోగ్య సాధికారత,",
        "heroTitle2": "జీవితాలను మార్చడం",
        "heroSubtitle": "ఆరోగ్యకరమైన సమాజం కోసం AI-ఆధారిత అంతర్దృష్టులు",
        "village": "గ్రామం",
        "demoDate": "మంగళ, 20 మే 2026",
        "increasing": "పెరుగుతోంది",
        "vsLastWeek": "గత వారంతో పోలిస్తే",
        "scanCard": "కార్డ్ స్కాన్ చేయండి",
        "voice": "వాయిస్",
        "upcomingFollowUps": "రాబోయే ఫాలో-అప్‌లు",
        "viewCalendar": "క్యాలెండర్ చూడండి",
        "today": "ఈరోజు",
        "allDay": "రోజంతా",
        "noFollowUpsToday": "ఈరోజు ఫాలో-అప్‌లు లేవు",
        "tomorrow": "రేపు",
        "noFollowUpsTomorrow": "రేపు ఫాలో-అప్‌లు లేవు",
        "overdue": "గడువు ముగిసినవి",
        "noOverdueFollowUps": "గడువు ముగిసిన ఫాలో-అప్‌లు లేవు",
        "upcoming": "రాబోయేవి",
        "vsLastMonth": "గత నెలతో పోలిస్తే"
      },
      "patients": {
        "unknown": "తెలియదు"
      },
      "profile": {
        "failedToLoadData": "రోగి డేటాను లోడ్ చేయడం విఫలమైంది",
        "confirmDelete": "రోగి {{name}}ని తొలగించాలా? ఈ చర్యను రద్దు చేయలేరు.",
        "patientDeleted": "రోగి విజయవంతంగా తొలగించబడ్డారు",
        "deleteFailed": "రోగిని తొలగించడం విఫలమైంది",
        "noDataAvailable": "డేటా అందుబాటులో లేదు",
        "schedule": "షెడ్యూల్ చేయండి",
        "routineFollowUp": "సాధారణ ఫాలో-అప్",
        "observationSaved": "పరిశీలన సేవ్ చేయబడింది",
        "observationFailed": "పరిశీలనను సేవ్ చేయడం విఫలమైంది",
        "scheduleFollowUp": "ఫాలో-అప్‌ను షెడ్యూల్ చేయండి"
      },
      "form": {
        "patientPhoto": "రోగి ఫోటో"
      }
    }
  },
  // 5. Settings Calendar
  {
    "en": {
      "reports": {
        "pdf": {
          "clinicalScreening": "Clinical Screening Report",
          "reportId": "Report ID",
          "date": "Date",
          "patientInfo": "Patient Information",
          "patientName": "Patient Name",
          "patientId": "Patient ID",
          "na": "N/A",
          "age": "Age",
          "gender": "Gender",
          "village": "Village",
          "healthStatus": "Health Status & Assessment",
          "healthScore": "Health Score",
          "riskLevel": "Risk Level",
          "aiRiskAssessment": "AI Risk Assessment",
          "noAssessment": "No assessment provided.",
          "metricSymptom": "Metric / Symptom",
          "recordedValue": "Recorded Value",
          "actionPlan": "Action Plan",
          "aiRecommendations": "AI Recommendations",
          "followUpNormally": "Follow up normally.",
          "followUpSchedule": "Follow-up Schedule",
          "followUp1Month": "Follow-up in 1 month.",
          "immediateFollowUp": "Immediate follow-up required (within 24 hours).",
          "followUp7Days": "Follow-up within 7 days.",
          "emergencyRecommendation": "⚠️ EMERGENCY RECOMMENDATION:",
          "emergencyText": "Patient shows high risk indicators. Immediate referral to the nearest Primary Health Centre (PHC) or hospital is strongly recommended. Please alert local medical authorities if necessary.",
          "generatedBy": "Generated by Swasthya AI",
          "timestamp": "Timestamp",
          "page": "Page",
          "of": "of",
          "unableToGeneratePdf": "Unable to generate PDF.",
          "pleaseTryAgain": "Please try again."
        }
      },
      "calendar": {
        "unknownPatient": "Unknown Patient",
        "failedLoad": "Failed to load calendar events",
        "title": "Follow-up Calendar",
        "allStatus": "All Status",
        "pending": "Pending",
        "completed": "Completed",
        "missed": "Missed",
        "allRisks": "All Risks",
        "highRisk": "High Risk",
        "mediumRisk": "Medium Risk",
        "lowRisk": "Low Risk",
        "today": "Today",
        "month": "Month",
        "week": "Week",
        "day": "Day",
        "agenda": "Agenda",
        "village": "Village",
        "na": "N/A",
        "phone": "Phone",
        "risk": "Risk",
        "date": "Date",
        "worker": "Worker",
        "noReason": "No reason provided",
        "unknownVillage": "Unknown Village",
        "schedule": "Schedule",
        "reason": "Reason",
        "routineFollowUp": "Routine follow-up",
        "statusPriority": "Status & Priority",
        "status": "Status",
        "priority": "Priority",
        "viewPatientProfile": "View Patient Profile",
        "startScreening": "Start Follow-up Screening",
        "markCompleted": "Mark as Completed manually",
        "cancelFollowUp": "Cancel Follow-up"
      },
      "list": {
        "failedLoad": "Failed to load follow-ups.",
        "markedCompleted": "Follow-up marked as completed!",
        "failedComplete": "Failed to complete follow-up.",
        "pendingFollowUps": "Pending Follow-ups",
        "noPending": "No pending follow-ups.",
        "unknownPatient": "Unknown Patient",
        "priority": "Priority"
      },
      "schedule": {
        "selectDateErr": "Please select a follow-up date",
        "dateFutureErr": "Follow-up date must be in the future",
        "success": "Follow-up scheduled successfully!",
        "error": "Failed to schedule follow-up.",
        "title": "Schedule Follow-up",
        "selectDate": "Select Date",
        "timeOptional": "Time (Optional)",
        "riskLevel": "Risk Level",
        "lowRisk": "Low Risk",
        "mediumRisk": "Medium Risk",
        "highRisk": "High Risk",
        "critical": "Critical",
        "priority": "Priority",
        "high": "High",
        "medium": "Medium",
        "low": "Low",
        "reason": "Reason for Follow-up",
        "reasonPlaceholder": "e.g. Routine Checkup, High Risk Review",
        "notes": "Add Notes (Optional)",
        "notesPlaceholder": "Enter notes...",
        "scheduling": "Scheduling...",
        "confirm": "Confirm Follow-up"
      },
      "publicCard": {
        "na": "N/A",
        "unknown": "Unknown",
        "title": "Patient QR Details",
        "invalidQr": "Invalid or empty QR data",
        "invalidQrDesc": "This QR code does not contain readable patient details.",
        "scannedFromQr": "Scanned from ASHA QR",
        "unknownPatient": "Unknown Patient",
        "familyId": "Family ID",
        "village": "Village",
        "healthScore": "Health Score",
        "riskLevel": "Risk Level",
        "verifiedFromQr": "Patient details verified from QR",
        "verifiedFromQrDesc": "If this card opens on another phone, the QR successfully carries the patient summary.",
        "scanTime": "Scan time"
      },
      "profile": {
        "failedLoad": "Failed to load profile",
        "phoneErr": "Phone number must be exactly 10 digits",
        "updateSuccess": "Profile updated successfully!",
        "updateFail": "Failed to update profile",
        "langUpdated": "Language updated",
        "langFail": "Failed to save language preference",
        "notifSaved": "Notification settings saved",
        "notifFail": "Failed to save notification settings",
        "active": "Active",
        "id": "ID",
        "phc": "PHC",
        "unassigned": "Unassigned",
        "editProfile": "Edit Profile",
        "cancel": "Cancel",
        "save": "Save",
        "personalInfo": "Personal Information",
        "fullName": "Full Name",
        "phoneNumber": "Phone Number",
        "emailAddress": "Email Address",
        "notProvided": "Not provided",
        "gender": "Gender",
        "selectGender": "Select Gender",
        "female": "Female",
        "male": "Male",
        "other": "Other",
        "notSpecified": "Not specified",
        "dob": "Date of Birth",
        "address": "Address",
        "workInfo": "Work Information",
        "workerId": "Worker ID",
        "assignedVillage": "Assigned Village",
        "assignedPHC": "Assigned PHC",
        "joiningDate": "Joining Date",
        "language": "Language",
        "langDesc": "Select your preferred application language.",
        "notifications": "Notifications",
        "emergAlerts": "Emergency Alerts",
        "emergAlertsDesc": "Critical high-risk patient alerts",
        "followUpReminders": "Follow-up Reminders",
        "followUpRemindersDesc": "Daily pending follow-ups",
        "commNotifs": "Community Outbreaks",
        "commNotifsDesc": "Village-level health alerts",
        "account": "Account",
        "changePassword": "Change Password",
        "enterNewPassword": "Enter new password",
        "leaveBlank": "Leave blank to keep current password.",
        "signOut": "Sign Out"
      }
    },
    "hi": {
      "reports": {
        "pdf": {
          "clinicalScreening": "क्लिनिकल स्क्रीनिंग रिपोर्ट",
          "reportId": "रिपोर्ट आईडी",
          "date": "तारीख",
          "patientInfo": "मरीज की जानकारी",
          "patientName": "मरीज का नाम",
          "patientId": "मरीज आईडी",
          "na": "उपलब्ध नहीं",
          "age": "उम्र",
          "gender": "लिंग",
          "village": "गाँव",
          "healthStatus": "स्वास्थ्य स्थिति और मूल्यांकन",
          "healthScore": "स्वास्थ्य स्कोर",
          "riskLevel": "जोखिम स्तर",
          "aiRiskAssessment": "एआई जोखिम मूल्यांकन",
          "noAssessment": "कोई मूल्यांकन प्रदान नहीं किया गया।",
          "metricSymptom": "मीट्रिक / लक्षण",
          "recordedValue": "दर्ज किया गया मान",
          "actionPlan": "कार्य योजना",
          "aiRecommendations": "एआई की सिफारिशें",
          "followUpNormally": "सामान्य रूप से फॉलो-अप करें।",
          "followUpSchedule": "फॉलो-अप अनुसूची",
          "followUp1Month": "1 महीने में फॉलो-अप।",
          "immediateFollowUp": "तत्काल फॉलो-अप की आवश्यकता है (24 घंटे के भीतर)।",
          "followUp7Days": "7 दिनों के भीतर फॉलो-अप।",
          "emergencyRecommendation": "⚠️ आपातकालीन सिफारिश:",
          "emergencyText": "मरीज में उच्च जोखिम के संकेतक दिख रहे हैं। निकटतम प्राथमिक स्वास्थ्य केंद्र (PHC) या अस्पताल में तत्काल रेफ़रल की दृढ़ता से अनुशंसा की जाती है। यदि आवश्यक हो तो कृपया स्थानीय चिकित्सा अधिकारियों को सचेत करें।",
          "generatedBy": "Swasthya AI द्वारा जनरेट किया गया",
          "timestamp": "समय",
          "page": "पृष्ठ",
          "of": "का",
          "unableToGeneratePdf": "पीडीएफ जनरेट करने में असमर्थ।",
          "pleaseTryAgain": "कृपया पुनः प्रयास करें।"
        }
      },
      "calendar": {
        "unknownPatient": "अज्ञात मरीज",
        "failedLoad": "कैलेंडर ईवेंट लोड करने में विफल",
        "title": "फॉलो-अप कैलेंडर",
        "allStatus": "सभी स्थिति",
        "pending": "लंबित",
        "completed": "पूरा हुआ",
        "missed": "छूट गया",
        "allRisks": "सभी जोखिम",
        "highRisk": "उच्च जोखिम",
        "mediumRisk": "मध्यम जोखिम",
        "lowRisk": "कम जोखिम",
        "today": "आज",
        "month": "महीना",
        "week": "सप्ताह",
        "day": "दिन",
        "agenda": "कार्यसूची",
        "village": "गाँव",
        "na": "उपलब्ध नहीं",
        "phone": "फ़ोन",
        "risk": "जोखिम",
        "date": "तारीख",
        "worker": "कार्यकर्ता",
        "noReason": "कोई कारण नहीं दिया गया",
        "unknownVillage": "अज्ञात गाँव",
        "schedule": "अनुसूची",
        "reason": "कारण",
        "routineFollowUp": "नियमित फॉलो-अप",
        "statusPriority": "स्थिति और प्राथमिकता",
        "status": "स्थिति",
        "priority": "प्राथमिकता",
        "viewPatientProfile": "मरीज की प्रोफ़ाइल देखें",
        "startScreening": "फॉलो-अप स्क्रीनिंग शुरू करें",
        "markCompleted": "मैन्युअल रूप से पूर्ण के रूप में चिह्नित करें",
        "cancelFollowUp": "फॉलो-अप रद्द करें"
      },
      "list": {
        "failedLoad": "फॉलो-अप लोड करने में विफल।",
        "markedCompleted": "फॉलो-अप पूर्ण के रूप में चिह्नित किया गया!",
        "failedComplete": "फॉलो-अप पूरा करने में विफल।",
        "pendingFollowUps": "लंबित फॉलो-अप",
        "noPending": "कोई लंबित फॉलो-अप नहीं।",
        "unknownPatient": "अज्ञात मरीज",
        "priority": "प्राथमिकता"
      },
      "schedule": {
        "selectDateErr": "कृपया फॉलो-अप की तारीख चुनें",
        "dateFutureErr": "फॉलो-अप की तारीख भविष्य में होनी चाहिए",
        "success": "फॉलो-अप सफलतापूर्वक निर्धारित किया गया!",
        "error": "फॉलो-अप निर्धारित करने में विफल।",
        "title": "फॉलो-अप निर्धारित करें",
        "selectDate": "तारीख चुनें",
        "timeOptional": "समय (वैकल्पिक)",
        "riskLevel": "जोखिम स्तर",
        "lowRisk": "कम जोखिम",
        "mediumRisk": "मध्यम जोखिम",
        "highRisk": "उच्च जोखिम",
        "critical": "गंभीर",
        "priority": "प्राथमिकता",
        "high": "उच्च",
        "medium": "मध्यम",
        "low": "कम",
        "reason": "फॉलो-अप का कारण",
        "reasonPlaceholder": "उदा. नियमित जांच, उच्च जोखिम की समीक्षा",
        "notes": "नोट्स जोड़ें (वैकल्पिक)",
        "notesPlaceholder": "नोट्स दर्ज करें...",
        "scheduling": "निर्धारित किया जा रहा है...",
        "confirm": "फॉलो-अप की पुष्टि करें"
      },
      "publicCard": {
        "na": "उपलब्ध नहीं",
        "unknown": "अज्ञात",
        "title": "मरीज का क्यूआर विवरण",
        "invalidQr": "अमान्य या खाली क्यूआर डेटा",
        "invalidQrDesc": "इस क्यूआर कोड में पढ़ने योग्य मरीज का विवरण नहीं है।",
        "scannedFromQr": "आशा क्यूआर से स्कैन किया गया",
        "unknownPatient": "अज्ञात मरीज",
        "familyId": "परिवार आईडी",
        "village": "गाँव",
        "healthScore": "स्वास्थ्य स्कोर",
        "riskLevel": "जोखिम स्तर",
        "verifiedFromQr": "क्यूआर से मरीज के विवरण सत्यापित किए गए",
        "verifiedFromQrDesc": "यदि यह कार्ड किसी अन्य फोन पर खुलता है, तो क्यूआर सफलतापूर्वक मरीज का सारांश ले जाता है।",
        "scanTime": "स्कैन का समय"
      },
      "profile": {
        "failedLoad": "प्रोफ़ाइल लोड करने में विफल",
        "phoneErr": "फ़ोन नंबर ठीक 10 अंकों का होना चाहिए",
        "updateSuccess": "प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!",
        "updateFail": "प्रोफ़ाइल अपडेट करने में विफल",
        "langUpdated": "भाषा अपडेट की गई",
        "langFail": "भाषा प्राथमिकता सहेजने में विफल",
        "notifSaved": "अधिसूचना सेटिंग्स सहेजी गईं",
        "notifFail": "अधिसूचना सेटिंग्स सहेजने में विफल",
        "active": "सक्रिय",
        "id": "आईडी",
        "phc": "पीएचसी",
        "unassigned": "असाइन नहीं किया गया",
        "editProfile": "प्रोफ़ाइल संपादित करें",
        "cancel": "रद्द करें",
        "save": "सहेजें",
        "personalInfo": "व्यक्तिगत जानकारी",
        "fullName": "पूरा नाम",
        "phoneNumber": "फ़ोन नंबर",
        "emailAddress": "ईमेल पता",
        "notProvided": "प्रदान नहीं किया गया",
        "gender": "लिंग",
        "selectGender": "लिंग चुनें",
        "female": "महिला",
        "male": "पुरुष",
        "other": "अन्य",
        "notSpecified": "निर्दिष्ट नहीं है",
        "dob": "जन्म की तारीख",
        "address": "पता",
        "workInfo": "कार्य की जानकारी",
        "workerId": "कार्यकर्ता आईडी",
        "assignedVillage": "आवंटित गाँव",
        "assignedPHC": "आवंटित पीएचसी",
        "joiningDate": "शामिल होने की तारीख",
        "language": "भाषा",
        "langDesc": "अपनी पसंदीदा एप्लिकेशन भाषा चुनें।",
        "notifications": "अधिसूचनाएं",
        "emergAlerts": "आपातकालीन अलर्ट",
        "emergAlertsDesc": "गंभीर उच्च-जोखिम वाले मरीज अलर्ट",
        "followUpReminders": "फॉलो-अप अनुस्मारक",
        "followUpRemindersDesc": "दैनिक लंबित फॉलो-अप",
        "commNotifs": "सामुदायिक प्रकोप",
        "commNotifsDesc": "गाँव-स्तरीय स्वास्थ्य अलर्ट",
        "account": "खाता",
        "changePassword": "पासवर्ड बदलें",
        "enterNewPassword": "नया पासवर्ड दर्ज करें",
        "leaveBlank": "वर्तमान पासवर्ड रखने के लिए खाली छोड़ दें।",
        "signOut": "साइन आउट"
      }
    },
    "te": {
      "reports": {
        "pdf": {
          "clinicalScreening": "క్లినికల్ స్క్రీనింగ్ నివేదిక",
          "reportId": "రిపోర్ట్ ID",
          "date": "తేదీ",
          "patientInfo": "రోగి సమాచారం",
          "patientName": "రోగి పేరు",
          "patientId": "రోగి ID",
          "na": "వర్తించదు",
          "age": "వయస్సు",
          "gender": "లింగం",
          "village": "గ్రామం",
          "healthStatus": "ఆరోగ్య స్థితి & అంచనా",
          "healthScore": "ఆరోగ్య స్కోర్",
          "riskLevel": "ప్రమాద స్థాయి",
          "aiRiskAssessment": "AI ప్రమాద అంచనా",
          "noAssessment": "ఎలాంటి అంచనా అందించబడలేదు.",
          "metricSymptom": "మెట్రిక్ / లక్షణం",
          "recordedValue": "నమోదు చేసిన విలువ",
          "actionPlan": "కార్యాచరణ ప్రణాళిక",
          "aiRecommendations": "AI సిఫార్సులు",
          "followUpNormally": "సాధారణంగా ఫాలో-అప్ చేయండి.",
          "followUpSchedule": "ఫాలో-అప్ షెడ్యూల్",
          "followUp1Month": "1 నెలలో ఫాలో-అప్ చేయండి.",
          "immediateFollowUp": "తక్షణ ఫాలో-అప్ అవసరం (24 గంటల్లోగా).",
          "followUp7Days": "7 రోజుల్లోగా ఫాలో-అప్ చేయండి.",
          "emergencyRecommendation": "⚠️ అత్యవసర సిఫార్సు:",
          "emergencyText": "రోగి అధిక ప్రమాద సూచికలను చూపిస్తున్నాడు. సమీపంలోని ప్రాథమిక ఆరోగ్య కేంద్రం (PHC) లేదా ఆసుపత్రికి తక్షణమే రిఫరల్ చేయాలని గట్టిగా సిఫార్సు చేయబడింది. అవసరమైతే దయచేసి స్థానిక వైద్య అధికారులను అప్రమత్తం చేయండి.",
          "generatedBy": "Swasthya AI ద్వారా రూపొందించబడింది",
          "timestamp": "సమయం",
          "page": "పేజీ",
          "of": "లో",
          "unableToGeneratePdf": "PDF రూపొందించడం సాధ్యం కాలేదు.",
          "pleaseTryAgain": "దయచేసి మళ్లీ ప్రయత్నించండి."
        }
      },
      "calendar": {
        "unknownPatient": "తెలియని రోగి",
        "failedLoad": "క్యాలెండర్ ఈవెంట్‌లను లోడ్ చేయడంలో విఫలమైంది",
        "title": "ఫాలో-అప్ క్యాలెండర్",
        "allStatus": "అన్ని స్థితులు",
        "pending": "పెండింగ్‌లో ఉంది",
        "completed": "పూర్తయింది",
        "missed": "తప్పిపోయింది",
        "allRisks": "అన్ని ప్రమాదాలు",
        "highRisk": "అధిక ప్రమాదం",
        "mediumRisk": "మధ్యస్థ ప్రమాదం",
        "lowRisk": "తక్కువ ప్రమాదం",
        "today": "నేడు",
        "month": "నెల",
        "week": "వారం",
        "day": "రోజు",
        "agenda": "కార్యక్రమం",
        "village": "గ్రామం",
        "na": "వర్తించదు",
        "phone": "ఫోన్",
        "risk": "ప్రమాదం",
        "date": "తేదీ",
        "worker": "వర్కర్",
        "noReason": "ఎలాంటి కారణం అందించబడలేదు",
        "unknownVillage": "తెలియని గ్రామం",
        "schedule": "షెడ్యూల్",
        "reason": "కారణం",
        "routineFollowUp": "సాధారణ ఫాలో-అప్",
        "statusPriority": "స్థితి & ప్రాధాన్యత",
        "status": "స్థితి",
        "priority": "ప్రాధాన్యత",
        "viewPatientProfile": "రోగి ప్రొఫైల్‌ను చూడండి",
        "startScreening": "ఫాలో-అప్ స్క్రీనింగ్ ప్రారంభించండి",
        "markCompleted": "మాన్యువల్‌గా పూర్తయినట్లు గుర్తు పెట్టు",
        "cancelFollowUp": "ఫాలో-అప్ రద్దు చేయండి"
      },
      "list": {
        "failedLoad": "ఫాలో-అప్‌లను లోడ్ చేయడంలో విఫలమైంది.",
        "markedCompleted": "ఫాలో-అప్ పూర్తయినట్లు గుర్తించబడింది!",
        "failedComplete": "ఫాలో-అప్ పూర్తి చేయడంలో విఫలమైంది.",
        "pendingFollowUps": "పెండింగ్‌లో ఉన్న ఫాలో-అప్‌లు",
        "noPending": "పెండింగ్‌లో ఉన్న ఫాలో-అప్‌లు లేవు.",
        "unknownPatient": "తెలియని రోగి",
        "priority": "ప్రాధాన్యత"
      },
      "schedule": {
        "selectDateErr": "దయచేసి ఫాలో-అప్ తేదీని ఎంచుకోండి",
        "dateFutureErr": "ఫాలో-అప్ తేదీ భవిష్యత్తులో ఉండాలి",
        "success": "ఫాలో-అప్ విజయవంతంగా షెడ్యూల్ చేయబడింది!",
        "error": "ఫాలో-అప్ షెడ్యూల్ చేయడంలో విఫలమైంది.",
        "title": "ఫాలో-అప్ షెడ్యూల్ చేయండి",
        "selectDate": "తేదీని ఎంచుకోండి",
        "timeOptional": "సమయం (ఐచ్ఛికం)",
        "riskLevel": "ప్రమాద స్థాయి",
        "lowRisk": "తక్కువ ప్రమాదం",
        "mediumRisk": "మధ్యస్థ ప్రమాదం",
        "highRisk": "అధిక ప్రమాదం",
        "critical": "క్లిష్టమైన",
        "priority": "ప్రాధాన్యత",
        "high": "అధిక",
        "medium": "మధ్యస్థ",
        "low": "తక్కువ",
        "reason": "ఫాలో-అప్ కోసం కారణం",
        "reasonPlaceholder": "ఉదా. సాధారణ తనిఖీ, అధిక ప్రమాద సమీక్ష",
        "notes": "గమనికలను జోడించండి (ఐచ్ఛికం)",
        "notesPlaceholder": "గమనికలను నమోదు చేయండి...",
        "scheduling": "షెడ్యూల్ చేయబడుతోంది...",
        "confirm": "ఫాలో-అప్‌ను నిర్ధారించండి"
      },
      "publicCard": {
        "na": "వర్తించదు",
        "unknown": "తెలియని",
        "title": "రోగి QR వివరాలు",
        "invalidQr": "చెల్లని లేదా ఖాళీ QR డేటా",
        "invalidQrDesc": "ఈ QR కోడ్‌లో చదవగలిగే రోగి వివరాలు లేవు.",
        "scannedFromQr": "ASHA QR నుండి స్కాన్ చేయబడింది",
        "unknownPatient": "తెలియని రోగి",
        "familyId": "కుటుంబ ID",
        "village": "గ్రామం",
        "healthScore": "ఆరోగ్య స్కోర్",
        "riskLevel": "ప్రమాద స్థాయి",
        "verifiedFromQr": "QR నుండి రోగి వివరాలు ధృవీకరించబడ్డాయి",
        "verifiedFromQrDesc": "ఈ కార్డ్ మరొక ఫోన్‌లో తెరుచుకుంటే, QR విజయవంతంగా రోగి సారాంశాన్ని తీసుకువెళుతుంది.",
        "scanTime": "స్కాన్ సమయం"
      },
      "profile": {
        "failedLoad": "ప్రొఫైల్‌ను లోడ్ చేయడంలో విఫలమైంది",
        "phoneErr": "ఫోన్ నంబర్ ఖచ్చితంగా 10 అంకెలు ఉండాలి",
        "updateSuccess": "ప్రొఫైల్ విజయవంతంగా నవీకరించబడింది!",
        "updateFail": "ప్రొఫైల్‌ను నవీకరించడంలో విఫలమైంది",
        "langUpdated": "భాష నవీకరించబడింది",
        "langFail": "భాష ప్రాధాన్యతను సేవ్ చేయడంలో విఫలమైంది",
        "notifSaved": "నోటిఫికేషన్ సెట్టింగ్‌లు సేవ్ చేయబడ్డాయి",
        "notifFail": "నోటిఫికేషన్ సెట్టింగ్‌లను సేవ్ చేయడంలో విఫలమైంది",
        "active": "చురుకైన",
        "id": "ID",
        "phc": "PHC",
        "unassigned": "కేటాయించబడలేదు",
        "editProfile": "ప్రొఫైల్‌ను సవరించండి",
        "cancel": "రద్దు చేయండి",
        "save": "భద్రపరుచు",
        "personalInfo": "వ్యక్తిగత సమాచారం",
        "fullName": "పూర్తి పేరు",
        "phoneNumber": "ఫోన్ నంబర్",
        "emailAddress": "ఇమెయిల్ చిరునామా",
        "notProvided": "అందించబడలేదు",
        "gender": "లింగం",
        "selectGender": "లింగాన్ని ఎంచుకోండి",
        "female": "స్త్రీ",
        "male": "పురుషుడు",
        "other": "ఇతర",
        "notSpecified": "పేర్కొనబడలేదు",
        "dob": "పుట్టిన తేదీ",
        "address": "చిరునామా",
        "workInfo": "పని సమాచారం",
        "workerId": "వర్కర్ ID",
        "assignedVillage": "కేటాయించిన గ్రామం",
        "assignedPHC": "కేటాయించిన PHC",
        "joiningDate": "చేరిన తేదీ",
        "language": "భాష",
        "langDesc": "మీకు ఇష్టమైన అప్లికేషన్ భాషను ఎంచుకోండి.",
        "notifications": "నోటిఫికేషన్‌లు",
        "emergAlerts": "అత్యవసర హెచ్చరికలు",
        "emergAlertsDesc": "క్లిష్టమైన అధిక-ప్రమాద రోగి హెచ్చరికలు",
        "followUpReminders": "ఫాలో-అప్ రిమైండర్‌లు",
        "followUpRemindersDesc": "రోజువారీ పెండింగ్‌లో ఉన్న ఫాలో-అప్‌లు",
        "commNotifs": "కమ్యూనిటీ వ్యాప్తి",
        "commNotifsDesc": "గ్రామ స్థాయి ఆరోగ్య హెచ్చరికలు",
        "account": "ఖాతా",
        "changePassword": "పాస్‌వర్డ్‌ను మార్చండి",
        "enterNewPassword": "కొత్త పాస్‌వర్డ్‌ను నమోదు చేయండి",
        "leaveBlank": "ప్రస్తుత పాస్‌వర్డ్‌ను ఉంచడానికి ఖాళీగా ఉంచండి.",
        "signOut": "సైన్ అవుట్"
      }
    }
  }
];

const localesDir = path.join(__dirname, 'src', 'i18n', 'locales');
const langs = ['en', 'hi', 'te'];

function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      if (!target[key]) Object.assign(target, { [key]: {} });
      deepMerge(target[key], source[key]);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  }
  return target;
}

langs.forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.json`);
  let currentData = {};
  
  if (fs.existsSync(filePath)) {
    try {
      currentData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error(`Error parsing ${lang}.json`, e);
    }
  }

  newTranslations.forEach(block => {
    if (block[lang]) {
      currentData = deepMerge(currentData, block[lang]);
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), 'utf8');
  console.log(`Successfully updated ${lang}.json`);
});
