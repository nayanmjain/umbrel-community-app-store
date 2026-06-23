FROM node:20-slim AS builder

WORKDIR /build
COPY ai-engine/package.json ai-engine/tsconfig.json ./
COPY ai-engine/src/ ./src/
RUN npm ci && npm run build

FROM node:20-slim

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /build/dist ./dist
COPY --from=builder /build/node_modules ./node_modules
COPY ai-engine/package.json ./

COPY nocodb-plugin ./nocodb-plugin

ENV PLUGIN_DIR=/app/nocodb-plugin

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3001/api/v1/health || exit 1

CMD ["node", "dist/index.js"]
