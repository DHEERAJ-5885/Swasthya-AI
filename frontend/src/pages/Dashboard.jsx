import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Menu, Bell, Users, ShieldAlert, Calendar, Plus, Stethoscope, Cloud, Activity, BrainCircuit, ScanLine, Mic, UsersRound, PhoneCall, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const user = JSON.parse(localStorage.getItem('user') || '{"name":"Anita Kumari", "village":"Rampur"}');

  useEffect(() => {
    // Online status listener
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Fetch unified dashboard stats
    api.get('/dashboard/stats')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load dashboard stats', err);
        setLoading(false);
      });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Fallback to zeros if stats completely failed to load
  const data = stats || { totalPatients: 0, highRiskPatients: 0, followUpsToday: 0, pendingAlerts: 0, communityRisk: 'Unknown' };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Top App Bar & Header */}
      <div className="bg-primary px-6 pt-10 pb-6 rounded-b-[32px] text-white shadow-lg shadow-primary/20 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <button className="text-white hover:bg-white/10 p-2 rounded-full transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-bold ${isOnline ? 'bg-emerald-500/20 text-emerald-100' : 'bg-red-500/20 text-red-100'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
              {isOnline ? 'SYNCED' : 'OFFLINE'}
            </div>
            <button className="relative hover:bg-white/10 p-2 rounded-full transition-colors" onClick={() => navigate('/alerts')}>
              <Bell className="w-6 h-6" />
              {data.pendingAlerts > 0 && (
                <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-400 rounded-full border-2 border-primary"></span>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium mb-1">Namaste,</p>
            <h1 className="text-2xl font-bold">{user.name}</h1>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="flex items-center gap-1.5 text-white/90 text-sm font-semibold mb-1">
              <Cloud className="w-4 h-4" /> 28°C
            </div>
            <p className="text-xs text-white/70 font-medium">{user.village || 'Rampur'} Village</p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 relative z-20 space-y-5">
        {/* Top 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white shadow-[0_4px_12px_rgb(0,0,0,0.06)] border-0 rounded-2xl">
            <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full gap-1">
              <div className="bg-primary/10 p-2 rounded-xl mb-1">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-lg font-bold text-slate-900 leading-none">{data.totalPatients}</p>
              <p className="text-[10px] text-slate-500 font-medium leading-tight">Total Patients</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-[0_4px_12px_rgb(0,0,0,0.06)] border-0 rounded-2xl">
            <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full gap-1">
              <div className="bg-red-50 p-2 rounded-xl mb-1">
                <ShieldAlert className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-lg font-bold text-slate-900 leading-none">{data.highRiskPatients}</p>
              <p className="text-[10px] text-slate-500 font-medium leading-tight">High Risk</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-[0_4px_12px_rgb(0,0,0,0.06)] border-0 rounded-2xl cursor-pointer hover:border-primary/50" onClick={() => navigate('/follow-ups')}>
            <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full gap-1">
              <div className="bg-orange-50 p-2 rounded-xl mb-1">
                <Calendar className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-lg font-bold text-slate-900 leading-none">{data.followUpsToday}</p>
              <p className="text-[10px] text-slate-500 font-medium leading-tight">Due Today</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Health Summary */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-primary/20 rounded-2xl">
          <CardContent className="p-4 flex gap-3">
            <div className="bg-primary/20 p-2 rounded-xl shrink-0 h-fit">
              <BrainCircuit className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">AI Health Summary</h3>
              <ul className="text-[11px] text-slate-700 font-medium space-y-1 list-disc pl-3">
                <li><span className="text-orange-600 font-bold">{data.followUpsToday} patients</span> require follow-up today.</li>
                {data.pendingAlerts > 0 && (
                  <li>There are <span className="text-red-500 font-bold">{data.pendingAlerts} unread alerts</span> needing attention.</li>
                )}
                {data.communityRisk === 'High' && (
                  <li>Village health risk is currently <span className="text-red-500 font-bold">Critical</span>.</li>
                )}
                {data.communityRisk !== 'High' && (
                  <li>Village health pulse is <span className="font-bold">{data.communityRisk}</span>.</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Community Risk Level */}
        <Card className="bg-white shadow-[0_4px_12px_rgb(0,0,0,0.03)] border-0 rounded-2xl cursor-pointer hover:border-primary/50" onClick={() => navigate('/community-risk')}>
          <CardContent className="p-5 flex flex-row items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-900 mb-1">Community Risk Pulse</p>
              <p className="text-xl font-bold text-orange-500 mb-1">{data.communityRisk}</p>
              <p className="text-[10px] text-slate-500 font-medium">Village: {user.village || 'Rampur'}</p>
            </div>
            <div className="relative w-24 h-12 overflow-hidden flex-shrink-0">
              <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-[10px] border-slate-100 border-t-orange-500 border-r-orange-500 rotate-45 box-border"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rounded-full"></div>
              <div className="absolute bottom-1 left-1/2 w-1 h-8 bg-slate-800 origin-bottom rounded-full -rotate-[20deg]"></div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => navigate('/patients/add')} className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity p-3 bg-white rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)]">
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 text-center">Add Patient</span>
            </button>
            <button onClick={() => navigate('/patients')} className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity p-3 bg-white rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)]">
              <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 text-center">Start Screening</span>
            </button>
            <button onClick={() => navigate('/patients')} className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity p-3 bg-white rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)]">
              <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center">
                <ScanLine className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 text-center">Scan Health Card</span>
            </button>
            <button onClick={() => navigate('/patients')} className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity p-3 bg-white rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)]">
              <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center">
                <Mic className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 text-center">Voice Screening</span>
            </button>
            <button onClick={() => toast.error('Emergency alert triggered!')} className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity p-3 bg-white rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)]">
              <div className="bg-red-50 w-12 h-12 rounded-xl flex items-center justify-center">
                <PhoneCall className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 text-center">Emergency Alert</span>
            </button>
            <button onClick={() => navigate('/family-insights')} className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity p-3 bg-white rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)]">
              <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center">
                <UsersRound className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 text-center">Family Insights</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
