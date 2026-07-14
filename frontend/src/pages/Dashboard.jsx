import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { 
  Users, ShieldAlert, Calendar, Plus, Stethoscope, Cloud, 
  Activity, BrainCircuit, ScanLine, Mic, UsersRound, PhoneCall, 
  Loader2, ArrowUpRight, ArrowDownRight, ArrowRight,
  Bell, Sparkles, ShieldPlus, AlertTriangle
} from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import EmergencyAssistanceModal from '../components/EmergencyAssistanceModal';
import toast from 'react-hot-toast';
import api from '../api';
import { useTranslation } from 'react-i18next';
import dashboardHero from '../assets/dashboard-hero.png';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

import { getPendingTasks, cacheDashboardStats, getCachedDashboardStats } from '../utils/offlineStore';

// Data is now fetched from the backend API

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [pendingSyncTasks, setPendingSyncTasks] = useState(0);
  const worker = JSON.parse(localStorage.getItem('worker') || '{"name":"ASHA Worker", "village":""}');
  const { t } = useTranslation();

  const fetchStats = async () => {
    // If online, fetch from backend. If offline, try to load last cached stats.
    if (navigator.onLine) {
      api.get('/dashboard/stats')
        .then(async res => {
          setStats(res.data);
          await cacheDashboardStats(res.data);
          setLoading(false);
        })
        .catch(async err => {
          console.error('Failed to load dashboard stats', err);
          const cached = await getCachedDashboardStats();
          if (cached) setStats(cached);
          setLoading(false);
        });
    } else {
      const cached = await getCachedDashboardStats();
      if (cached) setStats(cached);
      setLoading(false);
    }
  };

  const fetchPendingTasks = async () => {
    const tasks = await getPendingTasks();
    setPendingSyncTasks(tasks.length);
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    fetchStats();
    fetchPendingTasks();

    const interval = setInterval(() => {
      fetchPendingTasks();
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F8FAFC] w-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleEmergencySaved = () => {
    fetchStats();
  };

  const data = stats || { 
    totalPatients: 0, highRiskPatients: 0, followUpsToday: 0, screeningsToday: 0, pendingAlerts: 0, 
    communityRisk: 'Low Risk', riskScore: 0,
    patientTrendData: [], healthConditionsData: [], recentAlerts: [], aiInsights: [],
    sparklines: { total: [], highRisk: [], followUps: [], screenings: [] }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden w-full pb-24 md:pb-8 font-sans selection:bg-primary/20">
      
      {/* Top Nav Bar (Desktop) - Re-aligned, Search removed */}
      <div className="hidden md:flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <ShieldPlus className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">Swasthya AI</span>
        </div>
        
        <div className="flex items-center gap-4">
          {pendingSyncTasks > 0 ? (
            <button onClick={() => navigate('/sync-center')} className="px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-sm bg-orange-50 text-orange-600 border border-orange-100 animate-pulse hover:bg-orange-100 transition-colors">
              <Cloud className="w-3.5 h-3.5" />
              {pendingSyncTasks} Pending Sync
            </button>
          ) : (
            <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-sm ${isOnline ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              {isOnline ? 'Online & Synced' : t('dashboard.offline')}
            </div>
          )}
          <LanguageSelector showLabel={false} selectClassName="bg-white text-slate-800 border-slate-200 font-medium text-sm rounded-full px-3 py-1.5 shadow-sm" />
          <div className="relative">
            <button onClick={() => navigate('/alerts')} className="p-2 bg-white rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
            </button>
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
              {data.pendingAlerts}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Top Nav */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-40 border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <ShieldPlus className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-slate-900">Swasthya AI</span>
        </div>
        <div className="flex items-center gap-3">
          {pendingSyncTasks > 0 && (
            <button onClick={() => navigate('/sync-center')} className="relative p-1.5 text-orange-500">
              <Cloud className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                {pendingSyncTasks}
              </span>
            </button>
          )}
          <div className="relative">
            <button className="p-1.5">
              <Bell className="w-5 h-5 text-slate-600" />
            </button>
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">
              {data.pendingAlerts}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Banner Section */}
      <div className="w-full px-0 md:px-6 md:pt-6 max-w-7xl mx-auto">
        <div className="relative w-full h-[280px] sm:h-[300px] md:h-[380px] bg-[#0f172a] overflow-hidden flex flex-col justify-center rounded-none md:rounded-[32px] shadow-sm z-10">
          <img 
            src={dashboardHero} 
            alt="Healthcare Dashboard" 
            className="absolute inset-0 w-full h-full object-cover md:object-contain md:object-right opacity-85 md:opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 md:via-slate-900/40 to-transparent"></div>
        
        <div className="relative p-6 md:p-10 flex flex-col justify-center text-white z-10 max-w-3xl mt-4 md:mt-0">
          <p className="text-sm md:text-base font-semibold text-white/90 mb-2 flex items-center gap-2">
            Namaste, {worker.name || t('dashboard.ashaWorker')} <span className="text-xl">👋</span>
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4 tracking-tight shadow-sm text-white drop-shadow-md">
            {t('dashboard.heroTitle1')} <br className="hidden sm:block"/>
            <span className="text-indigo-100 font-light drop-shadow-md">{t('dashboard.heroTitle2')}</span>
          </h1>
          <p className="text-xs md:text-sm font-bold text-white flex items-center gap-2 bg-black/30 w-fit px-4 py-2 rounded-full backdrop-blur-md shadow-inner border border-white/10">
            <BrainCircuit className="w-4 h-4 text-emerald-400" /> {t('dashboard.heroSubtitle')}
          </p>
        </div>

        {/* Weather/Location floating top right on desktop */}
        <div className="hidden md:flex absolute top-10 right-10 flex-col items-end text-white text-shadow-sm drop-shadow-lg z-10">
          <div className="flex items-center gap-2 text-3xl font-black mb-1">
            <Cloud className="w-8 h-8 opacity-100 text-blue-200" /> 28°C
          </div>
          <p className="font-bold text-white tracking-wide">{worker.village || 'Shadnagar'} {t('dashboard.village')}</p>
          <p className="text-xs text-white/80 font-medium">{t('dashboard.demoDate')}</p>
        </div>
      </div>
      </div>

      {/* Main Content Area */}
      <motion.div 
        className="px-4 md:px-6 mt-6 md:mt-8 relative z-20 space-y-6 w-full max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title={t('dashboard.totalPatients')} 
            value={data.totalPatients} 
            icon={Users} 
            trend="" 
            trendUp={true} 
            color="primary"
            chartData={data.sparklines.total}
          />
          <MetricCard 
            title={t('dashboard.highRiskPatients')} 
            value={data.highRiskPatients} 
            icon={ShieldAlert} 
            trend="" 
            trendUp={false} 
            color="red"
            chartData={data.sparklines.highRisk}
          />
          <MetricCard 
            title={t('dashboard.followupsDue')} 
            value={data.followUpsToday} 
            icon={Calendar} 
            trend="" 
            trendUp={false} 
            color="orange"
            chartData={data.sparklines.followUps}
          />
          <MetricCard 
            title={t('dashboard.screeningsToday')} 
            value={data.screeningsToday} 
            icon={Activity} 
            trend="" 
            trendUp={true} 
            color="emerald"
            chartData={data.sparklines.screenings}
          />
        </div>

        {/* Middle Row: AI Insights, Risk Pulse, Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* AI Health Insights */}
          <motion.div variants={itemVariants} className="h-full">
            <Card className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 rounded-3xl h-full flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" /> {t('dashboard.aiHealthInsights')}
                  </h3>
                  <div className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-md">AI</div>
                </div>
                
                <ul className="space-y-4 mb-6 flex-1">
                  {data.aiInsights?.map((insight, index) => {
                    let icon = BrainCircuit;
                    let color = 'text-primary';
                    let bg = 'bg-primary/10';
                    
                    if (insight.type === 'Outbreak') { icon = ShieldAlert; color = 'text-red-500'; bg = 'bg-red-50'; }
                    else if (insight.type === 'Action') { icon = Activity; color = 'text-orange-500'; bg = 'bg-orange-50'; }
                    else if (insight.type === 'Reminder') { icon = Calendar; color = 'text-blue-500'; bg = 'bg-blue-50'; }
                    
                    return (
                      <InsightItem key={index} icon={icon} color={color} bg={bg} text={insight.text} />
                    );
                  })}
                  {(!data.aiInsights || data.aiInsights.length === 0) && (
                    <li className="text-xs text-slate-500 font-medium">{t('dashboard.noActiveInsights')}</li>
                  )}
                </ul>

                <button 
                  onClick={() => navigate('/ai-insights')}
                  className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-primary/20 mt-auto"
                >
                  {t('dashboard.viewAllInsights')}
                </button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Community Risk Pulse */}
          <motion.div variants={itemVariants} className="h-full">
            <Card className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 rounded-3xl h-full flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <CardContent className="p-6 flex-1 flex flex-col relative">
                <div className="mb-2">
                  <h3 className="text-sm font-bold text-slate-900">{t('dashboard.communityRisk')}</h3>
                  <p className="text-lg font-bold text-orange-500 mt-1">{t('ai.moderateRisk')}</p>
                  <p className="text-xs text-slate-500">{worker.village} {t('form.village')}</p>
                </div>
                
                {/* Gauge Visualization */}
                <div className="flex-1 flex items-center justify-center py-6">
                  <div className="relative w-40 h-20 overflow-hidden">
                    {/* Gauge Background Tracks */}
                    <div className="absolute top-0 left-0 w-40 h-40 rounded-full border-[12px] border-slate-100 box-border"></div>
                    {/* Gauge Colored Tracks (Green -> Yellow -> Orange -> Red) */}
                    <div className="absolute top-0 left-0 w-40 h-40 rounded-full border-[12px] border-transparent border-t-emerald-400 border-l-emerald-400 -rotate-45 box-border"></div>
                    {data.riskScore > 35 && <div className="absolute top-0 left-0 w-40 h-40 rounded-full border-[12px] border-transparent border-t-orange-400 rotate-45 box-border"></div>}
                    {data.riskScore > 60 && <div className="absolute top-0 left-0 w-40 h-40 rounded-full border-[12px] border-transparent border-r-red-500 rotate-45 box-border"></div>}
                    {/* Needle */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 rounded-full shadow-md z-10"></div>
                    <div 
                      className="absolute bottom-2 left-1/2 w-1.5 h-14 bg-slate-800 origin-bottom rounded-full shadow-sm z-0 transition-all duration-1000 ease-out"
                      style={{ transform: `rotate(${-90 + (data.riskScore * 1.8)}deg)` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-end justify-between mt-auto">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">{t('dashboard.riskScore')}</p>
                    <p className="text-2xl font-bold text-slate-900">{data.riskScore}<span className="text-sm text-slate-400 font-medium">/100</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-500 flex items-center justify-end gap-0.5">
                      <ArrowUpRight className="w-3 h-3" /> {t('dashboard.increasing')}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">{t('dashboard.vsLastWeek')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="h-full">
            <Card className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 rounded-3xl h-full flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-slate-900">{t('dashboard.quickActions')}</h3>
                  <button className="text-xs font-bold text-primary hover:text-primary-dark">{t('dashboard.viewAll')}</button>
                </div>
                
                <div className="grid grid-cols-3 gap-4 flex-1 content-start">
                  <QuickActionButton icon={Plus} label={t('button.addPatient')} color="primary" onClick={() => navigate('/patients/add')} />
                  <QuickActionButton icon={Stethoscope} label={t('nav.screenings')} color="emerald" onClick={() => navigate('/screenings')} />
                  <QuickActionButton icon={ScanLine} label={t('dashboard.scanCard')} color="blue" onClick={() => navigate('/patients')} />
                  <QuickActionButton icon={Mic} label={t('dashboard.voice')} color="purple" onClick={() => navigate('/patients')} />
                  <QuickActionButton icon={PhoneCall} label={t('button.emergencyAlert')} color="red" onClick={() => setShowEmergencyModal(true)} />
                  <QuickActionButton icon={UsersRound} label={t('nav.familyInsights')} color="orange" onClick={() => navigate('/family-insights')} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>

        {/* Bottom Row: Charts & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Patient Trend Area Chart */}
          <motion.div variants={itemVariants} className="lg:col-span-1 h-[320px]">
            <Card className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 rounded-3xl h-full hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">{t('dashboard.patientTrend')} <span className="text-slate-400 font-medium font-normal">({t('dashboard.thisMonth')})</span></h3>
                  <select className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none text-slate-600 font-medium">
                    <option>{t('dashboard.thisMonth')}</option>
                    <option>{t('dashboard.lastMonth')}</option>
                  </select>
                </div>
                <div className="flex-1 w-full -ml-6 pr-2">
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <AreaChart data={data.patientTrendData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        itemStyle={{ color: '#7c3aed', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="patients" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorPatients)" activeDot={{ r: 6, strokeWidth: 0, fill: '#7c3aed' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Health Conditions Donut Chart */}
          <motion.div variants={itemVariants} className="lg:col-span-1 h-[320px]">
            <Card className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 rounded-3xl h-full hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <CardContent className="p-6 h-full flex flex-col">
                <h3 className="text-sm font-bold text-slate-900 mb-2">{t('dashboard.topHealthConditions')}</h3>
                <div className="flex-1 flex items-center justify-between">
                  <div className="w-1/2 h-full relative">
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <PieChart>
                        <Pie
                          data={data.healthConditionsData}
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {data.healthConditionsData?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold text-slate-900">{data.totalPatients}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{t('dashboard.total')}</span>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="w-1/2 pl-4 space-y-3">
                    {data.healthConditionsData?.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-xs font-semibold text-slate-700">{item.name}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Alerts */}
          <motion.div variants={itemVariants} className="lg:col-span-1 h-[320px]">
            <Card className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 rounded-3xl h-full hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">{t('dashboard.recentAlerts')}</h3>
                  <button onClick={() => navigate('/alerts')} className="text-xs font-bold text-primary hover:text-primary-dark">{t('dashboard.viewAll')}</button>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide">
                  {data.recentAlerts?.map((alert) => {
                    let icon = ShieldAlert;
                    let color = 'red';
                    
                    if (alert.type === 'Insight') { icon = Sparkles; color = 'purple'; }
                    else if (alert.type === 'Missed' || alert.type === 'Follow-up Due') { icon = Calendar; color = 'orange'; }
                    else if (alert.type === 'High Risk' || alert.type === 'Emergency') { icon = PhoneCall; color = 'red'; }
                    else if (alert.type === 'Community Outbreak') { icon = UsersRound; color = 'emerald'; }

                    return (
                      <AlertItem 
                        key={alert._id}
                        id={alert._id}
                        icon={icon} color={color} 
                        title={alert.title} subtitle={alert.subtitle} time={alert.time} 
                        onClick={() => navigate(`/alerts/${alert._id}`)}
                      />
                    );
                  })}
                  {(!data.recentAlerts || data.recentAlerts.length === 0) && (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-xs text-slate-500 font-medium">{t('dashboard.noRecentAlerts')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Follow-ups */}
          <motion.div variants={itemVariants} className="lg:col-span-3 xl:col-span-4 mt-6">
            <Card className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 rounded-3xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <CardContent className="p-0">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" /> {t('dashboard.upcomingFollowUps')}
                  </h3>
                  <button onClick={() => navigate('/calendar')} className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1">
                    {t('dashboard.viewCalendar')} <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  {/* Today */}
                  <div className="p-6 bg-slate-50/50">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{t('dashboard.today')}</h4>
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                      {data.upcomingFollowUps?.filter(f => {
                        const d = new Date(f.date);
                        const today = new Date();
                        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
                      }).map(f => (
                        <div key={f._id} onClick={() => navigate(`/patients/${f.patientId}`)} className="bg-white p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-primary/50 transition-colors shadow-sm">
                          <p className="text-sm font-bold text-slate-900 truncate">{f.patientName}</p>
                          <p className="text-xs text-slate-500 font-medium truncate">{f.reason}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">{f.time || t('dashboard.allDay')}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${f.riskLevel === 'High Risk' ? 'bg-red-50 text-red-600' : f.riskLevel === 'Medium Risk' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>{f.riskLevel}</span>
                          </div>
                        </div>
                      ))}
                      {(!data.upcomingFollowUps || data.upcomingFollowUps.filter(f => new Date(f.date).toDateString() === new Date().toDateString()).length === 0) && (
                        <p className="text-xs text-slate-400 font-medium text-center py-4">{t('dashboard.noFollowUpsToday')}</p>
                      )}
                    </div>
                  </div>

                  {/* Tomorrow */}
                  <div className="p-6">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{t('dashboard.tomorrow')}</h4>
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                      {data.upcomingFollowUps?.filter(f => {
                        const d = new Date(f.date);
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        return d.getDate() === tomorrow.getDate() && d.getMonth() === tomorrow.getMonth() && d.getFullYear() === tomorrow.getFullYear();
                      }).map(f => (
                        <div key={f._id} onClick={() => navigate(`/patients/${f.patientId}`)} className="bg-white p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-primary/50 transition-colors shadow-sm">
                          <p className="text-sm font-bold text-slate-900 truncate">{f.patientName}</p>
                          <p className="text-xs text-slate-500 font-medium truncate">{f.reason}</p>
                        </div>
                      ))}
                      {(!data.upcomingFollowUps || data.upcomingFollowUps.filter(f => {
                        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
                        return new Date(f.date).toDateString() === tomorrow.toDateString();
                      }).length === 0) && (
                        <p className="text-xs text-slate-400 font-medium text-center py-4">{t('dashboard.noFollowUpsTomorrow')}</p>
                      )}
                    </div>
                  </div>

                  {/* Overdue */}
                  <div className="p-6">
                    <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-4">{t('dashboard.overdue')}</h4>
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                      {data.upcomingFollowUps?.filter(f => {
                        const d = new Date(f.date);
                        const today = new Date();
                        today.setHours(0,0,0,0);
                        return d < today;
                      }).map(f => (
                        <div key={f._id} onClick={() => navigate(`/patients/${f.patientId}`)} className="bg-red-50 p-3 rounded-xl border border-red-100 cursor-pointer hover:border-red-300 transition-colors shadow-sm">
                          <p className="text-sm font-bold text-slate-900 truncate">{f.patientName}</p>
                          <p className="text-xs text-slate-500 font-medium truncate">{new Date(f.date).toLocaleDateString()}</p>
                        </div>
                      ))}
                      {(!data.upcomingFollowUps || data.upcomingFollowUps.filter(f => new Date(f.date) < new Date(new Date().setHours(0,0,0,0))).length === 0) && (
                        <p className="text-xs text-slate-400 font-medium text-center py-4">{t('dashboard.noOverdueFollowUps')}</p>
                      )}
                    </div>
                  </div>

                  {/* Next 7 Days */}
                  <div className="p-6">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{t('dashboard.upcoming')}</h4>
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                      {data.upcomingFollowUps?.filter(f => {
                        const d = new Date(f.date);
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        return d > tomorrow; // strictly after tomorrow
                      }).map(f => (
                        <div key={f._id} onClick={() => navigate(`/patients/${f.patientId}`)} className="bg-white p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-primary/50 transition-colors shadow-sm flex justify-between items-center">
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 truncate">{f.patientName}</p>
                            <p className="text-[10px] text-slate-500 font-medium truncate">{f.reason}</p>
                          </div>
                          <div className="text-right shrink-0 ml-2 text-xs font-bold text-slate-400">
                            {new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </motion.div>

      {/* Emergency Modal */}
      <AnimatePresence>
        {showEmergencyModal && (
          <EmergencyAssistanceModal 
            isOpen={showEmergencyModal} 
            onClose={() => setShowEmergencyModal(false)}
            onEmergencySaved={handleEmergencySaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Subcomponents

function MetricCard({ title, value, icon: Icon, trend, trendUp, color, chartData }) {
  const { t } = useTranslation();
  const colorMap = {
    primary: 'text-primary bg-primary/10',
    red: 'text-red-500 bg-red-50',
    orange: 'text-orange-500 bg-orange-50',
    emerald: 'text-emerald-500 bg-emerald-50'
  };
  
  const strokeMap = {
    primary: '#7c3aed',
    red: '#ef4444',
    orange: '#f97316',
    emerald: '#10b981'
  };

  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
      <Card className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 rounded-3xl overflow-hidden hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all group relative">
        <CardContent className="p-5">
          <div className="flex items-start gap-4 mb-4">
            <div className={`p-3 rounded-2xl shrink-0 ${colorMap[color]}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-3xl font-extrabold text-slate-900 leading-none mb-1">{value}</p>
              <p className="text-[11px] font-semibold text-slate-500">{title}</p>
            </div>
          </div>
          
          <div className="flex items-end justify-between mt-4">
            <div className="flex items-center gap-1.5">
              <div className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${trendUp ? 'text-emerald-600 bg-emerald-50' : 'text-orange-600 bg-orange-50'}`}>
                {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {trend}
              </div>
              <span className="text-[9px] text-slate-400 font-medium">{t('dashboard.vsLastMonth')}</span>
            </div>
            
            {/* Sparkline */}
            <div className="w-16 h-8 opacity-60 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <LineChart data={chartData}>
                  <Line type="monotone" dataKey="v" stroke={strokeMap[color]} strokeWidth={2} dot={false} isAnimationActive={true} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function InsightItem({ icon: Icon, color, bg, text }) {
  return (
    <li className="flex items-start gap-3">
      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${bg} ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xs font-semibold text-slate-700 leading-relaxed">{text}</p>
    </li>
  );
}

function QuickActionButton({ icon: Icon, label, color, onClick }) {
  const colorMap = {
    primary: 'text-primary bg-primary/10 group-hover:bg-primary group-hover:text-white',
    emerald: 'text-emerald-600 bg-emerald-50 group-hover:bg-emerald-500 group-hover:text-white',
    blue: 'text-blue-600 bg-blue-50 group-hover:bg-blue-500 group-hover:text-white',
    purple: 'text-purple-600 bg-purple-50 group-hover:bg-purple-500 group-hover:text-white',
    red: 'text-red-600 bg-red-50 group-hover:bg-red-500 group-hover:text-white',
    orange: 'text-orange-600 bg-orange-50 group-hover:bg-orange-500 group-hover:text-white'
  };

  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-2 group outline-none"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${colorMap[color]}`}>
        <Icon className="w-6 h-6 transition-transform group-hover:scale-110" />
      </div>
      <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">{label}</span>
    </button>
  );
}

function AlertItem({ icon: Icon, color, title, subtitle, time, onClick }) {
  const colorMap = {
    red: 'text-red-500 bg-red-50',
    orange: 'text-orange-500 bg-orange-50',
    blue: 'text-blue-500 bg-blue-50',
    emerald: 'text-emerald-500 bg-emerald-50'
  };

  return (
    <div onClick={onClick} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group cursor-pointer">
      <div className={`p-2.5 rounded-xl shrink-0 ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-slate-900 truncate">{title}</h4>
        <p className="text-[10px] text-slate-500 truncate mt-0.5">{subtitle}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[9px] font-medium text-slate-400">{time}</p>
      </div>
    </div>
  );
}
