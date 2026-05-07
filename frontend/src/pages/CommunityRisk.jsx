import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Loader2, AlertTriangle, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../api';

export default function CommunityRisk() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/community-risk')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || !data.villages || data.villages.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 pb-20 text-center">
        <div className="px-6 py-5 flex items-center sticky top-0 bg-slate-50 z-10 border-b border-slate-100">
          <button onClick={() => navigate(-1)} className="text-slate-800 absolute left-6"><ArrowLeft className="w-6 h-6" /></button>
          <h1 className="text-sm font-bold text-slate-900 mx-auto">Community Risk</h1>
        </div>
        <p className="p-6 text-slate-500 mt-20">No community data available yet.</p>
      </div>
    );
  }

  const { villages, clusters } = data;
  
  // Prepare chart data
  const chartData = [
    { name: 'Fever', count: clusters.fever, color: '#ef4444' },
    { name: 'Weakness', count: clusters.weakness, color: '#f97316' },
    { name: 'Stress', count: clusters.stress, color: '#8b5cf6' },
    { name: 'High BP', count: clusters.highBp, color: '#eab308' },
  ].filter(item => item.count > 0);

  const mainVillage = villages[0]; // Assuming one main village for this dashboard view

  const getRiskLabel = (score) => {
    if (score > 60) return { label: 'Critical', color: 'text-red-600', bg: 'bg-red-50 border-red-200' };
    if (score > 30) return { label: 'Moderate', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' };
    return { label: 'Stable', color: 'text-green-600', bg: 'bg-green-50 border-green-200' };
  };

  const riskStatus = getRiskLabel(mainVillage.riskScore);
  const isOutbreak = clusters.fever >= 3 || clusters.weakness >= 3;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="px-6 py-5 flex items-center justify-between sticky top-0 bg-slate-50 z-10 border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="text-slate-800">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-bold text-slate-900 absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
          <MapPin className="w-4 h-4 text-primary" /> {mainVillage.name}
        </h1>
        <div className="w-6"></div> {/* Spacer */}
      </div>

      <div className="px-6 pt-6 space-y-6">

        {isOutbreak && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-3 shadow-sm animate-pulse">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-red-800 mb-1">Outbreak Warning</h3>
              <p className="text-xs text-red-700 font-medium">Multiple cases of Fever/Weakness detected in this cluster. Immediate community screening required.</p>
            </div>
          </div>
        )}

        {/* Community Risk Level Card */}
        <div className={`${riskStatus.bg} rounded-2xl p-5 shadow-[0_4px_12px_rgb(0,0,0,0.03)] border flex items-center justify-between`}>
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Risk Level</h3>
            <p className={`text-3xl font-black ${riskStatus.color}`}>{riskStatus.label}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Score</p>
            <p className={`text-2xl font-black ${riskStatus.color}`}>{mainVillage.riskScore}/100</p>
          </div>
        </div>

        {/* Villagers Health Summary */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-3 px-1">Population Summary</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-[0_4px_12px_rgb(0,0,0,0.03)]">
              <p className="text-[10px] font-bold text-red-500 mb-1">High Risk</p>
              <p className="text-2xl font-black text-slate-800">{mainVillage.highRisk}</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-[0_4px_12px_rgb(0,0,0,0.03)]">
              <p className="text-[10px] font-bold text-orange-500 mb-1">Medium Risk</p>
              <p className="text-2xl font-black text-slate-800">{mainVillage.mediumRisk}</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-[0_4px_12px_rgb(0,0,0,0.03)]">
              <p className="text-[10px] font-bold text-green-500 mb-1">Total Screened</p>
              <p className="text-2xl font-black text-slate-800">{mainVillage.total}</p>
            </div>
          </div>
        </div>

        {/* Disease Clusters Graph */}
        {chartData.length > 0 && (
          <div className="bg-white p-5 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-6">Disease Clusters</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
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
