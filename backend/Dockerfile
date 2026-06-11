FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && \
    npm install tsx typescript --save-dev

# Copy source
COPY src/ ./src/
COPY tsconfig.json ./

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["npx", "tsx", "src/server.ts"]
