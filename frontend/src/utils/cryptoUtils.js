import CryptoJS from 'crypto-js';

// Hardcoded secret for local client-side offline storage encryption
// In a real production app, this could be derived from the user's password or a secure token
const LOCAL_ENCRYPTION_KEY = 'swasthya-offline-secure-key-2026';

/**
 * Encrypts a sensitive string value
 */
export const encryptField = (value) => {
  if (!value) return value;
  try {
    return CryptoJS.AES.encrypt(value.toString(), LOCAL_ENCRYPTION_KEY).toString();
  } catch (e) {
    console.error('Encryption failed', e);
    return value;
  }
};

/**
 * Decrypts a sensitive string value
 */
export const decryptField = (encryptedValue) => {
  if (!encryptedValue) return encryptedValue;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedValue, LOCAL_ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    // If decryption fails, it might return empty string. Fallback to original if needed.
    return decrypted || encryptedValue;
  } catch (e) {
    console.error('Decryption failed', e);
    return encryptedValue; // Return original if not encrypted or fails
  }
};

/**
 * Encrypts specific sensitive fields in a patient record
 * @param {Object} patient - The patient data object
 * @returns {Object} A new object with sensitive fields encrypted
 */
export const encryptPatientData = (patient) => {
  if (!patient) return patient;
  
  const encrypted = { ...patient };
  
  const sensitiveFields = ['firstName', 'lastName', 'phone', 'address', 'aadharNumber'];
  
  sensitiveFields.forEach(field => {
    if (encrypted[field]) {
      encrypted[field] = encryptField(encrypted[field]);
    }
  });
  
  return encrypted;
};

/**
 * Decrypts specific sensitive fields in a patient record
 * @param {Object} patient - The patient data object with encrypted fields
 * @returns {Object} A new object with sensitive fields decrypted
 */
export const decryptPatientData = (patient) => {
  if (!patient) return patient;
  
  const decrypted = { ...patient };
  
  const sensitiveFields = ['firstName', 'lastName', 'phone', 'address', 'aadharNumber'];
  
  sensitiveFields.forEach(field => {
    if (decrypted[field] && typeof decrypted[field] === 'string' && decrypted[field].startsWith('U2FsdGVkX1')) { // Basic check for CryptoJS AES string
      decrypted[field] = decryptField(decrypted[field]);
    }
  });
  
  return decrypted;
};
