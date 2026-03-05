const defaultFormats = [
  { id: '1080p', label: '1080p MP4', quality: 'HD', size: 'N/A', fps: '60fps', icon: 'download' },
  { id: '720p', label: '720p MP4', quality: 'SD', size: 'N/A', fps: '30fps', icon: 'download' },
  { id: '480p', label: '480p MP4', quality: 'MOBILE', size: 'N/A', fps: '30fps', icon: 'download' },
  { id: 'mp3', label: 'MP3 Audio', quality: 'AUDIO', size: 'N/A', fps: '320kbps', icon: 'music_note' },
];

const FormatOptions = ({ formats, onDownload, showToast }) => {
  const displayFormats = formats.length > 0 ? formats : defaultFormats;
  
  const getQualityLabel = (quality) => {
    if (quality === '1080p') return 'HD';
    if (quality === '720p') return 'SD';
    if (quality === '480p') return 'MOBILE';
    if (quality === 'audio' || quality === 'mp3') return 'AUDIO';
    return quality;
  };

  const getFormatId = (format) => {
    return format.id || format.quality?.toLowerCase() || '720p';
  };

  const handleDownload = (format) => {
    const formatId = getFormatId(format);
    onDownload(formatId);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {displayFormats.map((format, index) => (
        <div 
          key={format.formatId || format.id || index}
          className="group relative flex flex-col p-4 bg-slate-50 dark:bg-[#252942] rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary hover:-translate-y-1 transition-all cursor-pointer"
          onClick={() => handleDownload(format)}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`px-2 py-0.5 text-xs font-bold rounded ${
              format.quality === '1080p' || format.quality === 'HD' ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' :
              format.quality === '720p' || format.quality === 'SD' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' :
              format.quality === '480p' || format.quality === 'MOBILE' ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' :
              'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400'
            }`}>
              {getQualityLabel(format.quality)}
            </span>
            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
              {format.quality === 'audio' || format.quality === 'mp3' ? 'music_note' : 'download'}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-slate-900 dark:text-white font-bold text-lg">
              {format.label || (format.quality === 'audio' ? 'MP3 Audio' : `${format.quality} MP4`)}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {format.size || 'N/A'} • {format.fps || format.type || 'N/A'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FormatOptions;
