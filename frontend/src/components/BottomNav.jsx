import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Stethoscope, BrainCircuit, Bell } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Patients', path: '/patients', icon: Users },
    { name: 'Screening', path: '/patients/add', icon: Stethoscope },
    { name: 'AI Insights', path: '/community-risk', icon: BrainCircuit },
    { name: 'Alerts', path: '/alerts', icon: Bell }
  ];

  // Only show on main tabs
  const showNav = ['/', '/patients', '/community-risk', '/alerts', '/family-insights', '/follow-ups'].includes(location.pathname);

  if (!showNav) return null;

  return (
    <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-slate-200 px-6 py-2 flex justify-between items-center z-40 pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || (item.path === '/patients' && location.pathname.startsWith('/patients') && location.pathname !== '/patients/add' && !location.pathname.includes('/screen') && !location.pathname.includes('/result'));
        return (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center space-y-1 w-14 h-12 transition-colors ${
              isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon className={`w-6 h-6 ${isActive ? 'fill-primary/20' : ''}`} />
            <span className="text-[10px] font-medium leading-tight text-center">{item.name}</span>
          </button>
        );
      })}
    </div>
  );
}
