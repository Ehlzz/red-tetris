# Build a lightweight production image for the API/socket server
FROM node:20-alpine

WORKDIR /app

# Install dependencies (production only) first to leverage Docker layer caching
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy source
COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
