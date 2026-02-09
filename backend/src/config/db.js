const mongoose = require('mongoose');

async function connectDB() {
  const mongoURI = 
    process.env.MONGODB_URL ||      
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL ||
    process.env.MONGO_URI ||        
    'mongodb://localhost:27017/chat-app'; 
  
  console.log('Connecting to MongoDB...');
  
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);

    if (process.env.NODE_ENV === 'production') {
      console.log('Available env vars:', Object.keys(process.env).filter(k => 
        k.includes('MONGO') || k.includes('DB')));
      process.exit(1);
    }
  }
}

module.exports = connectDB;