FROM node:20-alpine AS builder
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

FROM node:20-alpine AS production
# gcompat provides a glibc compatibility layer so the Debian-compiled Prisma
# query engine can load on Alpine (musl). Alpine 3.19+ ships gcompat.
RUN apk add --no-cache gcompat
WORKDIR /app
ENV NODE_ENV=production
# Force Prisma to use the Debian engine binary we copied from the host,
# rather than looking for a linux-musl variant that doesn't exist here.
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/server.js"]
