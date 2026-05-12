import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, BellRing, Calendar, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../api';

export default function Alerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('All');

  useEffect(() => {
    api.get('/alerts')
      .then(res => {
        setAlerts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getIconData = (type) => {
    switch(type) {
      case 'Emergency': return { icon: AlertTriangle, bg: 'bg-red-500', color: 'text-white' };
      case 'Outbreak': return { icon: BellRing, bg: 'bg-orange-500', color: 'text-white' };
      case 'Missed': return { icon: Calendar, bg: 'bg-yellow-500', color: 'text-white' };
      case 'Insight': return { icon: ShieldCheck, bg: 'bg-green-500', color: 'text-white' };
      default: return { icon: BellRing, bg: 'bg-primary', color: 'text-white' };
    }
  };

  const getSeverity = (type) => {
    switch (type) {
      case 'Emergency': return 'Critical';
      case 'Outbreak': return 'High';
      case 'Missed': return 'Medium';
      case 'Insight': return 'Low';
      default: return 'Low';
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="px-6 py-5 flex items-center justify-between sticky top-0 bg-slate-50 z-10 border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="text-slate-800">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-bold text-slate-900 absolute left-1/2 -translate-x-1/2">Alerts & Notifications</h1>
        <div className="w-6"></div> {/* Spacer */}
      </div>

      <div className="px-6 pt-6 space-y-4">
        <div className="flex gap-2">
          {['All', 'Critical', 'High', 'Medium', 'Low'].map((level) => (
            <button
              key={level}
              onClick={() => setSeverityFilter(level)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold border ${severityFilter === level ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200'}`}
            >
              {level}
            </button>
          ))}
        </div>

        {alerts.length === 0 ? (
          <div className="text-center p-6 text-slate-500">No new alerts.</div>
        ) : (
          alerts
            .filter(alert => severityFilter === 'All' || getSeverity(alert.type) === severityFilter)
            .map(alert => {
            const { icon: Icon, bg, color } = getIconData(alert.type);
            const timeAgo = new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return (
              <div 
                key={alert._id} 
                onClick={() => !alert.read && markAsRead(alert._id)}
                className={`rounded-2xl p-4 shadow-[0_4px_12px_rgb(0,0,0,0.03)] border flex gap-4 cursor-pointer transition-all ${alert.read ? 'bg-slate-50 border-slate-100 opacity-70' : 'bg-white border-slate-200'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-slate-900">{alert.title}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium text-slate-400">{timeAgo}</span>
                      {!alert.read && <div className={`w-1.5 h-1.5 rounded-full ${bg.replace('bg-', 'bg-')}`}></div>}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pr-4">{alert.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
