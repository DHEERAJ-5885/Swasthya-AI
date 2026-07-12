const crypto = require('crypto');
const { createVerificationPayload } = require('../types/verificationTypes');

/**
 * Generates a SHA-256 hash of the stable verification payload.
 *
 * @param {Object} rawData - The raw input data containing required fields.
 * @returns {string} The SHA-256 hash representing the verification payload.
 */
const generateRecordHash = (rawData) => {
  try {
    const payload = createVerificationPayload(rawData);
    
    // Convert to a stable, deterministic JSON string
    const stringifiedPayload = JSON.stringify(payload, Object.keys(payload).sort());
    
    return crypto.createHash('sha256').update(stringifiedPayload).digest('hex');
  } catch (error) {
    console.error('Failed to generate record hash:', error);
    throw new Error('Invalid data provided for record hashing.');
  }
};

module.exports = {
  generateRecordHash
};
