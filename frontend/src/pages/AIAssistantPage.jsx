import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Mic, MicOff, Loader2, Sparkles, Activity, FileText, HeartPulse, Languages, ShieldAlert, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import toast from 'react-hot-toast';
import MobileHeader from '../components/MobileHeader';
import { useTranslation } from 'react-i18next';

export default function AIAssistantPage() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: t('ai.welcomeMsg'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = t('ai.suggestedPrompts', { returnObjects: true });

  const quickActions = [
    { label: t('ai.quickActions.analyzeLabel'), icon: Activity, color: "text-blue-500", bg: "bg-blue-50", prompt: t('ai.quickActions.analyzePrompt') },
    { label: t('ai.quickActions.summarizeLabel'), icon: FileText, color: "text-emerald-500", bg: "bg-emerald-50", prompt: t('ai.quickActions.summarizePrompt') },
    { label: t('ai.quickActions.explainLabel'), icon: HeartPulse, color: "text-rose-500", bg: "bg-rose-50", prompt: t('ai.quickActions.explainPrompt') },
    { label: t('ai.quickActions.followUpLabel'), icon: Calendar, color: "text-orange-500", bg: "bg-orange-50", prompt: t('ai.quickActions.followUpPrompt') },
    { label: t('ai.quickActions.emergencyLabel'), icon: ShieldAlert, color: "text-red-500", bg: "bg-red-50", prompt: t('ai.quickActions.emergencyPrompt') },
    { label: t('ai.quickActions.transTeluguLabel'), icon: Languages, color: "text-indigo-500", bg: "bg-indigo-50", prompt: t('ai.quickActions.transTeluguPrompt') },
    { label: t('ai.quickActions.transHindiLabel'), icon: Languages, color: "text-indigo-500", bg: "bg-indigo-50", prompt: t('ai.quickActions.transHindiPrompt') }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textOverride) => {
    if (loading) return;
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const historyPayload = messages.slice(1).map(m => ({ sender: m.sender, text: m.text }));

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textOverride) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: textToSend, history: historyPayload });
      
      if (res.data.isEmergency) {
        toast.error('🚨 Emergency Alert Generated! High priority follow-up created.', { duration: 5000, icon: '🚨' });
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: res.data.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEmergency: res.data.isEmergency
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      toast.error(t('ai.errAiResponse'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(t('ai.errNoSpeech'));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast.success(t('ai.listening'), { icon: '🎤' });
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      toast.error(t('ai.errSpeech'));
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-[#F8FAFC] relative">
      <MobileHeader title={t('ai.aiAssistant')} />

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto px-4 py-6 scrollbar-hide pb-10">
        {/* Welcome & Quick Actions */}
        {messages.length === 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">{t('ai.copilot')}</h1>
                <p className="text-sm text-slate-500 font-medium">{t('ai.copilotDesc')}</p>
              </div>
            </div>

            <div className="mb-8 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              <div className="flex gap-3 w-max">
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(action.prompt)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-primary/50 hover:shadow-sm transition-all"
                    >
                      <div className={`p-1.5 rounded-md ${action.bg} ${action.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-700 whitespace-nowrap">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('ai.suggestedQuestions')}</h3>
            <div className="flex flex-wrap gap-2 mb-8">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(prompt)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600 hover:text-primary hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chat History */}
        <div className="space-y-6">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-3 mt-1">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className="flex flex-col">
                  {msg.isEmergency && (
                    <div className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1.5 rounded-md text-[10px] font-bold mb-2 w-max border border-red-100 ml-11">
                      <ShieldAlert className="w-3.5 h-3.5" /> Emergency Alert
                    </div>
                  )}
                  <div 
                    className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-white rounded-tr-sm ml-auto' 
                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'
                    }`}
                  >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <p className={`text-[9px] mt-2 font-semibold ${msg.sender === 'user' ? 'text-white/70 text-right' : 'text-slate-400'}`}>
                    {msg.time}
                  </p>
                </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-3 mt-1">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-sm p-4 flex gap-1 items-center shadow-sm">
                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area Fixed to Bottom */}
      <div className="w-full bg-white/80 backdrop-blur-xl border-t border-slate-200 p-4 pb-[80px] md:pb-4 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto w-full relative">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-[1.5rem] shadow-inner focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all"
          >
            <button 
              type="button"
              onClick={toggleListen}
              className={`p-3 shrink-0 rounded-full transition-colors ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t('ai.placeholder')}
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400 px-2 min-w-0"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-3 bg-primary text-white rounded-full shrink-0 hover:bg-primary-dark transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-md shadow-primary/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" /> {t('ai.disclaimer')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
