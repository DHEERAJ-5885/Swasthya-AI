# Swasthya AI - Complete Setup & Running Guide

## ✅ Prerequisites

- **Node.js**: v16 or higher
- **MongoDB**: Running locally OR MongoDB Atlas connection string
- **API Keys**: Groq API key (already configured in .env)

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd server
npm install
npm start
```

Server runs on `http://localhost:5000`

### 2. Frontend Setup (New Terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## 📋 Complete Feature Checklist

### ✅ Working Features

- **Login System**: ASHA worker authentication with name & phone
- **Dashboard**: Real-time patient stats, high-risk count, follow-ups, alerts
- **Patient Management**:
  - Add new patients with full validation
  - Patient list with search
  - Patient profile with health timeline
- **Screening Flow**: 
  - 5-step comprehensive screening (Vitals, Lifestyle, Mental, Observation, Voice)
  - AI-powered analysis with Groq LLM
  - Dynamic risk assessment
- **Results Screen**: Displays AI analysis with drift detection
- **Follow-ups**: Schedule and track patient follow-ups
- **Alerts**: Emergency alerts from high-risk patients
- **Family Insights**: Family member health overview
- **Community Risk**: Village-level disease clustering
- **AI Assistant**: Chat interface for healthcare queries
- **Responsive Design**: Mobile-first, works on tablet/desktop

### 🔌 Real Data Connections

- **MongoDB Atlas**: All patient data persists in cloud database
- **Groq AI**: Real AI analysis with historical data comparison
- **Dynamic Calculations**: Dashboard metrics calculated from live DB
- **Error Handling**: Global error handling with toast notifications

## 🔑 Environment Configuration

### Server (.env)
```
MONGO_URI=
swasthya-ai?appName=ClusterHunt
PORT=5000
GROQ_API_KEY=
OPENAI_API_KEY=optional
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api
```

## 🧪 Testing the Complete Flow

1. **Login**: Use any name and 10-digit phone number
2. **Dashboard**: See real metrics from database
3. **Add Patient**: Create new patient → saved to MongoDB
4. **Screening**: 
   - Fill health data (5 steps)
   - Submit for AI analysis
   - Get Groq AI powered results
5. **Results**: View risk assessment & drift detection
6. **Follow-up**: Schedule patient check-up
7. **Profile**: View patient history & timeline
8. **Alerts**: Emergency alerts for high-risk patients
9. **Community**: Village-level disease clustering insights
10. **Family**: View family member health status

## 📊 Data Flow

```
User Input (Screening)
    ↓
Frontend Validation
    ↓
Submit to Backend API (/analyze)
    ↓
Fetch Patient History from MongoDB
    ↓
Send to Groq AI with Historical Data
    ↓
Get AI Analysis (Risk Level, Drift, Explanation)
    ↓
Save Screening to MongoDB
    ↓
Create Auto-Alerts if High Risk
    ↓
Create Auto-Follow-ups if Declining
    ↓
Return Results to Frontend
    ↓
Display on Result Screen with Options
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB Atlas connection string in server/.env
- Ensure your IP is whitelisted in MongoDB Atlas
- Check network connectivity

### API Connection Failed
- Verify both servers are running (backend on 5000, frontend on 5173)
- Check VITE_API_URL in frontend/.env.local
- Open browser console for detailed error messages

### AI Analysis Not Working
- Verify Groq API key is valid and has quota
- Check server logs for API errors
- Fallback: Rule-based analysis will be used if Groq fails

### Form Not Submitting
- Check browser console for validation errors
- Ensure all required fields are filled
- Verify server is running and accessible

## 📱 Key Endpoints

### Patient API
- `POST /api/patients` - Create patient
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Screening API
- `POST /api/analyze` - Submit screening for AI analysis
- `GET /api/analyze/:patientId` - Get patient screening history

### Follow-ups
- `POST /api/followups` - Schedule follow-up
- `GET /api/followups` - Get pending follow-ups
- `PUT /api/followups/:id/complete` - Mark complete

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard metrics

### Alerts
- `GET /api/alerts` - Get all alerts
- `PUT /api/alerts/:id/read` - Mark alert as read

### Community
- `GET /api/community-risk` - Get village risk data

### Family
- `GET /api/family/:familyId` - Get family health data

## ✨ Features Explained

### Dynamic AI Analysis
- Compares current screening with patient's last screening
- Detects health drift (Improving/Stable/Declining/Critical Drift)
- Generates personalized recommendations
- Explains risk factors in detail

### Auto-Alerts
- Emergency alerts created for High-risk patients
- Alerts created for Critical Drift detection
- Alerts persist in database and can be marked as read

### Auto-Follow-ups
- Automatically schedules follow-ups for declining trends
- Urgent follow-ups (1 day) for Critical Drift
- Standard follow-ups (3 days) for High-risk
- Auto-created with reason from AI analysis

### Dashboard Metrics
- **Total Patients**: Count of all patients in DB
- **High-Risk Patients**: Count of latest screenings with High risk
- **Declining Drift Patients**: Count showing Declining/Critical Drift trend
- **Follow-ups Today**: Count of pending follow-ups due today
- **Community Risk**: Calculated from high-risk percentage

## 🎨 UI/UX Highlights

- Mobile-first design (tested on phones)
- Smooth animations and transitions
- Loading states with spinners
- Error handling with toast notifications
- Empty states with helpful messages
- Healthcare green/teal color theme
- Card-based layout for easy reading
- Sticky headers for better navigation

## 📈 Performance

- Efficient database queries with pagination
- Lazy loading of images (Gravatar)
- Minimal re-renders with React best practices
- Optimized bundle size with Vite
- Responsive images for different screen sizes

## 🔐 Security

- Session storage for user authentication
- CORS enabled on backend
- Input validation on all forms
- XSS protection with React escaping
- No sensitive data in local storage (except user name/phone)

## 📝 Notes

- First screening has no historical data for comparison
- Follow-up dates must be in the future
- Patient phone numbers validated as 10+ digits
- Age validated between 0-120 years
- Village name is required for community clustering
- Family ID is used to group family members

## 🆘 Support

If you encounter issues:
1. Check the browser console for errors
2. Check server logs for API errors
3. Verify all .env files are properly configured
4. Restart both frontend and backend servers
5. Clear browser cache if UI looks wrong

---

**Swasthya AI** - Making healthcare accessible at the first point of care for ASHA workers in rural India.
