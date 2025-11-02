# 🔄 SkillTrade - Global Peer-to-Peer Skill Trading Platform

## 🧠 Project Overview

**SkillTrade** is an innovative web platform that enables people around the world to **exchange skills directly** without using money. It operates on a **barter-based system** enhanced with **AI** and **gamified digital currency (coins)**. The platform allows users to **teach what they know** and **learn what they need**, building a self-sustaining global ecosystem for skill development.

### 🎯 Core Concept

Instead of paying for courses, users can:
- **Teach skills** they already possess to earn coins
- **Spend coins** to learn new skills from others
- Create a global knowledge barter economy

**Example:** A graphic designer teaches design to earn coins, then uses those coins to learn Python from another user.

---

## 📁 Project Structure

```
ignite-skill-trade/
├── backend/                 # Node.js/Express API Server
│   ├── config/             # Database & environment configuration
│   ├── controllers/        # Request handlers
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic (AI, matching, coins)
│   ├── middlewares/       # Auth & error handling
│   ├── utils/             # Helper functions
│   ├── server.js          # App entry point
│   ├── package.json       # Backend dependencies
│   └── .env.example       # Environment variables template
│
└── frontend/              # React Application
    ├── src/
    │   ├── components/    # Reusable UI components
    │   ├── pages/        # Page components
    │   ├── contexts/     # React Context (Auth, Toast)
    │   ├── services/     # API calls
    │   ├── App.jsx       # Main app component
    │   └── main.jsx      # App entry point
    ├── index.html
    ├── package.json      # Frontend dependencies
    ├── vite.config.js    # Vite configuration
    └── .env.example      # Environment variables template
```

---

## ⚙️ Key Features

### 1. **Skill Exchange System (Coin Economy)**
- Users earn coins by teaching
- Spend coins to learn from others
- Smart matching algorithm pairs compatible users

### 2. **AI-Powered Language Dubbing** (Planned)
- Automatic translation and dubbing of sessions
- Cross-language learning without barriers

### 3. **Skill Profiles and Portfolios**
- Skills to teach and learn
- Ratings and reviews
- Progress badges and achievements

### 4. **Gamification**
- Levels and achievements
- Badges for milestones
- Community challenges

### 5. **Smart Matching**
- AI-powered recommendations
- Skill compatibility scoring
- Language and timezone matching

### 6. **Video Learning & Chat** (Planned)
- Real-time video calling (WebRTC)
- Chat system
- Session recording

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** Firebase Authentication (free)
- **Storage:** Firebase Storage (free - 5GB)
- **Security:** Helmet, CORS
- **API Architecture:** RESTful

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **State Management:** Context API
- **Authentication:** Firebase Auth SDK
- **Storage:** Firebase Storage SDK
- **Styling:** CSS

### Firebase Services
- **Authentication (FREE):** Email/Password, Social Login (10k verifications/month)
  - ✅ No credit card required!
  - ✅ Perfect for MVP

**Note:** Firebase Storage requires Blaze (paid) plan. For MVP, we use:
- **Base64 encoding** for avatars (free, stored in MongoDB)
- **Alternative:** Cloudinary, ImgBB, or other free image hosting services

### Future Integrations
- **AI Services:** OpenAI Whisper, ElevenLabs, Gemini API
- **Video:** WebRTC for peer-to-peer calls
- **Blockchain:** Token-based coin system (future)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or MongoDB Atlas)
- **Firebase Account** (free - no credit card needed)
- **npm** or **yarn**

### Installation

#### 1. Clone the repository
```bash
git clone <repository-url>
cd ignite-skill-trade
```

#### 2. Setup Firebase (Required)

**Quick Start:** Follow [QUICKSTART_FIREBASE.md](./QUICKSTART_FIREBASE.md) (10 minutes)

**Detailed Guide:** See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

**Summary:**
1. Create Firebase project at https://console.firebase.google.com/
2. Enable Authentication (Email/Password)
3. Enable Storage
4. Get Firebase config for frontend (.env)
5. Download service account key for backend

#### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configurations:
# - MONGODB_URI
# - FIREBASE_SERVICE_ACCOUNT path
```

Backend will run on `http://localhost:5000`

#### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with Firebase config from Firebase Console
```

Frontend will run on `http://localhost:3000`

#### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### 6. Verify Setup

Run the setup checker (Windows):
```powershell
.\check-setup.ps1
```

---

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skilltrade

