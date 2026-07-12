
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, HeartPulse, MapPin, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function safeParsePayload(search) {
  const params = new URLSearchParams(search);
  const data = params.get('data');
  if (!data) return null;

  try {
    return JSON.parse(decodeURIComponent(data));
  } catch {
    return null;
  }
}

export default function PublicPatientCard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const payload = safeParsePayload(location.search);

  const healthScore = typeof payload?.healthScore === 'number' ? payload.healthScore : null;
  const scoreLabel = healthScore === null ? t('publicCard.na') : `${healthScore}/100`;
  const riskLevel = payload?.riskLevel || t('publicCard.unknown');

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-white shadow-sm border border-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-sm font-bold text-slate-900">{t('publicCard.title')}</h1>
          <div className="w-9" />
        </div>

        {!payload ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
            <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="font-semibold text-slate-900">{t('publicCard.invalidQr')}</p>
            <p className="text-sm text-slate-500 mt-1">{t('publicCard.invalidQrDesc')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-3xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
                  <HeartPulse className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-white/80 text-xs font-medium">{t('publicCard.scannedFromQr')}</p>
                  <h2 className="text-2xl font-bold">{payload.name || t('publicCard.unknownPatient')}</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/10 rounded-2xl p-3">
                  <p className="text-white/70 text-[10px] uppercase font-bold mb-1">{t('publicCard.familyId')}</p>
                  <p className="font-semibold break-words">{payload.familyId || t('publicCard.na')}</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-3">
                  <p className="text-white/70 text-[10px] uppercase font-bold mb-1">{t('publicCard.village')}</p>
                  <p className="font-semibold break-words">{payload.village || t('publicCard.na')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t('publicCard.healthScore')}</p>
                  <p className="text-3xl font-black text-slate-900">{scoreLabel}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t('publicCard.riskLevel')}</p>
                  <p className="text-lg font-black text-primary">{riskLevel}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-start gap-2 text-sm text-slate-700">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary" />
                  <div>
                    <p className="font-semibold">{t('publicCard.verifiedFromQr')}</p>
                    <p className="text-slate-500 text-xs mt-1">{t('publicCard.verifiedFromQrDesc')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
              {t('publicCard.scanTime')}: {payload.scannedAt ? new Date(payload.scannedAt).toLocaleString() : t('publicCard.na')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}