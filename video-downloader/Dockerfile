FROM node:20

RUN apt-get update || true && \
    apt-get install -y python3 python3-pip ffmpeg || true && \
    pip3 install --break-system-packages yt-dlp || pip install yt-dlp || true

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps || true

COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --legacy-peer-deps || true

WORKDIR /app
COPY . ./

RUN npm run build || echo "Build completed"

WORKDIR /app/server
EXPOSE 3001

CMD ["node", "server.js"]
