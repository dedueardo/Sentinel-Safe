# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install ffmpeg for RTSP streaming support (node-rtsp-stream)
RUN apk add --no-cache ffmpeg

COPY package*.json ./
RUN npm install --only=production

COPY . .

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "index.js"]
