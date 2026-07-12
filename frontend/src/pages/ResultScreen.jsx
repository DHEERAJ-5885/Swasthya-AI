
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Activity, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BlockchainVerificationCard from '../components/BlockchainVerificationCard';

export default function ResultScreen() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result || null;
  const verification = location.state?.verification || null;
  const screeningId = location.state?.screeningId || null;

  if (!result) {
    return (
      <div className="flex-1 w-full bg-slate-50 flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-3">{t('result.noResult')}</p>
          <Button className="h-10 text-xs font-semibold rounded-xl" onClick={() => navigate(`/patients/${id}`)}>
            {t('result.backToPatient')}
          </Button>
        </div>
      </div>
    );
  }

  const risk = result.riskLevel?.toUpperCase() || 'UNKNOWN';
  const isHighRisk = risk === 'HIGH RISK' || risk === 'CRITICAL';
  const riskColor = risk === 'CRITICAL' ? 'bg-[#991B1B]' : (risk === 'HIGH RISK' ? 'bg-[#EF4444]' : (risk === 'MEDIUM RISK' ? 'bg-[#F59E0B]' : 'bg-[#22C55E]'));
  const lightColor = risk === 'CRITICAL' ? 'bg-red-100 text-red-800' : (isHighRisk ? 'bg-red-50 text-red-600' : (risk === 'MEDIUM RISK' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'));

  const getTrendIcon = () => {
    if (result.trend === 'Critical Drift' || result.trend === 'Declining') return <TrendingDown className="w-5 h-5 text-red-500" />;
    if (result.trend === 'Improving') return <TrendingUp className="w-5 h-5 text-green-500" />;
    return <Activity className="w-5 h-5 text-blue-500" />;
  };

  const getTrendColor = () => {
    if (result.trend === 'Critical Drift') return 'bg-red-100 text-red-700 border-red-200';
    if (result.trend === 'Declining') return 'bg-orange-100 text-orange-700 border-orange-200';
    if (result.trend === 'Improving') return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-slate-50 pb-20">
      <div className="px-6 py-5 sticky top-0 bg-slate-50 z-10 text-center">
        <h1 className="text-base font-bold text-slate-900">{t('result.title')}</h1>
      </div>

      <div className="px-6 pt-2 space-y-5 max-w-7xl mx-auto w-full">
        {/* Risk Level & Confidence Headers */}
        <div className="flex justify-between items-end gap-3 bg-white p-4 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)]">
          <div className="flex-1 text-center">
            <h2 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">{t('result.riskLevel')}</h2>
            <div className={`${riskColor} text-white font-black text-xl py-2 rounded-xl shadow-sm`}>
              {result.riskLevel.toUpperCase()}
            </div>
          </div>
          <div className="w-[1px] h-12 bg-slate-100"></div>
          <div className="flex-1 text-center">
            <h2 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">{t('result.aiConfidence')}</h2>
            <div className={`font-black text-xl py-2 rounded-xl ${lightColor}`}>
              {result.confidence}%
            </div>
          </div>
        </div>

        {/* Drift Analyzer */}
        {result.trend !== 'No Data' && (
          <div className="bg-white p-5 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> {t('result.driftDetector')}
              </h3>
              <div className={`px-2 py-1 rounded-md border text-[10px] font-bold flex items-center gap-1 ${getTrendColor()}`}>
                {getTrendIcon()} {result.trend.toUpperCase()}
              </div>
            </div>
            
            <p className="text-xs text-slate-600 mb-4 italic">
              "{result.explanation}"
            </p>

            {result.drift && result.drift.length > 0 && (
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{t('result.whatChanged')}</h4>
                <ul className="space-y-2">
                  {result.drift.map((item, i) => {
                    const isWorse = item.toLowerCase().includes('worsened') || item.toLowerCase().includes('decreased') || item.toLowerCase().includes('appeared');
                    return (
                      <li key={i} className="flex items-start gap-2 text-xs font-semibold">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isWorse ? 'bg-red-500' : 'bg-green-500'}`}></span>
                        <span className={isWorse ? 'text-slate-800' : 'text-slate-700'}>{item}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* AI Insight Summary */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-2 px-1">{t('result.symptomExtraction')}</h3>
          <div className="bg-white p-4 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100">
            <p className="text-slate-700 text-sm leading-relaxed">
              {result.reason}
            </p>
          </div>
        </div>

        {/* Recommended Action */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-2 px-1">{t('result.nextAction')}</h3>
          <div className={`${lightColor} p-4 rounded-2xl flex items-start gap-3 border ${isHighRisk ? 'border-red-200' : 'border-orange-200'}`}>
            <div className={`${isHighRisk ? 'bg-red-100 text-red-600' : 'bg-white/50 text-orange-600'} p-2 rounded-xl shrink-0`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold whitespace-pre-line leading-relaxed capitalize">
              {result.followUpRecommendation || result.nextAction}
            </p>
          </div>
        </div>

        {/* Blockchain Verification */}
        {verification && screeningId && (
          <div className="pt-2">
            <h3 className="text-sm font-bold text-slate-900 mb-2 px-1">Blockchain Record</h3>
            <BlockchainVerificationCard 
              initialVerification={verification} 
              screeningId={screeningId} 
            />
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-4 space-y-3">
          <Button 
            className="w-full h-12 text-sm font-semibold shadow-lg shadow-primary/30 rounded-xl"
            onClick={() => navigate(`/patients/${id}/schedule-follow-up`)}
          >
            {t('result.scheduleFollowUp')}
          </Button>
          <Button 
            variant="secondary" 
            className="w-full h-12 text-sm font-semibold rounded-xl"
            onClick={() => navigate('/')}
          >
            {t('result.doneAndSave')}
          </Button>
        </div>
      </div>
    </div>
  );
}
