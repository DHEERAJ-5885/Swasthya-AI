import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Users, Stethoscope, Bell, Activity, UsersRound as FamilyIcon, 
  LogOut, Settings, BarChart2, FileText, MessageSquare, ShieldPlus, ChevronDown, Calendar, 
  UserPlus, ClipboardList, BellRing, RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import api from '../api';
import { getCachedDashboardStats } from '../utils/offlineStore';

export default function DesktopSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const worker = JSON.parse(localStorage.getItem('worker') || '{}');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        if (!navigator.onLine) throw new Error('Offline');
        const res = await api.get('/dashboard/stats');
        setUnreadCount(res.data.pendingAlerts || 0);
      } catch (err) {
        const cached = await getCachedDashboardStats();
        if (cached) setUnreadCount(cached.pendingAlerts || 0);
      }
    };
    fetchUnread();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('worker');
    navigate('/login');
  };

  const navItems = [
    { label: t('nav.dashboard', 'Dashboard'), icon: Home, path: '/' },
    { label: t('nav.addPatient', 'Add Patient'), icon: UserPlus, path: '/patients/add' },
    { label: t('nav.patients', 'Patients'), icon: Users, path: '/patients' },
    { label: t('nav.screenings', 'Screenings'), icon: ClipboardList, path: '/screenings' },
    { label: t('nav.followUps', 'Follow-ups'), icon: Calendar, path: '/follow-ups' },
    { label: t('nav.alerts', 'Alerts'), icon: BellRing, path: '/alerts', badge: unreadCount > 0 ? unreadCount : null },
    { label: t('nav.familyInsights', 'Family Insights'), icon: FamilyIcon, path: '/family-insights' },
    { label: t('nav.communityRisk', 'Community Risk'), icon: Activity, path: '/community-risk' },
    { label: t('nav.analytics', 'Analytics'), icon: BarChart2, path: '/analytics' },
    { label: t('nav.reports', 'Reports'), icon: FileText, path: '/reports' },
    { label: 'Sync Center', icon: RefreshCw, path: '/sync-center' },
    { label: t('nav.aiAssistant', 'AI Assistant'), icon: MessageSquare, path: '/ai-assistant' },
    { label: t('nav.settings', 'Settings'), icon: Settings, path: '/profile' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 h-screen flex-shrink-0 overflow-y-auto z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Header / Logo */}
      <div className="p-6 pb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-primary rounded-xl shadow-md shadow-primary/20">
            <ShieldPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t('nav.swasthyaAi')}</h1>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 font-semibold tracking-wide ml-12 -mt-2">{t('nav.tagline')}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                window.location.pathname === item.path 
                  ? 'bg-white/20 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Profile */}
      <div className="p-4 mt-auto">
        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
              {worker.profilePhoto ? (
                <img src={worker.profilePhoto} alt={worker.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-slate-600">{worker.name?.charAt(0) || 'U'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{worker.name || t('nav.user')}</p>
              <p className="text-[10px] text-slate-500 truncate font-medium">{t('nav.ashaWorker')}</p>
              <p className="text-[9px] text-slate-400 truncate">{worker.employeeId || t('nav.idUnknown')}</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 mt-2 w-full text-left rounded-xl text-red-500 hover:bg-red-50 transition-colors font-semibold text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </aside>
  );
}
