const mongoose = require('mongoose');

async function connectDB() {
  const mongoURI = 
    process.env.MONGO_URL ||     
    process.env.MONGODB_URL ||     
    process.env.MONGO_URI ||       
    'mongodb://localhost:27017/chat-app';
  
  console.log('Connecting to MongoDB...');
  console.log('Using URI from:', process.env.MONGO_URL ? 'MONGO_URL' : 
                                 process.env.MONGODB_URL ? 'MONGODB_URL' :
                                 process.env.MONGO_URI ? 'MONGO_URI' : 'localhost');
  
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Full URI (hidden):', mongoURI ? 'URI is set' : 'URI is undefined');
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

module.exports = connectDB;