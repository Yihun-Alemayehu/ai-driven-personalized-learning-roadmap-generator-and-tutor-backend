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

# Compile seed files to JS (so they can run in production without ts-node)
RUN node node_modules/.bin/tsc --rootDir prisma --outDir dist/prisma \
  --module commonjs --target ES2022 --esModuleInterop \
  --skipLibCheck --resolveJsonModule --declaration false \
  --sourceMap false --strict false prisma/seed.ts

# Save prisma CLI before pruning devDeps (needed for db push at startup)
RUN cp -r node_modules/prisma /tmp/prisma-cli

# Strip devDependencies — runs locally, no network needed
RUN npm prune --production

# Restore prisma CLI
RUN mv /tmp/prisma-cli node_modules/prisma

FROM node:20-slim AS production
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 3001
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "dist/server.js"]
