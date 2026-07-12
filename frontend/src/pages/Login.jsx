import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/Button';
import { 
  ShieldPlus, Eye, EyeOff, Loader2, Sparkles, MapPin, 
  Phone, LockKeyhole, IdCard, UsersRound, Camera, ArrowRight, CheckCircle2,
  Building2, Mail, Info, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { API_URL } from '../api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import authBg from '../assets/auth-bg.png';
import { useTranslation } from 'react-i18next';

// Input Field Component
const InputField = React.forwardRef(({ label, icon: Icon, error, ...props }, ref) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <input 
        ref={ref}
        className={`w-full h-12 pl-12 pr-4 rounded-xl border bg-slate-50/50 outline-none transition-all focus:bg-white focus:ring-4 text-sm text-slate-900 placeholder:text-slate-300
          ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary focus:ring-primary/10'}`}
        {...props}
      />
    </div>
    {error && (
      <p className="text-red-500 text-xs font-medium ml-1 flex items-center gap-1 mt-1">
        <Info className="w-3 h-3" /> {error.message}
      </p>
    )}
  </div>
));
InputField.displayName = 'InputField';

// Password Field Component
const PasswordField = React.forwardRef(({ label, icon: Icon, error, ...props }, ref) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5 w-full">
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <input 
          ref={ref}
          type={show ? "text" : "password"}
          className={`w-full h-12 pl-12 pr-12 rounded-xl border bg-slate-50/50 outline-none transition-all focus:bg-white focus:ring-4 text-sm text-slate-900 placeholder:text-slate-300
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary focus:ring-primary/10'}`}
          {...props}
        />
        <button 
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-xs font-medium ml-1 flex items-center gap-1 mt-1">
          <Info className="w-3 h-3" /> {error.message}
        </p>
      )}
    </div>
  );
});
PasswordField.displayName = 'PasswordField';

