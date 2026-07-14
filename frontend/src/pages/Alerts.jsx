import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BellRing, Calendar, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../api';
import MobileHeader from '../components/MobileHeader';
import { useTranslation } from 'react-i18next';

import { getCachedAlerts, cacheAlerts } from '../utils/offlineStore';

export default function Alerts() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.onLine) {
      api.get('/alerts')
        .then(async res => {
          setAlerts(res.data);
          await cacheAlerts(res.data);
          setLoading(false);
        })
        .catch(async err => {
          console.error(err);
          const cached = await getCachedAlerts();
          if (cached && cached.length > 0) setAlerts(cached);
          setLoading(false);
        });
    } else {
      getCachedAlerts().then(cached => {
        if (cached && cached.length > 0) setAlerts(cached);
        setLoading(false);
      });
    }
  }, []);

  const getIconData = (type) => {
    switch(type) {
      case 'Emergency': return { icon: AlertTriangle, dotColor: 'bg-red-500', iconBg: 'bg-red-50', iconColor: 'text-red-600' };
      case 'Outbreak': return { icon: AlertTriangle, dotColor: 'bg-red-500', iconBg: 'bg-red-50', iconColor: 'text-red-600' };
      case 'Missed': return { icon: Calendar, dotColor: 'bg-orange-500', iconBg: 'bg-orange-50', iconColor: 'text-orange-600' };
      case 'Insight': return { icon: ShieldCheck, dotColor: 'bg-green-500', iconBg: 'bg-green-50', iconColor: 'text-green-600' };
      default: return { icon: BellRing, dotColor: 'bg-blue-500', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' };
    }
  };



  const markAsRead = async (id) => {
    try {
      await api.put(`/alerts/${id}/read`);
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, read: true } : a));
    } catch(err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 w-full bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-[#F8FAFC] pb-24 md:pb-6">
      <div className="w-full max-w-7xl mx-auto px-0 md:px-6">
      <MobileHeader title={t('alerts.notifications')} />
      <div className="hidden md:flex px-6 py-5 items-center justify-between sticky top-0 bg-slate-50 z-10 border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="text-slate-800">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-bold text-slate-900 absolute left-1/2 -translate-x-1/2">{t('alerts.notifications')}</h1>
        <div className="w-6"></div> {/* Spacer */}
      </div>

      <div className="px-6 pt-6 space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center p-6 text-slate-500">{t('alerts.noAlerts')}</div>
        ) : (
          alerts.map(alert => {
            const { icon: Icon, dotColor, iconBg, iconColor } = getIconData(alert.type);
            const timeAgo = new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return (
              <div 
                key={alert._id} 
                onClick={() => {
                  if (!alert.read) markAsRead(alert._id);
                  navigate(`/alerts/${alert._id}`);
                }}
                className={`rounded-2xl p-3 shadow-sm border flex items-center gap-3 cursor-pointer transition-all ${alert.read ? 'bg-slate-50 border-transparent opacity-70' : 'bg-white border-slate-100'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{alert.title}</h3>
                  <p className="text-xs text-slate-500 truncate">{alert.message}</p>
                </div>
                <div className="flex flex-col items-end justify-center shrink-0 ml-2">
                  <span className="text-[10px] font-medium text-slate-400 mb-1.5">{timeAgo}</span>
                  {!alert.read ? <div className={`w-2 h-2 rounded-full ${dotColor}`}></div> : <div className="w-2 h-2"></div>}
                </div>
              </div>
            );
          })
        )}
      </div>
      </div>
    </div>
  );
}
