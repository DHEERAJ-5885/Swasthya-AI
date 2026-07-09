import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  X, Home, Users, AlertCircle, Stethoscope, BrainCircuit, 
  LogOut, User, Activity, UsersRound, BarChart2, FileText, MessageSquare 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const worker = JSON.parse(localStorage.getItem('worker') || '{}');
  const { clearAuth } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-mobile-menu', handleOpen);
    return () => window.removeEventListener('open-mobile-menu', handleOpen);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const menuItems = [
    { icon: Home, label: t('nav.dashboard'), path: '/' },
    { icon: Users, label: t('nav.patients'), path: '/patients' },
    { icon: Stethoscope, label: t('nav.screenings'), path: '/screenings' },
    { icon: BrainCircuit, label: t('dashboard.aiHealthInsights'), path: '/ai-insights' },
    { icon: AlertCircle, label: t('nav.alerts'), path: '/alerts' },
    { icon: UsersRound, label: t('nav.familyInsights'), path: '/family-insights' },
    { icon: Activity, label: t('nav.communityRisk'), path: '/community-risk' },
    { icon: BarChart2, label: t('nav.analytics'), path: '/analytics' },
    { icon: FileText, label: t('nav.reports'), path: '/reports' },
    { icon: MessageSquare, label: t('nav.aiAssistant'), path: '/ai-assistant' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    clearAuth();
    setIsOpen(false);
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed left-0 top-0 h-[100dvh] w-[80vw] max-w-[320px] bg-white z-[110] flex flex-col shadow-2xl md:hidden overflow-hidden rounded-r-3xl"
          >
            {/* Profile Header (Sticky) */}
            <div className="bg-primary/5 p-6 pb-8 border-b border-primary/10 relative shrink-0">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-colors text-slate-500 shadow-sm backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mt-2">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30 border-2 border-white overflow-hidden">
                    {worker.profilePhoto ? (
                      <img src={worker.profilePhoto} alt={worker.name} className="w-full h-full object-cover" />
                    ) : (
                      worker.name?.charAt(0) || 'A'
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="font-black text-slate-900 text-lg leading-tight">{worker.name || 'ASHA Worker'}</p>
                  <p className="text-xs font-semibold text-primary/80 tracking-wide mt-1 uppercase">{worker.employeeId || 'ID-UNKNOWN'}</p>
                </div>
              </div>
            </div>

            {/* Scrollable Navigation */}
            <div className="flex-1 overflow-y-auto scrollbar-hide py-4 px-3 space-y-1 bg-white">
              <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('nav.mainMenu')}</p>
              {menuItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
                      active
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${active ? 'opacity-100' : 'opacity-70'}`} />
                    <span className="font-bold text-sm tracking-wide">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions (Sticky) */}
            <div className="shrink-0 border-t border-slate-100 bg-slate-50/50 p-4 pb-safe space-y-2">
              <button
                onClick={() => handleNavigation('/profile')}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-700 hover:bg-slate-100 transition-colors bg-white border border-slate-200 shadow-sm"
              >
                <User className="w-5 h-5 opacity-70" />
                <span className="font-bold text-sm">{t('nav.accountSettings')}</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-600 hover:bg-red-50 transition-colors border border-transparent"
              >
                <LogOut className="w-5 h-5 opacity-80" />
                <span className="font-bold text-sm">{t('nav.logout')}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
