const { generateRecordHash } = require('../utils/cryptoUtils');
const { createVerificationPayload } = require('../types/verificationTypes');

class VerificationService {
  /**
   * Generates a deterministic hash for a given screening record.
   *
   * @param {Object} rawData - The raw screening or patient data.
   * @returns {Object} An object containing the payload and the resulting hash.
   */
  generateHash(rawData) {
    try {
      // Step 1: Extract and validate the stable payload
      const payload = createVerificationPayload(rawData);

      // Step 2: Generate hash
      const hash = generateRecordHash(rawData);

      return {
        success: true,
        payload,
        hash
      };
    } catch (error) {
      console.error('VerificationService - Hash generation failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Simulates verification logic by comparing a local hash with an expected hash.
   *
   * @param {Object} rawData - Local data to verify.
   * @param {string} expectedHash - The hash retrieved from Cardano (or DB).
   * @returns {import('../types/verificationTypes').VerificationResult}
   */
  verify(rawData, expectedHash) {
    try {
      if (!expectedHash) {
        return {
          isValid: false,
          status: 'UNANCHORED',
          hash: '',
          message: 'No expected hash provided. Record is unanchored.'
        };
      }

      const { hash, error } = this.generateHash(rawData);
      
      if (error) {
        return {
          isValid: false,
          status: 'FAILED',
          hash: '',
          message: `Hash generation failed: ${error}`
        };
      }

      const isValid = hash === expectedHash;

      return {
        isValid,
        status: isValid ? 'VERIFIED' : 'FAILED',
        hash,
        message: isValid ? 'Record successfully verified against the provided hash.' : 'Record hash mismatch. Data may have been tampered with.'
      };
    } catch (error) {
      return {
        isValid: false,
        status: 'FAILED',
        hash: '',
        message: 'Internal verification error.'
      };
    }
  }
}

module.exports = new VerificationService();
