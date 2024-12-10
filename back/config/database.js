const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Checking MongoDB status...');
    const adminDb = mongoose.connection.useDb('admin');
    const status = await adminDb.command({ serverStatus: 1 });
    console.log('MongoDB server status:', {
      connections: status.connections,
      uptime: status.uptime,
      version: status.version
    });

    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/test-db', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10
    });

    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to db');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose connection is disconnected');
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Database check failed:', error);
    throw error;
  }
};

const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    throw error;
  }
};

const checkConnection = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  console.log('Current MongoDB connection state:', states[state]);
  return state;
};

module.exports = { connectDB, closeDB, checkConnection };
