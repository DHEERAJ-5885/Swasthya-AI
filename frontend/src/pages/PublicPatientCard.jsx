import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, HeartPulse, MapPin, ShieldAlert, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api';

export default function PublicPatientCard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');

    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }

    const fetchPatient = async () => {
      try {
        const res = await api.get(`/public/patient/${id}`);
        setPatientData(res.data);
      } catch (err) {
        console.error('Failed to fetch public patient data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [location.search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="font-semibold text-slate-700">Loading Patient Health Card...</p>
      </div>
    );
  }

  const healthScore = patientData?.healthScore;
  const scoreLabel = healthScore === null ? t('publicCard.na', 'N/A') : `${healthScore}/100`;
  const riskLevel = patientData?.riskLevel || t('publicCard.unknown', 'Unknown');
  const isVerified = patientData?.isVerified || false;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-white shadow-sm border border-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-sm font-bold text-slate-900">{t('publicCard.title', 'Patient Health Card')}</h1>
          <div className="w-9" />
        </div>

        {error || !patientData ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
            <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="font-semibold text-slate-900">{t('publicCard.invalidQr', 'Invalid or Expired QR Code')}</p>
            <p className="text-sm text-slate-500 mt-1">{t('publicCard.invalidQrDesc', 'This QR code does not match any patient record.')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <HeartPulse className="w-24 h-24" />
              </div>
              <div className="relative z-10 flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
                  <HeartPulse className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-white/80 text-xs font-medium uppercase tracking-wide">Patient</p>
                  <h2 className="text-2xl font-bold">{patientData.name || t('publicCard.unknownPatient', 'Unknown Patient')}</h2>
                  <p className="text-white/90 text-sm mt-0.5">{patientData.age} Years</p>
                </div>
              </div>
              <div className="relative z-10 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/10 rounded-2xl p-3">
                  <p className="text-white/70 text-[10px] uppercase font-bold mb-1">Family ID</p>
                  <p className="font-semibold break-words">{patientData.familyId || t('publicCard.na', 'N/A')}</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-3">
                  <p className="text-white/70 text-[10px] uppercase font-bold mb-1">Village</p>
                  <p className="font-semibold break-words">{patientData.village || t('publicCard.na', 'N/A')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t('publicCard.healthScore', 'Health Score')}</p>
                  <p className="text-3xl font-black text-slate-900">{scoreLabel}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t('publicCard.riskLevel', 'Risk Level')}</p>
                  <p className={`text-lg font-black ${
                    riskLevel === 'High Risk' ? 'text-red-500' :
                    riskLevel === 'Medium Risk' ? 'text-orange-500' :
                    'text-emerald-500'
                  }`}>
                    {riskLevel}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mt-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Assigned ASHA Worker</p>
                <p className="font-bold text-slate-800">{patientData.workerName}</p>
              </div>

              <div className={`rounded-xl p-4 flex items-start gap-3 ${isVerified ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-slate-100'}`}>
                {isVerified ? (
                  <CheckCircle2 className="w-5 h-5 mt-0.5 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 mt-0.5 text-slate-400 shrink-0" />
                )}
                <div>
                  <p className={`font-semibold ${isVerified ? 'text-emerald-800' : 'text-slate-700'}`}>
                    {isVerified ? 'Blockchain Verified' : 'Unverified Record'}
                  </p>
                  <p className={`text-xs mt-1 leading-snug ${isVerified ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {isVerified 
                      ? 'The latest screening data has been securely verified and anchored on the Cardano blockchain.' 
                      : 'This patient record has not yet been synced and verified on the blockchain.'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center text-xs text-slate-400 font-medium">
              Live Data • Powered by Swasthya AI
            </div>
          </div>
        )}
      </div>
    </div>
  );
}