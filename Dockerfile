# ============================================================================
# Stage 1: Build Frontend
# ============================================================================
FROM node:18-alpine AS frontend-builder

# Set working directory
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy frontend source
COPY frontend/ ./

# Build the React application
RUN npm run build

# ============================================================================
# Stage 2: Production
# ============================================================================
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install production dependencies for backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production

# Copy backend source files
COPY backend/ ./

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/build /app/frontend/build

# Create data directory for SQLite database
RUN mkdir -p /app/backend/data

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run the application
CMD ["node", "server.js"]
