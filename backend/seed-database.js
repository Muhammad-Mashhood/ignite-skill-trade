const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/user.model');
const Post = require('./models/post.model');
const Skill = require('./models/skill.model');
const TradeProposal = require('./models/trade-proposal.model');
const Course = require('./models/course.model');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skilltrade', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ─── Real-looking users ───────────────────────────────────────────────────────
const seedUsers = [
  {
    email: 'alex.morgan@gmail.com',
    name: 'Alex Morgan',
    bio: 'Full-stack developer with 6 years of experience building web apps. Love sharing what I know and always hungry to learn something new.',
    firebaseUid: 'seed-uid-001',
    location: 'San Francisco, CA',
  },
  {
    email: 'sara.chen@gmail.com',
    name: 'Sara Chen',
    bio: 'UI/UX designer at a fintech startup. Passionate about clean interfaces and helping people understand design thinking.',
    firebaseUid: 'seed-uid-002',
    location: 'New York, NY',
  },
  {
    email: 'james.okafor@gmail.com',
    name: 'James Okafor',
    bio: 'Data scientist with a background in economics. I work with Python and R daily and love teaching statistics to beginners.',
    firebaseUid: 'seed-uid-003',
    location: 'Austin, TX',
  },
  {
    email: 'priya.sharma@gmail.com',
    name: 'Priya Sharma',
    bio: "React Native developer specializing in cross-platform apps. Also a weekend photographer who'd love to improve her editing skills.",
    firebaseUid: 'seed-uid-004',
    location: 'Seattle, WA',
  },
  {
    email: 'daniel.walsh@gmail.com',
    name: 'Daniel Walsh',
    bio: 'Digital marketer with 8 years running campaigns for SaaS companies. Looking to learn more about the technical side of things.',
    firebaseUid: 'seed-uid-005',
    location: 'Chicago, IL',
  },
  {
    email: 'nina.kowalski@gmail.com',
    name: 'Nina Kowalski',
    bio: 'Graphic designer and brand identity specialist. Adobe Creative Suite is my home. Always curious about motion design.',
    firebaseUid: 'seed-uid-006',
    location: 'Portland, OR',
  },
  {
    email: 'liam.turner@gmail.com',
    name: 'Liam Turner',
    bio: 'Backend engineer focused on Node.js and distributed systems. I enjoy breaking down complex concepts into simple explanations.',
    firebaseUid: 'seed-uid-007',
    location: 'Boston, MA',
  },
  {
    email: 'amara.diallo@gmail.com',
    name: 'Amara Diallo',
    bio: 'Freelance video editor and storyteller. 5 years cutting content for YouTube creators and corporate clients.',
    firebaseUid: 'seed-uid-008',
    location: 'Atlanta, GA',
  },
  {
    email: 'carlos.reyes@gmail.com',
    name: 'Carlos Reyes',
    bio: 'MBA graduate turned product manager. I analyze markets, write specs, and bridge business with engineering every day.',
    firebaseUid: 'seed-uid-009',
    location: 'Miami, FL',
  },
  {
    email: 'emily.park@gmail.com',
    name: 'Emily Park',
    bio: 'Portrait and street photographer based in LA. Shoot on Sony mirrorless. Happy to teach Lightroom, composition, and studio lighting.',
    firebaseUid: 'seed-uid-010',
    location: 'Los Angeles, CA',
  },
  {
    email: 'ryan.matthews@gmail.com',
    name: 'Ryan Matthews',
    bio: 'DevOps & cloud architect with certs in AWS and GCP. Building pipelines and infra is my day job — teaching it is my passion.',
    firebaseUid: 'seed-uid-011',
    location: 'Denver, CO',
  },
  {
    email: 'sophie.blanc@gmail.com',
    name: 'Sophie Blanc',
    bio: 'Copywriter and content strategist. I write for SaaS, e-commerce, and B2B brands. Currently trying to learn web design basics.',
    firebaseUid: 'seed-uid-012',
    location: 'Nashville, TN',
  },
];

