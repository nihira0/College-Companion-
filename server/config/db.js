const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      console.log('⚠️ MONGODB_URI not provided. Operating with in-memory state fallback for demo mode.');
      return false;
    }
    const conn = await mongoose.connect(connStr);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Warning: ${error.message}. Fallback to operational state enabled.`);
    return false;
  }
};

module.exports = connectDB;
