import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShieldPlus, Eye, EyeOff, Loader2, Sparkles, HeartPulse, MapPin, BadgeCheck, Phone, LockKeyhole, IdCard, UsersRound } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const highlightBullets = [
  'Fast patient screening and follow-up tracking',
  'Built for ASHA workers in rural field visits',
  'Patient records stay tied to your worker ID',
];

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
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const { setAuth } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleToken = params.get('google_token');
    const workerParam = params.get('worker');
    const googleError = params.get('google_error');

    if (googleError) {
      toast.error(googleError);
      params.delete('google_error');
      window.history.replaceState({}, '', `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`);
    }

    if (googleToken) {
      try {
        let worker = null;
        if (workerParam) {
          worker = JSON.parse(decodeURIComponent(workerParam));
        }
        setAuth(googleToken, worker);
        toast.success('Account signed in successfully');
        params.delete('google_token');
        params.delete('worker');
        window.history.replaceState({}, '', `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`);
        navigate('/');
      } catch (err) {
        toast.error('Google Sign-In session could not be restored');
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!employeeId || !phone || !password) {
      toast.error('Please enter Employee ID, phone number, and password');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { employeeId, phone, password });
      setAuth(res.data.token, res.data.worker);
      toast.success('Account signed in successfully');
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
    if (!/^\d{10}$/.test(phone)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { employeeId, name, phone, village, email, password });
      setAuth(res.data.token, res.data.worker);
      toast.success('Registration successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoAccount = () => {
    setEmployeeId('ASH-001');
    setPhone('9876543210');
    setPassword('password123');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(108,99,255,0.28),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(84,63,190,0.18),_transparent_24%),linear-gradient(180deg,_#f7f4ff_0%,_#ffffff_38%,_#f8fafc_100%)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.42)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.42)_1px,transparent_1px)] bg-[size:42px_42px] opacity-40" />
      <div className="absolute -left-24 top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute -right-28 bottom-4 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <section className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,_rgba(108,99,255,0.97)_0%,_rgba(89,77,220,0.96)_100%)] p-6 text-white shadow-[0_24px_80px_rgba(79,70,229,0.28)] sm:p-8 lg:min-h-[760px] lg:p-10">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.14),transparent_50%)]" />
            <div className="relative z-10 flex h-full flex-col justify-between gap-8">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4" />
                  First point of care
                </div>

                <div className="max-w-md space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-lg shadow-black/10">
                      <ShieldPlus className="h-8 w-8" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Swasthya AI</h1>
                      <p className="text-sm font-medium text-white/80">Intelligence at the First Point of Care</p>
                    </div>
                  </div>

                  <p className="text-base leading-7 text-white/88 sm:text-lg">
                    A clean, field-ready companion for ASHA workers to manage visits, screenings, follow-ups, and patient records from one place.
                  </p>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-md">
                <div className="absolute left-4 top-10 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute right-0 top-24 h-20 w-20 rounded-full bg-sky-200/20 blur-2xl" />

                <div className="relative rounded-[30px] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-md">
                  <div className="rounded-[26px] bg-[linear-gradient(180deg,_#f6f0ff_0%,_#ece8ff_100%)] px-5 py-5 text-slate-900 shadow-inner">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-primary shadow-sm">Field sketch</div>
                      <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-slate-600 shadow-sm">
                        <HeartPulse className="h-3.5 w-3.5 text-rose-500" />
                        Rural care
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,_#d7c5ff_0%,_#f8f5ff_58%,_#f4eefd_100%)] p-5">
                      <div className="absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.8),transparent_65%)]" />
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-[linear-gradient(180deg,transparent,_rgba(255,255,255,0.55))]" />

                      <div className="absolute left-5 top-6 h-16 w-24 rounded-full bg-white/35 blur-2xl" />
                      <div className="absolute right-5 top-6 h-16 w-24 rounded-full bg-primary/20 blur-2xl" />

                      <div className="relative h-[290px] overflow-hidden rounded-[22px] border border-white/35 bg-[linear-gradient(180deg,_#f6f2ff_0%,_#f0e9ff_58%,_#ede7ff_100%)]">
                        <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.95),rgba(255,255,255,0.2)_60%,transparent_75%)]" />

                        <div className="absolute left-4 right-4 top-8 flex items-end justify-between opacity-70">
                          <div className="h-16 w-20 rounded-t-[999px] bg-[linear-gradient(180deg,#cab4ff,#b394ff)]" />
                          <div className="h-20 w-24 rounded-t-[999px] bg-[linear-gradient(180deg,#d8c7ff,#bca0ff)]" />
                          <div className="h-14 w-16 rounded-t-[999px] bg-[linear-gradient(180deg,#cab4ff,#ae93f7)]" />
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-[linear-gradient(180deg,rgba(126,87,255,0.08),rgba(108,99,255,0.22))]" />

                        <div className="absolute bottom-10 left-10">
                          <div className="relative h-28 w-20">
                            <div className="absolute left-4 top-0 h-7 w-7 rounded-full bg-[#e7b08e] shadow-sm" />
                            <div className="absolute left-2 top-6 h-12 w-12 rounded-t-[22px] rounded-b-[16px] bg-[#f3d0b5] shadow-sm" />
                            <div className="absolute left-0 top-16 h-12 w-16 rounded-tr-[20px] rounded-bl-[16px] rounded-tl-[6px] rounded-br-[18px] bg-white shadow-[0_12px_24px_rgba(79,70,229,0.16)]" />
                            <div className="absolute left-1 top-16 h-11 w-14 rounded-tr-[18px] rounded-bl-[14px] rounded-tl-[6px] rounded-br-[18px] bg-[#f3d6c1]" />
                          </div>
                        </div>

                        <div className="absolute bottom-9 left-20 h-24 w-18 rounded-[24px] bg-[#f5efe7] shadow-[0_16px_30px_rgba(0,0,0,0.08)]" />

                        <div className="absolute bottom-8 left-24 h-28 w-28 rounded-[24px] bg-[linear-gradient(180deg,#f5e7d7,#efcfb1)] shadow-[0_16px_30px_rgba(0,0,0,0.08)]" />
                        <div className="absolute bottom-12 left-[5.9rem] h-20 w-28 rounded-[24px] bg-[#f8ebdc] shadow-[0_16px_30px_rgba(0,0,0,0.08)]" />
                        <div className="absolute bottom-12 left-[8.1rem] h-16 w-24 rounded-[18px] bg-[#1f2937] shadow-[0_12px_24px_rgba(31,41,55,0.28)]" />
                        <div className="absolute bottom-[4.35rem] left-[8.95rem] h-20 w-12 -rotate-12 rounded-[999px] bg-[#f3d0b5] shadow-sm" />
                        <div className="absolute bottom-[5.2rem] left-[9.8rem] h-16 w-14 rotate-6 rounded-[18px] bg-[#f5b889] shadow-sm" />

                        <div className="absolute bottom-12 right-8">
                          <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/60 bg-white/85 shadow-[0_14px_30px_rgba(79,70,229,0.14)] backdrop-blur-sm">
                            <div className="space-y-1 text-center">
                              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <MapPin className="h-5 w-5" />
                              </div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Village visit</p>
                            </div>
                          </div>
                        </div>

                        <div className="absolute left-8 top-[9.1rem] rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-primary shadow-sm">ASHA</div>
                        <div className="absolute left-10 top-[10.8rem] text-[11px] font-semibold text-slate-600">Worker on duty</div>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {highlightBullets.map((item, index) => (
                        <div key={item} className="rounded-2xl border border-slate-200/70 bg-white px-3 py-3 shadow-sm">
                          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            {index === 0 ? <UsersRound className="h-4 w-4" /> : index === 1 ? <BadgeCheck className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
                          </div>
                          <p className="text-[11px] font-semibold leading-5 text-slate-700">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="flex items-center lg:justify-end">
            <div className="w-full max-w-xl rounded-[32px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:p-7 lg:p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Secure access</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                    {mode === 'login' ? 'Welcome back' : 'Create your worker account'}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Sign in with your ASHA worker ID, phone number, and password.
                  </p>
                </div>

                <div className="hidden rounded-2xl bg-primary/10 p-3 text-primary sm:block">
                  <HeartPulse className="h-6 w-6" />
                </div>
              </div>

              <div className="mb-7 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
                <button
                  onClick={() => setMode('login')}
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${mode === 'login' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Login
                </button>
                <button
                  onClick={() => setMode('register')}
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${mode === 'register' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4 sm:space-y-5">
                {mode === 'register' && (
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Full Name</label>
                    <div className="relative">
                      <IdCard className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        className="w-full h-13 rounded-2xl border border-slate-200 bg-slate-50 py-0 pl-11 pr-4 text-slate-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
                        placeholder="Anita Kumari"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Employee ID</label>
                  <div className="relative">
                    <IdCard className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      className="w-full h-13 rounded-2xl border border-slate-200 bg-slate-50 py-0 pl-11 pr-4 text-slate-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
                      placeholder="ASH-001234"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Phone Number</label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        required
                        className="w-full h-13 rounded-2xl border border-slate-200 bg-slate-50 py-0 pl-11 pr-4 text-slate-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  {mode === 'register' && (
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Village</label>
                      <input
                        type="text"
                        required
                        className="w-full h-13 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
                        placeholder="Rampur"
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Password</label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full h-13 rounded-2xl border border-slate-200 bg-slate-50 py-0 pl-11 pr-12 text-slate-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Email (Optional)</label>
                    <input
                      type="email"
                      className="w-full h-13 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
                      placeholder="anita@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                )}

                <Button type="submit" className="mt-2 w-full h-13 rounded-2xl text-base font-semibold shadow-lg shadow-primary/25" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
                <div className="mt-6 space-y-4 border-t border-slate-200 pt-5">
                  <Button
                    type="button"
                    onClick={() => window.location.href = `${API_URL.replace(/\/api$/, '')}/api/auth/google/start`}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Continue with Google
                  </Button>

                  <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Demo Credentials</p>
                    <p className="mt-1 text-sm text-slate-600">Use the sample account to explore the app quickly.</p>
                    <button onClick={loadDemoAccount} className="mt-3 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                      Load Demo Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
