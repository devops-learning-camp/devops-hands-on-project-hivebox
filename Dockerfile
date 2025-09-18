# https://docs.warpbuild.com/ci/docker-builders/golden-dockerfiles/nodejs/nodejs-pnpm

# Use Node.js LTS as the base image for consistency and long-term support
FROM node:lts-jod AS base

# Stage 1: Install production dependencies using pnpm
FROM base AS deps

# Enable corepack (manages package managers like pnpm)
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy only package definition files first
COPY package.json pnpm-lock.yaml ./

# Cache the pnpm store for faster dependency fetches across builds
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
 pnpm fetch --frozen-lockfile

# Install only production dependencies
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
 pnpm install --frozen-lockfile --prod

# Stage 2: Create the final lightweight production image
FROM base

# Create a non-root user
RUN useradd -m hiveboxuser

# Set working directory
WORKDIR /app

# Copy only production dependencies (no dev dependencies)
COPY --from=deps /app/node_modules /app/node_modules

# Copy entire source code
COPY . .

# Explicitly set environment to production
ENV NODE_ENV production

# Switch to non-root user
USER hiveboxuser

# Default command to run your Node.js application
CMD ["node", "./src/server.ts"]