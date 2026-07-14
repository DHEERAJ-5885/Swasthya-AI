import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Mic, MicOff, BrainCircuit } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import MobileHeader from '../components/MobileHeader';
import { useTranslation } from 'react-i18next';
import { useNetwork } from '../hooks/useNetwork';
import { enqueueSyncTask } from '../utils/offlineStore';

const getSteps = (t) => [
  { 
    id: 1, 
    title: t('screening.steps.basicHealth'), 
    fields: [
      {name: 'fever', label: t('screening.fields.fever'), options: [t('screening.options.none'), t('screening.options.mild'), t('screening.options.high')]},
      {name: 'bp', label: t('screening.fields.bp'), options: [t('screening.options.normal'), t('screening.options.high'), t('screening.options.low')]},
      {name: 'sugar', label: t('screening.fields.sugar'), options: [t('screening.options.normal'), t('screening.options.high'), t('screening.options.low')]},
      {name: 'pulse', label: t('screening.fields.pulse'), options: [t('screening.options.normal'), t('screening.options.fast'), t('screening.options.slow')]},
      {name: 'oxygen', label: t('screening.fields.oxygen'), options: [t('screening.options.normal'), t('screening.options.low')]},
      {name: 'temperature', label: t('screening.fields.temperature'), options: [t('screening.options.normal'), t('screening.options.hot'), t('screening.options.cold')]}
    ] 
  },
  { 
    id: 2, 
    title: t('screening.steps.lifestyle'), 
    fields: [
      {name: 'sleep', label: t('screening.fields.sleep'), options: [t('screening.options.good'), t('screening.options.average'), t('screening.options.poor')]},
      {name: 'appetite', label: t('screening.fields.appetite'), options: [t('screening.options.normal'), t('screening.options.low'), t('screening.options.high')]},
      {name: 'energy', label: t('screening.fields.energy'), options: [t('screening.options.high'), t('screening.options.medium'), t('screening.options.low')]},
      {name: 'stress', label: t('screening.fields.stress'), options: [t('screening.options.low'), t('screening.options.medium'), t('screening.options.high')]},
      {name: 'waterIntake', label: t('screening.fields.waterIntake'), options: [t('screening.options.good'), t('screening.options.average'), t('screening.options.poor')]},
      {name: 'workFatigue', label: t('screening.fields.workFatigue'), options: [t('screening.options.none'), t('screening.options.some'), t('screening.options.severe')]}
    ] 
  },
  { 
    id: 3, 
    title: t('screening.steps.mentalEmotional'), 
    fields: [
      {name: 'sadness', label: t('screening.fields.sadness'), options: [t('screening.options.no'), t('screening.options.sometimes'), t('screening.options.often')]},
      {name: 'anxiety', label: t('screening.fields.anxiety'), options: [t('screening.options.no'), t('screening.options.sometimes'), t('screening.options.often')]},
      {name: 'loneliness', label: t('screening.fields.loneliness'), options: [t('screening.options.no'), t('screening.options.sometimes'), t('screening.options.often')]},
      {name: 'emotionalStress', label: t('screening.fields.emotionalStress'), options: [t('screening.options.low'), t('screening.options.medium'), t('screening.options.high')]},
      {name: 'overthinking', label: t('screening.fields.overthinking'), options: [t('screening.options.no'), t('screening.options.sometimes'), t('screening.options.often')]}
    ] 
  },
  { 
    id: 4, 
    title: t('screening.steps.passiveObservation'), 
    fields: [
      {name: 'swelling', label: t('screening.fields.swelling'), options: [t('screening.options.no'), t('screening.options.some'), t('screening.options.severe')]},
      {name: 'paleSkin', label: t('screening.fields.paleSkin'), options: [t('screening.options.no'), t('screening.options.yes')]},
      {name: 'fatigue', label: t('screening.fields.fatigue'), options: [t('screening.options.no'), t('screening.options.some'), t('screening.options.severe')]},
      {name: 'cough', label: t('screening.fields.cough'), options: [t('screening.options.no'), t('screening.options.some'), t('screening.options.severe')]},
      {name: 'weakness', label: t('screening.fields.weakness'), options: [t('screening.options.none'), t('screening.options.some'), t('screening.options.severe')]},
      {name: 'visibleDiscomfort', label: t('screening.fields.visibleDiscomfort'), options: [t('screening.options.no'), t('screening.options.yes')]}
    ] 
  },
  {
    id: 5,
    title: t('screening.steps.voiceNotes'),
    type: 'voice'
  }
];

