const networkProvider = require('../providers/networkProvider');
const { generateRecordHash } = require('../utils/cryptoUtils');

class CardanoService {
  /**
   * Anchors a validated SHA-256 health record hash to the Cardano blockchain.
   *
   * @param {string} recordHash - The 64-character hexadecimal SHA-256 hash.
   * @returns {Promise<Object>} The transaction submission result.
   */
  async anchorHealthRecord(recordHash) {
    try {
      // 1. Validate the hash
      const isValidHex = /^[0-9a-fA-F]{64}$/.test(recordHash);
      if (!isValidHex) {
        return {
          success: false,
          error: 'Invalid recordHash provided. Must be a 64-character hexadecimal SHA-256 string.'
        };
      }

      // 2. Initialize Lucid
      const lucid = await networkProvider.initialize();
      if (!lucid) {
        throw new Error('Lucid is not initialized. Cannot anchor record.');
      }

      const address = await lucid.wallet().address();

      // 3. Build the transaction
      // Using an application-specific metadata label (e.g., 2026 for SwasthyaAI)
      const metadataLabel = 2026;
      const metadataPayload = {
        app: "SwasthyaAI",
        version: "1.0",
        recordHash: recordHash
      };

      const tx = await lucid.newTx()
        .pay.ToAddress(address, { lovelace: 1000000n }) // Send minAda to self to carry the metadata
        .attachMetadata(metadataLabel, metadataPayload)
        .complete();

      // 4. Sign the transaction
      const signedTx = await tx.sign.withWallet().complete();

      // 5. Submit the transaction
      const txHash = await signedTx.submit();

      return {
        success: true,
        txHash: txHash,
        recordHash: recordHash,
        network: lucid.network || "Preprod",
        submittedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('CardanoService - Transaction failed:', error.message);
      return {
        success: false,
        error: error.message || 'Unknown transaction error'
      };
    }
  }

  /**
   * Awaits blockchain confirmation for a submitted transaction.
   *
   * @param {string} txHash - The transaction hash to await.
   * @returns {Promise<boolean>} True if confirmed successfully.
   */
  async awaitTxConfirmation(txHash) {
    try {
      const lucid = await networkProvider.initialize();
      if (!lucid) return false;
      
      const isConfirmed = await lucid.awaitTx(txHash);
      return isConfirmed;
    } catch (err) {
      console.error('CardanoService - Error awaiting confirmation:', err.message);
      return false;
    }
  }

  /**
   * Placeholder to verify a health record against the blockchain ledger.
   *
   * @param {Object} rawData - The local patient screening data to verify.
   * @param {string} onChainTxHash - The transaction hash where the record is supposedly anchored.
   * @returns {Promise<boolean>} True if the local hash matches the on-chain metadata hash.
   */
  async verifyHealthRecord(rawData, onChainTxHash) {
    const localHash = generateRecordHash(rawData);
    
    // TODO: Fetch transaction metadata from Blockfrost via Lucid
    // TODO: Compare localHash with the on-chain hash
    
    return false; // Pending implementation
  }
}

module.exports = new CardanoService();
