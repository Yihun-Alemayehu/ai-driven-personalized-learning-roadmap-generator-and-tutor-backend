FROM node:20-slim AS builder
WORKDIR /app

# Copy pre-installed node_modules from host (avoids npm ci network download).
# node_modules already contains the Prisma client generated for Debian/glibc.
COPY package*.json ./
COPY node_modules ./node_modules
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript using the host's installed compiler
RUN node node_modules/.bin/tsc

# Strip devDependencies — runs locally, no network needed
RUN npm prune --production

FROM node:20-slim AS production
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/server.js"]
