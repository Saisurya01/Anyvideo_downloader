export const downloadVideo = async (url, format, res) => {
  const outputPath = path.join(TEMP_DIR, `video_${Date.now()}`);
  
  // Always use best available format - keep it simple
  let command;
  if (format === 'mp3') {
    command = `${YTDLP_CMD} ${YTDLP_EXTRA} -x --audio-format mp3 -o "${outputPath}.%(ext)s" "${url}"`;
  } else {
    command = `${YTDLP_CMD} ${YTDLP_EXTRA} -f best -o "${outputPath}.%(ext)s" "${url}"`;
  }
  
  console.log('Downloading with command:', command);
  
  try {
    await execAsync(command, { maxBuffer: 500 * 1024 * 1024 });
  } catch (execError) {
    console.error('Download error:', execError.message);
    throw new Error(`Download failed: ${execError.message}`);
  }
  
  const files = fs.readdirSync(TEMP_DIR).filter(f => f.startsWith(`video_${Date.now() - 60000}`));
  const downloadedFile = files.find(f => f.startsWith('video_'));
  
  if (!downloadedFile) {
    throw new Error('Download failed. No file was created.');
  }
  
  const filePath = path.join(TEMP_DIR, downloadedFile);
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
