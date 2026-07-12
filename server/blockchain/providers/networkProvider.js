const config = require('../config/blockchainConfig');

class NetworkProvider {
  constructor() {
    this.lucid = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return this.lucid;

    if (!config.blockfrostProjectId) {
      console.warn('Blockchain provider skipped: Missing Blockfrost Project ID in env.');
      return null;
    }

    try {
      // Dynamically import ESM package in CJS environment
      const { Lucid, Blockfrost } = await import('@lucid-evolution/lucid');

      const blockfrostUrl = config.network === 'Mainnet' 
        ? 'https://cardano-mainnet.blockfrost.io/api/v0' 
        : 'https://cardano-preprod.blockfrost.io/api/v0';

      this.lucid = await Lucid(
        new Blockfrost(blockfrostUrl, config.blockfrostProjectId),
        config.network
      );

      if (config.walletSeed) {
        this.lucid.selectWallet.fromSeed(config.walletSeed);
      }

      this.isInitialized = true;
      console.log(`Cardano Network Provider Initialized on ${config.network}`);
      return this.lucid;
    } catch (error) {
      console.error('Failed to initialize Cardano network provider:', error);
      throw error;
    }
  }

  getLucidInstance() {
    if (!this.isInitialized) {
      throw new Error('Network Provider not initialized. Call initialize() first.');
    }
    return this.lucid;
  }
}

module.exports = new NetworkProvider();
