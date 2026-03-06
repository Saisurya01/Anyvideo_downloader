import { exec } from 'child_process';
import { promisify } from 'util';
import { pipeline } from 'stream/promises';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const YTDLP_CMD = process.platform === 'win32' 
  ? 'python -m yt_dlp' 
  : 'yt-dlp';
const YTDLP_EXTRA = '--no-check-certificate';

// Use app directory for temp files to avoid path issues
const TEMP_VIDEO_DIR = '/tmp/video-downloads';

console.log('Temp directory:', TEMP_VIDEO_DIR);

if (!fs.existsSync(TEMP_VIDEO_DIR)) {
  fs.mkdirSync(TEMP_VIDEO_DIR, { recursive: true });
}

const formatMap = {
  '1080p': 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best',
  '720p': 'best[height<=720][ext=mp4]/best',
  '480p': 'best[height<=480][ext=mp4]/best',
  'mp3': 'bestaudio/best',
};

const detectPlatform = (url) => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('tiktok.com')) return 'TikTok';
  if (url.includes('instagram.com')) return 'Instagram';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter';
  if (url.includes('facebook.com') || url.includes('fb.watch')) return 'Facebook';
  if (url.includes('reddit.com') || url.includes('redd.it')) return 'Reddit';
  if (url.includes('twitch.tv')) return 'Twitch';
  if (url.includes('vimeo.com')) return 'Vimeo';
  if (url.includes('dailymotion.com')) return 'Dailymotion';
  if (url.includes('snapchat.com')) return 'Snapchat';
  if (url.includes('linkedin.com')) return 'LinkedIn';
  if (url.includes('pinterest.com')) return 'Pinterest';
  if (url.includes('imgur.com')) return 'Imgur';
  if (url.includes('gyanipandit.com') || url.includes('sexeducation')) return 'GyanIPandit';
  return 'Unknown';
};

const INVIDIOUS_INSTANCES = [
  'https://invidious.privacydev.net',
  'https://invidious.snopyta.org',
  'https://invidious.jingl.xyz',
  'https://invidious.kavin.rocks',
  'https://pipedapi.kavin.rocks',
];

const isYouTube = (url) => url.includes('youtube.com') || url.includes('youtu.be');

