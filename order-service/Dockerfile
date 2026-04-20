# Multi-stage Dockerfile for the order-service (Node.js)
# Build stage: install deps & copy source
FROM node:18-alpine AS builder
WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci --silent

# Copy source and run optional build (if present)
COPY . .
RUN if [ -f package.json ] && grep -q "\"build\"" package.json; then npm run build; fi

# Runtime image: production deps only, non-root user
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package files and install production deps
COPY package*.json ./
RUN npm ci --production --silent

# Copy application files from builder
COPY --from=builder /app ./

# Set ownership and use non-root user
RUN chown -R appuser:appgroup /app
USER appuser

# Expose service port (adjust if your service uses a different port)
EXPOSE 3002

# Default command (adjust if your start script differs, e.g. "npm start")
CMD ["node", "index.js"]