// ─── Skills ───────────────────────────────────────────────────────────────────
const skillsData = [
  { name: 'JavaScript', category: 'Programming', description: 'Modern JavaScript including ES6+, async/await, and DOM manipulation' },
  { name: 'Python', category: 'Programming', description: 'Python for scripting, data analysis, and automation' },
  { name: 'React', category: 'Programming', description: 'Component-based UI development with React and hooks' },
  { name: 'Node.js', category: 'Programming', description: 'Server-side JavaScript with Express and REST APIs' },
  { name: 'Graphic Design', category: 'Design', description: 'Visual communication, brand identity, and layout design' },
  { name: 'UI/UX Design', category: 'Design', description: 'User research, wireframing, prototyping, and Figma' },
  { name: 'Digital Marketing', category: 'Marketing', description: 'SEO, paid ads, email campaigns, and growth analytics' },
  { name: 'Video Editing', category: 'Other', description: 'Post-production, color grading, and storytelling with Premiere & DaVinci' },
  { name: 'Photography', category: 'Photography', description: 'Composition, lighting, camera settings, and Lightroom editing' },
  { name: 'Data Science', category: 'Programming', description: 'Data wrangling, visualization, and ML with Python and R' },
  { name: 'Mobile Development', category: 'Programming', description: 'React Native and cross-platform app development' },
  { name: 'Cloud Computing', category: 'Programming', description: 'AWS, GCP, CI/CD pipelines, and Docker/Kubernetes' },
  { name: 'Content Writing', category: 'Writing', description: 'Blog posts, case studies, and brand storytelling' },
  { name: 'SEO', category: 'Marketing', description: 'On-page SEO, keyword research, and technical audits' },
  { name: 'Spanish', category: 'Languages', description: 'Conversational and business Spanish' },
  { name: 'Guitar', category: 'Music', description: 'Acoustic and electric guitar — chords, scales, and improvisation' },
  { name: 'Yoga', category: 'Fitness', description: 'Hatha and Vinyasa yoga instruction for beginners to intermediate' },
  { name: 'Business Analysis', category: 'Business', description: 'Market research, competitive analysis, and financial modeling' },
  { name: 'Copywriting', category: 'Writing', description: 'Conversion-focused copy for landing pages, ads, and emails' },
  { name: 'Adobe Premiere', category: 'Other', description: 'Professional video editing, transitions, and audio mixing' },
];

