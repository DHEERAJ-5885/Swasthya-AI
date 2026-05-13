import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShieldPlus, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!employeeId || !password) {
      toast.error('Please enter Employee ID and password');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { employeeId, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('worker', JSON.stringify(res.data.worker));
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!employeeId || !password || !name || !phone || !village) {
      toast.error('Please fill all fields');
      return;
    }
    if (phone.length < 10) {
      toast.error('Phone number must be at least 10 digits');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { employeeId, name, phone, village, email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('worker', JSON.stringify(res.data.worker));
      toast.success('Registration successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoAccount = async () => {
    setEmployeeId('ASH-001');
    setPassword('password123');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-primary-dark to-primary w-full relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

      <div className="relative z-10 pt-10 px-6 text-center">
        <div className="flex items-center gap-3 justify-center mb-3">
          <div className="bg-white text-primary p-3 rounded-2xl shadow-lg">
            <ShieldPlus className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white">Swasthya AI</h1>
        </div>
        <p className="text-white/90 text-sm font-medium">Healthcare at First Point of Care</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-colors ${mode === 'login' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-colors ${mode === 'register' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                  <input type="text" required className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-slate-900 bg-slate-50 focus:bg-white" placeholder="Anita Kumari" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Employee ID</label>
              <input type="text" required className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-slate-900 bg-slate-50 focus:bg-white" placeholder="ASH-001234" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required className="w-full h-12 px-4 pr-12 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-slate-900 bg-slate-50 focus:bg-white" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Phone Number</label>
                  <input type="tel" required className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-slate-900 bg-slate-50 focus:bg-white" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Village</label>
                  <input type="text" required className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-slate-900 bg-slate-50 focus:bg-white" placeholder="Rampur" value={village} onChange={(e) => setVillage(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Email (Optional)</label>
                  <input type="email" className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-slate-900 bg-slate-50 focus:bg-white" placeholder="anita@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </>
            )}

            <Button type="submit" className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/30 mt-8" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {mode === 'login' ? 'Signing in...' : 'Registering...'}
                </>
              ) : mode === 'login' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {mode === 'login' && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 mb-3 text-center">Demo Credentials</p>
              <button onClick={loadDemoAccount} className="w-full py-2 px-4 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors">
                Load Demo Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
