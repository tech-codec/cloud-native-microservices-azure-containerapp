# multi-stage build: build with Node, serve with nginx
FROM node:18-alpine AS builder
WORKDIR /app

# copy package files first to leverage layer caching
COPY package*.json ./

# install deps (use --legacy-peer-deps if you had peer issues locally)
RUN npm ci --silent

# copy source and build
COPY . .

# allow injecting VITE_API_URL at build time (default points to localhost gateway)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# build production assets (Vite will embed VITE_API_URL at build time)
RUN npm run build

# final image: lightweight nginx serving the static build
FROM nginx:stable-alpine
# remove default config and add SPA-friendly config (fallback to index.html)
RUN rm /etc/nginx/conf.d/default.conf
RUN printf '%s\n' \
 'server {' \
 '  listen 80;' \
 '  server_name _;' \
 '  root /usr/share/nginx/html;' \
 '  index index.html;' \
 '  location / {' \
 '    try_files $uri $uri/ /index.html;' \
 '  }' \
 '  location ~* \\.(js|css|png|jpg|jpeg|gif|svg|ico|json)$ {' \
 '    expires 1y;' \
 '    add_header Cache-Control "public, max-age=31536000, immutable";' \
 '  }' \
 '}' \
 > /etc/nginx/conf.d/frontend.conf

# copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
STOPSIGNAL SIGTERM
CMD ["nginx", "-g", "daemon off;"]