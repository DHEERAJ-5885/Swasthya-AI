import { openDB } from 'idb';
import { encryptPatientData, decryptPatientData } from './cryptoUtils';

const DB_NAME = 'swasthya-offline-db';
const DB_VERSION = 1;

/**
 * Initializes the IndexedDB for offline storage
 */
export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('syncHistory')) {
        db.createObjectStore('syncHistory', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('patientsCache')) {
        db.createObjectStore('patientsCache', { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains('screeningsCache')) {
        db.createObjectStore('screeningsCache', { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains('dashboardCache')) {
        db.createObjectStore('dashboardCache', { keyPath: 'key' });
      }
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
  } else if (type === 'CREATE_SCREENING') {
    // We only encrypt the patient name if it's stored inside the screening payload, but usually it's just IDs
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
    status: resultStatus, // 'SUCCESS' or 'FAILED'
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
    const encrypted = encryptPatientData(p);
    await tx.store.put(encrypted);
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
  return decryptPatientData(patient);
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
