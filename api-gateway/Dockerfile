# Multi-stage Dockerfile for API Gateway (Node.js)
FROM node:18-alpine AS builder
WORKDIR /app

# install dependencies
COPY package*.json ./
RUN npm ci --silent

# copy source
COPY . .

# (optional) run build if present
RUN if [ -f package.json ] && grep -q "\"build\"" package.json; then npm run build; fi

# runtime image: production deps only, non-root user
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

# create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# install production deps
COPY package*.json ./
RUN npm ci --production --silent

# copy application files from builder
COPY --from=builder /app ./

# set permissions and switch to non-root
RUN chown -R appuser:appgroup /app
USER appuser

# expose gateway port
EXPOSE 3000

# basic healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- --timeout=2000 http://localhost:3000/health || exit 1

# start
CMD ["node", "index.js"]