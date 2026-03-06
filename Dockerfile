FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install yt-dlp --break-system-packages

RUN curl -fsSL https://deno.land/install.sh | sh

ENV DENO_INSTALL="/root/.deno"
ENV PATH="$DENO_INSTALL/bin:$PATH"

RUN ln -s /usr/local/bin/yt-dlp /usr/bin/yt-dlp

COPY package.json ./
COPY video-downloader/package.json ./video-downloader/
COPY video-downloader/server/package.json ./video-downloader/server/

RUN rm -rf video-downloader/node_modules video-downloader/package-lock.json
RUN rm -rf video-downloader/server/node_modules video-downloader/server/package-lock.json

RUN npm install

RUN cd video-downloader && npm install
RUN cd video-downloader/server && npm install

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["node", "server.js"]
