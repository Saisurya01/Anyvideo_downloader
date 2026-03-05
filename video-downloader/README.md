# Universal Video Downloader

A full-stack video downloader application with React frontend and Node.js backend.

## Features

- Download videos from multiple platforms (YouTube, TikTok, Instagram, etc.)
- Multiple quality options (1080p, 720p, 480p, MP3)
- Real-time video metadata fetching using yt-dlp
- Firebase Firestore logging
- Modern dark/light mode UI

## Project Structure

```
video-downloader/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── pages/             # Page components
│   ├── api.js             # API client
│   └── firebase.js        # Firebase config
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   │   ├── videoProcessor.js
│   │   └── firebase.js
│   ├── middleware/        # Express middleware
│   └── server.js         # Main server file
└── package.json
```

## Prerequisites

1. Node.js 18+
2. yt-dlp installed on system
3. ffmpeg for video processing
4. Firebase project (optional)

## Installation

### Frontend
```bash
cd video-downloader
npm install
```

### Backend
```bash
cd video-downloader/server
npm install
```

## Configuration

### Backend Environment Variables

Create `server/.env` file:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
YTDLP_PATH=yt-dlp
TEMP_DIR=./tempDownloads

# Firebase (optional - can use firebase-credentials.json)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

### Frontend Environment Variables

Create `.env` file in root:

```env
VITE_API_URL=http://localhost:3001/api
VITE_FIREBASE_API_KEY=your-api-key
```

## Running the Application

### Start Backend
```bash
cd server
npm run dev
```
Backend runs on http://localhost:3001

### Start Frontend
```bash
npm run dev
```
Frontend runs on http://localhost:5173

## API Endpoints

### POST /api/video-info
Get video metadata

**Request:**
```json
{
  "url": "https://youtube.com/watch?v=..."
}
```

**Response:**
```json
{
  "title": "Video Title",
  "thumbnail": "https://...",
  "duration": "4:21",
  "platform": "YouTube",
  "formats": [
    { "quality": "1080p", "type": "mp4", "formatId": "22" },
    { "quality": "720p", "type": "mp4", "formatId": "best[height<=720]" }
  ]
}
```

### GET /api/download
Download video file

**Parameters:**
- `url` - Video URL
- `format` - Quality format (1080p, 720p, 480p, mp3)

## Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
```

### Backend (VPS/Docker)
- Install yt-dlp on server
- Set environment variables
- Run with PM2: `pm2 start server.js`

## Supported Platforms

- YouTube
- TikTok
- Instagram
- Twitter/X
- Facebook
- Reddit
- Vimeo
- Dailymotion
- And many more via yt-dlp

## License

MIT
