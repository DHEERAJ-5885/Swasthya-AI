import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, ExternalLink, Copy, CheckCircle2, ChevronRight, FileText, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function VerificationHistoryModal({ isOpen, onClose, patient, screenings }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedVerification, setSelectedVerification] = useState(null);

  if (!isOpen) return null;

  const verifiedScreenings = screenings.filter(s => s.verification && s.verification.txHash).reverse(); // Chronological (newest first usually, but reverse if the input was oldest first)
  // Ensure we sort by date descending
  const sortedScreenings = verifiedScreenings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatHash = (hash) => hash ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 7)}` : '';

  const renderDetails = () => (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -50, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full bg-slate-50"
    >
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <button onClick={() => setSelectedVerification(null)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors text-slate-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-bold text-slate-900">Verification Details</h2>
        <div className="w-9 h-9" /> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Core Verification Banner */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-green-800 text-lg">Verified on Cardano</h3>
          <p className="text-xs text-green-700 font-medium mt-1">Tamper-Proof Integrity Status</p>
        </div>

        {/* Record Info */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4 shadow-[0_4px_12px_rgb(0,0,0,0.02)]">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Screening Record</h4>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Patient Name</span>
            <span className="font-bold text-slate-900">{patient.name}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Health ID</span>
            <span className="font-bold text-slate-900">{patient.healthId || 'SWA-N/A'}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Screening ID</span>
            <span className="font-bold text-slate-900 font-mono text-xs">{selectedVerification._id.substring(0,8).toUpperCase()}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Screening Date</span>
            <span className="font-bold text-slate-900">{new Date(selectedVerification.createdAt).toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Risk Level</span>
            <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${
              selectedVerification.result?.riskLevel === 'High Risk' ? 'bg-red-50 text-red-600' :
              selectedVerification.result?.riskLevel === 'Medium Risk' ? 'bg-orange-50 text-orange-600' :
              'bg-green-50 text-green-600'
            }`}>
              {selectedVerification.result?.riskLevel || 'Unknown'}
            </span>
          </div>
        </div>

        {/* Blockchain Info */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4 shadow-[0_4px_12px_rgb(0,0,0,0.02)]">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
            Blockchain Ledger Data
          </h4>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">Network</span>
            <span className="text-sm font-bold text-slate-900">Cardano {selectedVerification.verification.blockchainNetwork}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">Verification Timestamp</span>
            <span className="text-sm font-bold text-slate-900">{new Date(selectedVerification.verification.anchoredAt || selectedVerification.verification.generatedAt).toLocaleString()}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">Transaction Hash</span>
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-xs font-mono text-slate-700 break-all">{selectedVerification.verification.txHash}</span>
              <button onClick={() => handleCopy(selectedVerification.verification.txHash)} className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 transition-colors shrink-0">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 space-y-3 pb-8">
          <button 
            onClick={() => navigate(`/result/${selectedVerification._id}`)} 
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-white border-2 border-primary text-primary hover:bg-slate-50 text-sm font-bold rounded-xl transition-all shadow-sm"
          >
            View Screening Report <FileText className="w-4 h-4" />
          </button>
          
          {selectedVerification.verification.txHash && (
            <a 
              href={`https://${(selectedVerification.verification.blockchainNetwork || 'Preprod').toLowerCase()}.cardanoscan.io/transaction/${selectedVerification.verification.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary/30"
            >
              Verify on Cardano Explorer <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderList = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-slate-50"
    >
      <div className="bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">Verification History</h2>
        <button onClick={onClose} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedScreenings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 px-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 mb-2">No Verified Records</h3>
            <p className="text-xs text-slate-500 max-w-[250px]">
              No blockchain verified healthcare records available.<br/><br/>
              Complete a screening to generate the first blockchain verification.
            </p>
          </div>
        ) : (
          sortedScreenings.map((s, index) => {
            const screeningNumber = sortedScreenings.length - index;
            const riskLevel = s.result?.riskLevel || 'Unknown';
            const riskColor = riskLevel === 'High Risk' ? 'bg-red-50 text-red-600 border-red-100' :
                              riskLevel === 'Medium Risk' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                              'bg-green-50 text-green-600 border-green-100';

            return (
              <div key={s._id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_4px_12px_rgb(0,0,0,0.02)] transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Screening #{screeningNumber}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{new Date(s.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${riskColor}`}>
                    {riskLevel}
                  </span>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-3 mb-3 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-bold text-slate-700">Verified</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {formatHash(s.verification.txHash)}
                    </span>
                    <span>{new Date(s.verification.anchoredAt || s.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedVerification(s)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" /> View Details
                </button>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl h-[85vh] sm:h-[80vh] overflow-hidden flex flex-col shadow-2xl relative"
      >
        <AnimatePresence mode="wait">
          {selectedVerification ? renderDetails() : renderList()}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
