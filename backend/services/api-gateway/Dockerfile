FROM node:20-alpine AS builder
WORKDIR /app

# Copy pre-installed node_modules from host (avoids npm ci network download)
COPY package*.json ./
COPY node_modules ./node_modules
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript using the host's installed compiler
RUN node node_modules/.bin/tsc

# Strip devDependencies — runs locally, no network needed
RUN npm prune --production

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["node", "dist/server.js"]
