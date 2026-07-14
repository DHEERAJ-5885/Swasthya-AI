import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddPatient from './pages/AddPatient';
import PatientList from './pages/PatientList';
import PatientProfile from './pages/PatientProfile';
import ScreeningFlow from './pages/ScreeningFlow';
import ScreeningsList from './pages/ScreeningsList';
import ResultScreen from './pages/ResultScreen';
import FollowUpList from './pages/FollowUpList';
import ScheduleFollowUp from './pages/ScheduleFollowUp';
import FamilyInsights from './pages/FamilyInsights';
import CommunityRisk from './pages/CommunityRisk';
import Alerts from './pages/Alerts';
import AlertDetail from './pages/AlertDetail';
import AshaWorkerProfile from './pages/AshaWorkerProfile';
import PublicPatientCard from './pages/PublicPatientCard';
import AIInsights from './pages/AIInsights';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import AIAssistantPage from './pages/AIAssistantPage';
import FollowUpCalendar from './pages/FollowUpCalendar';
import HamburgerMenu from './components/HamburgerMenu';
import AIAssistant from './components/AIAssistant';
import BottomNav from './components/BottomNav';
import DesktopSidebar from './components/DesktopSidebar';
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



import NetworkIndicator from './components/NetworkIndicator';
import OfflineSyncCenter from './pages/OfflineSyncCenter';
import ErrorBoundary from './components/ErrorBoundary';

import { prefetchOfflineData } from './utils/syncEngine';

function AppShell() {
  const { token, isAuthenticated } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    if (isAuthenticated && navigator.onLine) {
      prefetchOfflineData();
    }
  }, [isAuthenticated]);

  return (
    <div 
      key={token || 'guest'} 
      id="app-shell" 
      className={`relative flex flex-col h-screen w-full bg-[#F8FAFC] overflow-hidden ${
        isLoginPage ? '' : 'pb-[80px] md:pb-0'
      }`}
    >
      <Toaster position="top-center" toastOptions={{ style: { fontSize: '12px', fontWeight: 600, borderRadius: '12px' } }} />
      <NetworkIndicator />
      {isAuthenticated && <HamburgerMenu />}
      
      <div className="flex-1 flex overflow-hidden w-full">
        {isAuthenticated && !isLoginPage && <DesktopSidebar />}
        
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto relative bg-[#F8FAFC]">
          <ErrorBoundary>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/sync-center" element={<PrivateRoute><OfflineSyncCenter /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><AshaWorkerProfile /></PrivateRoute>} />
              <Route path="/patients" element={<PrivateRoute><PatientList /></PrivateRoute>} />
              <Route path="/screenings" element={<PrivateRoute><ScreeningsList /></PrivateRoute>} />
              <Route path="/patients/add" element={<PrivateRoute><AddPatient /></PrivateRoute>} />
              <Route path="/patients/:id" element={<PrivateRoute><PatientProfile /></PrivateRoute>} />
              <Route path="/patients/:id/screen" element={<PrivateRoute><ScreeningFlow /></PrivateRoute>} />
              <Route path="/patients/:id/result" element={<PrivateRoute><ResultScreen /></PrivateRoute>} />
              <Route path="/follow-ups" element={<PrivateRoute><FollowUpList /></PrivateRoute>} />
              <Route path="/calendar" element={<PrivateRoute><FollowUpCalendar /></PrivateRoute>} />
              <Route path="/patients/:id/schedule-follow-up" element={<PrivateRoute><ScheduleFollowUp /></PrivateRoute>} />
              <Route path="/family-insights" element={<PrivateRoute><FamilyInsights /></PrivateRoute>} />
              <Route path="/community-risk" element={<PrivateRoute><CommunityRisk /></PrivateRoute>} />
              <Route path="/alerts" element={<PrivateRoute><Alerts /></PrivateRoute>} />
              <Route path="/alerts/:id" element={<PrivateRoute><AlertDetail /></PrivateRoute>} />
              <Route path="/ai-insights" element={<PrivateRoute><AIInsights /></PrivateRoute>} />
              <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
              <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
              <Route path="/ai-assistant" element={<PrivateRoute><AIAssistantPage /></PrivateRoute>} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
      
      {!isLoginPage && <BottomNav />}
      {isAuthenticated && <AIAssistant />}
    </div>
  );
}
