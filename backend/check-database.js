const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/user.model');
const Post = require('./models/post.model');
const Skill = require('./models/skill.model');
const TradeProposal = require('./models/trade-proposal.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skilltrade', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

async function checkDatabase() {
  try {
    console.log('\n📊 DATABASE OVERVIEW\n' + '='.repeat(50));
    
    // Count documents
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    const proposalCount = await TradeProposal.countDocuments();
    
    console.log(`\n📈 Statistics:`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Posts: ${postCount}`);
    console.log(`   Proposals: ${proposalCount}`);
    
    // Show sample users
    console.log(`\n👥 Sample Users:`);
    const users = await User.find().limit(5).select('name email coins rating skillsToTeach skillsToLearn');
    users.forEach(user => {
      console.log(`\n   📧 ${user.email}`);
      console.log(`      Name: ${user.name}`);
      console.log(`      Coins: ${user.coins}`);
      console.log(`      Rating: ${user.rating.average}⭐ (${user.rating.count} reviews)`);
      console.log(`      Teaching: ${user.skillsToTeach.length} skills`);
      console.log(`      Learning: ${user.skillsToLearn.length} skills`);
    });
    
    // Show sample posts
    console.log(`\n\n📝 Sample Posts:`);
    const posts = await Post.find()
      .populate('user', 'name email')
      .populate('willTeach.skill', 'name')
      .populate('wantToLearn.skill', 'name')
      .limit(5);
    
    posts.forEach((post, i) => {
      console.log(`\n   ${i + 1}. "${post.title}"`);
      console.log(`      Posted by: ${post.user.name} (${post.user.email})`);
      console.log(`      Will teach: ${post.willTeach.map(s => s.skill?.name || s.customSkillName).join(', ')}`);
      console.log(`      Wants to learn: ${post.wantToLearn.map(s => s.skill?.name || s.customSkillName).join(', ')}`);
      console.log(`      Duration: ${post.duration} mins | Views: ${post.stats.views} | Interests: ${post.stats.interests}`);
      console.log(`      Status: ${post.status}`);
    });
    
    // Show sample proposals
    console.log(`\n\n💬 Sample Proposals:`);
    const proposals = await TradeProposal.find()
      .populate('proposer', 'name email')
      .populate('receiver', 'name email')
      .populate('targetPost', 'title')
      .populate('offering.skill', 'name')
      .limit(5);
    
    proposals.forEach((proposal, i) => {
      console.log(`\n   ${i + 1}. ${proposal.proposalType.toUpperCase()} Proposal`);
      console.log(`      From: ${proposal.proposer.name}`);
      console.log(`      To: ${proposal.receiver.name}`);
      console.log(`      Post: "${proposal.targetPost?.title}"`);
      if (proposal.offering?.skill) {
        console.log(`      Offering: ${proposal.offering.skill.name}`);
      }
      console.log(`      Status: ${proposal.status}`);
      console.log(`      Message: "${proposal.message.substring(0, 60)}..."`);
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Database check complete!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  }
}

checkDatabase();
