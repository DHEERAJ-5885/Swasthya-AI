import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

export default function ScheduleFollowUp() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState('High');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!date) {
      toast.error('Please select a follow-up date');
      return;
    }
    
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error('Follow-up date must be in the future');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/followups', { 
        patientId: id, 
        date: new Date(date),
        priority, 
        notes 
      });
      toast.success('Follow-up scheduled successfully!');
      navigate(`/patients/${id}`);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || 'Failed to schedule follow-up.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="px-6 py-5 flex items-center justify-between sticky top-0 bg-white z-10 border-b border-slate-50">
        <button onClick={() => navigate(-1)} className="text-slate-800">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-semibold text-slate-900 absolute left-1/2 -translate-x-1/2">Schedule Follow-up</h1>
        <div className="w-6"></div> {/* Spacer for centering */}
      </div>

      <div className="px-6 pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Select Date</label>
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
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Priority</label>
            <select 
              className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none bg-white text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
              value={priority} 
              onChange={e => setPriority(e.target.value)}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Add Notes (Optional)</label>
            <textarea 
              className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-slate-900 resize-none h-32" 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder="Enter notes..."
            />
          </div>

          <Button type="submit" className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/30 mt-8" disabled={loading}>
            {loading ? 'Scheduling...' : 'Confirm Follow-up'}
          </Button>
        </form>
      </div>
    </div>
  );
}
