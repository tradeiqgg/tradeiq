# ============================================================================
# TradeIQ Multi-Stage Dockerfile for Starship Deployment
# ============================================================================
# This Dockerfile builds and runs the TradeIQ Next.js frontend application.
# It's designed to work with the current structure and can be adapted for
# a future monorepo layout with /app/frontend and /app/backend.
#
# Package Manager: npm (detected via package-lock.json)
# Port: 3000
# Build Mode: Next.js standalone (fast boot, low memory)
# ============================================================================

# ----------------------------------------------------------------------------
# STAGE 1: Builder - Install dependencies and build the Next.js app
# ----------------------------------------------------------------------------
FROM node:20-alpine AS builder

# Set working directory in container
WORKDIR /app

# Install build dependencies required for native module compilation
# The 'usb' package (via @keystonehq/sdk) requires node-gyp which needs:
# - python3: Required by node-gyp for native builds
# - make: Build tool for compiling native code
# - g++: C++ compiler for native bindings
# - bash: Some build scripts require bash (Alpine uses sh by default)
# These are only needed during build, not in the final runtime image
RUN apk add --no-cache python3 make g++ bash

# Copy package files for dependency installation
# This layer is cached unless package files change
COPY package.json package-lock.json* ./

# Install dependencies using npm
# Using --frozen-lockfile equivalent (ci install) for reproducible builds
RUN npm ci

# Copy all application source code
# Note: Currently the Next.js app is at root level with /app directory
# If you move to monorepo structure (/app/frontend), update this to:
# COPY app/frontend ./app/frontend
# COPY components ./components
# COPY lib ./lib
# COPY public ./public
# COPY stores ./stores
# COPY types ./types
# COPY *.config.* ./
# COPY *.json ./
# COPY tsconfig.json ./
COPY . .

# Build the Next.js application in production mode
# This creates the .next/standalone directory with optimized output
RUN npm run build

# ----------------------------------------------------------------------------
# STAGE 2: Runner - Create minimal production image
# ----------------------------------------------------------------------------
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone build output from builder stage
# Next.js standalone includes only the necessary files for production
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy public assets (images, etc.) - standalone doesn't include these
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy .next/static for static assets optimization
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port 3000 (Starship and Next.js default)
EXPOSE 3000

# Set environment variable for Next.js
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the Next.js production server
# The standalone build includes node_modules, so we can run directly
CMD ["node", "server.js"]

# ============================================================================
# FUTURE BACKEND SUPPORT
# ============================================================================
# When you add a backend at /app/backend, you have two options:
#
# Option 1: Separate Dockerfiles
# - Keep this Dockerfile for frontend
# - Create Dockerfile.backend for backend
# - Use docker-compose.yml to orchestrate both
#
# Option 2: Multi-service Dockerfile
# - Add another COPY step for backend after frontend build
# - Use a process manager like PM2 or supervisor
# - Update CMD to run both services
#
# Example for Option 2 (when ready):
# COPY --from=builder --chown=nextjs:nodejs /app/app/backend ./app/backend
# RUN npm install -g pm2
# COPY ecosystem.config.js ./
# CMD ["pm2-runtime", "ecosystem.config.js"]
# ============================================================================

