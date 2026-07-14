import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCcw, Maximize } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import toast from 'react-hot-toast';
import api from '../api';
import MobileHeader from '../components/MobileHeader';
import { useTranslation } from 'react-i18next';
import { getCachedPatients } from '../utils/offlineStore';

export default function ScanQR() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const isScanning = useRef(false);

  useEffect(() => {
    // Initialize scanner
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      supportedScanTypes: [0, 1] // CAMERA and FILE
    };

    scannerRef.current = new Html5QrcodeScanner("reader", config, false);
    
    scannerRef.current.render(onScanSuccess, onScanFailure);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error('Failed to clear scanner', e));
      }
    };
  }, []);

  const onScanSuccess = async (decodedText) => {
    if (isScanning.current) return;
    isScanning.current = true;
    
    if (scannerRef.current) {
      scannerRef.current.clear().catch(e => console.error('Failed to clear scanner', e));
    }

    setLoading(true);
    setError(null);

    try {
      let patientId = null;
      
      try {
        // Expected format: URL with data query param containing JSON
        // Example: http://localhost:5175/qr/patient?data={"patientId":"..."}
        if (decodedText.includes('data=')) {
          const urlParams = new URLSearchParams(decodedText.substring(decodedText.indexOf('?')));
          const dataParam = urlParams.get('data');
          if (dataParam) {
            const payload = JSON.parse(decodeURIComponent(dataParam));
            patientId = payload.patientId || payload._id;
          }
        } else {
          // Fallback: If it's a raw JSON string
          try {
            const payload = JSON.parse(decodedText);
            patientId = payload.patientId || payload._id;
          } catch {
            // Fallback: If it's just the ID string directly
            patientId = decodedText;
          }
        }
      } catch (e) {
        console.error('Error parsing QR content:', e);
      }

      if (!patientId) {
        throw new Error('Invalid Health Card QR Code.');
      }

      // Fetch patient (Online / Offline)
      if (navigator.onLine) {
        try {
          await api.get(`/patients/${patientId}`);
          // Success, navigate
          navigate(`/patients/${patientId}`);
        } catch (apiError) {
          if (apiError.response && apiError.response.status === 404) {
            throw new Error('Patient not found.');
          } else {
            throw apiError; // unexpected error
          }
        }
      } else {
        const cachedPatients = await getCachedPatients();
        const found = (cachedPatients || []).find(p => p._id === patientId || p.healthId === patientId);
        
        if (found) {
          navigate(`/patients/${found._id || patientId}`);
        } else {
          throw new Error('This patient is not available in offline storage.');
        }
      }
    } catch (err) {
      const errMsg = err.message || 'Error processing QR Code.';
      setError(errMsg);
      toast.error(errMsg);
      setLoading(false);
    }
  };

  const onScanFailure = (error) => {
    // We ignore normal scan failures as they happen continuously until a QR is found
  };

  const retryScan = () => {
    setError(null);
    setLoading(false);
    isScanning.current = false;
    
    // Re-initialize scanner
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true
    };
    scannerRef.current = new Html5QrcodeScanner("reader", config, false);
    scannerRef.current.render(onScanSuccess, onScanFailure);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC]">
      <MobileHeader />

      <div className="hidden md:flex px-8 py-6 bg-white border-b border-slate-100 sticky top-0 z-30 justify-between items-center">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Scan Health Card</h1>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8 max-w-3xl mx-auto w-full flex flex-col items-center">
        <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Maximize className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Scan Patient QR Code</h2>
            <p className="text-slate-500 text-sm">Align the Health Card QR code within the frame or upload an image to view the patient profile.</p>
          </div>

          {!loading && !error && (
            <div className="w-full overflow-hidden rounded-xl border-2 border-dashed border-slate-200">
              <div id="reader" className="w-full"></div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-slate-600 font-semibold text-lg">Fetching Patient Data...</p>
              {!navigator.onLine && (
                <p className="text-slate-400 text-sm mt-2">Checking offline storage</p>
              )}
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-10 bg-red-50 rounded-2xl border border-red-100 mt-4">
              <p className="text-red-600 font-bold text-lg mb-6 text-center px-4">{error}</p>
              <button 
                onClick={retryScan}
                className="flex items-center gap-2 bg-white border-2 border-red-200 text-red-600 font-bold py-2.5 px-6 rounded-xl hover:bg-red-50 transition-colors"
              >
                <RefreshCcw className="w-4 h-4" />
                Scan Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
