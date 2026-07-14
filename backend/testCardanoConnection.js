const networkProvider = require('./blockchain/providers/networkProvider');

async function testConnection() {
  try {
    console.log('STATUS: Initializing Network Provider...');
    const lucid = await networkProvider.initialize();

    if (!lucid) {
      console.log('STATUS: Failed. Lucid instance not returned.');
      return;
    }

    console.log('STATUS: Connection to Blockfrost Successful.');
    console.log(`NETWORK DETECTED: ${lucid.network}`);

    // Retrieve Wallet Address
    const address = await lucid.wallet.address();
    const maskedAddress = `${address.slice(0, 10)}...${address.slice(-4)}`;
    console.log(`WALLET STATUS: Initialized`);
    console.log(`MASKED WALLET ADDRESS: ${maskedAddress}`);

    // Query UTxOs
    const utxos = await lucid.wallet.getUtxos();
    console.log(`UTXOs DETECTED: ${utxos.length}`);

    // Calculate ADA balance
    let totalLovelace = 0n;
    for (const utxo of utxos) {
      totalLovelace += utxo.assets.lovelace || 0n;
    }
    
    const balanceADA = Number(totalLovelace) / 1_000_000;
    console.log(`AVAILABLE BALANCE: ${balanceADA} tADA`);

    if (balanceADA < 1) {
      console.log('WARNING: The balance is very low. Please fund the wallet using the Cardano Testnet Faucet.');
    }

    process.exit(0);
  } catch (error) {
    console.error('ERROR ENCOUNTERED:', error.message);
    process.exit(1);
  }
}

testConnection();
