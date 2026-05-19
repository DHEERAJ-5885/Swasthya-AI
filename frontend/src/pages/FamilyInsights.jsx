import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import api from '../api';
import MobileHeader from '../components/MobileHeader';

export default function FamilyInsights() {
  const navigate = useNavigate();
  const [familyData, setFamilyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [familyIds, setFamilyIds] = useState([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState('');

  useEffect(() => {
    const loadFamilies = async () => {
      try {
        const res = await api.get('/patients');
        const ids = Array.from(new Set(res.data.map(p => p.familyId).filter(Boolean)));
        setFamilyIds(ids);
        if (ids.length > 0) {
          setSelectedFamilyId(ids[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadFamilies();
  }, []);

  useEffect(() => {
    const fetchFamily = async () => {
      if (!selectedFamilyId) {
        setFamilyData(null);
        return;
      }
      try {
        const res = await api.get(`/family/${selectedFamilyId}`);
        setFamilyData(res.data);
      } catch (err) {
        console.error(err);
        setFamilyData(null);
      }
    };

    fetchFamily();
  }, [selectedFamilyId]);

  const riskColors = {
    High: 'text-red-500',
    Medium: 'text-orange-500',
    Low: 'text-green-500'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Fallback to empty state if no family data or members
  if (!familyData || !familyData.members || familyData.members.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        <MobileHeader title="Family Intelligence" />
        <div className="hidden md:flex px-6 py-5 items-center sticky top-0 bg-slate-50 z-10 border-b border-slate-100">
          <button onClick={() => navigate(-1)} className="text-slate-800 absolute left-6"><ArrowLeft className="w-6 h-6" /></button>
          <h1 className="text-sm font-bold text-slate-900 mx-auto">Family Intelligence</h1>
        </div>
        <div className="p-6 text-center text-slate-500 mt-20">
          No family members found. Add patients with a Family ID to see insights.
        </div>
      </div>
    );
  }

  const isHighRisk = familyData.riskLevel === 'High';
  const isMediumRisk = familyData.riskLevel === 'Medium';
  const bannerBg = isHighRisk ? 'bg-red-50 border-red-100' : (isMediumRisk ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100');
  const bannerTitle = isHighRisk ? 'text-red-800' : (isMediumRisk ? 'text-orange-800' : 'text-green-800');
  const bannerText = isHighRisk ? 'text-red-700' : (isMediumRisk ? 'text-orange-700' : 'text-green-700');
  const bannerLine = isHighRisk ? 'bg-red-200' : (isMediumRisk ? 'bg-orange-200' : 'bg-green-200');

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <MobileHeader title="Family Intelligence" />
      <div className="hidden md:flex px-6 py-5 items-center justify-between sticky top-0 bg-slate-50 z-10 border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="text-slate-800">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-bold text-slate-900 absolute left-1/2 -translate-x-1/2">Family Intelligence</h1>
        <div className="w-6"></div>
      </div>

      <div className="px-6 pt-6 space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Family ID</label>
          <select
            value={selectedFamilyId}
            onChange={(e) => setSelectedFamilyId(e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800"
          >
            {familyIds.map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </div>
        {/* Insight Banner */}
        <div className={`${bannerBg} border rounded-2xl p-4 flex gap-4 items-center shadow-sm`}>
          <div>
            <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${bannerTitle}`}>Family Insight</h3>
            <p className={`text-lg font-black leading-none ${bannerText}`}>{familyData.riskLevel}</p>
          </div>
          <div className={`w-px h-10 ${bannerLine}`}></div>
          <p className={`text-xs font-semibold leading-relaxed flex-1 ${bannerText}`}>
            {familyData.insight}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-3 px-1">Family Members</h2>
          <div className="space-y-3">
            {familyData.members.map(member => {
              const risk = member.latestScreening?.riskLevel || 'Low';
              return (
                <div 
                  key={member._id} 
                  className="bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center justify-between cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => navigate(`/patients/${member._id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-slate-700">
                      {member.name?.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{member.name}</h3>
                      <p className="text-[10px] text-slate-500 font-medium">{member.age} Y, {member.gender}</p>
                    </div>
                  </div>
                  
                  <p className={`text-[10px] font-bold ${riskColors[risk]}`}>{risk} Risk</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
