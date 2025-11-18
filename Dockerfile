# ============================================================================
# TradeIQ Multi-Stage Dockerfile for Starship Hyperlift Deployment
# ============================================================================
# This Dockerfile builds and runs the TradeIQ Next.js frontend application.
# Uses Debian-based Node images (NOT Alpine) to support native dependencies
# like 'usb' package which requires kernel headers and libusb.
#
# Package Manager: npm (detected via package-lock.json)
# Port: 8080 (Starship Hyperlift default)
# Build Mode: Next.js standalone (fast boot, low memory)
# ============================================================================

# ----------------------------------------------------------------------------
# STAGE 1: Builder - Install dependencies and build the Next.js app
# ----------------------------------------------------------------------------
FROM node:20-bullseye AS builder

# Set working directory in container
WORKDIR /app

# Install build dependencies required for native module compilation
# The 'usb' package (via @keystonehq/sdk) requires:
# - python3: Required by node-gyp for native builds
# - make: Build tool for compiling native code
# - g++: C++ compiler for native bindings
# - libusb-1.0-0-dev: USB library development headers (required by usb package)
# - linux-headers-amd64: Generic kernel headers for Debian (not host-specific)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libusb-1.0-0-dev \
    linux-headers-amd64 \
    && rm -rf /var/lib/apt/lists/*

# Copy package files for dependency installation
# This layer is cached unless package files change
COPY package.json package-lock.json* ./

# Install dependencies using npm
# Using npm ci for reproducible builds (equivalent to --frozen-lockfile)
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

# Verify the standalone build was created successfully
RUN test -f .next/standalone/server.js || (echo "Error: standalone build failed - server.js not found" && exit 1)

# ----------------------------------------------------------------------------
# STAGE 2: Runner - Create minimal production image
# ----------------------------------------------------------------------------
FROM node:20-slim AS runner

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create a non-root user for security
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 nextjs

# Copy the standalone build output from builder stage
# Next.js standalone mode creates a self-contained directory structure
# The standalone directory contains server.js, node_modules, and app structure
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy .next/static for static assets optimization
# Standalone mode doesn't include static files, so we copy them separately
# These need to be at .next/static relative to where server.js runs
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy public assets (images, etc.) - standalone doesn't include these
# Public folder needs to be at the root where server.js runs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

# Expose port 8080 (Starship Hyperlift default application port)
EXPOSE 8080

# Set environment variables for Next.js
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Start the Next.js production server
# The standalone build includes node_modules and server.js at the root
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
# RUN apt-get update && apt-get install -y pm2 && rm -rf /var/lib/apt/lists/*
# COPY ecosystem.config.js ./
# CMD ["pm2-runtime", "ecosystem.config.js"]
# ============================================================================

