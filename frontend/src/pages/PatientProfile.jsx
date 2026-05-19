import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, MoreVertical, TrendingUp, TrendingDown, Minus, Loader2, QrCode } from 'lucide-react';
import QRCodeModal from '../components/QRCodeModal';
import toast from 'react-hot-toast';
import api from '../api';
import MobileHeader from '../components/MobileHeader';

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [familyData, setFamilyData] = useState(null);
  const [activeTab, setActiveTab] = useState('AI Insights');
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [deletingPatient, setDeletingPatient] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patient data
        const patientRes = await api.get(`/patients/${id}`);
        setPatient(patientRes.data);

        // Fetch historical screenings for the timeline
        try {
          const screeningsRes = await api.get(`/analyze/${id}`);
          setScreenings(screeningsRes.data);
        } catch (err) {
          console.error('Failed to fetch screenings', err);
          setScreenings([]);
        }

        try {
          const followUpsRes = await api.get(`/followups/patient/${id}`);
          setFollowUps(followUpsRes.data);
        } catch (err) {
          console.error('Failed to fetch follow-ups', err);
          setFollowUps([]);
        }

        if (patientRes.data.familyId) {
          try {
            const familyRes = await api.get(`/family/${patientRes.data.familyId}`);
            setFamilyData(familyRes.data);
          } catch (err) {
            console.error('Failed to fetch family data', err);
            setFamilyData(null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch patient data', err);
        toast.error('Failed to load patient data');
        navigate('/patients');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        <div className="px-6 py-5 flex items-center justify-between sticky top-0 bg-slate-50 z-20 border-b border-slate-100">
          <button onClick={() => navigate('/patients')} className="text-slate-800">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 text-center text-slate-500">
          <p>Patient not found</p>
        </div>
      </div>
    );
  }

  const tabs = ['History', 'AI Insights', 'Family Health', 'Reports', 'Observations'];

  const screeningPoints = screenings.map((s) => ({
    date: new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    risk: s.result?.riskLevel || 'Unknown',
    score: s.result?.confidence || 0,
    drift: s.result?.trendDirection || s.result?.trend || 'Stable',
    result: s.result || {}
  }));

  // Calculate dynamic drift message based on mock screenings
  const currentScore = screeningPoints[screeningPoints.length - 1]?.score || 0;
  const previousScore = screeningPoints[screeningPoints.length - 2]?.score || 0;
  
  // Use AI drift direction if available, otherwise fallback to score math
  const latestResult = screeningPoints[screeningPoints.length - 1]?.result || {};
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

  const handleDeletePatient = async () => {
    const confirmed = window.confirm(`Delete patient ${patient.name}? This action cannot be undone.`);
    if (!confirmed) return;

    setDeletingPatient(true);
    try {
      await api.delete(`/patients/${id}`);
      toast.success('Patient deleted successfully');
      navigate('/patients');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete patient');
    } finally {
      setDeletingPatient(false);
    }
  };

  const renderDynamicChart = () => {
    if (!screeningPoints || screeningPoints.length === 0) return <div className="text-center text-xs text-slate-400 py-10">No data available</div>;
    
    const maxW = 300;
    const maxH = 100;
    
    const points = screeningPoints.map((s, i) => {
      const x = screeningPoints.length === 1 ? maxW / 2 : (i / (screeningPoints.length - 1)) * maxW;
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
             if (screeningPoints.length > 4 && i % Math.ceil(screeningPoints.length / 3) !== 0 && i !== screeningPoints.length - 1) return null;
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
      <MobileHeader 
        title="Patient Profile" 
        actions={
          <button onClick={() => setShowQRModal(true)} className="text-slate-800 hover:bg-slate-100 p-2 rounded-full transition-colors active:scale-95">
            <QrCode className="w-5 h-5" />
          </button>
        }
      />
      {/* QR Code Modal */}
      <QRCodeModal patient={patient} isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
      
      {/* Top App Bar (Desktop Only) */}
      <div className="hidden md:flex px-6 py-4 items-center justify-between sticky top-0 bg-slate-50 z-20">
        <button onClick={() => navigate('/patients')} className="text-slate-800">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button onClick={() => setShowQRModal(true)} className="text-slate-800 hover:bg-slate-100 p-2 rounded-lg transition-colors">
          <QrCode className="w-6 h-6" />
        </button>
      </div>

      <div className="px-6 space-y-4">
        {/* Profile Info Header */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100">
          {patient.photoUrl ? (
            <img src={patient.photoUrl} alt="Avatar" className="w-16 h-16 rounded-full bg-slate-200 border-2 border-white shadow-sm object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-sm font-bold text-slate-700">
              {patient.name?.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          )}
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
            <p className={`text-xs font-bold ${latestResult.riskLevel === 'High' || latestResult.riskLevel === 'Critical' ? 'text-red-500' : (latestResult.riskLevel === 'Low' ? 'text-green-500' : 'text-orange-500')}`}>
              {latestResult.riskLevel || 'Unknown'}
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

        {activeTab === 'History' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {screenings.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-8">No screening history yet.</div>
            ) : (
              screenings.slice().reverse().map((s) => (
                <Card key={s._id} className="bg-white border border-slate-100 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{new Date(s.createdAt).toLocaleDateString()}</p>
                        <p className="text-[10px] text-slate-500">Risk: {s.result?.riskLevel || 'Unknown'}</p>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-600">{s.result?.trendDirection || s.result?.trend || 'Stable'}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">{s.result?.reason || 'No notes available.'}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

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

        {activeTab === 'Family Health' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {!familyData ? (
              <div className="text-center text-xs text-slate-500 py-8">No family data available.</div>
            ) : (
              <Card className="bg-white border border-slate-100 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)]">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900">Family ID</p>
                    <p className="text-xs font-semibold text-slate-600">{familyData.familyId}</p>
                  </div>
                  <p className="text-[10px] text-slate-500">{familyData.insight}</p>
                  <div className="space-y-2">
                    {familyData.members?.map((member) => (
                      <div key={member._id} className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-700 font-semibold">{member.name}</span>
                        <span className="text-slate-500">{member.latestScreening?.riskLevel || 'Unknown'} Risk</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'Reports' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="bg-white border border-slate-100 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)]">
              <CardContent className="p-4">
                <p className="text-xs font-bold text-slate-900 mb-1">Screenings</p>
                <p className="text-[10px] text-slate-500">Total screenings: {screenings.length}</p>
                {screenings.length > 0 && (
                  <p className="text-[10px] text-slate-500">Last screening: {new Date(screenings[screenings.length - 1].createdAt).toLocaleDateString()}</p>
                )}
              </CardContent>
            </Card>
            <Card className="bg-white border border-slate-100 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)]">
              <CardContent className="p-4">
                <p className="text-xs font-bold text-slate-900 mb-2">Follow-ups</p>
                {followUps.length === 0 ? (
                  <p className="text-[10px] text-slate-500">No follow-ups recorded.</p>
                ) : (
                  followUps.slice(0, 5).map((f) => (
                    <div key={f._id} className="flex items-center justify-between text-[10px] text-slate-600 mb-1">
                      <span>{new Date(f.date).toLocaleDateString()}</span>
                      <span>{f.status}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'Observations' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="bg-white border border-slate-100 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)]">
              <CardContent className="p-4 space-y-3">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Add Observation</label>
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full h-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
                  placeholder="Add a field note..."
                />
                <Button
                  onClick={async () => {
                    if (!noteInput.trim()) return;
                    setSavingNote(true);
                    try {
                      const res = await api.post(`/patients/${id}/observations`, { note: noteInput });
                      setPatient((prev) => ({ ...prev, observations: res.data }));
                      setNoteInput('');
                      toast.success('Observation saved');
                    } catch (err) {
                      toast.error(err.response?.data?.error || 'Failed to save observation');
                    } finally {
                      setSavingNote(false);
                    }
                  }}
                  className="h-10 text-xs font-semibold rounded-xl"
                  disabled={savingNote}
                >
                  {savingNote ? 'Saving...' : 'Save Observation'}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {(patient.observations || []).length === 0 ? (
                <div className="text-center text-xs text-slate-500 py-6">No observations yet.</div>
              ) : (
                patient.observations.slice().reverse().map((o, index) => (
                  <Card key={`${o.createdAt}-${index}`} className="bg-white border border-slate-100 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)]">
                    <CardContent className="p-4">
                      <p className="text-[10px] text-slate-500 mb-1">{new Date(o.createdAt).toLocaleString()}</p>
                      <p className="text-xs text-slate-800">{o.note}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button className="flex-1 h-12 text-sm font-semibold shadow-lg shadow-primary/30 rounded-xl" onClick={() => navigate(`/patients/${id}/screen`)}>
            Start Full Screening
          </Button>
          <Button
            variant="danger"
            className="h-12 px-5 text-sm font-semibold rounded-xl"
            onClick={handleDeletePatient}
            disabled={deletingPatient}
          >
            {deletingPatient ? 'Deleting...' : 'Delete Patient'}
          </Button>
        </div>
      </div>
    </div>
  );
}
