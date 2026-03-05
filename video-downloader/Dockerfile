FROM node:20

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    && pip3 install yt-dlp \
    && apt-get clean

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/

RUN npm install

RUN npm run build

COPY server ./server

EXPOSE 3001

WORKDIR /app/server
CMD ["node", "server.js"]
