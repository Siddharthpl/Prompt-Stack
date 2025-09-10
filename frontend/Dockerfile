# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Set build args
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GRAPHQL_URL
ARG NEXT_PUBLIC_GRAPHQL_ENDPOINT
ARG GOOGLE_CLIENT_ID
ARG CLOUDINARY_CLOUD_NAME
ARG CLOUDINARY_API_KEY

# Set environment for build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GRAPHQL_URL=$NEXT_PUBLIC_GRAPHQL_URL
ENV NEXT_PUBLIC_GRAPHQL_ENDPOINT=$NEXT_PUBLIC_GRAPHQL_ENDPOINT
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME
ENV CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY


# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile

# Copy configuration files first (for better caching)
COPY next.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY tsconfig.json ./
COPY components.json ./
COPY eslint.config.mjs ./

# Copy source code
COPY app ./app
COPY components ./components
COPY lib ./lib
COPY hooks ./hooks
COPY middleware.ts ./

# Copy public assets
COPY public ./public

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application (envs get baked here)
RUN npm run build

# Production stage
FROM node:20-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy package.json and install production dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json* ./
RUN npm ci --only=production --frozen-lockfile && npm cache clean --force

# Copy the standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Ensure the server.js file exists and is executable
RUN chmod +x server.js

# Set proper permissions
RUN chown -R nextjs:nodejs /app

# Set the user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Set the hostname to allow external connections
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Start the application
CMD ["node", "server.js"]
