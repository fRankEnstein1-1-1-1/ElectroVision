import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

// Import Routes (Note the .js extension!)
import User from './db/user_model.js';
import appRouter from './routes/index_routes.js'; 
import predictionRoutes from './routes/predictionRoute.js'; 

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log(" MongoDB Connected Successfully!"))
  .catch((error) => console.log('MongoDB Connection Error:', error));

// Routes
// It is cleaner to prefix everything with /api/v1, but this works too:
app.use('/api', predictionRoutes); // Access via: /api/predict
app.use('/api/v1', appRouter);     // Access via: /api/v1/user/login etc.

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});