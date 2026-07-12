import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import api from '../api';

export default function ScheduleFollowUp() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [priority, setPriority] = useState('Medium');
  const [riskLevel, setRiskLevel] = useState('Medium Risk');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!date) {
      toast.error(t('schedule.selectDateErr'));
      return;
    }
    
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error(t('schedule.dateFutureErr'));
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/followups', { 
        patientId: id, 
        date: new Date(date),
        time,
        priority, 
        riskLevel,
        reason,
        notes 
      });
      toast.success(t('schedule.success'));
      navigate(`/patients/${id}`);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || t('schedule.error');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-white pb-20">
      <div className="px-6 py-5 flex items-center justify-between sticky top-0 bg-white z-10 border-b border-slate-50">
        <button onClick={() => navigate(-1)} className="text-slate-800">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-semibold text-slate-900 absolute left-1/2 -translate-x-1/2">{t('schedule.title')}</h1>
        <div className="w-6"></div> {/* Spacer for centering */}
      </div>

      <div className="px-6 pt-6 max-w-7xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{t('schedule.selectDate')}</label>
              <div className="relative">
                <input 
                  type="date" 
                  required 
                  className="w-full h-12 px-4 pr-12 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-slate-900 appearance-none" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                />
                <Calendar className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{t('schedule.timeOptional')}</label>
              <input 
                type="time" 
                className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-slate-900" 
                value={time} 
                onChange={e => setTime(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{t('schedule.riskLevel')}</label>
              <select 
                className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none bg-white text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
                value={riskLevel} 
                onChange={e => setRiskLevel(e.target.value)}
              >
                <option value="Low Risk">{t('schedule.lowRisk')}</option>
                <option value="Medium Risk">{t('schedule.mediumRisk')}</option>
                <option value="High Risk">{t('schedule.highRisk')}</option>
                <option value="Critical">{t('schedule.critical')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{t('schedule.priority')}</label>
              <select 
                className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none bg-white text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
                value={priority} 
                onChange={e => setPriority(e.target.value)}
              >
                <option value="High">{t('schedule.high')}</option>
                <option value="Medium">{t('schedule.medium')}</option>
                <option value="Low">{t('schedule.low')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{t('schedule.reason')}</label>
            <input 
              type="text" 
              required
              className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-slate-900" 
              value={reason} 
              onChange={e => setReason(e.target.value)} 
              placeholder={t('schedule.reasonPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{t('schedule.notes')}</label>
            <textarea 
              className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-slate-900 resize-none h-32" 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder={t('schedule.notesPlaceholder')}
            />
          </div>

          <Button type="submit" className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/30 mt-8" disabled={loading}>
            {loading ? t('schedule.scheduling') : t('schedule.confirm')}
          </Button>
        </form>
      </div>
    </div>
  );
}
