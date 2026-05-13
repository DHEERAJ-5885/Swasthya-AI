import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Menu, Home, Users, AlertCircle, Stethoscope, BrainCircuit, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const worker = JSON.parse(localStorage.getItem('worker') || '{}');
  const { clearAuth } = useAuth();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Patients', path: '/patients' },
    { icon: Stethoscope, label: 'Screening', path: '/patients/add' },
    { icon: BrainCircuit, label: 'AI Insights', path: '/community-risk' },
    { icon: AlertCircle, label: 'Alerts', path: '/alerts' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Hamburger Button - Mobile only, hidden on desktop where sidebar is shown */}
      <button
        id="hamburger-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-5 left-4 z-[60] p-2.5 rounded-xl bg-white/90 backdrop-blur-md hover:bg-white transition-all shadow-md border border-slate-100 group active:scale-95"
      >
        <Menu className="w-6 h-6 text-slate-700 group-hover:text-primary transition-colors" />
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[70] sm:absolute"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-[280px] bg-white shadow-2xl z-[80] flex flex-col sm:absolute"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-bold">Swasthya AI</h2>
                <p className="text-white/80 text-xs">Healthcare Platform</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Worker Profile Section */}
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold">
                  {worker.name?.charAt(0) || 'A'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">{worker.name || 'ASHA Worker'}</p>
                  <p className="text-xs text-slate-500">{worker.employeeId || 'ASH-001'}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Bottom Actions */}
            <div className="border-t border-slate-200 p-4 space-y-2">
              <button
                onClick={() => handleNavigation('/profile')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="font-medium text-sm">Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium text-sm">Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
