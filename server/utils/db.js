const mongoose = require('mongoose');

const connectDB = async (retries = 5, delay = 5000) => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/swasthya-ai';
  
  while (retries > 0) {
    try {
      console.log(`Attempting MongoDB connection... (${retries} retries left)`);
      await mongoose.connect(uri);
      console.log('MongoDB connection established successfully.');
      return;
    } catch (err) {
      console.error(`MongoDB connection failed: ${err.message}`);
      retries -= 1;
      if (retries === 0) {
        console.error('All MongoDB connection retries exhausted. Exiting process.');
        process.exit(1);
      }
      console.log(`Waiting ${delay / 1000} seconds before retrying...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

module.exports = connectDB;
