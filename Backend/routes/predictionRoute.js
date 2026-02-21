import express from 'express';
// Check if you need to import the controller with .js too!
import { getPrediction } from '../controllers/predictionController.js'; 

const router = express.Router();

router.post('/predict', getPrediction);

export default router; // <--- This replaces 'module.exports = router'