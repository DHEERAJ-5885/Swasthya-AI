import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { 
  ArrowLeft, BellRing, Calendar, ShieldCheck, AlertTriangle, 
  Loader2, PhoneCall, User, CheckCircle, Activity, HeartPulse, Clock 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useTranslation } from 'react-i18next';

export default function AlertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    api.get(`/alerts/${id}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        toast.error(t('alerts.errLoadDetail'));
        navigate(-1);
      });
  }, [id, navigate]);

  const handleResolve = async () => {
    setResolving(true);
    try {
      await api.put(`/alerts/${id}/resolve`);
      toast.success(t('alerts.resolvedSuccess'));
      navigate(-1);
    } catch (err) {
      toast.error(t('alerts.errResolve'));
      setResolving(false);
    }
  };

  const getIconData = (type) => {
    switch(type) {
      case 'Emergency': return { icon: AlertTriangle, bg: 'bg-red-50', color: 'text-red-600', dot: 'bg-red-500' };
      case 'Outbreak': return { icon: AlertTriangle, bg: 'bg-red-50', color: 'text-red-600', dot: 'bg-red-500' };
      case 'High Risk': return { icon: AlertTriangle, bg: 'bg-red-50', color: 'text-red-600', dot: 'bg-red-500' };
      case 'AI Drift Alert': return { icon: Activity, bg: 'bg-orange-50', color: 'text-orange-600', dot: 'bg-orange-500' };
      case 'Follow-up Due': return { icon: Calendar, bg: 'bg-orange-50', color: 'text-orange-600', dot: 'bg-orange-500' };
      case 'Missed': return { icon: Calendar, bg: 'bg-orange-50', color: 'text-orange-600', dot: 'bg-orange-500' };
      case 'Insight': return { icon: ShieldCheck, bg: 'bg-green-50', color: 'text-green-600', dot: 'bg-green-500' };
      default: return { icon: BellRing, bg: 'bg-blue-50', color: 'text-blue-600', dot: 'bg-blue-500' };
    }
  };

  if (loading) {
    return (
      <div className="flex-1 w-full bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || !data.alert) {
    return <div className="text-center mt-20">{t('alerts.alertNotFound')}</div>;
  }

  const { alert, patient, latestScreening, previousScreenings } = data;
  const { icon: Icon, bg, color, dot } = getIconData(alert.type);
  
  // Format symptoms properly
  const formatSymptom = (key, val) => {
    if (!val || val === 'No Data' || val === 'N/A') return null;
    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    return { key: formattedKey, val };
  };

  const getSymptomsList = () => {
    if (!latestScreening || !latestScreening.data) return [];
    const sd = latestScreening.data;
    const items = [
      formatSymptom(t('alerts.symptoms.fever'), sd.fever),
      formatSymptom(t('alerts.symptoms.oxygen'), sd.oxygen),
      formatSymptom(t('alerts.symptoms.fatigue'), sd.fatigue),
      formatSymptom(t('alerts.symptoms.bp'), sd.bp),
      formatSymptom(t('alerts.symptoms.sleep'), sd.sleep),
      formatSymptom(t('alerts.symptoms.appetite'), sd.appetite),
      formatSymptom(t('alerts.symptoms.stress'), sd.stress)
    ].filter(Boolean);
    return items;
  };

  const symptoms = getSymptomsList();

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-[#F8FAFC] pb-24">
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between sticky top-0 bg-[#F8FAFC] z-10 border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="text-slate-800">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-bold text-slate-900 absolute left-1/2 -translate-x-1/2">{t('alerts.alertDetails')}</h1>
        <div className="w-6"></div>
      </div>

      <div className="px-6 pt-6 space-y-6 w-full max-w-7xl mx-auto">
        
        {/* Main Alert Card */}
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight mb-1">{alert.title}</h2>
            <p className="text-sm text-slate-500 mb-2">{alert.message}</p>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${bg} ${color}`}>{alert.type}</span>
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(alert.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Patient Card */}
        {patient && (
          <Card className="p-4 border-slate-100 shadow-sm overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-2 h-full ${patient.risk === 'High Risk' ? 'bg-red-500' : patient.risk === 'Medium Risk' ? 'bg-orange-500' : 'bg-green-500'}`}></div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">{t('alerts.patientInfo')}</p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                {patient.photoUrl ? (
                  <img src={patient.photoUrl} alt={patient.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">{patient.name}</h3>
                <p className="text-xs text-slate-500 mb-1">{patient.age} {t('alerts.years')} • {patient.gender}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <span>ID: {patient.familyId || t('alerts.na')}</span>
                  <span>•</span>
                  <span>{patient.village}</span>
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* AI Insight Card */}
        {latestScreening && (
          <Card className="p-4 border border-primary/20 bg-primary/5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <p className="text-xs font-bold text-primary uppercase tracking-wider">{t('alerts.aiHealthInsight')}</p>
            </div>
            <p className="text-sm font-medium text-slate-800 leading-relaxed">
              {latestScreening.result?.aiExplanation || 
               latestScreening.result?.explanation || 
               t('alerts.aiDefaultExplanation')}
            </p>
            
            <div className="mt-4 flex gap-2 flex-wrap">
              <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                <p className="text-[10px] text-slate-400 font-semibold">{t('alerts.currentRisk')}</p>
                <p className={`text-xs font-bold ${latestScreening.result?.riskLevel === 'High Risk' ? 'text-red-600' : 'text-slate-700'}`}>
                  {latestScreening.result?.riskLevel || patient?.risk || t('alerts.unknown')}
                </p>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                <p className="text-[10px] text-slate-400 font-semibold">{t('alerts.trend')}</p>
                <p className="text-xs font-bold text-slate-700">{latestScreening.result?.driftStatus || latestScreening.result?.trend || t('alerts.stable')}</p>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                <p className="text-[10px] text-slate-400 font-semibold">{t('alerts.confidence')}</p>
                <p className="text-xs font-bold text-slate-700">{latestScreening.result?.confidence || 95}%</p>
              </div>
            </div>
          </Card>
        )}

        {/* Symptoms Section */}
        {symptoms.length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-900 mb-3 ml-1">{t('alerts.reportedSymptoms')}</p>
            <div className="grid grid-cols-2 gap-2">
              {symptoms.map((s, idx) => (
                <div key={idx} className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-semibold mb-0.5">{s.key}</p>
                  <p className="text-xs font-bold text-slate-800">{s.val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Actions */}
        {latestScreening?.result?.nextAction && (
          <div>
            <p className="text-xs font-bold text-slate-900 mb-3 ml-1">{t('alerts.recommendedActions')}</p>
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-1">{latestScreening.result.nextAction}</p>
                {latestScreening.result.followUpRecommendation && (
                  <p className="text-xs text-slate-500">{latestScreening.result.followUpRecommendation}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        {previousScreenings && previousScreenings.length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-900 mb-3 ml-1">{t('alerts.timelineHistory')}</p>
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-4">
              {previousScreenings.slice(0, 3).map((sc, idx) => (
                <div key={sc._id} className="flex items-start gap-3 relative">
                  {idx !== previousScreenings.slice(0, 3).length - 1 && (
                    <div className="absolute top-6 bottom-[-16px] left-[7px] w-0.5 bg-slate-100 z-0"></div>
                  )}
                  <div className={`w-4 h-4 rounded-full mt-0.5 z-10 ring-4 ring-white ${sc.result?.riskLevel === 'High Risk' ? 'bg-red-400' : 'bg-slate-300'}`}></div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{t('alerts.screeningRisk', { level: sc.result?.riskLevel })}</p>
                    <p className="text-[10px] text-slate-500">{new Date(sc.createdAt).toLocaleDateString()} • {t('alerts.trend')}: {sc.result?.driftStatus || t('alerts.stable')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          {!alert.resolved && (
            <Button onClick={handleResolve} disabled={resolving} className="w-full flex items-center justify-center gap-2">
              {resolving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              {resolving ? t('alerts.resolving') : t('alerts.markResolved')}
            </Button>
          )}

          {patient && (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={() => navigate(`/patients/${patient._id}`)} className="w-full">
                {t('alerts.viewProfile')}
              </Button>
              <a href={`tel:${patient.phone}`} className="w-full">
                <Button variant="secondary" className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700">
                  <PhoneCall className="w-4 h-4" />
                  {t('alerts.call')}
                </Button>
              </a>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
