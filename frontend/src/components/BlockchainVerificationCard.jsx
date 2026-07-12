import React, { useEffect, useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, CheckCircle2, Copy, ExternalLink, Loader2 } from 'lucide-react';
import api from '../api';

export default function BlockchainVerificationCard({ initialVerification, screeningId }) {
  const [verification, setVerification] = useState(initialVerification);

  useEffect(() => {
    let intervalId;
    
    // Polling logic if status is PENDING or READY_FOR_BLOCKCHAIN
    if (screeningId && verification && 
       (verification.status === 'PENDING' || verification.status === 'READY_FOR_BLOCKCHAIN')) {
      
      intervalId = setInterval(async () => {
        try {
          const res = await api.get(`/screenings/${screeningId}/verification`);
          if (res.data && res.data.verification) {
            setVerification(res.data.verification);
            
            // Stop polling if we reached a final state
            if (res.data.verification.status === 'VERIFIED' || res.data.verification.status === 'FAILED') {
              clearInterval(intervalId);
            }
          }
        } catch (err) {
          console.error("Failed to fetch verification status", err);
        }
      }, 5000); // Check every 5 seconds
    }
    
    // Stop polling after 2 minutes to prevent aggressive polling if something gets stuck
    const timeoutId = setTimeout(() => {
      if (intervalId) clearInterval(intervalId);
    }, 120000);

    return () => {
      if (intervalId) clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [screeningId, verification?.status]);

  if (!verification) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusUI = () => {
    switch (verification.status) {
      case 'READY_FOR_BLOCKCHAIN':
        return {
          icon: <Shield className="w-5 h-5 text-blue-500" />,
          title: "Ready for Cardano",
          bgColor: "bg-blue-50",
          textColor: "text-blue-700",
          borderColor: "border-blue-200"
        };
      case 'PENDING':
        return {
          icon: <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />,
          title: "Anchoring to Cardano...",
          bgColor: "bg-orange-50",
          textColor: "text-orange-700",
          borderColor: "border-orange-200"
        };
      case 'VERIFIED':
        return {
          icon: <ShieldCheck className="w-5 h-5 text-green-600" />,
          title: "Verified on Cardano",
          bgColor: "bg-green-50",
          textColor: "text-green-800",
          borderColor: "border-green-200"
        };
      case 'FAILED':
        return {
          icon: <ShieldAlert className="w-5 h-5 text-red-500" />,
          title: "Blockchain verification failed",
          bgColor: "bg-red-50",
          textColor: "text-red-700",
          borderColor: "border-red-200"
        };
      default:
        return {
          icon: <Shield className="w-5 h-5 text-slate-500" />,
          title: "Unknown Status",
          bgColor: "bg-slate-50",
          textColor: "text-slate-700",
          borderColor: "border-slate-200"
        };
    }
  };

  const ui = getStatusUI();
  const formatHash = (hash) => hash ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 7)}` : '';

  return (
    <div className={`mt-4 p-4 rounded-xl border ${ui.bgColor} ${ui.borderColor}`}>
      <div className="flex items-center gap-2 mb-3">
        {ui.icon}
        <h3 className={`font-bold ${ui.textColor}`}>{ui.title}</h3>
      </div>
      
      <p className="text-[10px] text-slate-500 mb-4 leading-tight">
        Only a cryptographic fingerprint of this health record is stored on Cardano. Patient medical data remains off-chain.
      </p>

      {(verification.status === 'VERIFIED' || verification.status === 'PENDING') && (
        <div className="space-y-3 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
          {/* Network */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Network</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              Cardano {verification.blockchainNetwork || 'Preprod'}
            </span>
          </div>

          {/* Record Hash */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Record Hash</span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-slate-700">{formatHash(verification.recordHash)}</span>
              <button onClick={() => handleCopy(verification.recordHash)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors">
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Transaction Hash */}
          {verification.txHash && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Transaction Hash</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-slate-700">{formatHash(verification.txHash)}</span>
                <button onClick={() => handleCopy(verification.txHash)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors">
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Anchored Timestamp */}
          {verification.anchoredAt && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Anchored At</span>
              <span className="text-slate-700 font-medium">
                {new Date(verification.anchoredAt).toLocaleString()}
              </span>
            </div>
          )}

          {/* Explorer Button */}
          {verification.status === 'VERIFIED' && verification.txHash && (
            <a 
              href={`https://${(verification.blockchainNetwork || 'Preprod').toLowerCase()}.cardanoscan.io/transaction/${verification.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              View on Cardano Explorer <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
