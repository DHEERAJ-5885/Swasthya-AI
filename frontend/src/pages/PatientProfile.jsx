import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Loader2, QrCode, AlertTriangle } from 'lucide-react';
import QRCodeModal from '../components/QRCodeModal';
import VerificationHistoryModal from '../components/VerificationHistoryModal';
import toast from 'react-hot-toast';
import api from '../api';
import MobileHeader from '../components/MobileHeader';
import { useTranslation } from 'react-i18next';
import { getCachedPatientById } from '../utils/offlineStore';

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [patient, setPatient] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [familyData, setFamilyData] = useState(null);
  const [activeTab, setActiveTab] = useState('AI Insights');
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [deletingPatient, setDeletingPatient] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patient data
        let patientData = null;
        try {
          if (!navigator.onLine) throw new Error('Offline');
          const patientRes = await api.get(`/patients/${id}`);
          patientData = patientRes.data;
        } catch (err) {
          if (err.message !== 'Offline') console.error('Failed to fetch patient data', err);
          patientData = await getCachedPatientById(id);
        }

        if (!patientData) {
          toast.error(t('profile.failedToLoadData') || 'Failed to load offline data');
          navigate('/patients');
          return;
        }
        
        setPatient(patientData);

        // Fetch historical screenings for the timeline
        try {
          if (!navigator.onLine) throw new Error('Offline');
          const screeningsRes = await api.get(`/analyze/${id}`);
          setScreenings(screeningsRes.data);
        } catch (err) {
          if (err.message !== 'Offline') console.error('Failed to fetch screenings', err);
          setScreenings([]);
        }

        try {
          if (!navigator.onLine) throw new Error('Offline');
          const followUpsRes = await api.get(`/followups/patient/${id}`);
          setFollowUps(followUpsRes.data);
        } catch (err) {
          console.error('Failed to fetch follow-ups', err);
          setFollowUps([]);
        }

        try {
          if (!navigator.onLine) throw new Error('Offline');
          const emergencyRes = await api.get(`/emergency/patient/${id}`);
          setEmergencies(emergencyRes.data);
        } catch (err) {
          console.error('Failed to fetch emergencies', err);
          setEmergencies([]);
        }

        if (patientData.familyId) {
          try {
            if (!navigator.onLine) throw new Error('Offline');
            const familyRes = await api.get(`/family/${patientData.familyId}`);
            setFamilyData(familyRes.data);
          } catch (err) {
            console.error('Failed to fetch family data', err);
            setFamilyData(null);
          }
        }
      } catch (err) {
        console.error('Unhandled profile error', err);
        toast.error(t('profile.failedToLoadData'));
        navigate('/patients');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, t]);

  if (loading) {
    return (
      <div className="flex-1 bg-slate-50 w-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-slate-50 pb-20">
        <div className="px-6 py-5 flex items-center justify-between sticky top-0 bg-slate-50 z-20 border-b border-slate-100">
          <button onClick={() => navigate('/patients')} className="text-slate-800">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 text-center text-slate-500">
          <p>{t('profile.notFound')}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'History', label: t('profile.tabs.history') },
    { id: 'AI Insights', label: t('profile.tabs.insights') },
    { id: 'Family Health', label: t('profile.tabs.family') },
    { id: 'Reports', label: t('profile.tabs.reports') },
    { id: 'Observations', label: t('profile.tabs.observations') }
  ];

  const screeningPoints = screenings.map((s) => ({
    date: new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    risk: s.result?.riskLevel || t('profile.unknown'),
    score: s.result?.riskScore || 0,
    drift: s.result?.trendDirection || s.result?.trend || t('profile.stable'),
    result: s.result || {}
  }));

  // Calculate dynamic drift message based on actual historical screenings
  const currentScore = screeningPoints[screeningPoints.length - 1]?.score || 0;
  const previousScore = screeningPoints[screeningPoints.length - 2]?.score || 0;
  
  // Use AI drift direction if available, otherwise fallback to risk score math
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
    const confirmed = window.confirm(t('profile.confirmDelete', { name: patient.name }));
    if (!confirmed) return;

    setDeletingPatient(true);
    try {
      await api.delete(`/patients/${id}`);
      toast.success(t('profile.patientDeleted'));
      navigate('/patients');
    } catch (err) {
      toast.error(err.response?.data?.error || t('profile.deleteFailed'));
    } finally {
      setDeletingPatient(false);
    }
  };

  const handleUpdateEmergencyStatus = async (emergencyId, newStatus) => {
    try {
      await api.put(`/emergency/${emergencyId}/status`, { status: newStatus });
      toast.success(`Emergency marked as ${newStatus}`);
      // Refresh emergencies
      const res = await api.get(`/emergency/patient/${id}`);
      setEmergencies(res.data);
    } catch (err) {
      toast.error('Failed to update emergency status');
    }
  };

  const renderDynamicChart = () => {
    if (!screeningPoints || screeningPoints.length === 0) return <div className="text-center text-xs text-slate-400 py-10">{t('profile.noDataAvailable')}</div>;
    
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
    <div className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-slate-50 pb-20">
      <MobileHeader 
        title={t('profile.profile')} 
        actions={
          <button onClick={() => setShowQRModal(true)} className="text-slate-800 hover:bg-slate-100 p-2 rounded-full transition-colors active:scale-95">
            <QrCode className="w-5 h-5" />
          </button>
        }
      />
      {/* QR Code Modal */}
      <QRCodeModal patient={patient} isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
      
      {/* Verification History Modal */}
      <VerificationHistoryModal 
        isOpen={showVerificationModal} 
        onClose={() => setShowVerificationModal(false)}
        patient={patient}
        screenings={screenings}
      />
      
      {/* Top App Bar (Desktop Only) */}
      <div className="hidden md:flex px-6 py-4 items-center justify-between sticky top-0 bg-slate-50 z-20">
        <button onClick={() => navigate('/patients')} className="text-slate-800">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button onClick={() => setShowQRModal(true)} className="text-slate-800 hover:bg-slate-100 p-2 rounded-lg transition-colors">
          <QrCode className="w-6 h-6" />
        </button>
      </div>

      <div className="px-6 space-y-4 max-w-7xl mx-auto w-full">
        {emergencies.filter(e => e.status === 'Active' || e.status === 'Under Observation').map(emergency => (
          <div key={emergency._id} className="bg-red-50 border border-red-200 p-4 rounded-2xl flex flex-col gap-3 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-red-900 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" /> 
                  Active Emergency: {emergency.emergencyType}
                </h3>
                <p className="text-red-700 text-sm mt-1">Called: {emergency.emergencyContactCalled} ({emergency.emergencyNumber})</p>
                <p className="text-red-600/80 text-xs mt-1">Logged on {new Date(emergency.createdAt).toLocaleString()}</p>
              </div>
              <div className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-md">
                {emergency.status}
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleUpdateEmergencyStatus(emergency._id, 'Resolved')}
                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs py-2 px-3 rounded-lg transition-colors"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        ))}
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
            <p className="text-xs text-slate-500 font-medium mb-1">{patient.age} {t('patients.years')}, {patient.gender === 'Female' ? t('patients.female') : patient.gender || t('patients.female')}</p>
            <p className="text-[10px] text-slate-400">{t('profile.village')}: {patient.village} • {t('profile.id')}: {patient.healthId || 'SWA-8392'}</p>
          </div>
        </div>

        {/* Dynamic 3 Pill Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100 text-center flex flex-col justify-center">
            <p className="text-[10px] text-slate-500 font-medium mb-1">{t('profile.healthScore')}</p>
            <p className="text-xs font-bold text-slate-900">{100 - currentScore}/100</p>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100 text-center flex flex-col justify-center">
            <p className="text-[10px] text-slate-500 font-medium mb-1">{t('profile.riskLevel')}</p>
            <p className={`text-xs font-bold ${latestResult.riskLevel === 'High Risk' ? 'text-red-500' : (latestResult.riskLevel === 'Low Risk' ? 'text-green-500' : 'text-orange-500')}`}>
              {latestResult.riskLevel === 'High Risk' ? t('patients.highRisk') : latestResult.riskLevel === 'Low Risk' ? t('patients.lowRisk') : latestResult.riskLevel === 'Medium Risk' ? t('patients.mediumRisk') : latestResult.riskLevel || t('profile.unknown')}
            </p>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100 text-center flex flex-col justify-center">
            <p className="text-[10px] text-slate-500 font-medium mb-1">{t('profile.trend')}</p>
            <p className={`text-xs font-bold ${riskClass} flex items-center justify-center gap-1`}>
              {driftDirection === 'increased' ? t('profile.declining') : t('profile.improving')} 
              {driftDirection === 'increased' ? <TrendingDown className="w-3 h-3"/> : <TrendingUp className="w-3 h-3"/>}
            </p>
          </div>
        </div>

        {/* Blockchain Verification Summary Card */}
        <div className="bg-white p-5 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="text-lg">🟣</span> Blockchain Verification
            </h3>
          </div>
          
          {(() => {
            const verified = screenings.filter(s => s.verification && s.verification.txHash);
            if (verified.length === 0) {
              return (
                <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">No blockchain verified healthcare records available.<br/><br/>Complete a screening to generate the first blockchain verification.</p>
                </div>
              );
            }
            
            const latest = verified[verified.length - 1];
            const shortHash = latest.verification.txHash ? `${latest.verification.txHash.substring(0,8)}...${latest.verification.txHash.substring(latest.verification.txHash.length - 7)}` : '';
            
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Status</p>
                    <p className="text-xs font-bold text-green-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span> Verified
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Network</p>
                    <p className="text-xs font-bold text-slate-900">Cardano {latest.verification.blockchainNetwork}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Verified Records</p>
                    <p className="text-xs font-bold text-slate-900">{verified.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Integrity</p>
                    <p className="text-xs font-bold text-primary">Tamper-Proof</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Latest Verification</p>
                    <p className="text-xs font-bold text-slate-900">{new Date(latest.verification.anchoredAt || latest.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Latest Transaction</p>
                    <p className="text-xs font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100 w-max">{shortHash}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowVerificationModal(true)}
                  className="w-full mt-2 py-2.5 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 text-xs font-bold rounded-xl transition-colors"
                >
                  View Verification History
                </button>
              </div>
            );
          })()}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'History' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {screenings.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-8">{t('profile.noHistory')}</div>
            ) : (
              screenings.slice().reverse().map((s) => (
                <Card key={s._id} className="bg-white border border-slate-100 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{new Date(s.createdAt).toLocaleDateString()}</p>
                        <p className="text-[10px] text-slate-500">{t('patients.risk')}: {s.result?.riskLevel || t('profile.unknown')}</p>
                        {s.verification && s.verification.txHash && (
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="text-[10px]">🟣</span>
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md">Verified by Cardano Blockchain</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-600">{s.result?.trendDirection || s.result?.trend || t('profile.stable')}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">{s.result?.reason || t('profile.noNotes')}</p>
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
                {driftDirection === 'increased' ? t('profile.riskIncreased') : t('profile.riskDecreased')}
              </p>
            </div>

            {/* Health Timeline / Drift Graph */}
            <Card className="bg-white shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100 rounded-2xl">
              <CardContent className="p-5">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-semibold text-slate-900">{t('profile.driftGraph')}</h3>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${driftDirection === 'increased' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {driftDirection === 'increased' ? t('profile.criticalDrift') : t('profile.stable')}
                  </span>
                </div>
                
                {renderDynamicChart()}
              </CardContent>
            </Card>

            {/* Micro Trends */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-medium">{t('profile.driftStatus')}</p>
                  <p className={`text-xs font-bold ${latestResult.driftStatus === 'Declining' || latestResult.driftStatus === 'Critical Drift' ? 'text-red-500' : 'text-slate-600'}`}>{latestResult.driftStatus === 'Declining' ? t('profile.declining') : latestResult.driftStatus === 'Critical Drift' ? t('profile.criticalDrift') : t('profile.stable')}</p>
                </div>
                {latestResult.driftStatus === 'Declining' || latestResult.driftStatus === 'Critical Drift' ? <TrendingDown className="w-4 h-4 text-red-400" /> : <Minus className="w-4 h-4 text-slate-400" />}
              </div>
              <div className="bg-white p-3 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-medium">{t('profile.sleepTrend')}</p>
                  <p className="text-xs font-bold text-slate-600">{latestResult.currentData?.sleep || t('profile.unknown')}</p>
                </div>
                <Minus className="w-4 h-4 text-slate-400" />
              </div>
              <div className="bg-white p-3 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-medium">{t('profile.appetiteTrend')}</p>
                  <p className="text-xs font-bold text-slate-600">{latestResult.currentData?.appetite || t('profile.unknown')}</p>
                </div>
                <Minus className="w-4 h-4 text-slate-400" />
              </div>
              <div className="bg-white p-3 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-medium">{t('profile.actionNeeded')}</p>
                  <p className="text-[10px] font-bold text-red-500 truncate w-16">{latestResult.nextAction || t('profile.monitor')}</p>
                </div>
                <TrendingDown className="w-4 h-4 text-red-400" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Family Health' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {!familyData ? (
              <div className="text-center text-xs text-slate-500 py-8">{t('profile.noFamilyData')}</div>
            ) : (
              <Card className="bg-white border border-slate-100 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)]">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900">{t('profile.familyId')}</p>
                    <p className="text-xs font-semibold text-slate-600">{familyData.familyId}</p>
                  </div>
                  <p className="text-[10px] text-slate-500">{familyData.insight}</p>
                  <div className="space-y-2">
                    {familyData.members?.map((member) => (
                      <div key={member._id} className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-700 font-semibold">{member.name}</span>
                        <span className="text-slate-500">{member.latestScreening?.riskLevel === 'High Risk' ? t('patients.highRisk') : member.latestScreening?.riskLevel === 'Medium Risk' ? t('patients.mediumRisk') : member.latestScreening?.riskLevel === 'Low Risk' ? t('patients.lowRisk') : `${member.latestScreening?.riskLevel || t('profile.unknown')} ${t('patients.risk')}`}</span>
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
                <p className="text-xs font-bold text-slate-900 mb-1">{t('profile.screenings')}</p>
                <p className="text-[10px] text-slate-500">{t('profile.totalScreenings')}: {screenings.length}</p>
                {screenings.length > 0 && (
                  <p className="text-[10px] text-slate-500">{t('profile.lastScreening')}: {new Date(screenings[screenings.length - 1].createdAt).toLocaleDateString()}</p>
                )}
              </CardContent>
            </Card>
            <Card className="bg-white border border-slate-100 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-900">{t('profile.followups')}</p>
                  <Button onClick={() => navigate(`/patients/${id}/schedule-follow-up`)} variant="outline" className="h-6 text-[10px] px-2 py-0 border-primary text-primary">{t('profile.schedule')}</Button>
                </div>
                {followUps.length === 0 ? (
                  <p className="text-[10px] text-slate-500">{t('profile.noFollowups')}</p>
                ) : (
                  followUps.slice(0, 5).map((f) => (
                    <div key={f._id} className="flex flex-col gap-1 text-[10px] text-slate-600 mb-2 pb-2 border-b border-slate-50 last:border-0 last:pb-0 last:mb-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{new Date(f.date).toLocaleDateString()} {f.time && `at ${f.time}`}</span>
                        <span className={`px-2 py-0.5 rounded-md font-bold ${f.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : f.status === 'Missed' ? 'bg-slate-100 text-slate-500' : 'bg-orange-50 text-orange-600'}`}>{f.status}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="truncate pr-2">{f.reason || f.notes || t('profile.routineFollowUp')}</span>
                        <span className={`shrink-0 font-bold ${f.riskLevel === 'High Risk' || f.riskLevel === 'Critical' ? 'text-red-500' : 'text-slate-400'}`}>{f.riskLevel}</span>
                      </div>
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
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">{t('profile.addObservation')}</label>
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full h-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
                  placeholder={t('profile.addFieldNote')}
                />
                <Button
                  onClick={async () => {
                    if (!noteInput.trim()) return;
                    setSavingNote(true);
                    try {
                      const res = await api.post(`/patients/${id}/observations`, { note: noteInput });
                      setPatient((prev) => ({ ...prev, observations: res.data }));
                      setNoteInput('');
                      toast.success(t('profile.observationSaved'));
                    } catch (err) {
                      toast.error(err.response?.data?.error || t('profile.observationFailed'));
                    } finally {
                      setSavingNote(false);
                    }
                  }}
                  className="h-10 text-xs font-semibold rounded-xl"
                  disabled={savingNote}
                >
                  {savingNote ? t('profile.saving') : t('profile.saveObservation')}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {(patient.observations || []).length === 0 ? (
                <div className="text-center text-xs text-slate-500 py-6">{t('profile.noObservations')}</div>
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
        <div className="flex flex-col gap-3 mt-6">
          <div className="flex gap-3">
            <Button className="flex-1 h-12 text-sm font-semibold shadow-lg shadow-primary/30 rounded-xl" onClick={() => navigate(`/patients/${id}/screen`)}>
              {t('profile.startScreening')}
            </Button>
            <Button className="flex-1 h-12 text-sm font-semibold bg-white text-primary border border-primary shadow-sm rounded-xl hover:bg-primary/5" onClick={() => navigate(`/patients/${id}/schedule-follow-up`)}>
              {t('profile.scheduleFollowUp')}
            </Button>
          </div>
          <Button
            variant="danger"
            className="h-12 px-5 text-sm font-semibold rounded-xl"
            onClick={handleDeletePatient}
            disabled={deletingPatient}
          >
            {deletingPatient ? t('profile.deleting') : t('profile.deletePatient')}
          </Button>
        </div>
      </div>
    </div>
  );
}
