import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { 
  ShieldPlus, Eye, EyeOff, Loader2, Sparkles, HeartPulse, 
  MapPin, BadgeCheck, Phone, LockKeyhole, IdCard, 
  UsersRound, Camera, ArrowRight, CheckCircle2,
  Building2, Mail
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Form States
  const [formData, setFormData] = useState({
    employeeId: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    village: '',
    district: '',
    email: '',
  });

  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { setAuth } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleToken = params.get('google_token');
    const workerParam = params.get('worker');
    const googleError = params.get('google_error');

    if (googleError) {
      toast.error(googleError);
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (googleToken) {
      try {
        let worker = null;
        if (workerParam) {
          worker = JSON.parse(decodeURIComponent(workerParam));
        }
        setAuth(googleToken, worker);
        toast.success('Login successful');
        window.history.replaceState({}, '', window.location.pathname);
        navigate('/');
      } catch (err) {
        toast.error('Google Sign-In failed');
      }
    }
  }, [navigate, setAuth]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Only allow numbers and max 10 digits
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (mode === 'login') {
      if (!formData.employeeId) return 'Employee ID is required';
      if (!formData.phone || formData.phone.length !== 10) return 'Valid 10-digit phone number is required';
      if (!formData.password) return 'Password is required';
    } else {
      if (!formData.name) return 'Full Name is required';
      if (!formData.employeeId) return 'Employee ID is required';
      if (!formData.phone || formData.phone.length !== 10) return 'Valid 10-digit phone number is required';
      if (!formData.village) return 'Village name is required';
      if (!formData.district) return 'District is required';
      if (!formData.password) return 'Password is required';
      if (formData.password.length < 6) return 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    }
    return null;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await api.post('', { 
          employeeId: formData.employeeId, 
          phone: formData.phone, 
          password: formData.password 
        });
        setAuth(res.data.token, res.data.worker);
        toast.success('Welcome back!');
        navigate('/');
      } else {
        const res = await api.post('/auth/register', { 
          employeeId: formData.employeeId, 
          name: formData.name, 
          phone: formData.phone, 
          village: formData.village, 
          district: formData.district,
          email: formData.email, 
          password: formData.password 
        });
        setAuth(res.data.token, res.data.worker);
        toast.success('Registration successful!');
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || `${mode === 'login' ? 'Login' : 'Registration'} failed`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] overflow-x-hidden">
      {/* Desktop Left Branding Panel */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-primary via-teal-600 to-emerald-700 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="p-2 bg-white/20 rounded-xl">
              <ShieldPlus className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Swasthya AI</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">Empowering ASHA Workers with AI-Powered Healthcare</h2>
          <p className="text-white/80 text-lg leading-relaxed">Monitor patient health, detect risk drift, and coordinate care — all from one intelligent platform built for frontline healthcare workers.</p>
        </div>
        <div className="space-y-4">
          {[{icon: HeartPulse, label: 'Real-time health drift detection'}, {icon: BadgeCheck, label: 'AI-powered risk assessment'}, {icon: UsersRound, label: 'Family & community health insights'}].map(({icon: Icon, label}) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-white/90 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Auth Card Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative">
        {/* Mobile Header */}
        <div className="flex flex-col items-center mb-8 md:hidden">
          <div className="p-3 bg-primary/10 rounded-2xl mb-4">
            <ShieldPlus className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Swasthya AI</h1>
          <p className="text-slate-500 text-sm">Secure access for frontline workers</p>
        </div>

        <motion.div 
          layout
          className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden"
        >
          {/* Mode Toggle */}
          <div className="flex p-2 bg-slate-50 gap-1 m-4 rounded-2xl">
            <button 
              onClick={() => setMode('login')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
                mode === 'login' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setMode('register')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
                mode === 'register' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Register
            </button>
          </div>

          <div className="p-8 pt-4">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              {mode === 'login' ? 'Welcome back' : 'Join as Worker'}
            </h3>
            <p className="text-slate-500 text-sm mb-8">
              {mode === 'login' 
                ? 'Enter your credentials to access your dashboard' 
                : 'Create your professional account to start managing patients'}
            </p>

            <form onSubmit={handleAuth} className="space-y-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {mode === 'register' && (
                    <>
                      {/* Photo Upload */}
                      <div className="flex flex-col items-center mb-6">
                        <div 
                          className="relative group cursor-pointer"
                          onClick={() => fileInputRef.current.click()}
                        >
                          <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary">
                            {imagePreview ? (
                              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <Camera className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />
                            )}
                          </div>
                          <div className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full shadow-lg border-2 border-white">
                            <Plus className="w-3 h-3" />
                          </div>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleFileChange}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-500 mt-2">Profile Photo</span>
                      </div>

                      <div className="space-y-4">
                        <InputGroup 
                          label="Full Name" 
                          icon={UsersRound} 
                          name="name" 
                          placeholder="Anita Kumari" 
                          value={formData.name} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </>
                  )}

                  <InputGroup 
                    label="Employee ID" 
                    icon={IdCard} 
                    name="employeeId" 
                    placeholder="ASHA-1024" 
                    value={formData.employeeId} 
                    onChange={handleInputChange} 
                  />

                  <InputGroup 
                    label="Phone Number" 
                    icon={Phone} 
                    name="phone" 
                    type="tel"
                    placeholder="9876543210" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                  />

                  {mode === 'register' && (
                    <div className="grid grid-cols-2 gap-4">
                      <InputGroup 
                        label="Village" 
                        icon={MapPin} 
                        name="village" 
                        placeholder="Rampur" 
                        value={formData.village} 
                        onChange={handleInputChange} 
                      />
                      <InputGroup 
                        label="District" 
                        icon={Building2} 
                        name="district" 
                        placeholder="Patna" 
                        value={formData.district} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  )}

                  {mode === 'register' && (
                    <InputGroup 
                      label="Email (Optional)" 
                      icon={Mail} 
                      name="email" 
                      type="email"
                      placeholder="anita@example.com" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                    />
                  )}

                  <div className="relative">
                    <InputGroup 
                      label="Password" 
                      icon={LockKeyhole} 
                      name="password" 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••" 
                      value={formData.password} 
                      onChange={handleInputChange} 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 bottom-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {mode === 'register' && (
                    <InputGroup 
                      label="Confirm Password" 
                      icon={LockKeyhole} 
                      name="confirmPassword" 
                      type="password"
                      placeholder="••••••••" 
                      value={formData.confirmPassword} 
                      onChange={handleInputChange} 
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            {mode === 'login' && (
              <div className="mt-8 space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or continue with</span>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => window.location.href = `${API_URL.replace(/\/api$/, '')}/api/auth/google/start`}
                  className="w-full h-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors font-semibold text-slate-700"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M24 12.27c0-.85-.07-1.66-.21-2.46H12v4.66h6.75c-.29 1.56-1.17 2.89-2.48 3.77v3.13h4.02c2.35-2.17 3.71-5.37 3.71-9.1z"/>
                    <path fill="#FBBC05" d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-4.02-3.13c-1.11.75-2.54 1.19-3.91 1.19-3.01 0-5.56-2.03-6.46-4.77H1.41v3.22c2.01 3.99 6.13 6.74 10.59 6.74z"/>
                    <path fill="#34A853" d="M5.54 14.38c-.24-.72-.37-1.49-.37-2.38s.13-1.66.37-2.38V6.41H1.41C.51 8.21 0 10.15 0 12s.51 3.79 1.41 5.59l4.13-3.21z"/>
                    <path fill="#4285F4" d="M12 4.77c1.76 0 3.35.61 4.59 1.8l3.43-3.43C17.95 1.07 15.24 0 12 0 7.54 0 3.42 2.75 1.41 6.41l4.13 3.21c.9-2.74 3.45-4.77 6.46-4.77z"/>
                  </svg>
                  Google Account
                </button>

                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Demo Access</span>
                  </div>
                  <button 
                    onClick={() => setFormData({ ...formData, employeeId: 'ASH-001', phone: '9876543210', password: 'password123' })}
                    className="w-full text-left text-sm text-slate-600 hover:text-primary transition-colors flex items-center justify-between group"
                  >
                    Load sample account credentials
                    <CheckCircle2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Footer info */}
        <p className="mt-8 text-slate-400 text-xs font-medium tracking-wide text-center max-w-xs">
          Designed for rural healthcare efficiency. <br />
          © 2026 Swasthya AI. Secure & Compliant.
        </p>
      </div>
    </div>
  );
}

function InputGroup({ label, icon: Icon, type = "text", ...props }) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <input 
          type={type}
          className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 outline-none transition-all focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 text-slate-900 placeholder:text-slate-300"
          {...props}
        />
      </div>
    </div>
  );
}

function Plus(props) {
  return (
    <svg 
      {...props} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function BrainCircuit(props) {
  return (
    <svg 
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 5.886 3 3 0 1 0 5.174 3.09 3 3 0 1 0 5.174-3.09 4 4 0 0 0 .52-5.886 4 4 0 0 0-2.526-5.77A3 3 0 1 0 12 5z" />
      <path d="M9 13a3 3 0 1 0 6 0 3 3 0 1 0-6 0z" />
      <path d="M12 10v6" />
      <path d="M10 13h4" />
    </svg>
  );
}
