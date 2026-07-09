import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Mic, Camera, ScanLine } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import MobileHeader from '../components/MobileHeader';
import { useTranslation } from 'react-i18next';

export default function AddPatient() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', phone: '', age: '', gender: 'Female', 
    village: '', familyId: '', occupation: '',
    chronicConditions: '', pregnancyStatus: 'No', disabilityStatus: 'None',
    photoUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const photoInputRef = useRef(null);
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error(t('form.errName'));
      return;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      toast.error(t('form.errPhone'));
      return;
    }
    if (!formData.age || formData.age < 0 || formData.age > 120) {
      toast.error(t('form.errAge'));
      return;
    }
    if (!formData.village.trim()) {
      toast.error(t('form.errVillage'));
      return;
    }
    if (!formData.familyId.trim()) {
      toast.error(t('form.errFamilyId'));
      return;
    }

    setLoading(true);
    
    const payload = {
      ...formData,
      healthId: `SWA-${Math.floor(1000 + Math.random() * 9000)}`,
      chronicConditions: formData.chronicConditions.split(',').map(c => c.trim()).filter(Boolean)
    };

    try {
      const res = await api.post('/patients', payload);
      toast.success(t('form.successCreated'));
      navigate(`/patients/${res.data._id}`);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || t('form.errFailed');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <MobileHeader title={t('button.addPatient')} />
      <div className="hidden md:flex px-6 py-5 items-center justify-between sticky top-0 bg-white z-10 border-b border-slate-50">
        <button onClick={() => navigate(-1)} className="text-slate-800">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-semibold text-slate-900 absolute left-1/2 -translate-x-1/2">{t('button.addPatient')}</h1>
        <div className="w-6"></div> {/* Spacer for centering */}
      </div>

      <div className="px-6 pt-4 pb-4 border-b border-slate-50 flex gap-3 justify-center">
        <button type="button" onClick={() => navigate('/patients')} className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-[10px] font-bold">
          <Mic className="w-4 h-4" /> {t('form.voiceIntake')}
        </button>
        <button type="button" onClick={() => navigate('/patients')} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold">
          <ScanLine className="w-4 h-4" /> {t('dashboard.scanCard')}
        </button>
        <button type="button" onClick={() => photoInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold">
          <Camera className="w-4 h-4" /> {t('form.uploadPhoto')}
        </button>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              setFormData((prev) => ({ ...prev, photoUrl: reader.result }));
            };
            reader.readAsDataURL(file);
          }}
        />
      </div>

      <div className="px-6 pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{t('form.fullName')}</label>
            <input type="text" required className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-slate-900" 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{t('form.phoneNumber')}</label>
            <input type="tel" required className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-slate-900" 
              value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>

          {formData.photoUrl && (
            <div className="flex items-center gap-4">
              <img src={formData.photoUrl} alt="Patient" className="w-16 h-16 rounded-full object-cover border border-slate-200" />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, photoUrl: '' })}
                className="text-xs font-semibold text-red-600"
              >
                {t('form.removePhoto')}
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{t('form.age')}</label>
              <input type="number" required className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-slate-900" 
                value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{t('form.gender')}</label>
              <select className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none bg-white text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
                value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option value="Female">{t('patients.female')}</option>
                <option value="Male">{t('form.male')}</option>
                <option value="Other">{t('form.other')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{t('form.village')}</label>
              <input type="text" required className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-slate-900" 
                value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{t('form.familyId')}</label>
              <input type="text" required className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-slate-900" 
                value={formData.familyId} onChange={e => setFormData({...formData, familyId: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{t('form.occupation')}</label>
            <input type="text" className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-slate-900" 
              value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{t('form.chronicConditions')}</label>
            <input type="text" className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-slate-900" 
              value={formData.chronicConditions} placeholder={t('form.chronicPlaceholder')} onChange={e => setFormData({...formData, chronicConditions: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{t('form.pregnancy')}</label>
              <select className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none bg-white text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
                value={formData.pregnancyStatus} onChange={e => setFormData({...formData, pregnancyStatus: e.target.value})}>
                <option value="No">{t('form.no')}</option>
                <option value="Yes">{t('form.yes')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{t('form.disability')}</label>
              <input type="text" className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-slate-900" 
                value={formData.disabilityStatus} onChange={e => setFormData({...formData, disabilityStatus: e.target.value})} />
            </div>
          </div>

          <Button type="submit" className="w-full mt-8 h-12 text-base font-semibold shadow-lg shadow-primary/30" disabled={loading}>
            {loading ? t('form.savingToDb') : t('form.savePatient')}
          </Button>
        </form>
      </div>
    </div>
  );
}
