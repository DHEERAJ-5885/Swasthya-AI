import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Loader2, TrendingUp, Users, Activity, ChevronDown, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../api';
import toast from 'react-hot-toast';
import MobileHeader from '../components/MobileHeader';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7 Days');

  useEffect(() => {
    api.get('/advanced')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        toast.error('Failed to load analytics');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 md:pl-64">
      <MobileHeader title="Analytics" />
      {/* Header */}
      <div className="px-6 py-5 hidden md:flex items-center justify-between sticky top-0 bg-[#F8FAFC]/80 backdrop-blur-md z-10 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Analytics Overview</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Performance & Health Trends</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            {timeRange} <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
          <button className="hidden md:flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-md shadow-primary/20 transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <motion.div 
        className="px-6 py-6 max-w-[1400px] mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Patients" value={data.totalPatients} icon={Users} color="blue" trend="+12%" />
          <KpiCard title="Weekly Screenings" value={data.weeklyScreenings.reduce((a, b) => a + b.count, 0)} icon={Activity} color="emerald" trend="+5%" />
          <KpiCard title="Follow-up Rate" value="82%" icon={TrendingUp} color="orange" trend="+2%" />
          <KpiCard title="Avg Risk Score" value="34/100" icon={Activity} color="red" trend="-5%" />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Trend Chart */}
          <motion.div variants={itemVariants} className="lg:col-span-2 h-[380px]">
            <Card className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 rounded-3xl h-full flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Screening Volume</h3>
                    <p className="text-[11px] text-slate-500">Number of patient screenings over last 7 days</p>
                  </div>
                </div>
                <div className="flex-1 w-full -ml-4">
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <AreaChart data={data.weeklyScreenings} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Disease Distribution Pie */}
          <motion.div variants={itemVariants} className="h-[380px]">
            <Card className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 rounded-3xl h-full flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-slate-900 mb-2">Disease Distribution</h3>
                <p className="text-[11px] text-slate-500 mb-4">Symptom frequency among screened patients</p>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <PieChart>
                      <Pie
                        data={data.diseaseDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.diseaseDistribution.map((entry, index) => {
                          const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants} className="h-[380px]">
             <Card className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 rounded-3xl h-full flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-slate-900 mb-6">Follow-up Completion (Monthly)</h3>
                <div className="flex-1 w-full -ml-4">
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <BarChart data={data.followUpData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <RechartsTooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                      <Bar dataKey="completed" name="Completed" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} barSize={30} />
                      <Bar dataKey="missed" name="Missed" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants} className="h-[380px]">
             <Card className="bg-gradient-to-br from-primary to-indigo-600 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-0 rounded-3xl h-full flex flex-col p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Activity className="w-48 h-48 text-white" />
               </div>
               <div className="relative z-10 flex flex-col h-full justify-center">
                 <h2 className="text-2xl font-black text-white mb-2">AI Performance Summary</h2>
                 <p className="text-white/80 font-medium text-sm mb-8 leading-relaxed max-w-md">
                   Based on this week's analytics, your screening rate is up by 12%. Community health risk is stabilizing. Focus efforts on completing pending follow-ups for diabetic patients to further reduce critical escalations.
                 </p>
                 <button className="bg-white text-primary font-bold px-6 py-3 rounded-xl w-max shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2">
                   View Detailed Report
                 </button>
               </div>
            </Card>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, color, trend }) {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50',
    emerald: 'text-emerald-500 bg-emerald-50',
    red: 'text-red-500 bg-red-50',
    orange: 'text-orange-500 bg-orange-50',
  };

  return (
    <Card className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 rounded-3xl overflow-hidden hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {trend}
          </span>
        </div>
        <div>
          <p className="text-2xl font-black text-slate-900 mb-0.5">{value}</p>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}
