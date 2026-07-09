import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Loader2, LogOut, Edit2, Users, Activity, CheckCircle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import LanguageSelector from '../components/LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';

export default function AshaWorkerProfile() {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const navigate = useNavigate();
  const { language, setLanguage, getLanguageLabel } = useLanguage();
  const { t } = useTranslation();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (worker?.language && worker.language !== language) {
      setLanguage(worker.language);
    }
  }, [worker, language, setLanguage]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setWorker(res.data);
      setEditData(res.data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load profile');
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    // Validation
    if (editData.phone && !/^\d{10}$/.test(editData.phone)) {
      toast.error(t('profile.phoneInvalid'));
      return;
    }
    
    try {
      setLoading(true);
      const payload = { ...editData };
      if (newPassword) payload.password = newPassword;
      // In a real app, handle photo upload to S3/Cloudinary here
      if (photoPreview) payload.profilePhoto = photoPreview; // Mocking photo save

      await api.put('/auth/profile', payload);
      toast.success(t('profile.profileSuccess'));
      setWorker(payload);
      setIsEditing(false);
      setNewPassword('');
      setLoading(false);
    } catch (err) {
      toast.error(err.response?.data?.error || t('profile.profileFail'));
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
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

  const handleLanguageChange = (value) => {
    setLanguage(value);
    setEditData(prev => ({ ...prev, language: value }));
  };
  
  const handleClaimPatients = async () => {
    try {
      const res = await api.post('/patients/assign-existing');
      toast.success(t('profile.claimSuccess', { count: res.data.updated }));
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.error || t('profile.claimFail'));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
        <p className="text-slate-600">{t('profile.profileLoading')}</p>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="p-4 text-center">
        <p className="text-slate-600">{t('profile.profileNotFound')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 rounded-b-3xl">
        <div className="flex items-center gap-4 mb-4 relative">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden relative group">
            {photoPreview || worker.profilePhoto ? (
              <img src={photoPreview || worker.profilePhoto} alt={worker.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-2xl font-bold text-white">{worker.name.charAt(0)}</div>
            )}
            {isEditing && (
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit2 className="w-5 h-5 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            )}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editData.name || ''}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full text-xl font-bold bg-white/20 rounded px-2 py-1 text-white placeholder-white/70"
                placeholder="Full name"
              />
            ) : (
              <h1 className="text-xl font-bold">{worker.name}</h1>
            )}
            <p className="text-white/80 text-sm">{worker.employeeId}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 px-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-xs font-semibold text-slate-600">{t('profile.totalPatients')}</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{worker.stats?.totalPatients || 0}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-red-500" />
            <span className="text-xs font-semibold text-slate-600">{t('profile.highRisk')}</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{worker.stats?.highRiskPatients || 0}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-xs font-semibold text-slate-600">{t('profile.followUpRate')}</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{worker.stats?.followUpCompletionRate || 0}%</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span className="text-xs font-semibold text-slate-600">{t('profile.screensThisMonth')}</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{worker.stats?.screensThisMonth || 0}</p>
        </Card>
      </div>

      {/* Profile Details */}
      <div className="px-4 space-y-4">
        {isEditing ? (
          <Card className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">{t('profile.phone')}</label>
              <input
                type="tel"
                value={editData.phone || ''}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">{t('profile.email')}</label>
              <input
                type="email"
                value={editData.email || ''}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">{t('profile.village')}</label>
              <input
                type="text"
                value={editData.village || ''}
                onChange={(e) => setEditData({ ...editData, village: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">{t('profile.language')}</label>
              <select
                value={editData.language || language || 'en'}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="te">Telugu</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">{t('profile.newPassword')}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('profile.leaveBlank')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </Card>
        ) : (
          <Card className="p-5 space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">{t('profile.phone')}</p>
              <p className="text-slate-900 font-medium">{worker.phone || t('profile.notSet')}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">{t('profile.email')}</p>
              <p className="text-slate-900 font-medium">{worker.email || t('profile.notSet')}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">{t('profile.village')}</p>
              <p className="text-slate-900 font-medium">{worker.village || t('profile.notSet')}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">{t('profile.language')}</p>
              <p className="text-slate-900 font-medium">{getLanguageLabel(worker.language || language)}</p>
            </div>
          </Card>
        )}
      </div>

      {/* Enrolled Patients */}
      <div className="px-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">{t('profile.enrolledPatients')}</p>
              <p className="text-sm font-medium text-slate-900">{worker.stats?.totalPatients || 0} {t('profile.patients')}</p>
            </div>
            <div>
              <button onClick={() => navigate('/patients')} className="text-sm font-semibold text-primary">{t('profile.viewAll')}</button>
            </div>
          </div>

          {worker.assignedPatients && worker.assignedPatients.length > 0 ? (
            <div className="space-y-3">
              {worker.assignedPatients.slice(0, 6).map(p => (
                <div key={p._id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.familyId || ''} • {p.village || ''}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${p.risk === 'High' || p.risk === 'Critical' ? 'text-red-600' : p.risk === 'Medium' ? 'text-orange-500' : 'text-green-600'}`}>{p.risk} Risk</p>
                    <p className="text-[10px] text-slate-400">{p.lastScreenedAt ? new Date(p.lastScreenedAt).toLocaleDateString() : t('profile.neverScreened')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500">{t('profile.noEnrolledPatients')}</div>
          )}
        </Card>
      </div>

      {/* Settings */}
      <div className="px-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">{t('profile.settings')}</p>
            <p className="text-sm font-semibold text-slate-900">{t('profile.appLanguage')}</p>
          </div>
          <LanguageSelector
            label={t('profile.language')}
            showLabel={false}
            selectClassName="bg-white"
            onChange={handleLanguageChange}
          />
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-4 space-y-3">
        {isEditing ? (
          <>
            <Button onClick={handleSaveProfile} className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {t('profile.saving')}
                </>
              ) : (
                t('profile.saveChanges')
              )}
            </Button>
            <button
              onClick={() => setIsEditing(false)}
              className="w-full py-3 px-4 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
            >
              {t('profile.cancel')}
            </button>
          </>
        ) : (
          <>
            <Button
              variant="secondary"
              onClick={() => setIsEditing(true)}
              className="w-full flex items-center gap-2 justify-center"
            >
              <Edit2 className="w-4 h-4" />
              {t('profile.editProfile')}
            </Button>
            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 flex items-center gap-2 justify-center"
            >
              <LogOut className="w-4 h-4" />
              {t('profile.logout')}
            </button>
          </>
        )}
        <Button onClick={handleClaimPatients} variant="secondary" className="w-full">
          {t('profile.claimPatients')}
        </Button>
      </div>
    </div>
  );
}
