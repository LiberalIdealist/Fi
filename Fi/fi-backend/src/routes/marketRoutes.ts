import { Router, Request, Response, NextFunction } from 'express';
import getStockDataRouter from '../controllers/market/getStockData.js';
import axios from 'axios';

// Helper function for async route handlers
const asyncHandler = (fn: Function) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

const router = Router();

// Stock data route (already has router implementation)
router.use('/get-stock-data', getStockDataRouter);

// News route
router.get('/get-news', asyncHandler(async (req: Request, res: Response) => {
  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  
  const response = await axios.get(
    `https://newsapi.org/v2/everything`, {
      params: {
        q: 'stocks OR mutual funds OR investments',
        language: 'en',
        sortBy: 'publishedAt',
        apiKey: NEWS_API_KEY
      }
    }
  );

  // Axios responses don't have .ok property, need to check status
  res.json(response.data);
}));

// Mutual funds route
router.get('/get-mutual-funds', asyncHandler(async (req: Request, res: Response) => {
  const response = await fetch("https://api.mfapi.in/mf");
  
  if (!response.ok) {
    throw new Error(`Failed to fetch mutual funds: ${response.statusText}`);
  }

  const mutualFunds = await response.json();
  res.json(mutualFunds);
}));

export default router;