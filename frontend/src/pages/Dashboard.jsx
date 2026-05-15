import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { 
  Users, ShieldAlert, Calendar, Plus, Stethoscope, Cloud, 
  Activity, BrainCircuit, ScanLine, Mic, UsersRound, PhoneCall, 
  Loader2, ArrowUpRight, ArrowDownRight, ChevronRight, CheckCircle2,
  Bell, Sparkles, ShieldPlus, AlertTriangle
} from 'lucide-react';
import NotificationPanel from '../components/NotificationPanel';
import LanguageSelector from '../components/LanguageSelector';
import toast from 'react-hot-toast';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/i18n';
import dashboardHero from '../assets/dashboard-hero.png';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

// Data is now fetched from the backend API

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [triggeringEmergency, setTriggeringEmergency] = useState(false);
  const worker = JSON.parse(localStorage.getItem('worker') || '{"name":"ASHA Worker", "village":""}');
  const { language } = useLanguage();

  const fetchStats = () => {
    api.get('/dashboard/stats')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load dashboard stats', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    fetchStats();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center md:pl-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleEmergency = async () => {
    setTriggeringEmergency(true);
    try {
      await api.post('/alerts/emergency', { village: worker.village });
      toast.success('Emergency alert triggered successfully');
      setShowEmergencyModal(false);
      fetchStats(); // Update alerts instantly
    } catch (err) {
      toast.error('Failed to trigger emergency alert');
    } finally {
      setTriggeringEmergency(false);
    }
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
    <div className="w-full min-h-screen pb-24 md:pb-8 font-sans selection:bg-primary/20 overflow-x-hidden">
      
      {/* Search & Top Nav Bar (Desktop) */}
      <div className="hidden md:flex items-center justify-between px-8 py-4 bg-white/50 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100/50">
        <div className="flex items-center bg-slate-100/50 rounded-full px-4 py-2 w-96 border border-slate-200/50 focus-within:border-primary/30 focus-within:bg-white transition-all">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search patients, reports..." 
            className="bg-transparent border-none outline-none text-sm ml-2 w-full text-slate-700 placeholder-slate-400"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-sm ${isOnline ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            {isOnline ? 'SYNCED' : 'OFFLINE'}
          </div>
          <LanguageSelector showLabel={false} selectClassName="bg-white text-slate-800 border-slate-200 font-medium text-sm rounded-full px-3 py-1.5 shadow-sm" />
          <div className="relative">
            <button className="p-2 bg-white rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
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
      <div className="relative w-full h-[280px] md:h-[320px] bg-slate-900 overflow-hidden flex items-center justify-center">
        <img 
          src={dashboardHero} 
          alt="Healthcare Dashboard" 
          className="absolute inset-0 w-full h-full object-cover object-top md:object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/80 via-primary/50 to-transparent"></div>
        
        <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-center text-white z-10 max-w-2xl">
          <p className="text-sm md:text-base font-semibold text-white/90 mb-2 flex items-center gap-2">
            Namaste, {worker.name || 'ASHA Worker'} <span className="text-xl">👋</span>
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 tracking-tight shadow-sm">
            Empowering Health, <br />
            <span className="text-white/90 font-light">Transforming Lives</span>
          </h1>
          <p className="text-xs md:text-sm font-medium text-white/80 flex items-center gap-2 bg-black/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-md">
            <BrainCircuit className="w-4 h-4" /> AI-powered insights for a healthier community
          </p>
        </div>

        {/* Weather/Location floating top right on desktop */}
        <div className="hidden md:flex absolute top-10 right-10 flex-col items-end text-white text-shadow-sm">
          <div className="flex items-center gap-2 text-3xl font-bold mb-1">
            <Cloud className="w-8 h-8 opacity-90" /> 28°C
          </div>
          <p className="font-medium text-white/90">{worker.village || 'Shadnagar'} Village</p>
          <p className="text-xs text-white/70">Tue, 20 May 2026</p>
        </div>
      </div>

      {/* Main Content Area */}
      <motion.div 
        className="px-4 md:px-8 -mt-16 md:-mt-20 relative z-20 space-y-6 w-full max-w-[1400px] mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Total Patients" 
            value={data.totalPatients} 
            icon={Users} 
            trend="" 
            trendUp={true} 
            color="primary"
            chartData={data.sparklines.total}
          />
          <MetricCard 
            title="High Risk Patients" 
            value={data.highRiskPatients} 
            icon={ShieldAlert} 
            trend="" 
            trendUp={false} 
            color="red"
            chartData={data.sparklines.highRisk}
          />
          <MetricCard 
            title="Follow-ups Due" 
            value={data.followUpsToday} 
            icon={Calendar} 
            trend="" 
            trendUp={false} 
            color="orange"
            chartData={data.sparklines.followUps}
          />
          <MetricCard 
            title="Screenings Today" 
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
                    <Sparkles className="w-4 h-4 text-primary" /> AI Health Insights
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
                    <li className="text-xs text-slate-500 font-medium">No active insights at the moment.</li>
                  )}
                </ul>

                <button 
                  onClick={() => navigate('/ai-insights')}
                  className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-primary/20 mt-auto"
                >
                  View All Insights
                </button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Community Risk Pulse */}
          <motion.div variants={itemVariants} className="h-full">
            <Card className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 rounded-3xl h-full flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <CardContent className="p-6 flex-1 flex flex-col relative">
                <div className="mb-2">
                  <h3 className="text-sm font-bold text-slate-900">Community Risk Pulse</h3>
                  <p className="text-lg font-bold text-orange-500 mt-1">{data.communityRisk}</p>
                  <p className="text-xs text-slate-500">{worker.village || 'Shadnagar'} Village</p>
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
                    <p className="text-xs text-slate-500 font-medium">Risk Score</p>
                    <p className="text-2xl font-bold text-slate-900">{data.riskScore}<span className="text-sm text-slate-400 font-medium">/100</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-500 flex items-center justify-end gap-0.5">
                      <ArrowUpRight className="w-3 h-3" /> Increasing
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">vs last week</p>
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
                  <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
                  <button className="text-xs font-bold text-primary hover:text-primary-dark">View All</button>
                </div>
                
                <div className="grid grid-cols-3 gap-4 flex-1 content-start">
                  <QuickActionButton icon={Plus} label="Add Patient" color="primary" onClick={() => navigate('/patients/add')} />
                  <QuickActionButton icon={Stethoscope} label="Start Screening" color="emerald" onClick={() => navigate('/patients')} />
                  <QuickActionButton icon={ScanLine} label="Scan Health Card" color="blue" onClick={() => navigate('/patients')} />
                  <QuickActionButton icon={Mic} label="Voice Screening" color="purple" onClick={() => navigate('/patients')} />
                  <QuickActionButton icon={PhoneCall} label="Emergency Alert" color="red" onClick={() => setShowEmergencyModal(true)} />
                  <QuickActionButton icon={UsersRound} label="Family Insights" color="orange" onClick={() => navigate('/family-insights')} />
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
                  <h3 className="text-sm font-bold text-slate-900">Patient Trend <span className="text-slate-400 font-medium font-normal">(This Month)</span></h3>
                  <select className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none text-slate-600 font-medium">
                    <option>This Month</option>
                    <option>Last Month</option>
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
                <h3 className="text-sm font-bold text-slate-900 mb-2">Top Health Conditions</h3>
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
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total</span>
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
                  <h3 className="text-sm font-bold text-slate-900">Recent Alerts</h3>
                  <button onClick={() => navigate('/alerts')} className="text-xs font-bold text-primary hover:text-primary-dark">View All</button>
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
                      <p className="text-xs text-slate-500 font-medium">No recent alerts.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </motion.div>

      {/* Emergency Modal */}
      <AnimatePresence>
        {showEmergencyModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl relative overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 mt-2">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Trigger Emergency?</h2>
              <p className="text-sm text-slate-500 font-medium mb-6 px-4">
                This will immediately alert doctors and primary health centers in {worker.village || 'your area'}.
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={handleEmergency}
                  disabled={triggeringEmergency}
                  className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-lg shadow-red-500/30"
                >
                  {triggeringEmergency ? <Loader2 className="w-5 h-5 animate-spin" /> : <PhoneCall className="w-5 h-5" />}
                  {triggeringEmergency ? 'Triggering...' : 'Yes, Trigger Alert'}
                </button>
                <button 
                  onClick={() => setShowEmergencyModal(false)}
                  disabled={triggeringEmergency}
                  className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors disabled:opacity-70"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Subcomponents

function MetricCard({ title, value, icon: Icon, trend, trendUp, color, chartData }) {
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
              <span className="text-[9px] text-slate-400 font-medium">vs last month</span>
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

function AlertItem({ id, icon: Icon, color, title, subtitle, time, onClick }) {
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