// ─── Post content that looks real ─────────────────────────────────────────────
const postTemplates = [
  {
    title: "I'll teach you React — you teach me Data Science",
    description: "I've been shipping React apps for 4 years and can take you from zero to building real projects. In return, I'm looking for someone who can walk me through data pipelines, pandas, and maybe some ML basics. Happy to do weekly 1-hour sessions.",
  },
  {
    title: "Graphic Designer looking to swap skills for JavaScript lessons",
    description: "I design brand identities and marketing assets for a living, but I've always wanted to bring my designs to life in the browser. Looking for a JS or React mentor to do weekly sessions in exchange for design reviews, logo work, or Figma help.",
  },
  {
    title: "Learn Python from a Data Scientist — I want UX Design in return",
    description: "I work in data science daily (pandas, matplotlib, scikit-learn) and enjoy teaching it from scratch. Would love sessions with a UX designer who can help me understand user research, wireframing, and Figma. Let's trade!",
  },
  {
    title: "Video editing lessons for someone who can teach me marketing",
    description: "I edit YouTube videos and short-form content professionally. I can teach Premiere Pro, DaVinci, pacing, and storytelling. Looking for someone with digital marketing or SEO chops who can help me grow my freelance business.",
  },
  {
    title: "Offering Node.js & backend tutoring — want to learn Photography",
    description: "I build REST APIs and microservices for a fintech company. I can teach Node.js, Express, databases, and auth flows. Hoping to find a photographer who can teach me Lightroom and composition — I just got a mirrorless camera!",
  },
  {
    title: "Swap: Mobile App Dev (React Native) ↔ Digital Marketing",
    description: "I've shipped 3 React Native apps to the App Store. Will happily walk you through navigation, state management, and publishing. Want to learn how to run Facebook ads, email campaigns, and grow an app audience in return.",
  },
  {
    title: "UI/UX Designer offering Figma sessions — learning cloud infrastructure",
    description: "I run design sprints and build prototypes for early-stage startups. Looking to swap Figma and UX fundamentals for AWS or GCP cloud basics. Remote sessions, flexible schedule, 1 hour/week to start.",
  },
  {
    title: "Teach you Copywriting — want to learn Web Development basics",
    description: "I've written for 50+ SaaS brands and can teach you how to write landing pages, emails, and ads that convert. Looking for someone to walk me through HTML, CSS, and maybe a bit of JavaScript — I want to build my own portfolio site.",
  },
  {
    title: "Photography lessons (Sony/Lightroom) for coding help",
    description: "I shoot portraits and street photography in LA. Happy to teach camera settings, composition, and editing in Lightroom. Looking for a developer who can help me with Python or simple web scripting for automating my workflow.",
  },
  {
    title: "Cloud & DevOps mentor — looking for Graphic Design skills",
    description: "AWS Solutions Architect by day. I can teach Docker, CI/CD, Terraform, and cloud architecture. Would love someone to help me with logo design, brand identity, or even just better slide decks.",
  },
  {
    title: "Learn SEO from me — I want to learn Spanish",
    description: "I've ranked dozens of sites on page 1 and can teach keyword research, on-page optimization, and technical SEO audits. Looking for a native or fluent Spanish speaker for conversational practice — business level preferred.",
  },
  {
    title: "Business Analysis & Product Strategy for JavaScript lessons",
    description: "I can teach you market sizing, competitive frameworks, user story writing, and roadmapping. Have an MBA and 5+ years in product management. Looking for a JS developer to help me understand the technical side of building products.",
  },
  {
    title: "Guitar lessons for someone who can teach me Video Editing",
    description: "Been playing guitar for 10 years — rock, blues, fingerpicking. Can teach complete beginners or help intermediate players level up. Want to learn Premiere Pro or DaVinci Resolve to start making music videos for my band.",
  },
  {
    title: "Data Science tutoring in exchange for Copywriting coaching",
    description: "I'll walk you through Python, data cleaning, visualization, and basic machine learning. In return, I need help writing better technical blog posts and LinkedIn content — I want to build my personal brand in data.",
  },
  {
    title: "Yoga instructor offering sessions — want to learn React",
    description: "I teach Vinyasa and Hatha yoga and can offer private virtual sessions. In exchange, I'm looking to learn React from someone patient enough to explain components and state to a complete beginner.",
  },
];

