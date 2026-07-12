import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneCall, AlertTriangle, X, ChevronRight, CheckCircle2, User, Activity, Loader2 } from 'lucide-react';
import { emergencyConfig } from '../config/emergencyContacts';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../api';

const EmergencyAssistanceModal = ({ isOpen, onClose, onEmergencySaved }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPatients();
      setStep(1);
      setSelectedPatient(null);
      setSelectedEmergency(null);
      setNotes('');
      setSearch('');
    }
  }, [isOpen]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/patients');
      setPatients(res.data);
    } catch (err) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.healthId && p.healthId.toLowerCase().includes(search.toLowerCase()))
  );

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setStep(2);
  };

  const handleEmergencySelect = (emergency) => {
    setSelectedEmergency(emergency);
    setStep(3);
  };

  const handleCallAndSave = async () => {
    if (!selectedPatient || !selectedEmergency) return;
    
    // Attempt to open dialer on mobile
    window.location.href = `tel:${selectedEmergency.number}`;

    setSaving(true);
    try {
      await api.post('/emergency', {
        patientId: selectedPatient._id,
        emergencyType: selectedEmergency.type,
        emergencyContactCalled: selectedEmergency.service,
        emergencyNumber: selectedEmergency.number,
        notes
      });
      
      toast.success('Emergency Assistance Recorded Successfully.');
      if (onEmergencySaved) {
        onEmergencySaved(); // This should trigger a refetch of Dashboard stats
      }
      onClose();
    } catch (err) {
      toast.error('Failed to save emergency record.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-red-600 p-4 flex justify-between items-center text-white shrink-0">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" /> 
              Emergency Assistance
            </h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-red-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto grow">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3 className="text-lg font-bold text-slate-900 mb-4">1. Select Patient</h3>
                <input 
                  type="text"
                  placeholder="Search by Name or Health ID..."
                  className="w-full p-3 rounded-xl border border-slate-200 mb-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                
                {loading ? (
                  <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {filteredPatients.map(p => (
                      <button 
                        key={p._id}
                        onClick={() => handlePatientSelect(p)}
                        className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-primary hover:bg-primary/5 transition-colors flex justify-between items-center"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-xs text-slate-500">ID: {p.healthId || 'N/A'} • {p.village} • {p.riskLevel} Risk</div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </button>
                    ))}
                    {filteredPatients.length === 0 && (
                      <div className="text-center text-slate-500 py-4">No patients found.</div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center gap-2 mb-4 text-sm font-medium text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <User className="w-4 h-4" /> Patient: <span className="text-slate-900 font-bold">{selectedPatient?.name}</span>
                  <button onClick={() => setStep(1)} className="ml-auto text-primary text-xs hover:underline">Change</button>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-4">2. Select Emergency Type</h3>
                
                <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-2">
                  {emergencyConfig.services.map((em, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleEmergencySelect(em)}
                      className="p-3 text-left rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50 transition-colors"
                    >
                      <div className="font-bold text-slate-800 text-sm">{em.type}</div>
                      <div className="text-xs text-slate-500 mt-1 line-clamp-1">{em.description}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <button onClick={() => setStep(2)} className="mb-4 text-primary text-sm font-medium hover:underline flex items-center">
                  &larr; Back to emergency types
                </button>
                
                <div className="bg-red-50 rounded-2xl p-6 border border-red-100 text-center mb-6">
                  <h3 className="text-red-900 font-bold mb-1">{selectedEmergency?.service}</h3>
                  <div className="text-4xl font-black text-red-600 mb-2">{selectedEmergency?.number}</div>
                  <p className="text-sm text-red-700">{selectedEmergency?.description}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Emergency Notes (Optional)</label>
                  <textarea 
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Describe the patient's current condition..."
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={onClose}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCallAndSave}
                    disabled={saving}
                    className="flex-[2] py-3 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex justify-center items-center gap-2"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <PhoneCall className="w-5 h-5" />}
                    CALL NOW & RECORD
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EmergencyAssistanceModal;
