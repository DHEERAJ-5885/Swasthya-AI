import { openDB } from 'idb';
import { encryptPatientData, decryptPatientData } from './cryptoUtils';

const DB_NAME = 'swasthya-offline-db';
const DB_VERSION = 2;

/**
 * Initializes the IndexedDB for offline storage
 */
export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('syncQueue')) db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('syncHistory')) db.createObjectStore('syncHistory', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('patientsCache')) db.createObjectStore('patientsCache', { keyPath: '_id' });
      if (!db.objectStoreNames.contains('screeningsCache')) db.createObjectStore('screeningsCache', { keyPath: '_id' });
      if (!db.objectStoreNames.contains('dashboardCache')) db.createObjectStore('dashboardCache', { keyPath: 'key' });
      
      // New stores for Milestone 1
      if (!db.objectStoreNames.contains('patientProfilesCache')) db.createObjectStore('patientProfilesCache', { keyPath: '_id' });
      if (!db.objectStoreNames.contains('reportsCache')) db.createObjectStore('reportsCache', { keyPath: 'key' });
      if (!db.objectStoreNames.contains('followupsCache')) db.createObjectStore('followupsCache', { keyPath: '_id' });
      if (!db.objectStoreNames.contains('alertsCache')) db.createObjectStore('alertsCache', { keyPath: '_id' });
      if (!db.objectStoreNames.contains('analyticsCache')) db.createObjectStore('analyticsCache', { keyPath: 'key' });
      if (!db.objectStoreNames.contains('blockchainCache')) db.createObjectStore('blockchainCache', { keyPath: 'patientId' });
    },
  });
};

// --- Sync Queue Operations ---

/**
 * Adds a new task to the sync queue
 * @param {string} type - e.g., 'CREATE_PATIENT', 'CREATE_SCREENING'
 * @param {Object} payload - The data to sync
 */
export const enqueueSyncTask = async (type, payload) => {
  const db = await initDB();
  
  // Encrypt payload if it contains patient data
  let processedPayload = payload;
  if (type === 'CREATE_PATIENT' || type === 'UPDATE_PATIENT') {
    processedPayload = encryptPatientData(payload);
  }

  const task = {
    type,
    payload: processedPayload,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    retryCount: 0,
    error: null
  };

  const id = await db.add('syncQueue', task);
  return id;
};

export const getPendingTasks = async () => {
  const db = await initDB();
  return db.getAll('syncQueue');
};

export const updateTaskStatus = async (id, updates) => {
  const db = await initDB();
  const tx = db.transaction('syncQueue', 'readwrite');
  const store = tx.objectStore('syncQueue');
  const task = await store.get(id);
  if (task) {
    const updatedTask = { ...task, ...updates };
    await store.put(updatedTask);
  }
  await tx.done;
};

export const removeTask = async (id) => {
  const db = await initDB();
  await db.delete('syncQueue', id);
};

// --- Sync History Operations ---

export const addSyncHistory = async (task, resultStatus, message) => {
  const db = await initDB();
  const historyRecord = {
    taskId: task.id,
    type: task.type,
    syncedAt: new Date().toISOString(),
    status: resultStatus,
    message
  };
  await db.add('syncHistory', historyRecord);
};

export const getSyncHistory = async () => {
  const db = await initDB();
  return db.getAll('syncHistory');
};

// --- Caching Operations ---

export const cachePatients = async (patients) => {
  if (!patients || !Array.isArray(patients)) return;
  const db = await initDB();
  const tx = db.transaction('patientsCache', 'readwrite');
  for (const p of patients) {
    await tx.store.put(encryptPatientData(p));
  }
  await tx.done;
};

export const getCachedPatients = async () => {
  const db = await initDB();
  const patients = await db.getAll('patientsCache');
  return patients.map(p => decryptPatientData(p));
};

export const getCachedPatientById = async (id) => {
  const db = await initDB();
  const patient = await db.get('patientsCache', id);
  return patient ? decryptPatientData(patient) : null;
};

export const cacheDashboardStats = async (stats) => {
  const db = await initDB();
  await db.put('dashboardCache', { key: 'main_stats', data: stats, timestamp: new Date().toISOString() });
};

