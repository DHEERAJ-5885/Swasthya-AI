import React, { useEffect, useState } from 'react';
import { useNetwork } from '../hooks/useNetwork';
import { motion, AnimatePresence } from 'framer-motion';
import { processSyncQueue, setSyncProgressCallback } from '../utils/syncEngine';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function NetworkIndicator() {
  const { isOnline } = useNetwork();
  const [syncProgress, setSyncProgress] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    setSyncProgressCallback((progress) => {
      setSyncProgress(progress);
    });
    
    if (isOnline) {
      // Small delay before syncing to ensure full connection stability
      const timer = setTimeout(() => {
        processSyncQueue();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return (
    <AnimatePresence>
      {(!isOnline || syncProgress) && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className={`w-full text-white text-xs sm:text-sm font-medium py-2 px-4 flex items-center justify-center gap-2 z-50 ${
            !isOnline ? 'bg-orange-500' : 'bg-blue-600'
          }`}
          style={{ position: 'sticky', top: 0 }}
        >
          {!isOnline ? (
            <>
              <WifiOff className="w-4 h-4" />
              <span>Offline Mode. Your work will be saved locally.</span>
            </>
          ) : (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                Synchronizing {syncProgress?.current} of {syncProgress?.total} records...
              </span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
