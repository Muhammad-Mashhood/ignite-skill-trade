# SkillTrade Backend API

## Overview

This is the backend API for the SkillTrade platform, built with Node.js, Express, and MongoDB.

## Structure

```
backend/
├── config/
│   ├── database.js          # MongoDB connection
│   └── environment.js       # Environment variables
├── controllers/
│   ├── user.controller.js   # User authentication & profile
│   ├── skill.controller.js  # Skill management
│   ├── trade.controller.js  # Trade/session management
│   └── coin.controller.js   # Coin transactions
├── models/
│   ├── user.model.js        # User schema
│   ├── skill.model.js       # Skill schema
│   ├── trade.model.js       # Trade schema
│   └── transaction.model.js # Transaction schema
├── routes/
│   ├── user.routes.js       # User routes
│   ├── skill.routes.js      # Skill routes
│   ├── trade.routes.js      # Trade routes
│   └── coin.routes.js       # Coin routes
├── services/
│   ├── coin-economy.service.js  # Coin management logic
│   ├── matching.service.js      # User matching algorithm
│   └── ai-dubbing.service.js    # AI dubbing (placeholder)
├── middlewares/
│   ├── auth.middleware.js       # JWT authentication
│   └── error.middleware.js      # Error handling
├── utils/
│   ├── logger.js                # Logging utility
│   └── helpers.js               # Helper functions
└── server.js                    # Application entry point
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skilltrade
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
```

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Documentation

### Authentication

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Protected Routes

All protected routes require the JWT token in the Authorization header:
```http
Authorization: Bearer <your_jwt_token>
```

#### Get Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "bio": "My bio",
  "languages": ["English", "Spanish"]
}
```

### Skills

#### Get All Skills
```http
GET /api/skills?category=Programming&search=python
```

#### Create Skill
```http
POST /api/skills
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Python Programming",
  "category": "Programming",
  "description": "Learn Python basics"
}
```

### Trades

#### Create Trade Request
```http
POST /api/trades
Authorization: Bearer <token>
Content-Type: application/json

{
  "teacherId": "teacher_user_id",
  "skillId": "skill_id",
  "sessionType": "video-call",
  "scheduledAt": "2024-01-15T10:00:00Z",
  "duration": 60
}
```

#### Get User Trades
```http
GET /api/trades?status=pending&role=teacher
Authorization: Bearer <token>
```

#### Accept Trade
```http
PUT /api/trades/:tradeId/accept
Authorization: Bearer <token>
```

#### Complete Trade
```http
PUT /api/trades/:tradeId/complete
Authorization: Bearer <token>
```

#### Rate Trade
```http
PUT /api/trades/:tradeId/rate
Authorization: Bearer <token>
Content-Type: application/json

{
  "score": 5,
  "feedback": "Great session!"
}
```

### Coins

#### Get Balance
```http
GET /api/coins/balance
Authorization: Bearer <token>
```

#### Get Transactions
```http
GET /api/coins/transactions?type=earn&limit=20
Authorization: Bearer <token>
```

## Models

### User
- name, email, password
- coins (balance)
- skillsToTeach, skillsToLearn
- rating, level, badges
- languages, timezone, availability

### Skill
- name, category, description
- tags, icon
- popularityScore

### Trade
- teacher, learner, skill
- coinsAmount, status
- sessionType, scheduledAt, duration
- rating, feedback

### Transaction
- user, type (earn/spend/bonus)
- amount, balanceAfter
- relatedTrade, description

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Error Handling

All errors are handled by the error middleware and return JSON:
```json
{
  "success": false,
  "error": "Error message"
}
```

### Authentication

JWT tokens are used for authentication. Include in header:
```
Authorization: Bearer <token>
```

## Testing

Testing infrastructure to be added.

## Future Enhancements

- WebSocket for real-time notifications
- Redis for caching
- Email notifications
- File upload for avatars/videos
- Advanced search and filtering
