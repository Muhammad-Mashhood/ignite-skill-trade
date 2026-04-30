/**
 * Creates seed Firebase Auth users that match seed-database.js
 * Run ONCE before seeding MongoDB: node create-firebase-users.js
 */

require('dotenv').config();
const admin = require('./config/firebase-admin.js');

const SEED_PASSWORD = 'SeedPass@2024';

const seedUsers = [
  { email: 'alex.morgan@gmail.com',   displayName: 'Alex Morgan',    uid: 'seed-uid-001' },
  { email: 'sara.chen@gmail.com',      displayName: 'Sara Chen',      uid: 'seed-uid-002' },
  { email: 'james.okafor@gmail.com',   displayName: 'James Okafor',   uid: 'seed-uid-003' },
  { email: 'priya.sharma@gmail.com',   displayName: 'Priya Sharma',   uid: 'seed-uid-004' },
  { email: 'daniel.walsh@gmail.com',   displayName: 'Daniel Walsh',   uid: 'seed-uid-005' },
  { email: 'nina.kowalski@gmail.com',  displayName: 'Nina Kowalski',  uid: 'seed-uid-006' },
  { email: 'liam.turner@gmail.com',    displayName: 'Liam Turner',    uid: 'seed-uid-007' },
  { email: 'amara.diallo@gmail.com',   displayName: 'Amara Diallo',   uid: 'seed-uid-008' },
  { email: 'carlos.reyes@gmail.com',   displayName: 'Carlos Reyes',   uid: 'seed-uid-009' },
  { email: 'emily.park@gmail.com',     displayName: 'Emily Park',     uid: 'seed-uid-010' },
  { email: 'ryan.matthews@gmail.com',  displayName: 'Ryan Matthews',  uid: 'seed-uid-011' },
  { email: 'sophie.blanc@gmail.com',   displayName: 'Sophie Blanc',   uid: 'seed-uid-012' },
];

async function createFirebaseUsers() {
  console.log('🔥 Creating Firebase seed users...\n');
  let created = 0, updated = 0;

  for (const user of seedUsers) {
    try {
      // Check if already exists
      let existing;
      try { existing = await admin.auth().getUserByEmail(user.email); } catch (_) {}

      if (existing) {
        await admin.auth().updateUser(existing.uid, {
          password: SEED_PASSWORD,
          displayName: user.displayName,
        });
        console.log(`  ↻ Updated: ${user.email}`);
        updated++;
      } else {
        await admin.auth().createUser({
          uid: user.uid,
          email: user.email,
          password: SEED_PASSWORD,
          displayName: user.displayName,
          emailVerified: true,
        });
        console.log(`  ✔ Created: ${user.email}`);
        created++;
      }
    } catch (err) {
      console.error(`  ✗ Failed for ${user.email}:`, err.message);
    }
  }

  console.log(`\n✅ Done — ${created} created, ${updated} updated`);
  console.log(`\n🔑 Login with any seed account:`);
  seedUsers.forEach(u => console.log(`   ${u.email}  /  ${SEED_PASSWORD}`));
  console.log('');
  process.exit(0);
}

createFirebaseUsers();
