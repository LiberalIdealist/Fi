import express from 'express';
import next from 'next';
import { parse } from 'url';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables based on environment
const NODE_ENV = process.env.NODE_ENV || 'development';
console.log(`Starting server in ${NODE_ENV} environment`);

// Get directory name for ES module (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define environment file priorities
const envFiles = [
  `.env.${NODE_ENV}.local`,
  `.env.${NODE_ENV}`,
  '.env.local',
  '.env'
];

// Load environment variables from files in priority order
envFiles.forEach(file => {
  const envPath = path.resolve(__dirname, file);
  if (fs.existsSync(envPath)) {
    console.log(`Loading environment from ${file}`);
    dotenv.config({ path: envPath });
  }
});

const dev = NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Use environment-specific port variables if available
const port = process.env.PORT || process.env[`PORT_${NODE_ENV.toUpperCase()}`] || 8080;
console.log(`Server will listen on port ${port}`);

app.prepare().then(() => {
  const server = express();

  // Custom route for NextAuth
  server.use('/api/auth', (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Handle all other routes with Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`Server is running on port ${port}`);
  });
});