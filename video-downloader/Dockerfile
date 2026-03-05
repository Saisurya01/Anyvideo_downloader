FROM node:20

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    && pip3 install yt-dlp \
    && apt-get clean

WORKDIR /app

COPY video-downloader/package*.json ./video-downloader/
WORKDIR /app/video-downloader
RUN npm install

COPY video-downloader/server/package*.json ./server/
WORKDIR /app/video-downloader/server
RUN npm install

WORKDIR /app/video-downloader
RUN npm run build

WORKDIR /app/video-downloader/server

EXPOSE 3001

CMD ["node", "server.js"]
