import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Bell, Activity, Users as FamilyIcon, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { t } from '../utils/i18n';
import { useLanguage } from '../context/LanguageContext';

export default function DesktopSidebar() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const worker = JSON.parse(localStorage.getItem('worker') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('worker');
    navigate('/login');
  };

  const navItems = [
    { icon: Home, label: t('dashboard', language), path: '/' },
    { icon: Users, label: t('patients', language), path: '/patients' },
    { icon: Bell, label: 'Alerts', path: '/alerts' },
    { icon: FamilyIcon, label: 'Family Insights', path: '/family-insights' },
    { icon: Activity, label: 'Community Risk', path: '/community-risk' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 h-screen fixed left-0 top-0 overflow-y-auto z-50">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight">Swasthya <span className="text-primary">AI</span></h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">Healthcare Platform</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-700">
            {worker.profilePhoto ? (
              <img src={worker.profilePhoto} alt={worker.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-white">{worker.name?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{worker.name || 'User'}</p>
            <p className="text-[10px] text-slate-500 truncate uppercase">{worker.employeeId || 'Staff'}</p>
          </div>
          <button onClick={() => navigate('/profile')} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
