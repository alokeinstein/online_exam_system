import express from 'express';
import cors from 'cors'; 
import { configDotenv } from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import examRoutes from './routes/examRoutes.js';
configDotenv();

const app = express();
const port = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api', courseRoutes); 
app.use('/api', examRoutes);   

// --- Server Initialization ---
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});