export default function Login() {
  const { t } = useTranslation();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const { register, handleSubmit, formState: { errors }, watch, setValue, clearErrors } = useForm({
    mode: 'onTouched'
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchPassword = watch('password');
  
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { setAuth } = useAuth();

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
        toast.success(t('auth.loginSuccess'));
        window.history.replaceState({}, '', window.location.pathname);
        navigate('/');
      } catch {
        toast.error(t('auth.googleFail'));
      }
    }
  }, [navigate, setAuth, t]);

  useEffect(() => {
    clearErrors();
  }, [mode, clearErrors]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await api.post('/auth/login', { 
          employeeId: data.employeeId, 
          phone: data.phone, 
          password: data.password 
        });
        setAuth(res.data.token, res.data.worker);
        toast.success(t('auth.loginSuccess'));
        navigate('/');
      } else {
        const res = await api.post('/auth/register', { 
          employeeId: data.employeeId, 
          name: data.name, 
          phone: data.phone, 
          village: data.village, 
          district: data.district,
          email: data.email, 
          password: data.password 
        });
        setAuth(res.data.token, res.data.worker);
        toast.success(t('auth.registerSuccess'));
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || (mode === 'login' ? t('auth.loginFailed') : t('auth.registerFailed')));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t('auth.imgSizeErr'));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const loadDemo = () => {
    setValue('employeeId', 'ASH-001');
    setValue('phone', '9876543210');
    setValue('password', 'password123');
    toast.success(t('auth.demoLoaded'));
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col md:flex-row bg-[#F8FAFC] overflow-y-auto overflow-x-hidden font-sans">
      
      {/* Background / Left Branding Section */}
      <div className="relative w-full h-[38vh] md:h-screen md:w-5/12 lg:w-1/2 flex-shrink-0 bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary-dark/95 mix-blend-multiply z-10"></div>
        <img 
          src={authBg} 
          alt="Healthcare Worker Illustration" 
          className="absolute inset-0 w-full h-full object-cover object-top md:object-center z-0 opacity-90"
        />
        
        {/* Decorative elements */}
        <div className="absolute inset-0 z-10 opacity-20 hidden md:block" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, white 1.5px, transparent 1.5px), radial-gradient(circle at 80% 20%, white 1.5px, transparent 1.5px)', backgroundSize: '40px 40px'}} />

        {/* Desktop Left Content Overlay */}
        <div className="hidden md:flex absolute inset-0 z-20 p-12 lg:p-16 flex-col justify-between text-white">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md shadow-lg shadow-black/10">
                <ShieldPlus className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-bold tracking-tight">{t('auth.swasthyaAi')}</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">{t('auth.tagline')}</h2>
            <p className="text-white/90 text-lg leading-relaxed max-w-md font-medium">{t('auth.desc')}</p>
          </div>
          
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              </div>
              <span className="text-white/95 font-semibold text-lg">{t('auth.driftDetection')}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              </div>
              <span className="text-white/95 font-semibold text-lg">{t('auth.riskAssessment')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Card Section */}
      <div className="flex-1 w-full flex items-start md:items-center justify-center md:p-8 -mt-6 md:mt-0 relative z-30">
        
        <motion.div 
          layout
          className="w-full bg-white rounded-t-[32px] md:rounded-[2rem] shadow-[0_-12px_40px_rgba(0,0,0,0.12)] md:shadow-2xl md:shadow-primary/10 md:max-w-md md:border md:border-slate-100 overflow-hidden min-h-[65vh] md:min-h-0 pb-12 md:pb-0"
        >
          {/* Mobile Header (Only visible inside card on mobile) */}
          <div className="flex flex-col items-center pt-8 pb-4 md:hidden">
            <div className="p-3 bg-primary/10 rounded-2xl mb-3">
              <ShieldPlus className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{t('auth.swasthyaAi')}</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">{t('auth.secureAccess')}</p>
          </div>

          {/* Mode Toggle */}
          <div className="flex p-1.5 bg-slate-100/80 gap-1 mx-6 mt-4 md:mt-8 rounded-2xl">
            <button 
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
                mode === 'login' ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t('auth.signIn')}
            </button>
            <button 
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
                mode === 'register' ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t('auth.register')}
            </button>
          </div>

          <div className="p-6 md:p-8 pt-6">
            <div className="hidden md:block mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {mode === 'login' ? t('auth.welcomeBack') : t('auth.joinAsWorker')}
              </h3>
              <p className="text-slate-500 text-sm font-medium">
                {mode === 'login' 
                  ? t('auth.enterCreds') 
                  : t('auth.createAccountDesc')}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
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
                          <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary group-hover:bg-slate-50">
                            {imagePreview ? (
                              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <Camera className="w-7 h-7 text-slate-400 group-hover:text-primary transition-colors" />
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
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-3">{t('auth.profilePhoto')}</span>
                      </div>

                      <InputField 
                        label={t('auth.fullName')} 
                        icon={UsersRound} 
                        placeholder={t('auth.placeholderName')}
                        error={errors.name}
                        {...register("name", { required: t('auth.nameReq') })}
                      />
                    </>
                  )}

                  <InputField 
                    label={t('auth.employeeId')} 
                    icon={IdCard} 
                    placeholder={t('auth.placeholderEmpId')}
                    error={errors.employeeId}
                    {...register("employeeId", { required: t('auth.empIdReq') })}
                  />

                  <InputField 
                    label={t('auth.phoneNum')} 
                    icon={Phone} 
                    type="tel"
                    placeholder={t('auth.placeholderPhone')}
                    error={errors.phone}
                    {...register("phone", { 
                      required: t('auth.phoneReq'),
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: t('auth.phoneInvalid')
                      }
                    })}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                    }}
                  />

                  {mode === 'register' && (
                    <div className="grid grid-cols-2 gap-4">
                      <InputField 
                        label={t('auth.village')} 
                        icon={MapPin} 
                        placeholder={t('auth.placeholderVillage')}
                        error={errors.village}
                        {...register("village", { required: t('auth.villageReq') })}
                      />
                      <InputField 
                        label={t('auth.district')} 
                        icon={Building2} 
                        placeholder={t('auth.placeholderDistrict')}
                        error={errors.district}
                        {...register("district", { required: t('auth.districtReq') })}
                      />
                    </div>
                  )}

                  {mode === 'register' && (
                    <InputField 
                      label={t('auth.email')} 
                      icon={Mail} 
                      type="email"
                      placeholder={t('auth.placeholderEmail')}
                      error={errors.email}
                      {...register("email", {
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: t('auth.emailInvalid')
                        }
                      })}
                    />
                  )}

                  <PasswordField 
                    label={t('auth.password')} 
                    icon={LockKeyhole} 
                    placeholder={t('auth.placeholderPassword')}
                    error={errors.password}
                    {...register("password", { 
                      required: t('auth.passReq'),
                      minLength: { value: 6, message: t('auth.passMin') }
                    })}
                  />

                  {mode === 'register' && (
                    <PasswordField 
                      label={t('auth.confirmPassword')} 
                      icon={LockKeyhole} 
                      placeholder={t('auth.placeholderPassword')}
                      error={errors.confirmPassword}
                      {...register("confirmPassword", { 
                        required: t('auth.passConfirmReq'),
                        validate: value => value === watchPassword || t('auth.passMismatch')
                      })}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 mt-6 rounded-xl bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? t('auth.signIn') : t('auth.createAccount')}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            {mode === 'login' && (
              <div className="mt-8 space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">{t('auth.or')}</span>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => window.location.href = `${API_URL.replace(/\/api$/, '')}/api/auth/google/start`}
                  className="w-full h-12 rounded-xl border-2 border-slate-100 bg-white flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-200 transition-all font-bold text-slate-700 active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M24 12.27c0-.85-.07-1.66-.21-2.46H12v4.66h6.75c-.29 1.56-1.17 2.89-2.48 3.77v3.13h4.02c2.35-2.17 3.71-5.37 3.71-9.1z"/>
                    <path fill="#FBBC05" d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-4.02-3.13c-1.11.75-2.54 1.19-3.91 1.19-3.01 0-5.56-2.03-6.46-4.77H1.41v3.22c2.01 3.99 6.13 6.74 10.59 6.74z"/>
                    <path fill="#34A853" d="M5.54 14.38c-.24-.72-.37-1.49-.37-2.38s.13-1.66.37-2.38V6.41H1.41C.51 8.21 0 10.15 0 12s.51 3.79 1.41 5.59l4.13-3.21z"/>
                    <path fill="#4285F4" d="M12 4.77c1.76 0 3.35.61 4.59 1.8l3.43-3.43C17.95 1.07 15.24 0 12 0 7.54 0 3.42 2.75 1.41 6.41l4.13 3.21c.9-2.74 3.45-4.77 6.46-4.77z"/>
                  </svg>
                  {t('auth.googleSignIn')}
                </button>

                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 mt-6 group hover:bg-primary/10 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{t('auth.demoAccess')}</span>
                  </div>
                  <button 
                    type="button"
                    onClick={loadDemo}
                    className="w-full text-left text-sm font-semibold text-slate-600 group-hover:text-primary transition-colors flex items-center justify-between"
                  >
                    {t('auth.loadDemo')}
                    <CheckCircle2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
