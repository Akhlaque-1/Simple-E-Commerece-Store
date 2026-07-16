const mongoose = require('mongoose');

let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (!cachedPromise) {
    const opts = {
      bufferCommands: false, // Disable buffering so errors are caught early during initialization
    };
    cachedPromise = mongoose.connect(process.env.MONGO_URI, opts).then((conn) => {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    }).catch((error) => {
      cachedPromise = null;
      console.error(`Database connection failed: ${error.message}`);
      throw error;
    });
  }

  return cachedPromise;
};

module.exports = connectDB;