export const getCachedDashboardStats = async () => {
  const db = await initDB();
  const record = await db.get('dashboardCache', 'main_stats');
  return record ? record.data : null;
};

// Milestone 1: New Cache Getters & Setters

export const cachePatientProfile = async (id, profileData) => {
  const db = await initDB();
  await db.put('patientProfilesCache', { _id: id, ...encryptPatientData(profileData), timestamp: new Date().toISOString() });
};

export const getCachedPatientProfile = async (id) => {
  const db = await initDB();
  const profile = await db.get('patientProfilesCache', id);
  return profile ? decryptPatientData(profile) : null;
};

export const cacheScreenings = async (screenings) => {
  if (!screenings || !Array.isArray(screenings)) return;
  const db = await initDB();
  const tx = db.transaction('screeningsCache', 'readwrite');
  for (const s of screenings) await tx.store.put(s);
  await tx.done;
};

export const deletePatientFromCache = async (id) => {
  if (!id) return;
  try {
    const db = await initDB();
    await db.delete('patientsCache', id);
  } catch (e) {
    console.error('Failed to delete patient from cache', e);
  }
};

export const deleteScreeningFromCache = async (id) => {
  if (!id) return;
  try {
    const db = await initDB();
    await db.delete('screeningsCache', id);
  } catch (e) {
    console.error('Failed to delete screening from cache', e);
  }
};

export const getCachedScreeningsByPatient = async (patientId) => {
  const db = await initDB();
  const screenings = await db.getAll('screeningsCache');
  return screenings.filter(s => s.patientId === patientId || s.patient === patientId);
};

export const getCachedAllScreenings = async () => {
  const db = await initDB();
  return db.getAll('screeningsCache');
};

export const cacheAlerts = async (alerts) => {
  if (!alerts || !Array.isArray(alerts)) return;
  const db = await initDB();
  const tx = db.transaction('alertsCache', 'readwrite');
  for (const a of alerts) await tx.store.put(a);
  await tx.done;
};

export const getCachedAlerts = async () => {
  const db = await initDB();
  return db.getAll('alertsCache');
};

export const cacheFollowUps = async (followUps) => {
  if (!followUps || !Array.isArray(followUps)) return;
  const db = await initDB();
  const tx = db.transaction('followupsCache', 'readwrite');
  for (const f of followUps) await tx.store.put(f);
  await tx.done;
};

export const getCachedFollowUps = async () => {
  const db = await initDB();
  return db.getAll('followupsCache');
};

export const cacheReports = async (reports) => {
  const db = await initDB();
  await db.put('reportsCache', { key: 'all_reports', data: reports, timestamp: new Date().toISOString() });
};

export const getCachedReports = async () => {
  const db = await initDB();
  const record = await db.get('reportsCache', 'all_reports');
  return record ? record.data : [];
};

export const cacheBlockchainStatus = async (patientId, data) => {
  const db = await initDB();
  await db.put('blockchainCache', { patientId, data, timestamp: new Date().toISOString() });
};

export const getCachedBlockchainStatus = async (patientId) => {
  const db = await initDB();
  const record = await db.get('blockchainCache', patientId);
  return record ? record.data : null;
};

export const cacheCommunityRisk = async (data) => {
  const db = await initDB();
  await db.put('dashboardCache', { key: 'communityRisk', data, timestamp: new Date().toISOString() });
};

export const getCachedCommunityRisk = async () => {
  const db = await initDB();
  const record = await db.get('dashboardCache', 'communityRisk');
  return record ? record.data : null;
};

export const cacheAnalytics = async (data) => {
  const db = await initDB();
  await db.put('analyticsCache', { key: 'advanced_analytics', data, timestamp: new Date().toISOString() });
};

export const getCachedAnalytics = async () => {
  const db = await initDB();
  const record = await db.get('analyticsCache', 'advanced_analytics');
  return record ? record.data : null;
};

export const cacheAIInsights = async (data) => {
  const db = await initDB();
  await db.put('analyticsCache', { key: 'ai_insights', data, timestamp: new Date().toISOString() });
};

export const getCachedAIInsights = async () => {
  const db = await initDB();
  const record = await db.get('analyticsCache', 'ai_insights');
  return record ? record.data : null;
};
