# Base image
FROM node:20-alpine AS build

# Set working directory to match project root
WORKDIR /fi-backend

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies including dev (needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Production image
FROM node:20-alpine

# Set working directory to match project root
WORKDIR /fi-backend

# Copy built app from build stage
COPY --from=build /fi-backend/dist ./dist
COPY --from=build /fi-backend/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Create non-root user for security
# IMPORTANT: This needs to be BEFORE using the user in chown
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Change ownership to non-root user
RUN chown -R appuser:appgroup /fi-backend

# Switch to non-root user
USER appuser

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]