import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/edusphere';
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`[MongoDB Connection Warning]: ${error.message}`);
    console.log('[Notice]: Ensure MongoDB is running locally or MONGO_URI is set in .env');
    return false;
  }
};

export default connectDB;
