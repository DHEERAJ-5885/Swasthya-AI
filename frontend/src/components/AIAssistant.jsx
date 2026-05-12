import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, X, Send, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { useEffect } from 'react';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Namaste! I am Swasthya AI. How can I help you today?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [portalRoot, setPortalRoot] = useState(null);

  useEffect(() => {
    setPortalRoot(document.getElementById('app-shell'));
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again later." }]);
    }
    
    setLoading(false);
  };

  return (
    <>
      {portalRoot
        ? createPortal(
            <>
              <button
                onClick={() => setIsOpen(true)}
                className="absolute bottom-24 right-4 bg-primary text-white p-4 rounded-full shadow-lg shadow-primary/40 hover:scale-105 transition-transform z-40"
              >
                <MessageCircle className="w-6 h-6" />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="absolute bottom-24 right-4 w-[20rem] max-w-[90%] h-[28rem] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col z-50 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="bg-primary p-4 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5" />
                        <span className="font-bold text-sm">Swasthya Assistant</span>
                      </div>
                      <button onClick={() => setIsOpen(false)}><X className="w-5 h-5" /></button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
                      {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-primary text-white rounded-br-sm'
                              : 'bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-sm'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {loading && (
                        <div className="flex justify-start">
                          <div className="bg-white p-3 rounded-2xl text-xs border border-slate-100 shadow-sm rounded-bl-sm flex gap-1">
                            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce delay-150"></span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                      <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder="Ask about your patients..."
                        className="flex-1 bg-slate-50 text-xs px-3 py-2 rounded-xl outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        onClick={sendMessage}
                        className="bg-primary text-white p-2 rounded-xl hover:bg-primary/90 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          , portalRoot)
        : null}
    </>
  );
}
