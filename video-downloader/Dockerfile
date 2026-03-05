FROM node:20-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    ffmpeg \
    && pip3 install --no-cache-dir --break-system-packages yt-dlp \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install

WORKDIR /app
COPY . ./

RUN npm run build

WORKDIR /app/server
RUN mkdir -p /tmp/video-downloads

EXPOSE 3001

CMD ["node", "server.js"]
