import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Mic, MicOff, BrainCircuit } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

const steps = [
  { 
    id: 1, 
    title: 'Basic Health', 
    fields: [
      {name: 'fever', label: 'Fever Status', options: ['None', 'Mild', 'High']},
      {name: 'bp', label: 'Blood Pressure', options: ['Normal', 'High', 'Low']},
      {name: 'sugar', label: 'Blood Sugar', options: ['Normal', 'High', 'Low']},
      {name: 'pulse', label: 'Pulse Rate', options: ['Normal', 'Fast', 'Slow']},
      {name: 'oxygen', label: 'Oxygen Level', options: ['Normal', 'Low']},
      {name: 'temperature', label: 'Temperature Feeling', options: ['Normal', 'Hot', 'Cold']}
    ] 
  },
  { 
    id: 2, 
    title: 'Lifestyle', 
    fields: [
      {name: 'sleep', label: 'Sleep Quality', options: ['Good', 'Average', 'Poor']},
      {name: 'appetite', label: 'Appetite', options: ['Normal', 'Low', 'High']},
      {name: 'energy', label: 'Energy Level', options: ['High', 'Medium', 'Low']},
      {name: 'stress', label: 'Stress Level', options: ['Low', 'Medium', 'High']},
      {name: 'waterIntake', label: 'Water Intake', options: ['Good', 'Average', 'Poor']},
      {name: 'workFatigue', label: 'Work Fatigue', options: ['None', 'Some', 'Severe']}
    ] 
  },
  { 
    id: 3, 
    title: 'Mental & Emotional', 
    fields: [
      {name: 'sadness', label: 'Feeling Sad?', options: ['No', 'Sometimes', 'Often']},
      {name: 'anxiety', label: 'Feeling Anxious?', options: ['No', 'Sometimes', 'Often']},
      {name: 'loneliness', label: 'Feeling Lonely?', options: ['No', 'Sometimes', 'Often']},
      {name: 'emotionalStress', label: 'Emotional Stress', options: ['Low', 'Medium', 'High']},
      {name: 'overthinking', label: 'Overthinking?', options: ['No', 'Sometimes', 'Often']}
    ] 
  },
  { 
    id: 4, 
    title: 'Passive Observation', 
    fields: [
      {name: 'swelling', label: 'Visible Swelling?', options: ['No', 'Some', 'Severe']},
      {name: 'paleSkin', label: 'Pale Skin?', options: ['No', 'Yes']},
      {name: 'fatigue', label: 'Visible Fatigue?', options: ['No', 'Some', 'Severe']},
      {name: 'cough', label: 'Persistent Cough?', options: ['No', 'Some', 'Severe']},
      {name: 'weakness', label: 'Physical Weakness?', options: ['None', 'Some', 'Severe']},
      {name: 'visibleDiscomfort', label: 'Visible Discomfort?', options: ['No', 'Yes']}
    ] 
  },
  {
    id: 5,
    title: 'Voice Notes & Extra Info',
    type: 'voice'
  }
];

export default function ScreeningFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    sleep: 'Good', appetite: 'Normal', energy: 'Medium',
    stress: 'Low', fever: 'None', bp: 'Normal',
    voiceNotes: '',
    scanImage: ''
  });
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
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
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(`screeningDraft:${id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.formData) setFormData(parsed.formData);
        if (typeof parsed.currentStep === 'number') setCurrentStep(parsed.currentStep);
      } catch (err) {
        console.error('Failed to load draft', err);
      }
    }
  }, [id]);

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

  const handleSubmit = async () => {
    setLoading(true);
    const worker = JSON.parse(localStorage.getItem('worker') || '{}');
    const payload = { 
      patientId: id, 
      data: formData,
      workerId: worker._id
    };
    
    try {
      const res = await api.post('/analyze', payload);
      if (res.data && res.data.result) {
        localStorage.removeItem(`screeningDraft:${id}`);
        navigate(`/patients/${id}/result`, { state: { result: res.data.result } });
      } else {
        toast.error('Invalid response from server');
        setLoading(false);
      }
    } catch (err) {
      console.error('Screening submission failed:', err);
      const errorMsg = err.response?.data?.error || 'Failed to analyze screening data';
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-primary/10 w-28 h-28 rounded-full flex items-center justify-center mb-8 animate-pulse">
          <BrainCircuit className="w-14 h-14 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">AI is analyzing<br/>patient data...</h2>
        <p className="text-slate-500 mb-12">Extracting voice symptoms and comparing history</p>
        
        <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden mb-8">
          <div className="h-full bg-primary rounded-full animate-[loading_2s_ease-in-out_infinite]" style={{width: '60%'}}></div>
        </div>
        
        <p className="text-sm text-slate-400">Tip: More accurate data leads to better insights</p>
        <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }`}</style>
      </div>
    );
  }

  const step = steps[currentStep];
  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-white pb-32 relative">
      <div className="px-6 py-5 bg-white sticky top-0 z-10 shadow-sm border-b border-slate-50">
        <h1 className="text-lg font-bold text-slate-900 mb-4">Step {currentStep + 1} of {steps.length}: {step.title}</h1>
        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <div className="px-6 pt-6 space-y-8">
        {previousScreening && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Previous Screening</p>
            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="text-xs font-semibold text-slate-900">{previousScreening.result?.riskLevel || 'Unknown'} Risk</p>
                <p className="text-[10px] text-slate-500">{new Date(previousScreening.createdAt).toLocaleDateString()}</p>
              </div>
              <p className="text-[10px] text-slate-500">{previousScreening.result?.trendDirection || previousScreening.result?.trend || 'Stable'}</p>
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
              {isListening ? 'Listening...' : 'Tap to speak'}
            </p>
            
            <div className="w-full">
              <label className="block text-sm font-semibold text-slate-900 mb-3">Live Transcript</label>
              <textarea 
                className="w-full h-40 p-4 rounded-2xl border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-slate-50 text-slate-900 resize-none shadow-inner"
                placeholder={recognitionRef.current ? "Speak now or type patient's symptoms here..." : "Voice API not supported in this browser. Please type."}
                value={formData.voiceNotes}
                onChange={(e) => setFormData({...formData, voiceNotes: e.target.value})}
              ></textarea>
            </div>

            <div className="w-full mt-6">
              <label className="block text-sm font-semibold text-slate-900 mb-3">Scan Upload</label>
              <div className="flex items-center gap-3">
                <Button type="button" onClick={() => scanInputRef.current?.click()} className="h-10 rounded-xl text-xs font-semibold">
                  Upload Scan
                </Button>
                {formData.scanImage && (
                  <img src={formData.scanImage} alt="Scan" className="h-10 w-10 rounded-lg object-cover border border-slate-200" />
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

      <div className="fixed bottom-0 w-full max-w-md bg-white p-6 border-t border-slate-100 flex items-center justify-between z-20">
        <button onClick={handleBack} className="text-sm font-semibold text-slate-500 flex items-center gap-1 hover:text-slate-900 transition-colors px-2 py-2">
          &larr; Back
        </button>
        
        {step.type !== 'voice' && (
          <div className="flex flex-col items-center">
            <button className="bg-primary/10 p-3 rounded-full shadow-sm hover:scale-105 transition-transform text-primary mb-1">
              <Mic className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-semibold text-slate-400">Speak</span>
          </div>
        )}

        <Button onClick={handleNext} className="h-10 px-6 rounded-xl text-sm font-semibold shadow-lg shadow-primary/30">
          {currentStep === steps.length - 1 ? 'Analyze \u2192' : 'Next \u2192'}
        </Button>
      </div>
    </div>
  );
}
