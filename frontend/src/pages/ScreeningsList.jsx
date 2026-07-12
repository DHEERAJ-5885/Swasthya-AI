import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Loader2, ArrowRight, Activity, Calendar } from 'lucide-react';
import api from '../api';
import MobileHeader from '../components/MobileHeader';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next';

export default function ScreeningsList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/screenings/all')
      .then(res => {
        setScreenings(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch screenings', err);
        setError(t('screeningsList.errLoad'));
        setLoading(false);
      });
  }, [t]);

  if (loading) {
    return (
      <div className="flex-1 w-full bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden w-full pb-24 bg-[#F8FAFC]">
      <MobileHeader title={t('screeningsList.recentScreenings')} />
      
      <div className="hidden md:flex px-8 py-6 bg-white border-b border-slate-100 sticky top-0 z-30 justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('screeningsList.recentScreenings')}</h1>
        <Button onClick={() => navigate('/patients')} className="h-10 px-6 rounded-xl font-bold shadow-md shadow-primary/20">
          <Stethoscope className="w-4 h-4 mr-2" /> {t('screeningsList.startNew')}
        </Button>
      </div>

      <div className="p-4 md:p-6 w-full max-w-7xl mx-auto space-y-4">
        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-semibold">{error}</div>
        ) : screenings.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center h-64 mt-8">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <Stethoscope className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-semibold mb-6">{t('screeningsList.noScreenings')}</p>
            <Button onClick={() => navigate('/patients')} className="h-11 px-8 rounded-xl font-bold">
              {t('screeningsList.startNew')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {screenings.map(screening => {
              const rawRisk = screening.result?.riskLevel || 'Unknown';
              const riskLevel = rawRisk === 'High Risk' ? t('screeningsList.high') :
                                rawRisk === 'Medium Risk' ? t('screeningsList.medium') :
                                rawRisk === 'Low Risk' ? t('screeningsList.low') :
                                t('screeningsList.unknown');
              const riskColors = {
                'High Risk': 'text-red-600 bg-red-50 border-red-100',
                'Medium Risk': 'text-orange-600 bg-orange-50 border-orange-100',
                'Low Risk': 'text-emerald-600 bg-emerald-50 border-emerald-100',
                'Unknown': 'text-slate-600 bg-slate-50 border-slate-200'
              };
              const colorClass = riskColors[rawRisk] || riskColors.Unknown;

              return (
                <div 
                  key={screening._id} 
                  onClick={() => navigate(`/patients/${screening.patientId?._id || screening.patientId}/result`, { 
                    state: { 
                      result: screening.result,
                      screeningId: screening._id,
                      verification: screening.verification
                    } 
                  })}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 line-clamp-1">{screening.patientId?.name || t('screeningsList.unknownPatient')}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{screening.patientId?.healthId || t('screeningsList.idUnknown')} • {screening.patientId?.village || t('screeningsList.unknownVillage')}</p>
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${colorClass}`}>
                      {riskLevel}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-4 bg-slate-50 p-3 rounded-xl">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(screening.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-slate-400" />
                      {screening.result?.trendDirection === 'Stable' ? t('screening.stable') : screening.result?.trendDirection === 'Declining' ? t('profile.declining') : screening.result?.trendDirection === 'Improving' ? t('profile.improving') : screening.result?.trendDirection || t('screeningsList.assessed')}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('screeningsList.aiGenerated')}</span>
                    <button className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      {t('screeningsList.viewResult')} <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
