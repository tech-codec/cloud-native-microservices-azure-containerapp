# Multi-stage Dockerfile for a Node.js user-service
# - build stage installs deps & runs optional build
# - final stage runs with production deps only

FROM node:18-alpine AS builder
WORKDIR /app

# install deps
COPY package*.json ./
RUN npm ci --silent

# copy source and run optional build (no-op if no build script)
COPY . .
RUN if [ -f package.json ] && grep -q "\"build\"" package.json; then npm run build; fi

# Final runtime image
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
# create non-root user for better security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# copy package.json and install production deps only
COPY package*.json ./
RUN npm ci --production --silent

# copy app files from builder (includes built assets if any)
COPY --from=builder /app ./

# ensure correct permissions
RUN chown -R appuser:appgroup /app
USER appuser

# expose default user service port (adjust if your service uses a different port)
EXPOSE 3001

# default command — adjust if your start script differs
CMD ["node", "index.js"]
