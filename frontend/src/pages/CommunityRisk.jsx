import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ArrowLeft, Loader2, AlertTriangle, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../api';
import MobileHeader from '../components/MobileHeader';
import { useTranslation } from 'react-i18next';

export default function CommunityRisk() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.onLine) {
      api.get('/community-risk')
        .then(async res => {
          setData(res.data);
          const { cacheCommunityRisk } = await import('../utils/offlineStore');
          await cacheCommunityRisk(res.data);
          setLoading(false);
        })
        .catch(async err => {
          console.error(err);
          const { getCachedCommunityRisk } = await import('../utils/offlineStore');
          const cached = await getCachedCommunityRisk();
          if (cached) setData(cached);
          setLoading(false);
        });
    } else {
      import('../utils/offlineStore').then(async ({ getCachedCommunityRisk }) => {
        const cached = await getCachedCommunityRisk();
        if (cached) setData(cached);
        setLoading(false);
      });
    }
  }, []);

  if (loading) {
    return (
      <div className="flex-1 w-full bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || !data.villages || data.villages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-slate-50 pb-20 text-center">
        <MobileHeader title={t('community.communityRisk')} />
        <div className="hidden md:flex px-6 py-5 items-center sticky top-0 bg-slate-50 z-10 border-b border-slate-100">
          <button onClick={() => navigate(-1)} className="text-slate-800 absolute left-6"><ArrowLeft className="w-6 h-6" /></button>
          <h1 className="text-sm font-bold text-slate-900 mx-auto">{t('community.communityRisk')}</h1>
        </div>
        <p className="p-6 text-slate-500 mt-20">{t('community.noData')}</p>
      </div>
    );
  }

  const { villages, clusters } = data;
  
  // Prepare chart data
  const chartData = [
    { name: t('community.fever'), count: clusters.fever, color: '#ef4444' },
    { name: t('community.weakness'), count: clusters.weakness, color: '#f97316' },
    { name: t('community.stress'), count: clusters.stress, color: '#8b5cf6' },
    { name: t('community.highBp'), count: clusters.highBp, color: '#eab308' },
  ].filter(item => item.count > 0);

  const mainVillage = villages[0]; // Assuming one main village for this dashboard view

  const getRiskLabel = (score) => {
    if (score > 60) return { label: t('community.critical'), color: 'text-red-600', bg: 'bg-red-50 border-red-200' };
    if (score > 30) return { label: t('community.moderate'), color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' };
    return { label: t('community.stable'), color: 'text-green-600', bg: 'bg-green-50 border-green-200' };
  };

  const riskStatus = getRiskLabel(mainVillage.riskScore);
  const isOutbreak = clusters.fever >= 3 || clusters.weakness >= 3;

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-slate-50 pb-20">
      <MobileHeader title={mainVillage.name} />
      <div className="hidden md:flex px-6 py-5 items-center justify-between sticky top-0 bg-slate-50 z-10 border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="text-slate-800">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-bold text-slate-900 absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
          <MapPin className="w-4 h-4 text-primary" /> {mainVillage.name}
        </h1>
        <div className="w-6"></div> {/* Spacer */}
      </div>

      <div className="px-6 pt-6 space-y-6 max-w-7xl mx-auto w-full">

        {isOutbreak && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-3 shadow-sm animate-pulse">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-red-800 mb-1">{t('community.outbreakWarning')}</h3>
              <p className="text-xs text-red-700 font-medium">{t('community.outbreakDesc')}</p>
            </div>
          </div>
        )}

        {/* Community Risk Level Card */}
        <div className={`${riskStatus.bg} rounded-2xl p-5 shadow-[0_4px_12px_rgb(0,0,0,0.03)] border flex items-center justify-between`}>
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">{t('community.riskLevel')}</h3>
            <p className={`text-3xl font-black ${riskStatus.color}`}>{riskStatus.label}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('community.score')}</p>
            <p className={`text-2xl font-black ${riskStatus.color}`}>{mainVillage.riskScore}/100</p>
          </div>
        </div>

        {/* Villagers Health Summary */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-3 px-1">{t('community.popSummary')}</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-[0_4px_12px_rgb(0,0,0,0.03)]">
              <p className="text-[10px] font-bold text-red-500 mb-1">{t('community.highRisk')}</p>
              <p className="text-2xl font-black text-slate-800">{mainVillage.highRisk}</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-[0_4px_12px_rgb(0,0,0,0.03)]">
              <p className="text-[10px] font-bold text-orange-500 mb-1">{t('community.mediumRisk')}</p>
              <p className="text-2xl font-black text-slate-800">{mainVillage.mediumRisk}</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-[0_4px_12px_rgb(0,0,0,0.03)]">
              <p className="text-[10px] font-bold text-green-500 mb-1">{t('community.totalScreened')}</p>
              <p className="text-2xl font-black text-slate-800">{mainVillage.total}</p>
            </div>
          </div>
        </div>

        {/* Disease Clusters Graph */}
        {chartData.length > 0 && (
          <div className="bg-white p-5 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-6">{t('community.diseaseClusters')}</h3>
            <div className="w-full" style={{ minWidth: 0, height: 200 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgb(0,0,0,0.05)' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
