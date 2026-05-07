import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddPatient from './pages/AddPatient';
import PatientList from './pages/PatientList';
import PatientProfile from './pages/PatientProfile';
import ScreeningFlow from './pages/ScreeningFlow';
import ResultScreen from './pages/ResultScreen';
import FollowUpList from './pages/FollowUpList';
import ScheduleFollowUp from './pages/ScheduleFollowUp';
import FamilyInsights from './pages/FamilyInsights';
import CommunityRisk from './pages/CommunityRisk';
import Alerts from './pages/Alerts';
import AIAssistant from './components/AIAssistant';
import BottomNav from './components/BottomNav';

function PrivateRoute({ children }) {
  const user = localStorage.getItem('user');
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen max-w-md mx-auto bg-white sm:shadow-xl sm:border-x sm:border-slate-200 relative pb-16">
        <Toaster position="top-center" toastOptions={{ style: { fontSize: '12px', fontWeight: 600, borderRadius: '12px' } }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/patients" element={<PrivateRoute><PatientList /></PrivateRoute>} />
          <Route path="/patients/add" element={<PrivateRoute><AddPatient /></PrivateRoute>} />
          <Route path="/patients/:id" element={<PrivateRoute><PatientProfile /></PrivateRoute>} />
          <Route path="/patients/:id/screen" element={<PrivateRoute><ScreeningFlow /></PrivateRoute>} />
          <Route path="/patients/:id/result" element={<PrivateRoute><ResultScreen /></PrivateRoute>} />
          <Route path="/follow-ups" element={<PrivateRoute><FollowUpList /></PrivateRoute>} />
          <Route path="/patients/:id/schedule-follow-up" element={<PrivateRoute><ScheduleFollowUp /></PrivateRoute>} />
          <Route path="/family-insights" element={<PrivateRoute><FamilyInsights /></PrivateRoute>} />
          <Route path="/community-risk" element={<PrivateRoute><CommunityRisk /></PrivateRoute>} />
          <Route path="/alerts" element={<PrivateRoute><Alerts /></PrivateRoute>} />
        </Routes>
        <BottomNav />
        {/* Render AI Assistant globally if not on login screen */}
        {localStorage.getItem('user') && <AIAssistant />}
      </div>
    </BrowserRouter>
  );
}
