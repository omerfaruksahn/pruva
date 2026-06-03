const express = require('express');
const cors = require('cors');
const { startEmailScheduler } = require('./services/schedulerService');
const helmet = require('helmet');
const hpp = require('hpp');
const xss = require('xss-clean');
const path = require('path');
const errorHandler = require('./errorHandler');
const { generalLimiter, aiLimiter, uploadLimiter } = require('./rateLimiter');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// Trust proxy (Render/Cloudflare) for express-rate-limit
app.set('trust proxy', 1);

// --- PARANOID SECURITY MIDDLEWARE ---
app.use(helmet({
    crossOriginOpenerPolicy: false, // OAuth pop-up penceresinin parent ile iletişim kurabilmesi için kapatıldı
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
            scriptSrcAttr: ["'unsafe-inline'"], // Allow onclick handlers
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", "http://localhost:5000", "http://127.0.0.1:5000", "https://firebasestorage.googleapis.com", ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [])],
        },
    },
})); 
app.use(xss());    // Request body/query/params içindeki script'leri temizle
app.use(hpp());    // HTTP Parameter Pollution koruması
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5000', 'http://127.0.0.1:5000', 'http://localhost:3005', 'https://pruvahub.com', 'https://www.pruvahub.com'];
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? ALLOWED_ORIGINS : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
app.use((req, res, next) => {
    if (req.path.startsWith('/api/rate-sheets')) {
        express.json({ limit: '50mb' })(req, res, next);
    } else {
        express.json({ limit: '10kb' })(req, res, next);
    }
});

// Block sensitive files
app.use((req, res, next) => {
    const blocked = ['.env', 'firebase-service-account', 'msal_cache', '.git'];
    if (blocked.some(b => req.path.toLowerCase().includes(b))) {
        return res.status(403).send('Forbidden');
    }
    next();
});

// Static Files - Serve only specific folders/files
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/assets', express.static(path.join(__dirname, '..', 'public', 'assets')));
app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use('/js', express.static(path.join(__dirname, '..', 'js')));
app.use('/index.html', express.static(path.join(__dirname, '..', 'index.html')));

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
app.use('/api/ai', aiLimiter, require('./routes/aiChat'));
app.use('/api/rate-sheets', uploadLimiter, express.json({ limit: '50mb' }), express.urlencoded({ limit: '50mb', extended: true }), require('./routes/rateSheets'));
app.use('/api/user-actions', require('./routes/userActions'));
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

const { exec } = require('child_process');
exec('node init_db.js', (err, stdout, stderr) => {
    if (err) console.error('[INIT DB ERROR]', err);
    else console.log('[INIT DB SUCCESS]', stdout);
});

const server = app.listen(PORT, () => {
    console.log(`[SERVER] ${PORT} portunda yayında...`);
    console.log(`[SERVER] Frontend: http://localhost:${PORT}`);
    // E-posta arka plan zamanlayıcısını otomatik olarak başlat
    startEmailScheduler();
});

module.exports = server;

