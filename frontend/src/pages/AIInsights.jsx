import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';

import { 
  ArrowLeft, BrainCircuit, Activity, ShieldAlert, Calendar, 
  Loader2, AlertTriangle, User, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell 
} from 'recharts';
import api from '../api';
import toast from 'react-hot-toast';
import MobileHeader from '../components/MobileHeader';
import { useTranslation } from 'react-i18next';

export default function AIInsights() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/insights')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        toast.error(t('insights.errLoad'));
        setLoading(false);
      });
  }, [t]);

  if (loading) {
    return (
      <div className="flex-1 w-full bg-[#F8FAFC] flex items-center justify-center">
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
    <div className="flex-1 overflow-y-auto overflow-x-hidden w-full pb-24 md:pb-8 bg-[#F8FAFC]">
      <MobileHeader title={t('insights.aiInsights')} />
      {/* Header */}
      <div className="hidden md:flex px-6 py-5 items-center justify-between sticky top-0 bg-[#F8FAFC]/80 backdrop-blur-md z-10 border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="text-slate-800 p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <BrainCircuit className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-base font-bold text-slate-900">{t('insights.aiHealthInsights')}</h1>
        </div>
        <div className="w-10"></div>
      </div>

      <motion.div 
        className="px-4 md:px-6 py-6 max-w-7xl mx-auto space-y-6 w-full"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard 
            title={t('insights.totalScreenings')} 
            value={data.totalScreenings} 
            icon={Activity} 
            color="emerald" 
          />
          <SummaryCard 
            title={t('insights.highRiskDetected')} 
            value={data.highRiskCount} 
            icon={ShieldAlert} 
            color="red" 
          />
          <SummaryCard 
            title={t('insights.followUpsPredicted')} 
            value={data.followUpsPredicted} 
            icon={Calendar} 
            color="orange" 
          />
        </div>

        {/* AI Recommendations */}
        <motion.div variants={itemVariants}>
          <h2 className="text-sm font-bold text-slate-900 mb-3 ml-1">{t('insights.aiRecommendations')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.aiRecommendations?.map(rec => (
              <RecommendationCard key={rec.id} recommendation={rec} t={t} />
            ))}
            {(!data.aiRecommendations || data.aiRecommendations.length === 0) && (
              <div className="col-span-3 text-center py-8 text-sm text-slate-500 font-medium">{t('insights.noInsights')}</div>
            )}
          </div>
        </motion.div>

        {/* Charts & High Risk Patients */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Risk Analytics Chart */}
          <motion.div variants={itemVariants} className="h-[380px]">
            <Card className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 rounded-3xl h-full flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-slate-900 mb-6">{t('insights.riskLevelDist')}</h3>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <BarChart data={data.riskAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <RechartsTooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={40}>
                        {data.riskAnalytics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* High Risk Patients */}
          <motion.div variants={itemVariants} className="h-[380px]">
            <Card className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 rounded-3xl h-full flex flex-col overflow-hidden">
              <CardContent className="p-0 flex-1 flex flex-col h-full">
                <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{t('insights.highRiskPatients')}</h3>
                  <span className="bg-red-100 text-red-600 px-2.5 py-1 rounded-full text-xs font-bold">{data.highRiskPatients?.length || 0}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto scrollbar-hide p-2">
                  {data.highRiskPatients?.map(patient => (
                    <div 
                      key={patient._id}
                      onClick={() => navigate(`/patients/${patient._id}`)}
                      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{patient.name}</h4>
                        <p className="text-[11px] text-slate-500 truncate">{patient.age} {t('insights.yrs')} • {patient.village || t('insights.unknownVillage')}</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-3">
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">{t('insights.critical')}</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  ))}
                  {(!data.highRiskPatients || data.highRiskPatients.length === 0) && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                        <ShieldAlert className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">{t('insights.noHighRisk')}</p>
                      <p className="text-xs text-slate-500 mt-1">{t('insights.excellentNoCritical')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, color }) {
  const colorMap = {
    emerald: 'text-emerald-500 bg-emerald-50',
    red: 'text-red-500 bg-red-50',
    orange: 'text-orange-500 bg-orange-50',
  };

  return (
    <Card className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 rounded-3xl overflow-hidden hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl ${colorMap[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div>
          <p className="text-4xl font-extrabold text-slate-900 mb-1">{value}</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function RecommendationCard({ recommendation, t }) {
  let Icon = BrainCircuit;
  let color = 'text-primary';
  let bg = 'bg-primary/10';
  let border = 'border-transparent';

  if (recommendation.type === 'warning') { 
    Icon = AlertTriangle; color = 'text-red-500'; bg = 'bg-red-50'; border = 'border-red-100'; 
  } else if (recommendation.type === 'action') { 
    Icon = Activity; color = 'text-orange-500'; bg = 'bg-orange-50'; border = 'border-orange-100'; 
  } else if (recommendation.type === 'info') { 
    Icon = BrainCircuit; color = 'text-blue-500'; bg = 'bg-blue-50'; border = 'border-blue-100'; 
  }

  return (
    <Card className={`bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all border ${border} relative group cursor-pointer`}>
      <CardContent className="p-5 flex flex-col h-full relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-xl ${bg} ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 leading-tight">{recommendation.title}</h3>
        </div>
        <p className="text-xs font-medium text-slate-600 leading-relaxed flex-1">
          {recommendation.description}
        </p>
        <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <span className={`text-[10px] font-bold ${color}`}>{t('insights.takeAction')}</span>
          <ChevronRight className={`w-4 h-4 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}
