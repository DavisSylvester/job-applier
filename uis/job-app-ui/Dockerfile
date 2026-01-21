# Multi-stage build for Angular UI with monorepo dependencies

# Stage 1: Build the application
FROM oven/bun:1.3.6 AS builder

WORKDIR /app

# Copy root workspace files
COPY package.json bun.lock bunfig.toml turbo.json ./
COPY tsconfig.json ./

# Copy workspace packages needed for build
COPY libs/interfaces ./libs/interfaces
COPY uis/job-app-ui ./uis/job-app-ui

# Install dependencies (resolves workspace:* references)
RUN bun install --frozen-lockfile

# Build the Angular application using Turbo
RUN bunx turbo run build --filter=@job-applier/ui

# Stage 2: Production nginx server
FROM nginx:alpine

# Copy custom nginx configuration
COPY uis/job-app-ui/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular app from builder stage
COPY --from=builder /app/uis/job-app-ui/dist/job-app-ui/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