// ─── Course content that looks real ───────────────────────────────────────────
const courseTemplates = [
  {
    title: "Full-Stack Web Development: From Zero to React",
    description: "A comprehensive journey through modern web development. We'll start with HTML/CSS, dive deep into JavaScript, and build complete applications using React and Node.js. Perfect for beginners or those looking to solidify their fundamentals.",
    category: "Programming",
    level: "beginner",
    price: 0,
    coinsRequired: 150,
    duration: 1200,
  },
  {
    title: "Mastering UI/UX Design with Figma",
    description: "Learn how to design beautiful, user-centered interfaces. This course covers everything from wireframing and prototyping to design systems and handoff to developers. Includes real-world projects and design critiques.",
    category: "Design",
    level: "intermediate",
    price: 0,
    coinsRequired: 100,
    duration: 600,
  },
  {
    title: "Python for Data Science & Machine Learning",
    description: "Unlock the power of your data with Python. We'll cover Pandas for data manipulation, Matplotlib for visualization, and scikit-learn for building your first machine learning models. Practical examples used throughout.",
    category: "Programming",
    level: "intermediate",
    price: 0,
    coinsRequired: 200,
    duration: 900,
  },
  {
    title: "Digital Marketing: The SEO Playbook",
    description: "Stop guessing and start ranking. This course breaks down technical SEO, keyword research, and content strategy into actionable steps. You'll learn the exact frameworks I've used to grow organic traffic by 300%.",
    category: "Marketing",
    level: "all",
    price: 0,
    coinsRequired: 120,
    duration: 450,
  },
  {
    title: "Cinematic Video Editing in Premiere Pro",
    description: "Take your footage from raw to cinematic. We'll cover pacing, J/L cuts, sound design, color grading, and export settings for different platforms. Stop making boring videos and start telling stories.",
    category: "Other",
    level: "all",
    price: 0,
    coinsRequired: 180,
    duration: 540,
  },
];

const SEED_PASSWORD = 'SeedPass@2024';

