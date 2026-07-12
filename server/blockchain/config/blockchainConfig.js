require('dotenv').config();

const blockchainConfig = {
  network: process.env.CARDANO_NETWORK || 'Preprod',
  blockfrostProjectId: process.env.BLOCKFROST_PROJECT_ID || '',
  walletSeed: process.env.CARDANO_WALLET_SEED || '',
};

module.exports = blockchainConfig;
