import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";

// Load environment variables
dotenv.config();

// Import backend route handlers
import authRoutes from "./app/api/auth/routes";
import chatRoutes from "./app/api/chat/routes";
import profileRoutes from "./app/api/profile/routes";
import marketRoutes from "./app/api/market/routes";
import documentRoutes from "./app/api/documents/routes";
import recommendationsRoutes from "./app/api/recommendations/routes";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS
app.use(helmet()); // Security headers

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/recommendations", recommendationsRoutes);

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Healthy", timestamp: new Date() });
});

// Global Error Handling Middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Fi Backend is running on port ${PORT}`);
});