/**
 * Defines the standard verification payload structure used for blockchain anchoring.
 * This structure explicitly excludes MongoDB-specific internal fields.
 *
 * @typedef {Object} VerificationPayload
 * @property {string} patientId
 * @property {string} screeningId
 * @property {string} ashaWorkerId
 * @property {string} screeningTimestamp
 * @property {string} aiResultVersion
 * @property {string} reportVersion
 */

/**
 * @typedef {'PENDING' | 'VERIFIED' | 'FAILED' | 'UNANCHORED'} VerificationStatus
 */

/**
 * @typedef {Object} VerificationResult
 * @property {boolean} isValid
 * @property {VerificationStatus} status
 * @property {string} hash
 * @property {string} [txHash]
 * @property {string} [message]
 */

const createVerificationPayload = ({
  patientId,
  screeningId,
  ashaWorkerId,
  screeningTimestamp,
  aiResultVersion,
  reportVersion = '1.0'
}) => {
  if (!patientId || !screeningId || !ashaWorkerId || !screeningTimestamp || !aiResultVersion) {
    throw new Error('Missing required fields for VerificationPayload');
  }

  return {
    patientId: patientId.toString(),
    screeningId: screeningId.toString(),
    ashaWorkerId: ashaWorkerId.toString(),
    screeningTimestamp: new Date(screeningTimestamp).toISOString(),
    aiResultVersion: aiResultVersion.toString(),
    reportVersion: reportVersion.toString()
  };
};

module.exports = {
  createVerificationPayload
};
