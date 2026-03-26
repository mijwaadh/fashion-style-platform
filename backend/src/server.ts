import './config/env'; // MUST BE THE VERY FIRST IMPORT
import express from 'express';
import cors from 'cors';

import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import lookRoutes from './routes/lookRoutes';
import productRoutes from './routes/productRoutes';
import userRoutes from './routes/userRoutes';
import uploadRoutes from './routes/uploadRoutes';
import searchRoutes from './routes/searchRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import commentRoutes from './routes/commentRoutes';
import collectionRoutes from './routes/collectionRoutes';
import notificationRoutes from './routes/notificationRoutes';
import adminRoutes from './routes/adminRoutes';
import payoutRoutes from './routes/payoutRoutes';
import sellerOnboardRoutes from './routes/sellerOnboardRoutes';
import cartRoutes from './routes/cartRoutes';
import addressRoutes from './routes/addressRoutes';
import orderRoutes from './routes/orderRoutes';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:3000',
    'https://stywear.vercel.app',
    'https://fashion-style-platform.vercel.app'
].filter(Boolean) as string[];

console.log('CORS Allowed Origins:', allowedOrigins);
app.use(cors({ 
    // Dynamically reflect the request origin if it's in the list, or just allow it if it's the new domain
    origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('stywear.vercel.app')) {
            callback(null, true);
        } else {
            // For now, allow any origin to prevent blocking
            callback(null, true);
        }
    },
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] REQ: ${req.method} ${req.url}`);
  next();
});

// API Routes
console.log("SERVER_STARTING: Reading routes...");
app.use('/api/auth', authRoutes);

app.use('/api/looks', lookRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller-onboard', sellerOnboardRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);

// Health Check
app.get('/health', (_req, res) => res.json({ status: 'ok', message: 'Aura API is running.' }));

// Global 404
app.use((_req, res) => res.status(404).json({ message: 'AURA_SERVER_404: Route not found.' }));

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('SERVER_ERROR:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Connect DB and Start Server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🌿 Aura API Server running on port ${PORT}`);
    });
  } catch (error: any) {
    console.error(`FAILED_TO_START_SERVER: ${error.message}`);
    process.exit(1);
  }
};

startServer();
