# Swasthya AI

**Theme:** Theme 7 – Analytics & Decision Intelligence

## Problem Statement
Healthcare workers lack intelligent decision-support systems that transform patient screening data into actionable insights for timely interventions and proactive healthcare management.

## Project Description
Swasthya AI is an AI-powered Healthcare Decision Intelligence Platform built for ASHA workers. The platform digitizes patient screening, performs AI-assisted health risk analysis, manages follow-ups, enables emergency assistance, provides multilingual support, visualizes community health analytics, and secures healthcare records using Cardano Blockchain.

## Key Features
* AI-assisted Patient Screening
* AI Risk Prediction
* Patient Health Timeline
* AI Drift Graph
* Follow-up Calendar
* Emergency Assistance
* Community Risk Dashboard
* Analytics Dashboard
* AI Healthcare Assistant
* Reports & PDF Generation
* Cardano Blockchain Verification
* Multilingual Support (English, Hindi, Telugu)

## Tech Stack
**Frontend:**
* React
* Tailwind CSS
* Framer Motion

**Backend:**
* Node.js
* Express.js
* MongoDB

**AI:**
* OpenAI / Groq API

**Blockchain:**
* Cardano (Lucid, Blockfrost)

**Deployment:**
* Vercel

## Folder Structure
```text
Team-SwasthyaAI/
│
├── frontend/             # React application (Vite)
├── backend/              # Node.js & Express API server
├── SmartContract/        # Cardano blockchain integration services
├── README.md             # Project documentation
└── .gitignore            # Git ignore definitions
```

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Team-SwasthyaAI
```

2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

3. Install Backend Dependencies
```bash
cd ../backend
npm install
```

4. Environment Variables
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_or_groq_api_key
BLOCKFROST_API_KEY=your_blockfrost_api_key
CARDANO_NETWORK=Preprod
```

## Running the Project

**Start the Backend:**
```bash
cd backend
npm run dev
```
*(Runs on http://localhost:5000)*

**Start the Frontend:**
```bash
cd frontend
npm run dev
```
*(Runs on http://localhost:5173)*

## Future Scope
* **ABDM Integration:** Seamless integration with Ayushman Bharat Digital Mission.
* **PHC Dashboard:** Dedicated dashboard for Primary Health Centers.
* **District Health Dashboard:** High-level analytics for district health officers.
* **IoT Medical Devices:** Direct Bluetooth integration with portable health devices.
* **Real-time Ambulance Integration:** GPS-based emergency dispatch routing.
