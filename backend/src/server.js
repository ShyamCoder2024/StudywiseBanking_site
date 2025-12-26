import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import compression from 'compression';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import { initQuizCleanupJob } from './services/quizCleanupService.js';
import cacheMiddleware from './middleware/cacheMiddleware.js';

dotenv.config();

const app = express();

// Compression middleware - gzip/brotli for all responses
app.use(compression());

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', process.env.FRONTEND_URL].filter(Boolean),
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Cache middleware for GET requests (2 minute TTL)
app.use(cacheMiddleware());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'StudyWiseBanking API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', quizRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Database connection with optimized settings
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/studywisebanking';
        await mongoose.connect(mongoUri, {
            maxPoolSize: 10, // Maximum number of connections in pool
            minPoolSize: 2,  // Minimum number of connections
            serverSelectionTimeoutMS: 5000, // Timeout for server selection
            socketTimeoutMS: 45000, // Socket timeout
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        // Initialize quiz cleanup cron job
        initQuizCleanupJob();
    });
});

// ============================================
// ENTERPRISE STABILITY: Global Error Handlers
// ============================================

// Handle unhandled promise rejections (prevents silent crashes)
process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
    // In production, log to monitoring service
    // Don't crash the server - just log and continue
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error.message);
    console.error('Stack:', error.stack);
    // Graceful shutdown - give time for pending requests
    setTimeout(() => {
        process.exit(1);
    }, 1000);
});

// Handle SIGTERM (graceful shutdown for cloud platforms)
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received. Shutting down gracefully...');
    mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed.');
        process.exit(0);
    });
});

export default app;
