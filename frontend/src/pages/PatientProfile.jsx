import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, MoreVertical, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import api from '../api';

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [activeTab, setActiveTab] = useState('AI Insights');

  useEffect(() => {
    // Attempt fetch patient
    api.get(`/patients/${id}`).then(res => {
      setPatient(res.data);
    }).catch(err => {
      console.error(err);
    });

    // Fetch historical screenings for the timeline
    api.get(`/analyze/${id}`).then(res => {
      const formattedScreenings = res.data.map(s => ({
        date: new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        risk: s.result.riskLevel,
        score: s.result.confidence,
        drift: s.result.trendDirection || s.result.trend || 'Stable',
        result: s.result
      }));
      setScreenings(formattedScreenings);
    }).catch(err => {
      console.error('Failed to fetch screenings', err);
    });
  }, [id]);

  if (!patient) return <div className="p-6 text-center">Loading...</div>;

  const tabs = ['History', 'AI Insights', 'Family Health', 'Reports', 'Observations'];

  // Calculate dynamic drift message based on mock screenings
  const currentScore = screenings[screenings.length - 1]?.score || 0;
  const previousScore = screenings[screenings.length - 2]?.score || 0;
  
  // Use AI drift direction if available, otherwise fallback to score math
  const latestResult = screenings[screenings.length - 1]?.result || {};
  let driftDirection = 'stable';
  if (['Declining', 'Critical Drift'].includes(latestResult.trendDirection || latestResult.trend)) {
    driftDirection = 'increased';
  } else if (['Improving'].includes(latestResult.trendDirection || latestResult.trend)) {
    driftDirection = 'decreased';
  } else if (currentScore > previousScore) {
    driftDirection = 'increased';
  } else if (currentScore < previousScore) {
    driftDirection = 'decreased';
  }

  const riskClass = driftDirection === 'increased' ? 'text-red-500' : (driftDirection === 'decreased' ? 'text-green-500' : 'text-slate-500');

  const renderDynamicChart = () => {
    if (!screenings || screenings.length === 0) return <div className="text-center text-xs text-slate-400 py-10">No data available</div>;
    
    const maxW = 300;
    const maxH = 100;
    
    const points = screenings.map((s, i) => {
      const x = screenings.length === 1 ? maxW / 2 : (i / (screenings.length - 1)) * maxW;
      const y = maxH - (s.score || 0); 
      return { x, y, date: s.date };
    });
    
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x},${maxH} L ${points[0].x},${maxH} Z`;

    const chartColor = driftDirection === 'increased' ? '#ef4444' : (driftDirection === 'decreased' ? '#22c55e' : '#3b82f6');
    const colorClass = driftDirection === 'increased' ? 'bg-red-500' : (driftDirection === 'decreased' ? 'bg-green-500' : 'bg-blue-500');

    return (
      <div className="relative h-24 w-full mt-8 mb-6">
        <div className="absolute w-full border-b border-slate-100 top-0"></div>
        <div className="absolute w-full border-b border-slate-100 top-1/2"></div>
        <div className="absolute w-full border-b border-slate-100 bottom-0"></div>
        
        <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
          <path d={pathD} fill="none" stroke={chartColor} strokeWidth="2" />
          <path d={areaD} fill="url(#chartGradient)" opacity="0.1" />
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
        </svg>
        
        {points.map((p, i) => (
          <div 
            key={i} 
            className={`absolute w-2 h-2 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 ${colorClass}`} 
            style={{ left: `${(p.x / maxW) * 100}%`, top: `${(p.y / maxH) * 100}%` }}
          />
        ))}
        
        <div className="absolute w-full top-[110px]">
          {points.map((p, i) => {
             // Only show up to 4 dates to avoid crowding
             if (screenings.length > 4 && i % Math.ceil(screenings.length / 3) !== 0 && i !== screenings.length - 1) return null;
             return (
              <span key={i} className="text-[8px] text-slate-400 font-medium absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${(p.x / maxW) * 100}%` }}>
                {p.date}
              </span>
             );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top App Bar */}
      <div className="px-6 py-4 flex items-center justify-between sticky top-0 bg-slate-50 z-20">
        <button onClick={() => navigate('/patients')} className="text-slate-800">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button className="text-slate-800">
          <MoreVertical className="w-6 h-6" />
        </button>
      </div>

      <div className="px-6 space-y-4">
        {/* Profile Info Header */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100">
          <img src={`https://i.pravatar.cc/150?u=${patient._id}`} alt="Avatar" className="w-16 h-16 rounded-full bg-slate-200 border-2 border-white shadow-sm" />
          <div>
            <h2 className="text-xl font-bold text-slate-900">{patient.name}</h2>
            <p className="text-xs text-slate-500 font-medium mb-1">{patient.age} Years, {patient.gender}</p>
            <p className="text-[10px] text-slate-400">Village: {patient.village} • ID: {patient.healthId || 'SWA-8392'}</p>
          </div>
        </div>

        {/* Dynamic 3 Pill Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100 text-center flex flex-col justify-center">
            <p className="text-[10px] text-slate-500 font-medium mb-1">Health Score</p>
            <p className="text-xs font-bold text-slate-900">{100 - currentScore}/100</p>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100 text-center flex flex-col justify-center">
            <p className="text-[10px] text-slate-500 font-medium mb-1">Risk Level</p>
            <p className={`text-xs font-bold ${currentScore > 70 ? 'text-red-500' : 'text-orange-500'}`}>
              {currentScore > 70 ? 'High' : 'Medium'}
            </p>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100 text-center flex flex-col justify-center">
            <p className="text-[10px] text-slate-500 font-medium mb-1">Trend</p>
            <p className={`text-xs font-bold ${riskClass} flex items-center justify-center gap-1`}>
              {driftDirection === 'increased' ? 'Declining' : 'Improving'} 
              {driftDirection === 'increased' ? <TrendingDown className="w-3 h-3"/> : <TrendingUp className="w-3 h-3"/>}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'AI Insights' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Dynamic Message */}
            <div className={`p-3 rounded-xl border ${driftDirection === 'increased' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
              <p className="text-xs font-bold flex items-center gap-2">
                {driftDirection === 'increased' ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
                Risk {driftDirection} over the last 14 days.
              </p>
            </div>

            {/* Health Timeline / Drift Graph */}
            <Card className="bg-white shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100 rounded-2xl">
              <CardContent className="p-5">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-semibold text-slate-900">AI Drift Graph</h3>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${driftDirection === 'increased' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {driftDirection === 'increased' ? 'Critical Drift' : 'Stable'}
                  </span>
                </div>
                
                {renderDynamicChart()}
              </CardContent>
            </Card>

            {/* Micro Trends */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-medium">Drift Status</p>
                  <p className={`text-xs font-bold ${latestResult.driftStatus === 'Declining' || latestResult.driftStatus === 'Critical Drift' ? 'text-red-500' : 'text-slate-600'}`}>{latestResult.driftStatus || 'Stable'}</p>
                </div>
                {latestResult.driftStatus === 'Declining' || latestResult.driftStatus === 'Critical Drift' ? <TrendingDown className="w-4 h-4 text-red-400" /> : <Minus className="w-4 h-4 text-slate-400" />}
              </div>
              <div className="bg-white p-3 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-medium">Sleep Trend</p>
                  <p className="text-xs font-bold text-slate-600">{latestResult.currentData?.sleep || 'Unknown'}</p>
                </div>
                <Minus className="w-4 h-4 text-slate-400" />
              </div>
              <div className="bg-white p-3 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-medium">Appetite Trend</p>
                  <p className="text-xs font-bold text-slate-600">{latestResult.currentData?.appetite || 'Unknown'}</p>
                </div>
                <Minus className="w-4 h-4 text-slate-400" />
              </div>
              <div className="bg-white p-3 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-medium">Action Needed</p>
                  <p className="text-[10px] font-bold text-red-500 truncate w-16">{latestResult.nextAction || 'Monitor'}</p>
                </div>
                <TrendingDown className="w-4 h-4 text-red-400" />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button className="flex-1 h-12 text-sm font-semibold shadow-lg shadow-primary/30 rounded-xl" onClick={() => navigate(`/patients/${id}/screen`)}>
            Start Full Screening
          </Button>
        </div>
      </div>
    </div>
  );
}
