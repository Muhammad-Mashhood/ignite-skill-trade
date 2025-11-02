require('dotenv').config();
const mongoose = require('mongoose');
const Conversation = require('./models/conversation.model');

const cleanupDuplicates = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Get all conversations
    const conversations = await Conversation.find({}).lean();
    console.log(`Found ${conversations.length} total conversations`);

    // Group by participants
    const conversationMap = new Map();
    const duplicates = [];

    conversations.forEach(conv => {
      // Sort participant IDs to create a unique key
      const key = [...conv.participants].map(p => p.toString()).sort().join('-');
      
      if (conversationMap.has(key)) {
        // This is a duplicate
        const existing = conversationMap.get(key);
        
        // Keep the one with more messages or the older one
        if (conv.lastMessageAt > existing.lastMessageAt || 
            (conv.lastMessage && !existing.lastMessage)) {
          duplicates.push(existing._id);
          conversationMap.set(key, conv);
        } else {
          duplicates.push(conv._id);
        }
      } else {
        conversationMap.set(key, conv);
      }
    });

    console.log(`\n🔍 Found ${duplicates.length} duplicate conversations`);

    if (duplicates.length > 0) {
      console.log('Duplicate conversation IDs:', duplicates);
      
      // Delete duplicates
      const result = await Conversation.deleteMany({ _id: { $in: duplicates } });
      console.log(`\n✅ Deleted ${result.deletedCount} duplicate conversations`);
    } else {
      console.log('✅ No duplicates found!');
    }

    console.log(`\n📊 Final count: ${conversationMap.size} unique conversations`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

cleanupDuplicates();
