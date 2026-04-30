const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = "mongodb://baqimuhammad42:dummy112233@ac-nrcdffw-shard-00-00.od5paou.mongodb.net:27017,ac-nrcdffw-shard-00-01.od5paou.mongodb.net:27017,ac-nrcdffw-shard-00-02.od5paou.mongodb.net:27017/skilltrade?ssl=true&replicaSet=atlas-ubgb62-shard-0&authSource=admin&retryWrites=true&w=majority";
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
