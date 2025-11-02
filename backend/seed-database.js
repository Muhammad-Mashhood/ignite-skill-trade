const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

// Dummy user data
const dummyUsers = [
  { email: 'dummymash1@gmail.com', name: 'Dummymash One', bio: 'Web developer passionate about teaching JavaScript', firebaseUid: 'dummy-firebase-uid-1' },
  { email: 'dummymash2@gmail.com', name: 'Dummymash Two', bio: 'Graphic designer with 5 years of experience', firebaseUid: 'dummy-firebase-uid-2' },
  { email: 'dummymash3@gmail.com', name: 'Dummymash Three', bio: 'Data scientist and machine learning enthusiast', firebaseUid: 'dummy-firebase-uid-3' },
  { email: 'dummymash4@gmail.com', name: 'Dummymash Four', bio: 'Mobile app developer specializing in React Native', firebaseUid: 'dummy-firebase-uid-4' },
  { email: 'dummymash5@gmail.com', name: 'Dummymash Five', bio: 'Digital marketing expert and content creator', firebaseUid: 'dummy-firebase-uid-5' },
  { email: 'dummymash6@gmail.com', name: 'Dummymash Six', bio: 'UI/UX designer focused on user-centered design', firebaseUid: 'dummy-firebase-uid-6' },
  { email: 'dummymash7@gmail.com', name: 'Dummymash Seven', bio: 'Backend engineer with expertise in Node.js', firebaseUid: 'dummy-firebase-uid-7' },
  { email: 'dummymash8@gmail.com', name: 'Dummymash Eight', bio: 'Video editor and motion graphics artist', firebaseUid: 'dummy-firebase-uid-8' },
  { email: 'dummymash9@gmail.com', name: 'Dummymash Nine', bio: 'Business analyst with MBA background', firebaseUid: 'dummy-firebase-uid-9' },
  { email: 'dummymash10@gmail.com', name: 'Dummymash Ten', bio: 'Photographer and photo editing specialist', firebaseUid: 'dummy-firebase-uid-10' },
  { email: 'dummymash11@gmail.com', name: 'Dummymash Eleven', bio: 'DevOps engineer and cloud infrastructure expert', firebaseUid: 'dummy-firebase-uid-11' },
  { email: 'dummymash12@gmail.com', name: 'Dummymash Twelve', bio: 'Content writer and copywriting professional', firebaseUid: 'dummy-firebase-uid-12' },
];

// Skills catalog (using valid categories from Skill model)
const skillsData = [
  { name: 'JavaScript', category: 'Programming', description: 'Programming language for web development' },
  { name: 'Python', category: 'Programming', description: 'Versatile programming language' },
  { name: 'React', category: 'Programming', description: 'JavaScript library for building UIs' },
  { name: 'Node.js', category: 'Programming', description: 'JavaScript runtime for backend' },
  { name: 'Graphic Design', category: 'Design', description: 'Visual communication design' },
  { name: 'UI/UX Design', category: 'Design', description: 'User interface and experience design' },
  { name: 'Digital Marketing', category: 'Marketing', description: 'Online marketing strategies' },
  { name: 'Video Editing', category: 'Other', description: 'Video production and editing' },
  { name: 'Photography', category: 'Photography', description: 'Photo capturing and editing' },
  { name: 'Data Science', category: 'Programming', description: 'Data analysis and ML' },
  { name: 'Mobile Development', category: 'Programming', description: 'iOS and Android development' },
  { name: 'Cloud Computing', category: 'Programming', description: 'AWS, Azure, GCP' },
  { name: 'Content Writing', category: 'Writing', description: 'Creative and technical writing' },
  { name: 'SEO', category: 'Marketing', description: 'Search engine optimization' },
  { name: 'Spanish', category: 'Languages', description: 'Spanish language' },
  { name: 'Guitar', category: 'Music', description: 'Guitar playing' },
  { name: 'Yoga', category: 'Fitness', description: 'Yoga practice and instruction' },
  { name: 'Business Analysis', category: 'Business', description: 'Business process analysis' },
  { name: 'Copywriting', category: 'Writing', description: 'Marketing and sales writing' },
  { name: 'Piano', category: 'Music', description: 'Piano playing and music theory' },
];