async function seedDatabase() {
  try {
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Post.deleteMany({});
    await Skill.deleteMany({});
    await TradeProposal.deleteMany({});
    await Course.deleteMany({});
    console.log('✅ Cleared');

    // Skills
    console.log('📚 Seeding skills...');
    const skills = await Skill.insertMany(skillsData);
    console.log(`✅ ${skills.length} skills created`);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(SEED_PASSWORD, salt);

    // Users
    console.log('👤 Seeding users...');
    const users = [];
    for (let i = 0; i < seedUsers.length; i++) {
      const userData = seedUsers[i];
      const shuffled = [...skills].sort(() => Math.random() - 0.5);

      // 1–3 skills to teach
      const numTeach = Math.floor(Math.random() * 3) + 1;
      const skillsToTeach = shuffled.slice(0, numTeach).map(s => ({
        skillId: s._id,
        proficiencyLevel: ['intermediate', 'advanced', 'expert'][Math.floor(Math.random() * 3)],
        yearsOfExperience: Math.floor(Math.random() * 7) + 2,
      }));

      // 1–3 skills to learn (non-overlapping)
      const numLearn = Math.floor(Math.random() * 3) + 1;
      const skillsToLearn = shuffled.slice(numTeach, numTeach + numLearn).map(s => ({
        skillId: s._id,
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      }));

      const user = await User.create({
        ...userData,
        password: hashedPassword,
        coins: Math.floor(Math.random() * 400) + 150,
        skillsToTeach,
        skillsToLearn,
        rating: {
          average: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)), // 3.5–5.0
          count: Math.floor(Math.random() * 60) + 5,
        },
        languages: ['English'],
        timezone: 'UTC',
        isVerified: Math.random() > 0.2,
        level: Math.floor(Math.random() * 5) + 1,
        totalSessionsCompleted: Math.floor(Math.random() * 40) + 2,
      });

      users.push(user);
    }
    console.log(`✅ ${users.length} users created`);

    // Posts
    console.log('📝 Seeding posts...');
    const posts = [];
    for (let i = 0; i < postTemplates.length; i++) {
      const user = users[i % users.length];
      const teach = user.skillsToTeach;
      const learn = user.skillsToLearn;

      if (teach.length === 0 || learn.length === 0) continue;

      const offerSkill = teach[Math.floor(Math.random() * teach.length)];
      const wantSkill  = learn[Math.floor(Math.random() * learn.length)];

      const post = await Post.create({
        user: user._id,
        type: 'trade',
        title: postTemplates[i].title,
        description: postTemplates[i].description,
        willTeach: [{
          skill: offerSkill.skillId,
          level: offerSkill.proficiencyLevel || 'intermediate',
          description: 'Structured sessions with real-world examples and hands-on practice.',
        }],
        wantToLearn: [{
          skill: wantSkill.skillId,
          level: ['beginner', 'intermediate'][Math.floor(Math.random() * 2)],
          description: 'Open to any teaching style — patient guidance appreciated.',
        }],
        level: offerSkill.proficiencyLevel || 'intermediate',
        duration: [30, 45, 60, 90][Math.floor(Math.random() * 4)],
        languages: ['English'],
        tags: ['skill-trade', 'mentorship'],
        maxParticipants: 1,
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        stats: {
          views: Math.floor(Math.random() * 120) + 10,
          interests: Math.floor(Math.random() * 25),
          shares: Math.floor(Math.random() * 8),
        },
        availability: {
          timezone: 'UTC',
          schedule: [
            { day: 'monday',    slots: [{ startTime: '18:00', endTime: '20:00' }] },
            { day: 'wednesday', slots: [{ startTime: '18:00', endTime: '20:00' }] },
            { day: 'saturday',  slots: [{ startTime: '10:00', endTime: '13:00' }] },
          ],
        },
      });

      posts.push(post);
    }
    console.log(`✅ ${posts.length} posts created`);

    // Proposals
    console.log('💬 Seeding proposals...');
    const proposalMessages = [
      "Hey! Your post caught my eye — I'd love to swap skills. I think we'd be a great match!",
      "This is exactly what I've been looking for. Would you be open to a quick intro call first?",
      "I saw your post and think we can really help each other. Let me know if you're still looking!",
      "I'm genuinely interested in learning from you and think I can offer a lot in return.",
      "Your background sounds impressive. I'd love to set up a session — what works for you?",
    ];

    let propCount = 0;
    for (let i = 0; i < 12; i++) {
      const proposer = users[i % users.length];
      const targetPost = posts[(i + 2) % posts.length];
      const receiver = await User.findById(targetPost.user);

      if (!receiver || proposer._id.toString() === receiver._id.toString()) continue;
      if (proposer.skillsToTeach.length === 0) continue;

      const offerSkill = proposer.skillsToTeach[0];

      await TradeProposal.create({
        proposer: proposer._id,
        receiver: receiver._id,
        targetPost: targetPost._id,
        proposalType: 'trade',
        message: proposalMessages[i % proposalMessages.length],
        status: ['pending', 'pending', 'accepted', 'rejected'][Math.floor(Math.random() * 4)],
        offering: {
          skill: offerSkill.skillId,
          description: 'Happy to tailor sessions to your pace and goals.',
        },
      });
      propCount++;
    }
    console.log(`✅ ${propCount} proposals created`);

    // Courses
    console.log('🎓 Seeding courses...');
    const courses = [];
    const thumbnails = {
      'Programming': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000',
      'Design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=1000',
      'Marketing': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000',
      'Other': 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=1000',
    };

    for (let i = 0; i < courseTemplates.length; i++) {
      const instructor = users[i % users.length];
      const template = courseTemplates[i];
      const matchingSkill = skills.find(s => s.category === template.category) || skills[0];

      const course = await Course.create({
        ...template,
        instructor: instructor._id,
        skills: [matchingSkill._id],
        isPublished: true,
        isDraft: false,
        thumbnail: { url: thumbnails[template.category] || thumbnails['Other'] },
        stats: {
          views: Math.floor(Math.random() * 500) + 50,
          enrollmentCount: Math.floor(Math.random() * 100) + 10,
          averageRating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
          ratingCount: Math.floor(Math.random() * 50) + 5,
        }
      });
      courses.push(course);
    }
    console.log(`✅ ${courses.length} courses created`);

    console.log('\n🎉 Database seeded with realistic data!\n');
    console.log('🔑 Login with any of these accounts:');
    seedUsers.forEach(u => console.log(`   ${u.email}  /  ${SEED_PASSWORD}`));
    console.log('\n⚠️  Dev/test data only — do not use in production\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seedDatabase();
