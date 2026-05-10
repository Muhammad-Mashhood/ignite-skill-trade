const mongoose = require('mongoose');

// Use a global variable to cache the MongoDB connection across serverless function invocations
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || "mongodb://baqimuhammad42:dummy112233@ac-nrcdffw-shard-00-00.od5paou.mongodb.net:27017,ac-nrcdffw-shard-00-01.od5paou.mongodb.net:27017,ac-nrcdffw-shard-00-02.od5paou.mongodb.net:27017/skilltrade?ssl=true&replicaSet=atlas-ubgb62-shard-0&authSource=admin&retryWrites=true&w=majority";

  if (cached.conn) {
    console.log('🔄 Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔌 Connecting to MongoDB...');
    cached.promise = mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000, // Timeout after 15s instead of 30s
    }).then((mongoose) => {
      console.log('✅ MongoDB Connected successfully');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error(`❌ MongoDB Connection Error: ${e.message}`);
    // If it's a timeout, it's likely an IP whitelist issue
    if (e.message.includes('timeout')) {
      console.error('👉 TIP: Ensure your MongoDB Atlas IP Whitelist allows access from 0.0.0.0/0');
    }
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;