# Firebase Admin SDK - Path to service account JSON
FIREBASE_SERVICE_ACCOUNT=./firebase-service-account.json
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api

# Firebase Config (from Firebase Console)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456:web:abc123
```

**📚 Get Firebase values:** [QUICKSTART_FIREBASE.md](./QUICKSTART_FIREBASE.md)

---

## 🔑 API Endpoints

### Authentication (Firebase)
- `POST /api/users/firebase-register` - Register with Firebase token
- `POST /api/users/sync` - Sync Firebase user with backend
- `GET /api/users/profile` - Get user profile (Protected)
- `PUT /api/users/profile` - Update profile (Protected)
- `GET /api/users/:id` - Get user by ID (Protected)

### Skills
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Create new skill (Protected)
- `GET /api/skills/:id` - Get single skill
- `PUT /api/skills/:id` - Update skill (Protected)
- `DELETE /api/skills/:id` - Delete skill (Protected)

### Trades (Sessions)
- `GET /api/trades` - Get user's trades (Protected)
- `POST /api/trades` - Create trade request (Protected)
- `PUT /api/trades/:id/accept` - Accept trade (Protected)
- `PUT /api/trades/:id/complete` - Complete trade (Protected)
- `PUT /api/trades/:id/rate` - Rate completed trade (Protected)

### Coins
- `GET /api/coins/balance` - Get coin balance (Protected)
- `GET /api/coins/transactions` - Get transaction history (Protected)
- `POST /api/coins/bonus` - Award bonus coins (Protected)

---

## 📊 Database Schema

### User Model
- Personal information (name, email, password)
- Coin balance
- Skills to teach/learn
- Rating and level
- Badges and achievements
- Languages and timezone

### Skill Model
- Skill name and category
- Description and tags
- Popularity metrics

### Trade Model
- Teacher and learner references
- Skill being traded
- Coin amount
- Session details (type, date, duration)
- Status (pending, accepted, completed)
- Rating and feedback

### Transaction Model
- User reference
- Transaction type (earn, spend, bonus)
- Amount and balance
- Related trade

---

## 🎮 Usage Flow

### For Teachers (Earning Coins)
1. Add skills you can teach to your profile
2. Get matched with learners
3. Accept trade requests
4. Conduct teaching sessions
5. Mark session as complete
6. Receive coins + rating

### For Learners (Spending Coins)
1. Add skills you want to learn
2. Browse available teachers
3. Send trade request (costs coins)
4. Attend learning session
5. Rate and review teacher

---

## 🧪 Testing

Currently, testing infrastructure is not set up. Future additions will include:
- Unit tests (Jest)
- Integration tests (Supertest)
- E2E tests (Cypress)

---

## 🚧 Roadmap

### Phase 1: MVP (Current)
- [x] User authentication
- [x] Basic skill management
- [x] Coin economy system
- [x] Trade/session management
- [x] Rating system
- [ ] Complete UI for all features

### Phase 2: Enhanced Features
- [ ] Real-time video calling (WebRTC)
- [ ] Chat messaging
- [ ] Advanced matching algorithm
- [ ] Notification system
- [ ] Profile verification

### Phase 3: AI Integration
- [ ] AI-powered language dubbing
- [ ] Automatic transcription
- [ ] AI tutor assistance
- [ ] Content moderation

### Phase 4: Scale & Expansion
- [ ] Mobile app (React Native)
- [ ] Blockchain integration
- [ ] Skill certification partnerships
- [ ] Community features (forums, groups)

---

## 🤝 Contributing

This is an MVP/prototype project. Contributions, suggestions, and feedback are welcome!

---

## 📄 License

MIT License

---

## 👨‍💻 Developer Notes

### Current Status: MVP/Prototype

This is a **minimum viable product** designed to demonstrate the core concept of skill trading. Many features are placeholders awaiting full implementation.

### Key Implementation Notes:

1. **AI Services:** Currently stubbed - requires API keys and integration
2. **Video Calling:** Not yet implemented - will use WebRTC
3. **Matching Algorithm:** Basic implementation - can be enhanced with ML
4. **Payment/Coins:** Internal system only - no real money involved

### Quick Commands

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev

# Production Build (Frontend)
npm run build
```

---

## 📧 Support

For questions or issues, please open a GitHub issue or contact the development team.

---

**Built with ❤️ for democratizing global education through peer-to-peer skill exchange.**
