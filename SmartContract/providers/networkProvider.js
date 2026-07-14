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
      // Resolve @lucid-evolution/lucid dynamically from the backend's node_modules
      const { createRequire } = require('module');
      const path = require('path');
      const { pathToFileURL } = require('url');
      const requireFromBackend = createRequire(path.resolve(__dirname, '../../backend/server.js'));
      const lucidPath = requireFromBackend.resolve('@lucid-evolution/lucid');
      const { Lucid, Blockfrost } = await import(pathToFileURL(lucidPath).href);

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
