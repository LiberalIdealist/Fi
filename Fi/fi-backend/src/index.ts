import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "@/app/api/auth/routes";
import chatRoutes from "@/app/api/chat/routes";
import documentRoutes from "@/app/api/documents/routes";
import marketRoutes from "@/app/api/market/routes";
import profileRoutes from "@/app/api/profile/routes";
import recommendationRoutes from "@/app/api/recommendations/routes";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/recommendations", recommendationRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("🚀 Fi Backend API is Running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});