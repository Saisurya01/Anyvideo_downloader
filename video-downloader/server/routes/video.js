import express from 'express';
import { getVideoInfo, downloadVideo } from '../services/videoProcessor.js';
import { logDownload } from '../services/firebase.js';

const router = express.Router();

const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

router.post('/video-info', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    if (!validateUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    const videoInfo = await getVideoInfo(url);
    
    await logDownload({
      url,
      platform: videoInfo.platform,
      videoTitle: videoInfo.title,
      availableFormats: videoInfo.formats.map(f => f.quality),
    });
    
    res.json(videoInfo);
  } catch (error) {
    console.error('Video info error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch video information' });
  }
});

router.get('/download', async (req, res) => {
  try {
    const { url, format } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    if (!validateUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    const selectedFormat = format || '720p';
    console.log('Download requested:', { url, format: selectedFormat });
    
    await downloadVideo(url, selectedFormat, res);
  } catch (error) {
    console.error('Download error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Download failed. Try a different format or video.' });
    }
  }
});

export default router;
