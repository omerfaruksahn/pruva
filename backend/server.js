const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const xss = require('xss-clean');
const path = require('path');
const errorHandler = require('./errorHandler');
const { generalLimiter } = require('./rateLimiter');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// --- PARANOID SECURITY MIDDLEWARE ---
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
            scriptSrcAttr: ["'unsafe-inline'"], // Allow onclick handlers
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", "http://localhost:5000", "http://127.0.0.1:5000"],
        },
    },
})); 
app.use(xss());    // Request body/query/params içindeki script'leri temizle
app.use(hpp());    // HTTP Parameter Pollution koruması
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Body boyutunu kısıtla (Paranoid)

// Static Files - Serve everything from the parent directory (No Rate Limit for assets)
app.use(express.static(path.join(__dirname, '..')));

// Routes with Rate Limiting
app.use('/api', generalLimiter); // Apply rate limit only to API endpoints
app.use('/api/auth', require('./routes/auth'));
app.use('/api/outlook', require('./routes/outlook'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/offers', require('./routes/offers'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/coins', require('./routes/coins'));
app.use('/api/pricing', require('./routes/pricingData'));
app.use('/api/pricing', require('./routes/pricingActions'));
app.use('/api/ai', require('./routes/aiChat'));



// Root route - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// 404 Handler for API
app.use('/api', (req, res, next) => {
    const error = new Error('API Endpoint Bulunamadı');
    error.statusCode = 404;
    next(error);
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Centralized Error Handler (Must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`[SERVER] ${PORT} portunda yayında...`);
    console.log(`[SERVER] Frontend: http://localhost:${PORT}`);
});

module.exports = server;

