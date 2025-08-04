FROM node:20-slim AS builder

WORKDIR /app

# Install OpenSSL and libssl-dev (required for Prisma)
RUN apt-get update && \
    apt-get install -y openssl libssl-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Prisma client + build
RUN npx prisma generate
RUN npm run build

# Entrypoint
COPY entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["./entrypoint.sh"]



# For Production
FROM node:20-slim

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json* ./
COPY --from=builder /app/node_modules .node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

RUN npx prisma generate

# entrypoint script
COPY entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["./entrypoint.sh"]