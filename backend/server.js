const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
require('dotenv').config();

const connectDB = require('./config/database');
const { errorHandler } = require('./middlewares/error.middleware');

// Import routes
const userRoutes = require('./routes/user.routes');
const skillRoutes = require('./routes/skill.routes');
const tradeRoutes = require('./routes/trade.routes');
const tradeProposalRoutes = require('./routes/trade-proposal.routes');
const coinRoutes = require('./routes/coin.routes');
const uploadRoutes = require('./routes/upload.routes');
const postRoutes = require('./routes/post.routes');
const feedRoutes = require('./routes/feed.routes');
const messageRoutes = require('./routes/message.routes');
const courseRoutes = require('./routes/course.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// CORS Configuration
const corsOptions = {
  origin: true, // Allow all origins for production stability
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased from 100 to 500 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for auth endpoints
  skip: (req) => {
    return req.path.includes('/users/sync') || 
           req.path.includes('/users/profile') ||
           req.path.includes('/health');
  },
});

// Apply rate limiting to API routes (but not to excluded paths)
app.use('/api/', limiter);

// Security Middleware
app.use(helmet()); // Set security headers
app.use(cors(corsOptions)); // Enable CORS with options
app.use(express.json({ limit: '10mb' })); // Body parser with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attacks
app.use(morgan('dev')); // Logging

// Routes
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/trade-proposals', tradeProposalRoutes);
app.use('/api/coins', coinRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/courses', courseRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'SkillTrade API is running' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SkillTrade server running on port ${PORT}`);
});

module.exports = app;
