import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Plus, Bell, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    import('../api').then(module => {
      module.default.get('/dashboard/stats').then(res => {
        setUnreadCount(res.data.pendingAlerts || 0);
      }).catch(err => console.error(err));
    });
  }, [location.pathname]);

  // Define navigation items based on the reference image
  const navItems = [
    { name: t('nav.dashboard'), path: '/', icon: Home },
    { name: t('nav.patients'), path: '/patients', icon: Users },
    { name: t('button.addPatient').split(' ')[0], path: '/patients/add', icon: Plus, isFab: true },
    { name: t('nav.alerts'), path: '/alerts', icon: Bell, badge: unreadCount > 0 ? unreadCount : null },
    { name: t('nav.more'), path: '#menu', icon: Menu, isAction: true }
  ];

  // Only show on main tabs
  const showNav = ['/', '/patients', '/community-risk', '/alerts', '/family-insights', '/follow-ups', '/menu'].includes(location.pathname);

  if (!showNav) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 z-50 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.04)] rounded-t-[24px]">
      <div className="flex justify-around items-center h-[72px] px-2 relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === '/patients' && location.pathname.startsWith('/patients') && location.pathname !== '/patients/add');
          
          if (item.isFab) {
            return (
              <div key={item.name} className="relative -top-6 flex flex-col items-center justify-center">
                <button
                  onClick={() => navigate(item.path)}
                  className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/40 active:scale-95 transition-transform"
                >
                  <Icon className="w-7 h-7" strokeWidth={2.5} />
                </button>
              </div>
            );
          }

          return (
            <button
              key={item.name}
              onClick={(e) => {
                if (item.isAction) {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('open-mobile-menu'));
                } else {
                  navigate(item.path);
                }
              }}
              className={`relative flex flex-col items-center justify-center w-16 h-full transition-colors ${
                isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-primary/10' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-[1.5px] border-white shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-semibold'}`}>
                {item.name}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-1 h-1 bg-primary rounded-full mb-1.5"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
