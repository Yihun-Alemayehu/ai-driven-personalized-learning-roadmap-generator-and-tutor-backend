FROM node:20-slim AS builder
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

RUN node node_modules/.bin/tsc --rootDir prisma --outDir dist/prisma \
  --module commonjs --target ES2022 --esModuleInterop \
  --skipLibCheck --resolveJsonModule --declaration false \
  --sourceMap false --strict false prisma/seed.ts

RUN cp -r node_modules/prisma /tmp/prisma-cli
RUN npm prune --production
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
