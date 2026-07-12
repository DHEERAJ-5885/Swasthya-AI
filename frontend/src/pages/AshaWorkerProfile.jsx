import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Loader2, LogOut, Edit2, Check, Camera, Shield, Bell, Globe, User, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';

export default function AshaWorkerProfile() {
  const { t } = useTranslation();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get('/auth/profile');
      // Initialize defaults for nested objects if missing
      const data = res.data;
      if (!data.notifications) {
        data.notifications = { emergencyAlerts: true, followUpReminders: true, communityNotifications: true };
      }
      setWorker(data);
      setEditData(data);
      setLoading(false);
    } catch {
      toast.error(t('profile.failedLoad'));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (worker?.language && worker.language !== language) {
      setLanguage(worker.language);
    }
  }, [worker, language, setLanguage]);

  const handleSaveProfile = async () => {
    if (editData.phone && !/^\d{10}$/.test(editData.phone)) {
      toast.error(t('profile.phoneErr'));
      return;
    }
    
    try {
      setLoading(true);
      const payload = { ...editData };
      if (newPassword) payload.password = newPassword;
      if (photoPreview) payload.profilePhoto = photoPreview;

      const res = await api.put('/auth/profile', payload);
      toast.success(t('profile.updateSuccess'));
      
      const updatedWorker = res.data;
      if (!updatedWorker.notifications) {
        updatedWorker.notifications = payload.notifications;
      }
      setWorker(updatedWorker);
      setIsEditing(false);
      setNewPassword('');
      setLoading(false);
    } catch (err) {
      toast.error(err.response?.data?.error || t('profile.updateFail'));
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('worker');
    navigate('/login');
  };

  const handleLanguageChange = async (value) => {
    setLanguage(value);
    setEditData(prev => ({ ...prev, language: value }));
    try {
      await api.put('/auth/profile', { language: value });
      setWorker(prev => ({ ...prev, language: value }));
      toast.success(t('profile.langUpdated'));
    } catch (err) {
      toast.error(t('profile.langFail'));
    }
  };

  const toggleNotification = async (key) => {
    const newNotifications = { 
      ...worker.notifications, 
      [key]: !worker.notifications[key] 
    };
    
    setWorker(prev => ({ ...prev, notifications: newNotifications }));
    setEditData(prev => ({ ...prev, notifications: newNotifications }));
    
    try {
      await api.put('/auth/profile', { notifications: newNotifications });
      toast.success(t('profile.notifSaved'));
    } catch (err) {
      toast.error(t('profile.notifFail'));
      // Revert on fail
      setWorker(prev => ({ 
        ...prev, 
        notifications: { ...prev.notifications, [key]: !newNotifications[key] } 
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto w-full bg-slate-50 pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Profile Header */}
        <Card className="p-6 md:p-8 overflow-hidden relative border-none shadow-sm bg-white rounded-2xl">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/10 to-indigo-50/50"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 pt-12">
            
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100 flex items-center justify-center shrink-0">
                {(photoPreview || worker.profilePhoto) ? (
                  <img src={photoPreview || worker.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-primary">{worker.name?.charAt(0)}</span>
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-2 right-2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-hover transition-colors">
                  <Camera className="w-5 h-5" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{worker.name}</h1>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full w-max mx-auto md:mx-0 flex items-center gap-1">
                  <Check className="w-3 h-3" /> {t('profile.active')}
                </span>
              </div>
              <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2 mb-1">
                <Shield className="w-4 h-4" /> {t('profile.id')}: {worker.employeeId}
              </p>
              <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2">
                <MapPin className="w-4 h-4" /> {worker.village} | {t('profile.phc')}: {worker.assignedPHC || t('profile.unassigned')}
              </p>
            </div>

            <div className="shrink-0 mt-4 md:mt-0">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="rounded-xl px-6">
                  <Edit2 className="w-4 h-4 mr-2" /> {t('profile.editProfile')}
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => { setIsEditing(false); setEditData(worker); }} className="rounded-xl border-slate-200 text-slate-700">
                    {t('profile.cancel')}
                  </Button>
                  <Button onClick={handleSaveProfile} className="rounded-xl px-6 bg-emerald-600 hover:bg-emerald-700">
                    <Check className="w-4 h-4 mr-2" /> {t('profile.save')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="p-6 border-none shadow-sm rounded-2xl bg-white">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> {t('profile.personalInfo')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t('profile.fullName')}</label>
                  {isEditing ? (
                    <input type="text" value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  ) : (
                    <p className="text-slate-900 font-medium bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">{worker.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t('profile.phoneNumber')}</label>
                  {isEditing ? (
                    <input type="tel" value={editData.phone || ''} onChange={e => setEditData({...editData, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  ) : (
                    <p className="text-slate-900 font-medium bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">{worker.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t('profile.emailAddress')}</label>
                  {isEditing ? (
                    <input type="email" value={editData.email || ''} onChange={e => setEditData({...editData, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  ) : (
                    <p className="text-slate-900 font-medium bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">{worker.email || t('profile.notProvided')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t('profile.gender')}</label>
                  {isEditing ? (
                    <select value={editData.gender || ''} onChange={e => setEditData({...editData, gender: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                      <option value="">{t('profile.selectGender')}</option>
                      <option value="Female">{t('profile.female')}</option>
                      <option value="Male">{t('profile.male')}</option>
                      <option value="Other">{t('profile.other')}</option>
                    </select>
                  ) : (
                    <p className="text-slate-900 font-medium bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">{worker.gender || t('profile.notSpecified')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t('profile.dob')}</label>
                  {isEditing ? (
                    <input type="date" value={editData.dob ? editData.dob.split('T')[0] : ''} onChange={e => setEditData({...editData, dob: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  ) : (
                    <p className="text-slate-900 font-medium bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">{worker.dob ? new Date(worker.dob).toLocaleDateString() : t('profile.notProvided')}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t('profile.address')}</label>
                  {isEditing ? (
                    <textarea value={editData.address || ''} onChange={e => setEditData({...editData, address: e.target.value})} rows="2" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none" />
                  ) : (
                    <p className="text-slate-900 font-medium bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 min-h-[3rem]">{worker.address || t('profile.notProvided')}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Work Information */}
            <Card className="p-6 border-none shadow-sm rounded-2xl bg-white">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" /> {t('profile.workInfo')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">{t('profile.workerId')}</p>
                  <p className="text-slate-900 font-medium">{worker.employeeId}</p>
                </div>
                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">{t('profile.assignedVillage')}</p>
                  <p className="text-slate-900 font-medium">{worker.village}</p>
                </div>
                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">{t('profile.assignedPHC')}</p>
                  <p className="text-slate-900 font-medium">{worker.assignedPHC || t('profile.unassigned')}</p>
                </div>
                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">{t('profile.joiningDate')}</p>
                  <p className="text-slate-900 font-medium">{new Date(worker.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            
            {/* Language Settings */}
            <Card className="p-6 border-none shadow-sm rounded-2xl bg-white">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" /> {t('profile.language')}
              </h2>
              <p className="text-sm text-slate-500 mb-4">{t('profile.langDesc')}</p>
              <div className="space-y-3">
                {['English', 'Hindi', 'Telugu'].map(lang => (
                  <button 
                    key={lang} 
                    onClick={() => handleLanguageChange(lang)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${worker.language === lang ? 'bg-primary/5 border-primary text-primary font-bold shadow-sm' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    {lang}
                    {worker.language === lang && <Check className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </Card>

            {/* Notification Settings */}
            <Card className="p-6 border-none shadow-sm rounded-2xl bg-white">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" /> {t('profile.notifications')}
              </h2>
              <div className="space-y-5">
                {[
                  { key: 'emergencyAlerts', label: t('profile.emergAlerts'), desc: t('profile.emergAlertsDesc') },
                  { key: 'followUpReminders', label: t('profile.followUpReminders'), desc: t('profile.followUpRemindersDesc') },
                  { key: 'communityNotifications', label: t('profile.commNotifs'), desc: t('profile.commNotifsDesc') }
                ].map(item => (
                  <div key={item.key} className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => toggleNotification(item.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${worker.notifications?.[item.key] ? 'bg-primary' : 'bg-slate-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${worker.notifications?.[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Account Settings */}
            <Card className="p-6 border-none shadow-sm rounded-2xl bg-white">
              <h2 className="text-lg font-bold text-slate-900 mb-4">{t('profile.account')}</h2>
              <div className="space-y-4">
                {isEditing ? (
                  <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t('profile.changePassword')}</label>
                    <input 
                      type="password" 
                      placeholder={t('profile.enterNewPassword')}
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white" 
                    />
                    <p className="text-xs text-slate-500 mt-2">{t('profile.leaveBlank')}</p>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full justify-center rounded-xl border-slate-200 text-slate-700 h-11 hover:bg-slate-50">
                    {t('profile.changePassword')}
                  </Button>
                )}
                
                <Button onClick={handleLogout} className="w-full justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold h-11 border-0">
                  <LogOut className="w-4 h-4 mr-2" /> {t('profile.signOut')}
                </Button>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
