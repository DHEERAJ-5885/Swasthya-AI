import api from '../api';
import { getPendingTasks, updateTaskStatus, removeTask, addSyncHistory } from './offlineStore';
import toast from 'react-hot-toast';
import { encryptField, decryptField, decryptPatientData } from './cryptoUtils';

let isSyncing = false;
let syncProgressCallback = null;

export const setSyncProgressCallback = (callback) => {
  syncProgressCallback = callback;
};

export const processSyncQueue = async () => {
  if (!navigator.onLine) return;
  if (isSyncing) return;
  
  const pendingTasks = await getPendingTasks();
  if (pendingTasks.length === 0) return;
  
  isSyncing = true;
  toast.success('Internet connection restored. Synchronizing records...', { duration: 4000 });
  
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < pendingTasks.length; i++) {
    const task = pendingTasks[i];
    
    if (syncProgressCallback) {
      syncProgressCallback({ current: i + 1, total: pendingTasks.length });
    }

    // Skip tasks that failed too many times in this session, wait for next reconnect/reload
    if (task.status === 'FAILED' && task.retryCount > 3) {
      continue;
    }

    try {
      await updateTaskStatus(task.id, { status: 'SYNCHRONIZING' });
      
      let endpoint = '';
      let method = 'post';
      let payloadToSync = { ...task.payload };

      // Decrypt any encrypted fields before sending to the backend
      if (task.type === 'CREATE_PATIENT' || task.type === 'UPDATE_PATIENT') {
        payloadToSync = decryptPatientData(payloadToSync);
      }

      switch (task.type) {
        case 'CREATE_PATIENT':
          endpoint = '/patients';
          break;
        case 'CREATE_SCREENING':
          endpoint = '/analyze';
          break;
        case 'CREATE_FOLLOWUP':
          endpoint = '/follow-ups';
          break;
        case 'CREATE_EMERGENCY':
          endpoint = '/emergency/alerts';
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      const response = await api[method](endpoint, payloadToSync);

      // On success, mark as synced and remove from queue
      await removeTask(task.id);
      await addSyncHistory(task, 'SUCCESS', 'Synchronized successfully');
      successCount++;

      // Dispatch specific notifications
      if (task.type === 'CREATE_PATIENT') {
        toast.success('Patient synchronized successfully.', { id: `sync-${task.id}` });
      } else if (task.type === 'CREATE_SCREENING') {
        // Since backend triggers AI and Cardano natively, we show a combined success message
        toast.success('Screening synchronized. AI analysis & Blockchain verification completed.', { duration: 5000, id: `sync-${task.id}` });
      }

    } catch (error) {
      failCount++;
      const isClientError = error.response && (error.response.status === 400 || error.response.status === 404 || error.response.status === 409);
      
      if (isClientError) {
        console.warn(`Task ${task.id} failed permanently with ${error.response.status}. Removing from queue.`);
        await removeTask(task.id);
        await addSyncHistory(task, 'PERMANENT_FAIL', error.response?.data?.error || 'Validation failed or duplicate');
      } else {
        await updateTaskStatus(task.id, { 
          status: 'FAILED', 
          error: error.message,
          retryCount: (task.retryCount || 0) + 1
        });
        await addSyncHistory(task, 'FAILED', error.message || 'Network error');
      }
    }
  }

  isSyncing = false;
  if (syncProgressCallback) {
    syncProgressCallback(null); // Clear progress
  }

  if (successCount > 0) {
    toast.success(`Synchronization completed. ${successCount} records synced.`);
  }
};
