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
const YTDLP_EXTRA = '--no-check-certificate --extractor-args "youtube:player_client=web,default_client=web" --extractor-args "youtube:player_skip=webpage,configs"';
const FFMPEG_PATH = 'ffmpeg';
console.log('Using yt-dlp command:', YTDLP_CMD);
console.log('Using ffmpeg path:', FFMPEG_PATH);

// Use app directory for temp files to avoid path issues
const TEMP_VIDEO_DIR = process.platform === 'win32' 
  ? path.join(__dirname, 'temp_downloads')
  : '/tmp/video-downloads';

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
  if (url.includes('reddit.com')) return 'Reddit';
  if (url.includes('twitch.tv')) return 'Twitch';
  if (url.includes('vimeo.com')) return 'Vimeo';
  if (url.includes('dailymotion.com')) return 'Dailymotion';
  return 'Unknown';
};

export const getVideoInfo = async (url) => {
  try {
    const ytdlp = process.platform === 'win32' ? 'python -m yt_dlp' : 'yt-dlp';
    const clientArg = '--extractor-args "youtube:player_client=tv"';
    const command = `${ytdlp} ${YTDLP_EXTRA} ${clientArg} --dump-json --no-download "${url}"`;
    console.log('Getting video info with command:', command);
    const { stdout } = await execAsync(command, { maxBuffer: 50 * 1024 * 1024, shell: true });
    
    const info = JSON.parse(stdout);
    
    const duration = info.duration ? formatDuration(info.duration) : 'Unknown';
    const thumbnail = info.thumbnail || info.thumbnails?.[0]?.url || '';
    const title = info.title || 'Unknown Title';
    const platform = detectPlatform(url);
    
    const formats = extractAvailableFormats(info);
    
    return {
      title,
      thumbnail,
      duration,
      platform,
      formats,
    };
  } catch (error) {
    console.error('Error getting video info:', error.message);
    throw new Error(`Failed to fetch video information: ${error.message}`);
  }
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
  
  // Ensure temp directory exists
  if (!fs.existsSync(TEMP_VIDEO_DIR)) {
    fs.mkdirSync(TEMP_VIDEO_DIR, { recursive: true });
  }
  
  const ytdlp = process.platform === 'win32' ? 'python -m yt_dlp' : 'yt-dlp';
  const clientArg = '--extractor-args "youtube:player_client=tv"';
  let command;
  if (format === 'mp3') {
    command = `${ytdlp} -x --audio-format mp3 ${clientArg} -o "${outputPath}.%(ext)s" "${url}"`;
  } else {
    command = `${ytdlp} -f best ${clientArg} -o "${outputPath}.%(ext)s" "${url}"`;
  }
  
  console.log('Downloading with command:', command);
  console.log('Output path:', outputPath);
  
  try {
    const { stdout, stderr } = await execAsync(command, { 
      maxBuffer: 500 * 1024 * 1024, 
      shell: true
    });
    console.log('Command completed');
    console.log('stdout:', stdout ? stdout.slice(-500) : 'none');
    if (stderr) console.log('stderr:', stderr.slice(-500));
  } catch (execError) {
    console.error('Download error:', execError.message);
    if (execError.stderr) console.error('stderr:', execError.stderr.slice(-500));
    throw new Error(`Download failed: ${execError.message}`);
  }
  
  const allFiles = fs.readdirSync(TEMP_VIDEO_DIR);
  
  // Find any video file
  const files = allFiles.filter(f => f.startsWith('video_') && (f.endsWith('.mp4') || f.endsWith('.mp3') || f.endsWith('.m4a')));
  
  // Get the most recent file
  const downloadedFile = files.length > 0 ? files[files.length - 1] : null;
  
  if (!downloadedFile) {
    throw new Error('Download failed. No file was created.');
  }
  
  const filePath = path.join(TEMP_VIDEO_DIR, downloadedFile);
  const stat = fs.statSync(filePath);
  const ext = path.extname(downloadedFile);
  
  const contentType = ext === '.mp3' ? 'audio/mpeg' : 'video/mp4';
  
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Disposition', `attachment; filename="video${ext}"`);
  
  const readStream = fs.createReadStream(filePath);
  
  await pipeline(readStream, res);
  
  setTimeout(() => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.error('Error cleaning up file:', e);
    }
  }, 5000);
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