export const getVideoInfo = async (url) => {
  const platform = detectPlatform(url);
  
  if (isYouTube(url)) {
    const videoId = extractVideoId(url);
    if (videoId) {
      for (const instance of INVIDIOUS_INSTANCES) {
        try {
          const response = await fetch(`${instance}/api/v1/videos/${videoId}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });
          if (!response.ok) continue;
          
          const data = await response.json();
          return {
            title: data.title || 'Unknown',
            thumbnail: data.thumbnailUrl || '',
            duration: formatDuration(data.lengthSeconds) || 'Unknown',
            platform: 'YouTube',
            formats: [
              { quality: '1080p', type: 'mp4', formatId: '1080p' },
              { quality: '720p', type: 'mp4', formatId: '720p' },
              { quality: '480p', type: 'mp4', formatId: '480p' },
              { quality: 'audio', type: 'mp3', formatId: 'audio' },
            ],
          };
        } catch (e) {
          console.log(`Invidious ${instance} failed:`, e.message);
          continue;
        }
      }
    }
  }

  try {
    const command = `${YTDLP_CMD} ${YTDLP_EXTRA} --dump-json --no-download "${url}"`;
    console.log('Getting video info with:', command);
    const { stdout } = await execAsync(command, { maxBuffer: 50 * 1024 * 1024, shell: true });
    
    const info = JSON.parse(stdout);
    return {
      title: info.title || 'Unknown',
      thumbnail: info.thumbnail || info.thumbnails?.[0]?.url || '',
      duration: formatDuration(info.duration) || 'Unknown',
      platform,
      formats: [
        { quality: '1080p', type: 'mp4', formatId: 'best[height<=1080]' },
        { quality: '720p', type: 'mp4', formatId: 'best[height<=720]' },
        { quality: '480p', type: 'mp4', formatId: 'best[height<=480]' },
        { quality: 'audio', type: 'mp3', formatId: 'bestaudio' },
      ],
    };
  } catch (error) {
    console.error('yt-dlp error:', error.message);
    throw new Error(`Failed to fetch video: ${error.message}`);
  }
};

const extractVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const formatDuration = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const extractAvailableFormats = (info) => {
  const formats = [];
  const formatEntries = info.formats || [];
  
  const has1080p = formatEntries.some(f => f.height >= 1080 && f.ext === 'mp4');
  const has720p = formatEntries.some(f => f.height >= 720 && f.height < 1080 && f.ext === 'mp4');
  const has480p = formatEntries.some(f => f.height >= 480 && f.height < 720 && f.ext === 'mp4');
  const hasAudio = formatEntries.some(f => f.vcodec === 'none' && f.acodec);
  
  if (has1080p) formats.push({ quality: '1080p', type: 'mp4', formatId: '22' });
  if (has720p) formats.push({ quality: '720p', type: 'mp4', formatId: 'best[height<=720]' });
  if (has480p) formats.push({ quality: '480p', type: 'mp4', formatId: 'best[height<=480]' });
  if (hasAudio || !formats.length) formats.push({ quality: 'audio', type: 'mp3', formatId: 'bestaudio' });
  
  return formats;
};

export const downloadVideo = async (url, format, res) => {
  const outputPath = path.join(TEMP_VIDEO_DIR, `video_${Date.now()}`);
  
  if (!fs.existsSync(TEMP_VIDEO_DIR)) {
    fs.mkdirSync(TEMP_VIDEO_DIR, { recursive: true });
  }
  
  const ytdlp = 'yt-dlp';
  let command;
  
  if (format === 'mp3') {
    command = `${ytdlp} -x --audio-format mp3 --no-check-certificate -o "${outputPath}.%(ext)s" "${url}"`;
  } else if (format === '1080p') {
    command = `${ytdlp} -f "bestvideo[height<=1080]+bestaudio/best[height<=1080]/best" --no-check-certificate -o "${outputPath}.%(ext)s" "${url}"`;
  } else if (format === '720p') {
    command = `${ytdlp} -f "bestvideo[height<=720]+bestaudio/best[height<=720]/best" --no-check-certificate -o "${outputPath}.%(ext)s" "${url}"`;
  } else if (format === '480p') {
    command = `${ytdlp} -f "bestvideo[height<=480]+bestaudio/best[height<=480]/best" --no-check-certificate -o "${outputPath}.%(ext)s" "${url}"`;
  } else {
    command = `${ytdlp} --no-check-certificate -o "${outputPath}.%(ext)s" "${url}"`;
  }
  
  console.log('Downloading with command:', command);
  
  let stdout, stderr;
  try {
    const result = await execAsync(command, { maxBuffer: 500 * 1024 * 1024, shell: true });
    stdout = result.stdout;
    stderr = result.stderr;
    console.log('yt-dlp stdout:', stdout);
    if (stderr) console.log('yt-dlp stderr:', stderr);
  } catch (execError) {
    console.error('Download error:', execError.message);
    if (execError.stdout) console.log('stdout:', execError.stdout);
    if (execError.stderr) console.log('stderr:', execError.stderr);
    
    if (execError.message.includes('Requested format is not available')) {
      const fallbackCommand = `${ytdlp} --no-check-certificate -o "${outputPath}.%(ext)s" "${url}"`;
      console.log('Retrying with best format:', fallbackCommand);
      try {
        const fallbackResult = await execAsync(fallbackCommand, { maxBuffer: 500 * 1024 * 1024, shell: true });
        stdout = fallbackResult.stdout;
      } catch (fallbackError) {
        throw new Error(`Download failed: ${fallbackError.message}`);
      }
    } else {
      throw new Error(`Download failed: ${execError.message}`);
    }
  }
  
  const allFiles = fs.readdirSync(TEMP_VIDEO_DIR);
  console.log('Files in temp dir:', allFiles);
  const files = allFiles.filter(f => f.startsWith('video_') && (f.endsWith('.mp4') || f.endsWith('.mp3') || f.endsWith('.m4a')));
  console.log('Downloaded files:', files);
  const downloadedFile = files.length > 0 ? files[files.length - 1] : null;
  
  if (!downloadedFile) {
    throw new Error('Download failed. No file was created.');
  }
  
  const filePath = path.join(TEMP_VIDEO_DIR, downloadedFile);
  const stat = fs.statSync(filePath);
  const ext = path.extname(downloadedFile);
  
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Type, Content-Length');
  res.setHeader('Content-Type', ext === '.mp3' ? 'audio/mpeg' : 'video/mp4');
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Disposition', `attachment; filename="video${ext}"`);
  
  const readStream = fs.createReadStream(filePath);
  await pipeline(readStream, res);
  
  setTimeout(() => {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (e) {}
  }, 5000);
};

const downloadFromInvidious = async (videoId, format, res) => {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const response = await fetch(`${instance}/api/v1/videos/${videoId}`);
      if (!response.ok) continue;
      
      const data = await response.json();
      const formatMap = {
        '1080p': 'video-1080',
        '720p': 'video-720',
        '480p': 'video-480',
        'audio': 'audio',
      };
      
      let downloadUrl = data.adaptiveFormats?.find(f => f.type.startsWith('video/mp4') && f.qualityLabel === '1080p')?.url;
      if (!downloadUrl || format === '720p') {
        downloadUrl = data.adaptiveFormats?.find(f => f.type.startsWith('video/mp4') && f.qualityLabel === '720p')?.url;
      }
      if (!downloadUrl || format === '480p') {
        downloadUrl = data.adaptiveFormats?.find(f => f.type.startsWith('video/mp4') && f.qualityLabel === '480p')?.url;
      }
      if (!downloadUrl || format === 'mp3') {
        downloadUrl = data.adaptiveFormats?.find(f => f.type.startsWith('audio'))?.url;
      }
      
      if (!downloadUrl) {
        downloadUrl = data.adaptiveFormats?.[0]?.url;
      }
      
      if (!downloadUrl) continue;
      
      console.log('Downloading from Invidious:', instance);
      
      const videoResponse = await fetch(downloadUrl);
      if (!videoResponse.ok) continue;
      
      const ext = format === 'mp3' ? '.mp4' : '.mp4';
      res.setHeader('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');
      res.setHeader('Content-Disposition', `attachment; filename="${data.title || 'video'}.${format === 'mp3' ? 'mp3' : 'mp4'}"`);
      
      await pipeline(videoResponse.body, res);
      return;
    } catch (e) {
      console.log('Failed:', e.message);
      continue;
    }
  }
  throw new Error('Download failed. Try a different video.');
};

export const cleanupOldFiles = () => {
  try {
    const files = fs.readdirSync(TEMP_VIDEO_DIR);
    const now = Date.now();
    const maxAge = 60 * 60 * 1000;
    
    files.forEach(file => {
      const filePath = path.join(TEMP_VIDEO_DIR, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
      }
    });
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};

setInterval(cleanupOldFiles, 15 * 60 * 1000);
