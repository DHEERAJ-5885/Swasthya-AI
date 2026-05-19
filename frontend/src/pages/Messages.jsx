import React, { useEffect, useState, useRef } from 'react';
import { Loader2, Search, Send, Bot, AlertTriangle, Calendar, Bell, ChevronRight, User } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';
import toast from 'react-hot-toast';
import MobileHeader from '../components/MobileHeader';

export default function Messages() {
  const [threads, setThreads] = useState([
    { id: 'ai-assistant', type: 'chat', title: 'Swasthya AI Assistant', priority: 'normal', unread: 0 }
  ]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState('ai-assistant');
  const [chatHistory, setChatHistory] = useState([
    { id: 1, sender: 'ai', text: 'Hello! I am Swasthya AI. How can I assist you with your patients today?', time: new Date().toLocaleTimeString() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    api.get('/inbox')
      .then(res => {
        setMessages(res.data);
        const dynamicThreads = res.data.map(m => ({
          id: m.id,
          type: m.type,
          title: m.title,
          patientName: m.patientName,
          priority: m.priority,
          date: m.date,
          unread: 1,
          body: m.body
        }));
        setThreads(prev => [prev[0], ...dynamicThreads]);
        setLoading(false);
      })
      .catch(err => {
        toast.error('Failed to load messages');
        setLoading(false);
      });
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: chatInput, time: new Date().toLocaleTimeString() };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await api.post('/chat', { message: userMsg.text });
      const aiMsg = { id: Date.now() + 1, sender: 'ai', text: res.data.reply, time: new Date().toLocaleTimeString() };
      setChatHistory(prev => [...prev, aiMsg]);
    } catch (err) {
      toast.error('Failed to connect to AI');
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeMessage = messages.find(m => m.id === selectedThread);

  const getIcon = (type) => {
    if (type === 'chat') return <Bot className="w-5 h-5 text-indigo-500" />;
    if (type === 'alert') return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (type === 'followup') return <Calendar className="w-5 h-5 text-orange-500" />;
    return <Bell className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] md:pl-64 flex flex-col md:flex-row h-screen">
      <MobileHeader title="Messages" />
      
      {/* Left Sidebar */}
      <div className="w-full md:w-[350px] border-r border-slate-200 bg-white flex flex-col h-full flex-shrink-0 z-10 shadow-sm relative">
        <div className="p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h1 className="hidden md:block text-lg font-bold text-slate-900 tracking-tight mb-4">Inbox</h1>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search messages..."
              className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-transparent rounded-xl text-sm outline-none focus:border-primary/20 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {threads.map(thread => (
            <div 
              key={thread.id}
              onClick={() => setSelectedThread(thread.id)}
              className={`p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 flex items-start gap-3 ${selectedThread === thread.id ? 'bg-primary/5 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'}`}
            >
              <div className={`p-2.5 rounded-full shrink-0 ${thread.type === 'chat' ? 'bg-indigo-50' : thread.type === 'alert' ? 'bg-red-50' : 'bg-orange-50'}`}>
                {getIcon(thread.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-slate-900 truncate pr-2">{thread.title}</h3>
                  {thread.date && <span className="text-[10px] font-semibold text-slate-400 shrink-0">{new Date(thread.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                </div>
                {thread.patientName && <p className="text-xs text-slate-500 font-medium truncate mb-1">Patient: {thread.patientName}</p>}
                <p className="text-xs text-slate-400 truncate pr-4">{thread.type === 'chat' ? 'Start a conversation with Swasthya AI' : thread.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 bg-[#F8FAFC] flex flex-col h-full relative">
        {selectedThread === 'ai-assistant' ? (
          // AI Chat Interface
          <>
            <div className="p-4 border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-10 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-full">
                <Bot className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Swasthya AI Assistant</h2>
                <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.map(msg => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] md:max-w-[60%] rounded-2xl p-4 shadow-sm ${
                    msg.sender === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <p className={`text-[9px] mt-2 font-semibold text-right ${msg.sender === 'user' ? 'text-white/70' : 'text-slate-400'}`}>
                      {msg.time}
                    </p>
                  </div>
                </motion.div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 rounded-tl-sm flex gap-1 items-center">
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask about symptoms, protocols, or insights..."
                  className="w-full pl-4 pr-12 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button 
                  type="submit" 
                  disabled={!chatInput.trim() || chatLoading}
                  className="absolute right-2 p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : activeMessage ? (
          // Read-only Message View
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
              <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6 ${activeMessage.priority === 'high' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                {getIcon(activeMessage.type)}
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">{activeMessage.title}</h2>
              {activeMessage.patientName && (
                <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 mb-6 bg-slate-50 py-2 rounded-lg">
                  <User className="w-4 h-4" /> {activeMessage.patientName}
                </div>
              )}
              <p className="text-sm text-slate-600 leading-relaxed font-medium mb-8">
                {activeMessage.body}
              </p>
              
              <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-primary/20">
                View Details
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
          </div>
        )}
      </div>

    </div>
  );
}
