import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { Router } from "express";
import { firebaseConfig } from "./config/firebase"; // Changed to named import

dotenv.config();

// Initialize Express App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Create router instances for each API section
const authRouter = Router();
const chatRouter = Router();
const documentRouter = Router();
const marketRouter = Router();
const profileRouter = Router();
const recommendationRouter = Router();

// Import handlers for each route
import loginHandler from "./app/api/auth/login";
import geminiAnalysisHandler from "./app/api/chat/geminiAnalysis";
import uploadHandler from "./app/api/documents/upload";
import getStockDataHandler from "./app/api/market/getStockData";
import getProfileHandler from "./app/api/profile/getProfile";
import generatePortfolioHandler from "./app/api/recommendations/generatePortfolio";

// Set up the route handlers
authRouter.post("/login", async (req, res) => {
  try {
    const result = await loginHandler(req, res);
    // If not already sent, send the result
    if (!res.headersSent) {
      res.json(result);
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: "Authentication failed" });
    }
  }
});

chatRouter.post("/geminiAnalysis", async (req, res) => {
  try {
    const result = await geminiAnalysisHandler(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Analysis failed" });
  }
});

documentRouter.post("/upload", async (req, res) => {
  try {
    // Assuming the upload handler expects buffer, filename, and mimetype
    const { fileBuffer, fileName, mimeType } = req.body;
    const result = await uploadHandler(fileBuffer, fileName, mimeType);
    res.json({ url: result });
  } catch (error) {
    res.status(500).json({ error: "Upload failed" });
  }
});

marketRouter.get("/getStockData", async (req, res, next) => {
  try {
    // Fix: Pass req, res, and next to the handler as it expects them
    const result = await getStockDataHandler(req, res, next);
    if (!res.headersSent) {
      res.json(result);
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to get stock data" });
    }
  }
});

profileRouter.get("/getProfile/:userId", async (req, res) => {
  try {
    const result = await getProfileHandler(req);
    if (!res.headersSent) {
      res.json(result);
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to get profile" });
    }
  }
});

recommendationRouter.post("/generatePortfolio", async (req, res) => {
  try {
    const result = await generatePortfolioHandler(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate portfolio" });
  }
});

// Register the routers with the app
app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);
app.use("/api/documents", documentRouter);
app.use("/api/market", marketRouter);
app.use("/api/profile", profileRouter);
app.use("/api/recommendations", recommendationRouter);

// Root route
app.get("/", (req, res) => {
  res.send("Fi Backend API is running...");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});