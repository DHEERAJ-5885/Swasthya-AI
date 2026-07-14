import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Search, Filter, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import MobileHeader from '../components/MobileHeader';
import { useTranslation } from 'react-i18next';

import { getCachedPatients, cachePatients } from '../utils/offlineStore';

export default function PatientList() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.onLine) {
      api.get('/patients').then(async res => {
        const cached = await getCachedPatients();
        const offlinePatients = cached.filter(p => p._isOffline);
        
        const merged = [...offlinePatients, ...res.data];
        setPatients(merged);
        cachePatients(res.data);
        setLoading(false);
      }).catch(async err => {
        console.error(err);
        toast.error(t('patients.failedLoad') || 'Failed to load live data, showing offline cache');
        const cached = await getCachedPatients();
        if (cached && cached.length > 0) setPatients(cached);
        setLoading(false);
      });
    } else {
      getCachedPatients().then(cached => {
        if (cached && cached.length > 0) setPatients(cached);
        setLoading(false);
      });
    }
  }, [t]);

  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const riskColors = {
    'High Risk': 'text-red-500',
    'Medium Risk': 'text-orange-500',
    'Low Risk': 'text-green-500'
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-slate-50 pb-24 md:pb-6">
      <MobileHeader title={t('nav.patients')} />
      {/* Search Bar Area */}
      <div className="bg-slate-50 px-6 md:px-10 py-5 sticky md:top-0 top-[60px] z-10">
        <div className="relative flex items-center max-w-3xl">
          <Search className="absolute left-4 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder={t('patients.searchPatients')} 
            className="w-full h-12 pl-12 pr-12 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white shadow-[0_4px_12px_rgb(0,0,0,0.03)] text-sm font-medium"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="absolute right-4 text-slate-400 hover:text-slate-600">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-6 md:px-10 w-full max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(patient => (
          <div 
            key={patient._id} 
            className="bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center justify-between cursor-pointer hover:border-primary/30 transition-colors"
            onClick={() => navigate(`/patients/${patient._id}`)}
          >
            <div className="flex items-center gap-3">
              {patient.photoUrl ? (
                <img 
                  src={patient.photoUrl}
                  alt={patient.name}
                  className="w-12 h-12 rounded-full bg-slate-100 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700">
                  {patient.name?.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-slate-900">{patient.name}</h3>
                <p className="text-[10px] text-slate-500 font-medium">{patient.age} {t('patients.years')}, {patient.gender === 'Female' ? t('patients.female') : patient.gender || t('patients.female')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-right">
              <div>
                <p className={`text-[10px] font-bold ${riskColors[patient.risk] || 'text-slate-500'} mb-0.5`}>
                  {patient.risk === 'High Risk' ? t('patients.highRisk') : patient.risk === 'Medium Risk' ? t('patients.mediumRisk') : patient.risk === 'Low Risk' ? t('patients.lowRisk') : `${patient.risk || t('patients.unknown')} ${t('patients.risk')}`}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">{patient.date}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
           <div className="text-center py-10 text-slate-500 text-sm font-medium">{t('patients.noPatients')}</div>
        )}
        </div>
        )}
      </div>
    </div>
  );
}
