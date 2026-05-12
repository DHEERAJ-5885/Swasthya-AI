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
import AshaWorkerProfile from './pages/AshaWorkerProfile';
import PublicPatientCard from './pages/PublicPatientCard';
import HamburgerMenu from './components/HamburgerMenu';
import AIAssistant from './components/AIAssistant';
import BottomNav from './components/BottomNav';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
        <Routes>
          <Route path="/qr/patient" element={<PublicPatientCard />} />
          <Route path="/*" element={(
            <AppShell />
          )} />
        </Routes>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function AuthScopedChrome() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <HamburgerMenu /> : null;
}

function AuthScopedChromeAssistant() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AIAssistant /> : null;
}

function AppShell() {
  const { token, isAuthenticated } = useAuth();

  return (
    <div key={token || 'guest'} id="app-shell" className="relative mx-auto min-h-screen w-full max-w-[430px] overflow-x-hidden bg-white sm:rounded-3xl sm:shadow-xl sm:border sm:border-slate-200 pb-16">
      <Toaster position="top-center" toastOptions={{ style: { fontSize: '12px', fontWeight: 600, borderRadius: '12px' } }} />
      {isAuthenticated && <HamburgerMenu />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><AshaWorkerProfile /></PrivateRoute>} />
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
      {isAuthenticated && <AIAssistant />}
    </div>
  );
}