// Test/development password - NOT for production use
const password = 'test_seed_password_123';

async function seedDatabase() {
  try {
    console.log('🧹 Cleaning existing data...');
    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Skill.deleteMany({});
    await TradeProposal.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create skills
    console.log('📚 Creating skills...');
    const skills = await Skill.insertMany(skillsData);
    console.log(`✅ Created ${skills.length} skills`);

    // Hash password once for all users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create users with skills
    console.log('👥 Creating users...');
    const users = [];
    for (let i = 0; i < dummyUsers.length; i++) {
      const userData = dummyUsers[i];
      
      // Assign random skills to teach and learn
      const teachSkills = [];
      const learnSkills = [];
      
      // Each user will teach 1-3 skills
      const numTeachSkills = Math.floor(Math.random() * 3) + 1;
      const shuffledSkills = [...skills].sort(() => Math.random() - 0.5);
      
      for (let j = 0; j < numTeachSkills; j++) {
        teachSkills.push({
          skillId: shuffledSkills[j]._id,
          proficiencyLevel: ['intermediate', 'advanced', 'expert'][Math.floor(Math.random() * 3)],
          yearsOfExperience: Math.floor(Math.random() * 8) + 2,
        });
      }
      
      // Each user will want to learn 1-4 skills (different from teaching)
      const numLearnSkills = Math.floor(Math.random() * 4) + 1;
      for (let j = numTeachSkills; j < numTeachSkills + numLearnSkills && j < skills.length; j++) {
        learnSkills.push({
          skillId: shuffledSkills[j]._id,
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        });
      }

      const user = await User.create({
        ...userData,
        password: hashedPassword,
        coins: Math.floor(Math.random() * 300) + 100,
        skillsToTeach: teachSkills,
        skillsToLearn: learnSkills,
        rating: {
          average: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
          count: Math.floor(Math.random() * 50),
        },
        languages: ['English'],
        timezone: 'UTC',
        isVerified: Math.random() > 0.3,
        level: Math.floor(Math.random() * 5) + 1,
        totalSessionsCompleted: Math.floor(Math.random() * 30),
      });
      
      users.push(user);
    }
    console.log(`✅ Created ${users.length} users`);

    // Create posts
    console.log('📝 Creating posts...');
    const posts = [];
    const postTitles = [
      'Looking to trade web development skills for design help',
      'Experienced Python developer seeking JavaScript mentor',
      'Teach you graphic design in exchange for marketing tips',
      'React expert willing to trade for Node.js knowledge',
      'Learn data science from me, teach me mobile development',
      'UI/UX designer looking to learn backend development',
      'Marketing guru seeking coding skills',
      'Video editing pro wants to learn photography',
      'Full-stack developer offering mentorship',
      'Content writer looking to improve technical skills',
      'Cloud computing expert seeking DevOps knowledge',
      'Mobile developer wants to learn web frameworks',
      'Graphic designer teaching Adobe Suite',
      'SEO specialist offering digital marketing lessons',
      'Photography enthusiast teaching photo editing',
      'Yoga instructor looking to trade for video editing skills',
      'Spanish tutor seeking web development lessons',
      'Guitar teacher wants to learn music production',
      'Business analyst teaching Excel and data analysis',
      'Beginner-friendly JavaScript crash course',
    ];

    for (let i = 0; i < 25; i++) {
      const user = users[i % users.length];
      const userTeachSkills = user.skillsToTeach;
      const userLearnSkills = user.skillsToLearn;

      if (userTeachSkills.length > 0 && userLearnSkills.length > 0) {
        // Randomly pick skills from user's profile
        const willTeachSkill = userTeachSkills[Math.floor(Math.random() * userTeachSkills.length)];
        const wantToLearnSkill = userLearnSkills[Math.floor(Math.random() * userLearnSkills.length)];

        const post = await Post.create({
          user: user._id,
          type: 'trade',
          title: postTitles[i % postTitles.length],
          description: `I'm passionate about sharing my knowledge and learning new skills. With ${willTeachSkill.yearsOfExperience || 3} years of experience, I can help you master this skill while learning from you in return. Let's grow together!`,
          willTeach: [{
            skill: willTeachSkill.skillId,
            level: willTeachSkill.proficiencyLevel || 'intermediate',
            description: 'Comprehensive hands-on training with real-world projects',
          }],
          wantToLearn: [{
            skill: wantToLearnSkill.skillId,
            level: ['beginner', 'intermediate'][Math.floor(Math.random() * 2)],
            description: 'Looking for practical guidance and mentorship',
          }],
          level: willTeachSkill.proficiencyLevel || 'intermediate',
          duration: [30, 45, 60, 90][Math.floor(Math.random() * 4)],
          languages: ['English'],
          tags: ['skill-trade', 'mentorship', 'learning'],
          maxParticipants: Math.floor(Math.random() * 5) + 1,
          status: 'active',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          stats: {
            views: Math.floor(Math.random() * 100),
            interests: Math.floor(Math.random() * 20),
            shares: Math.floor(Math.random() * 5),
          },
          availability: {
            timezone: 'UTC',
            schedule: [
              { 
                day: 'monday', 
                slots: [
                  { startTime: '10:00', endTime: '12:00' },
                  { startTime: '14:00', endTime: '16:00' }
                ]
              },
              { 
                day: 'wednesday', 
                slots: [
                  { startTime: '10:00', endTime: '12:00' }
                ]
              },
              { 
                day: 'friday', 
                slots: [
                  { startTime: '14:00', endTime: '17:00' }
                ]
              },
            ],
          },
        });

        posts.push(post);
      }
    }
    console.log(`✅ Created ${posts.length} posts`);

    // Create proposals
    console.log('💬 Creating proposals...');
    const proposals = [];
    
    for (let i = 0; i < 15; i++) {
      const proposer = users[i % users.length];
      const targetPost = posts[(i + 3) % posts.length];
      const receiver = await User.findById(targetPost.user);

      if (proposer._id.toString() !== receiver._id.toString()) {
        const proposalTypes = ['trade', 'chat'];
        const proposalType = proposalTypes[Math.floor(Math.random() * proposalTypes.length)];
        
        const proposalData = {
          proposer: proposer._id,
          receiver: receiver._id,
          targetPost: targetPost._id,
          proposalType: proposalType,
          message: `Hi! I'm interested in your post. ${proposalType === 'trade' ? "I'd love to trade skills with you!" : "Can we chat about this opportunity?"}`,
          status: ['pending', 'accepted', 'rejected'][Math.floor(Math.random() * 3)],
        };

        if (proposalType === 'trade' && proposer.skillsToTeach.length > 0) {
          const offeringSkill = proposer.skillsToTeach[0];
          proposalData.offering = {
            skill: offeringSkill.skillId,
            description: 'I can teach you this skill in exchange!',
          };
        }

        const proposal = await TradeProposal.create(proposalData);
        proposals.push(proposal);
      }
    }
    console.log(`✅ Created ${proposals.length} proposals`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${skills.length} skills`);
    console.log(`   - ${users.length} users`);
    console.log(`   - ${posts.length} posts`);
    console.log(`   - ${proposals.length} proposals`);
    console.log('\n🔑 Login credentials:');
    console.log('   Email: Any of the dummy emails (dummymash1@gmail.com to dummymash12@gmail.com)');
    console.log('   Password: test_seed_password_123');
    console.log('\n⚠️  Note: This is TEST DATA ONLY - not for production use\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
