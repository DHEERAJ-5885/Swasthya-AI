import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

export default function QRCodeModal({ patient, isOpen, onClose }) {
  const [qrUrl, setQrUrl] = useState(null);
  const [latestScore, setLatestScore] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadQr = async () => {
      if (!(isOpen && patient)) return;

      try {
        const screeningsRes = await api.get(`/analyze/${patient._id}`);
        const latest = screeningsRes.data?.[screeningsRes.data.length - 1] || null;
        const riskLevel = latest?.result?.riskLevel || 'Unknown';
        const confidence = latest?.result?.confidence ?? null;
        const healthScore = confidence !== null ? Math.max(0, Math.min(100, Math.round(100 - confidence))) : null;

        if (cancelled) return;

        setLatestScore(healthScore);

        const scanUrl = `${window.location.origin}/qr/patient?id=${patient._id}`;

        QRCode.toDataURL(scanUrl, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 300,
          margin: 1,
          color: {
            dark: '#1e40af',
            light: '#ffffff'
          }
        }).then((url) => {
          if (!cancelled) setQrUrl(url);
        }).catch((err) => {
          console.error('Failed to generate QR code:', err);
        });
      } catch (err) {
        console.error('Failed to load latest screening for QR code:', err);
        if (cancelled) return;
        
        const scanUrl = `${window.location.origin}/qr/patient?id=${patient._id}`;

        QRCode.toDataURL(scanUrl, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 300,
          margin: 1,
          color: {
            dark: '#1e40af',
            light: '#ffffff'
          }
        }).then((url) => {
          if (!cancelled) setQrUrl(url);
        });
      }
    }

    loadQr();

    return () => {
      cancelled = true;
    };
  }, [isOpen, patient]);

  const downloadQR = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.download = `${patient.name}_health_card.png`;
    link.href = qrUrl;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 z-50 max-w-sm w-full mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Health Card QR Code</h2>
                <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl mb-4 flex justify-center">
                {qrUrl ? (
                  <img src={qrUrl} alt="QR Code" className="w-64 h-64" />
                ) : (
                  <div className="w-64 h-64 bg-slate-200 rounded flex items-center justify-center">
                    <p className="text-slate-500">Generating...</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Patient:</span> {patient.name}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Family ID:</span> {patient.familyId || 'N/A'}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Village:</span> {patient.village}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Health Score:</span> {latestScore !== null ? latestScore : 'N/A'}
                </p>
              </div>

              <button
                onClick={downloadQR}
                disabled={!qrUrl}
                className="w-full bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Download QR Code
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