export default function ScreeningFlow() {
  const { t } = useTranslation();
  const steps = getSteps(t);
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem(`screeningDraft:${id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.currentStep === 'number') return parsed.currentStep;
      } catch (err) {
        console.error('Failed to load draft currentStep', err);
      }
    }
    return 0;
  });
  
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem(`screeningDraft:${id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.formData) return parsed.formData;
      } catch (err) {
        console.error('Failed to load draft formData', err);
      }
    }
    return {
      sleep: 'Good', appetite: 'Normal', energy: 'Medium',
      stress: 'Low', fever: 'None', bp: 'Normal',
      voiceNotes: '',
      scanImage: ''
    };
  });
  
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const isApiSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const [previousScreening, setPreviousScreening] = useState(null);
  const recognitionRef = useRef(null);
  const scanInputRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setFormData(prev => ({ ...prev, voiceNotes: transcript }));
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'network') {
          toast.error(t('screening.errNetwork'));
        } else if (event.error === 'not-allowed') {
          toast.error(t('screening.errMic'));
        } else {
          toast.error(t('screening.errVoiceStop', { error: event.error }));
        }
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [t]);

  useEffect(() => {
    localStorage.setItem(`screeningDraft:${id}`, JSON.stringify({ formData, currentStep }));
  }, [formData, currentStep, id]);

  useEffect(() => {
    const fetchPrevious = async () => {
      try {
        const res = await api.get(`/analyze/${id}`);
        const last = res.data[res.data.length - 1];
        setPreviousScreening(last || null);
      } catch (err) {
        console.error('Failed to load previous screening', err);
      }
    };
    fetchPrevious();
  }, [id]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setFormData(prev => ({ ...prev, voiceNotes: '' })); // clear previous
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      if (isListening) toggleListening();
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    } else {
      navigate(-1);
    }
  };

  const { isOnline } = useNetwork();
  
  const handleSubmit = async () => {
    setLoading(true);
    const worker = JSON.parse(localStorage.getItem('worker') || '{}');
    const payload = { 
      patientId: id, 
      data: formData,
      workerId: worker._id
    };
    
    if (!isOnline) {
      await enqueueSyncTask('CREATE_SCREENING', payload);
      localStorage.removeItem(`screeningDraft:${id}`);
      toast.success('Screening saved successfully. It will automatically synchronize when internet becomes available.');
      navigate(`/patients/${id}`);
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/analyze', payload);
      if (res.data && res.data.result) {
        localStorage.removeItem(`screeningDraft:${id}`);
        toast.success(t('screening.successAnalysis'));
        // Pass the screeningId and verification object to the result screen
        navigate(`/patients/${id}/result`, { 
          state: { 
            result: res.data.result,
            screeningId: res.data.screeningId,
            verification: res.data.verification 
          } 
        });
      } else {
        toast.error(t('screening.errInvalidRes'));
        setLoading(false);
      }
    } catch (err) {
      console.error('Screening submission failed:', err);
      const errorMsg = err.response?.data?.error || t('screening.errAnalysisFail');
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 w-full bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-primary/10 w-28 h-28 rounded-full flex items-center justify-center mb-8 animate-pulse">
          <BrainCircuit className="w-14 h-14 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2 whitespace-pre-line">{t('screening.aiAnalyzing')}</h2>
        <p className="text-slate-500 mb-12">{t('screening.extractingVoice')}</p>
        
        <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden mb-8">
          <div className="h-full bg-primary rounded-full animate-[loading_2s_ease-in-out_infinite]" style={{width: '60%'}}></div>
        </div>
        
        <p className="text-sm text-slate-400">{t('screening.tip')}</p>
        <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }`}</style>
      </div>
    );
  }

  const step = steps[currentStep];
  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-white pb-32 relative flex flex-col">
      <MobileHeader title={t('screening.flow')} />
      <div className="px-6 py-5 bg-white sticky md:top-0 top-[60px] z-10 shadow-sm border-b border-slate-50">
        <h1 className="text-lg font-bold text-slate-900 mb-4">{t('screening.stepOf', { current: currentStep + 1, total: steps.length })}: {step.title}</h1>
        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <div className="px-6 pt-6 space-y-8 flex-1 max-w-7xl mx-auto w-full">
        {previousScreening && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{t('screening.previous')}</p>
            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  {previousScreening.result?.riskLevel === 'High Risk' ? t('patients.highRisk') : previousScreening.result?.riskLevel === 'Low Risk' ? t('patients.lowRisk') : previousScreening.result?.riskLevel === 'Medium Risk' ? t('patients.mediumRisk') : previousScreening.result?.riskLevel ? `${previousScreening.result.riskLevel}` : `${t('screening.unknown')} ${t('screening.risk')}`}
                </p>
                <p className="text-[10px] text-slate-500">{new Date(previousScreening.createdAt).toLocaleDateString()}</p>
              </div>
              <p className="text-[10px] text-slate-500">{previousScreening.result?.trendDirection === 'Stable' ? t('screening.stable') : previousScreening.result?.trendDirection === 'Declining' ? t('profile.declining') : previousScreening.result?.trendDirection === 'Improving' ? t('profile.improving') : previousScreening.result?.trendDirection || previousScreening.result?.trend || t('screening.stable')}</p>
            </div>
          </div>
        )}
        {step.type === 'voice' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col items-center">
            
            <button 
              onClick={toggleListening}
              className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 shadow-xl transition-all duration-500 ${isListening ? 'bg-red-500 shadow-red-500/40 animate-pulse scale-110' : 'bg-primary shadow-primary/30 hover:scale-105'}`}
            >
              {isListening ? <MicOff className="w-12 h-12 text-white" /> : <Mic className="w-12 h-12 text-white" />}
            </button>
            <p className={`text-sm font-bold mb-8 ${isListening ? 'text-red-500' : 'text-slate-600'}`}>
              {isListening ? t('screening.listening') : t('screening.tapSpeak')}
            </p>
            
            <div className="w-full">
              <label className="block text-sm font-semibold text-slate-900 mb-3">{t('screening.liveTranscript')}</label>
              <textarea 
                className="w-full h-40 p-4 rounded-2xl border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-slate-50 text-slate-900 resize-none shadow-inner"
                placeholder={isApiSupported ? t('screening.speakNow') : t('screening.apiNotSupported')}
                value={formData.voiceNotes}
                onChange={(e) => setFormData({...formData, voiceNotes: e.target.value})}
              ></textarea>
            </div>

            <div className="w-full mt-6">
              <label className="block text-sm font-semibold text-slate-900 mb-3">{t('screening.scanUpload')}</label>
              <div className="flex items-center gap-3">
                <Button type="button" onClick={() => scanInputRef.current?.click()} className="h-10 rounded-xl text-xs font-semibold">
                  {t('screening.uploadScan')}
                </Button>
                {formData.scanImage && (
                  <img src={formData.scanImage} alt={t('screening.scanAlt')} className="h-10 w-10 rounded-lg object-cover border border-slate-200" />
                )}
              </div>
              <input
                ref={scanInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    setFormData((prev) => ({ ...prev, scanImage: reader.result }));
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </div>
          </div>
        ) : (
          step.fields.map(field => (
            <div key={field.name} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <label className="block text-sm font-semibold text-slate-900 mb-3">{field.label}</label>
              <div className="flex gap-2">
                {field.options.map(opt => {
                  const isSelected = formData[field.name] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setFormData({ ...formData, [field.name]: opt })}
                      className={`flex-1 min-h-[48px] py-2 px-1 rounded-xl text-xs font-semibold transition-all border ${
                        isSelected 
                          ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' 
                          : 'bg-white text-slate-700 border-slate-200 hover:border-primary/50'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="sticky bottom-0 w-full bg-white p-6 border-t border-slate-100 flex items-center justify-between z-20 mt-auto">
        <button onClick={handleBack} className="text-sm font-semibold text-slate-500 flex items-center gap-1 hover:text-slate-900 transition-colors px-2 py-2">
          &larr; {t('screening.back')}
        </button>
        
        {step.type !== 'voice' && (
          <div className="flex flex-col items-center">
            <button className="bg-primary/10 p-3 rounded-full shadow-sm hover:scale-105 transition-transform text-primary mb-1">
              <Mic className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-semibold text-slate-400">{t('screening.speak')}</span>
          </div>
        )}

        <Button onClick={handleNext} className="h-10 px-6 rounded-xl text-sm font-semibold shadow-lg shadow-primary/30">
          {currentStep === steps.length - 1 ? t('screening.analyze') : t('screening.next')}
        </Button>
      </div>
    </div>
  );
}
