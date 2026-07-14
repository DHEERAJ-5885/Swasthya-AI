import api from '../api';
import { getPendingTasks, updateTaskStatus, removeTask, addSyncHistory, getCachedPatients, cachePatients, cacheDashboardStats, deletePatientFromCache, deleteScreeningFromCache } from './offlineStore';
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
  const idMap = new Map(); // Maps offline_xxx IDs to actual MongoDB _ids

  // Sort tasks to ensure CREATE_PATIENT comes first (usually already in order, but just in case)
  pendingTasks.sort((a, b) => {
    const order = { 'CREATE_PATIENT': 1, 'CREATE_SCREENING': 2, 'CREATE_FOLLOWUP': 3, 'CREATE_EMERGENCY': 4 };
    return (order[a.type] || 99) - (order[b.type] || 99);
  });

  for (let i = 0; i < pendingTasks.length; i++) {
    const task = pendingTasks[i];
    
    if (syncProgressCallback) {
      syncProgressCallback({ current: i + 1, total: pendingTasks.length });
    }

    if (task.status === 'FAILED' && task.retryCount > 3) {
      continue;
    }

    try {
      await updateTaskStatus(task.id, { status: 'SYNCHRONIZING' });
      
      let endpoint = '';
      let method = 'post';
      let payloadToSync = { ...task.payload };

      // Swap any offline IDs with their real MongoDB IDs
      if (payloadToSync.patientId && idMap.has(payloadToSync.patientId)) {
        payloadToSync.patientId = idMap.get(payloadToSync.patientId);
      }
      if (payloadToSync.patient && idMap.has(payloadToSync.patient)) {
        payloadToSync.patient = idMap.get(payloadToSync.patient);
      }

      if (task.type === 'CREATE_PATIENT' || task.type === 'UPDATE_PATIENT') {
        payloadToSync = decryptPatientData(payloadToSync);
        // The backend doesn't expect _id or _isOffline during creation
        delete payloadToSync._id;
        delete payloadToSync._isOffline;
        delete payloadToSync.createdAt;
      }

      switch (task.type) {
        case 'CREATE_PATIENT':
          endpoint = '/patients';
          break;
        case 'CREATE_SCREENING':
          endpoint = '/analyze';
          // Clean up mock offline fields from screening payload
          delete payloadToSync._id;
          delete payloadToSync.result; 
          delete payloadToSync.createdAt;
          break;
        case 'CREATE_FOLLOWUP':
          endpoint = '/follow-ups';
          break;
        case 'CREATE_EMERGENCY':
          endpoint = '/emergency';
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      const response = await api[method](endpoint, payloadToSync);

      // Mapping offline IDs to Real IDs
      if (task.type === 'CREATE_PATIENT' && task.payload._id && task.payload._id.startsWith('offline_')) {
        const realId = response.data._id;
        idMap.set(task.payload._id, realId);
        
        // Remove the offline mock patient from cache, and save the real one
        await deletePatientFromCache(task.payload._id);
        await cachePatients([response.data]);
      }
      
      if (task.type === 'CREATE_SCREENING' && task.payload._id && task.payload._id.startsWith('offline_')) {
        await deleteScreeningFromCache(task.payload._id);
        // We will let the subsequent global prefetchOfflineData handle fetching the new real screening
      }

      await removeTask(task.id);
      await addSyncHistory(task, 'SUCCESS', 'Synchronized successfully');
      successCount++;

      if (task.type === 'CREATE_PATIENT') {
        toast.success('Patient synchronized successfully.', { id: `sync-${task.id}` });
      } else if (task.type === 'CREATE_SCREENING') {
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
    syncProgressCallback(null);
  }

  if (successCount > 0) {
    toast.success(`Synchronization completed. ${successCount} records synced.`);
    // Fetch and cache updated dashboard stats and other core data
    prefetchOfflineData();
  }
};

export const prefetchOfflineData = async () => {
  if (!navigator.onLine) return;
  try {
    const [stats, patients, alerts, followups, communityRisk, analytics, insights, screenings, reports] = await Promise.allSettled([
      api.get('/dashboard/stats'),
      api.get('/patients'),
      api.get('/emergency/alerts'),
      api.get('/followups'),
      api.get('/community-risk'),
      api.get('/advanced'),
      api.get('/insights'),
      api.get('/screenings/all'),
      api.get('/reports')
    ]);

    if (stats.status === 'fulfilled') await cacheDashboardStats(stats.value.data);
    if (patients.status === 'fulfilled') await cachePatients(patients.value.data);
    
    const { 
      cacheAlerts, cacheFollowUps, cacheCommunityRisk, 
      cacheAnalytics, cacheAIInsights, cacheScreenings, cacheReports 
    } = await import('./offlineStore');
    
    if (alerts.status === 'fulfilled') await cacheAlerts(alerts.value.data);
    if (followups.status === 'fulfilled') await cacheFollowUps(followups.value.data);
    if (communityRisk.status === 'fulfilled') await cacheCommunityRisk(communityRisk.value.data);
    if (analytics.status === 'fulfilled') await cacheAnalytics(analytics.value.data);
    if (insights.status === 'fulfilled') await cacheAIInsights(insights.value.data);
    if (screenings.status === 'fulfilled') await cacheScreenings(screenings.value.data);
    if (reports.status === 'fulfilled') await cacheReports(reports.value.data);
    
  } catch (err) {
    console.warn('Background prefetch failed', err);
  }
};
