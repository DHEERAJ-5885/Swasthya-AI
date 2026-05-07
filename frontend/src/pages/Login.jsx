import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShieldPlus } from 'lucide-react';

export default function Login() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (name && phone) {
      localStorage.setItem('user', JSON.stringify({ name, phone }));
      navigate('/');
    }
  };

  const loadDemo = () => {
    localStorage.setItem('user', JSON.stringify({ name: 'Anita Kumari', phone: '9876543210' }));
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Top Illustration Area */}
      <div className="h-64 bg-gradient-to-b from-primary-dark to-primary w-full relative">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        {/* Placeholder for the ASHA worker illustration */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </div>

      {/* Main Login Card */}
      <div className="flex-1 -mt-16 px-6 pb-6 relative z-10">
        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <div className="flex items-center gap-3 justify-center mb-1">
            <div className="bg-primary text-white p-2 rounded-xl">
              <ShieldPlus className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Swasthya AI</h1>
          </div>
          <p className="text-slate-500 mb-8 text-center text-sm font-medium">Intelligence at the First Point of Care</p>

          <form onSubmit={handleLogin} className="w-full space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Name</label>
              <input
                type="text"
                required
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-slate-900 bg-slate-50 focus:bg-white"
                placeholder="Anita Kumari"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Phone Number</label>
              <input
                type="tel"
                required
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-slate-900 bg-slate-50 focus:bg-white"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full h-12 mt-4 text-base font-semibold shadow-lg shadow-primary/30">
              Login
            </Button>
          </form>
          
          <Button variant="ghost" onClick={loadDemo} className="w-full mt-4 text-slate-400 text-sm">
            Load Demo User
          </Button>
        </div>
      </div>
    </div>
  );
}
