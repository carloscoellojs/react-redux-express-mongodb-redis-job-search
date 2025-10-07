const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const redis = require('redis');
const app = express();
const PORT = process.env.PORT || 2000;

const mongodb_password = encodeURIComponent(process.env.MONGODB_PASSWORD);

mongoose.connect(
  `mongodb+srv://${process.env.MONGODB_USERNAME}:${mongodb_password}@${process.env.SERVERLESS_INSTANCE}`
);

// Redis client setup and initialization
let redisClient = null;
let redisAvailable = false;

const initializeRedis = async () => {
    try {
        // Check if REDIS_URL is provided, otherwise use individual connection parameters
        const redisConfig = process.env.REDIS_URL 
            ? { url: process.env.REDIS_URL }
            : {
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                password: process.env.REDIS_PASSWORD || undefined,
              };

        redisClient = redis.createClient({
            ...redisConfig,
            socket: {
                connectTimeout: 5000,
                lazyConnect: true
            }
        });

        redisClient.on('error', (err) => {
            console.warn('Redis Client Error:', err.message);
            redisAvailable = false;
        });

        redisClient.on('connect', () => {
            const connectionMethod = process.env.REDIS_URL ? 'URL' : 'host/port';
            console.log(`✓ Connected to Redis via ${connectionMethod} - caching enabled`);
            redisAvailable = true;
        });

        redisClient.on('end', () => {
            console.log('Redis connection closed - caching disabled');
            redisAvailable = false;
        });

        await redisClient.connect();
        redisAvailable = true;
    } catch (error) {
        console.warn('Redis unavailable - continuing without caching:', error.message);
        redisClient = null;
        redisAvailable = false;
    }
};

// Make Redis client available globally
global.redisClient = null;
global.redisAvailable = false;

// Initialize Redis
initializeRedis().then(() => {
    global.redisClient = redisClient;
    global.redisAvailable = redisAvailable;
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/dist')));

const JobController = require('./controllers/JobController.cjs');
app.use('/api/v1/jobs', JobController);

// Catch-all handler for client-side routing
app.use((req, res, next) => {
    // If the request is for an API route that doesn't exist, return 404
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'API endpoint not found' });
    }
    // Otherwise, serve the React app
    res.sendFile(path.join(__dirname, '/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

