FROM node:18-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install yt-dlp

COPY package.json ./
COPY video-downloader/package.json ./video-downloader/
COPY video-downloader/server/package.json ./video-downloader/server/

RUN npm install

RUN cd video-downloader && npm install
RUN cd video-downloader/server && npm install

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["node", "server.js"]
