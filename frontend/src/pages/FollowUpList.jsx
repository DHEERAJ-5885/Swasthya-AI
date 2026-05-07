import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Calendar, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

export default function FollowUpList() {
  const navigate = useNavigate();
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const fetchFollowUps = async () => {
    try {
      const res = await api.get('/followups');
      setFollowUps(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load follow-ups.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.put(`/followups/${id}/complete`);
      toast.success('Follow-up marked as completed!');
      fetchFollowUps();
    } catch (err) {
      console.error(err);
      toast.error('Failed to complete follow-up.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="px-6 py-5 flex items-center justify-between sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
        <button onClick={() => navigate(-1)} className="text-slate-800">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-semibold text-slate-900 absolute left-1/2 -translate-x-1/2">Pending Follow-ups</h1>
        <div className="w-6"></div>
      </div>

      <div className="px-6 pt-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : followUps.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm font-medium">No pending follow-ups.</div>
        ) : (
          followUps.map(f => (
            <div key={f._id} className="bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${f.priority === 'High' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{f.patientId?.name || 'Unknown Patient'}</h3>
                  <p className="text-xs text-slate-500 mb-1">{new Date(f.date).toLocaleDateString()}</p>
                  <p className={`text-[10px] font-bold ${f.priority === 'High' ? 'text-red-500' : 'text-orange-500'}`}>{f.priority} Priority</p>
                </div>
              </div>
              <button 
                onClick={() => handleComplete(f._id)}
                className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
