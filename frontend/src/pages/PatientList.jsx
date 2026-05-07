import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Search, Filter, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

export default function PatientList() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt fetch
    api.get('/patients').then(res => {
      setPatients(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      toast.error('Failed to load patients. Using cached data if available.');
      setLoading(false);
    });
  }, []);

  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const riskColors = {
    High: 'text-red-500',
    Medium: 'text-orange-500',
    Low: 'text-green-500'
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Search Bar Area */}
      <div className="bg-slate-50 px-6 py-5 sticky top-0 z-10">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search patients..." 
            className="w-full h-12 pl-12 pr-12 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white shadow-[0_4px_12px_rgb(0,0,0,0.03)] text-sm font-medium"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="absolute right-4 text-slate-400 hover:text-slate-600">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-6 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {filtered.map(patient => (
          <div 
            key={patient._id} 
            className="bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center justify-between cursor-pointer hover:border-primary/30 transition-colors"
            onClick={() => navigate(`/patients/${patient._id}`)}
          >
            <div className="flex items-center gap-3">
              <img 
                src={patient.avatar || `https://i.pravatar.cc/150?u=${patient._id}`} 
                alt={patient.name} 
                className="w-12 h-12 rounded-full bg-slate-100 object-cover" 
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900">{patient.name}</h3>
                <p className="text-[10px] text-slate-500 font-medium">{patient.age} Years, {patient.gender || 'Female'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-right">
              <div>
                <p className={`text-[10px] font-bold ${riskColors[patient.risk] || 'text-slate-500'} mb-0.5`}>{patient.risk} Risk</p>
                <p className="text-[10px] text-slate-400 font-medium">{patient.date}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
           <div className="text-center py-10 text-slate-500 text-sm font-medium">No patients found.</div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
