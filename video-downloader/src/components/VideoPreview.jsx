import FormatOptions from './FormatOptions';

const VideoPreview = ({ video, onDownloadFormat, showToast }) => {
  const formats = video.formats || [];
  
  return (
    <div className="bg-white dark:bg-[#1a1d2e] rounded-xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
      <div className="relative aspect-video w-full group">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: video.thumbnail ? `url('${video.thumbnail}')` : undefined }}
        ></div>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="size-16 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-2xl scale-100 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-4xl">play_arrow</span>
          </div>
        </div>
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">
          {video.duration}
        </div>
      </div>
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
              <span className="material-symbols-outlined text-lg">brand_awareness</span>
              {video.platform}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
              {video.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{video.metadata || ''}</p>
          </div>
        </div>
        <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">settings_suggest</span>
            Select Download Format &amp; Quality
          </h3>
          <FormatOptions formats={formats} onDownload={onDownloadFormat} showToast={showToast} />
        </div>
      </div>
    </div>
  );
};

export default VideoPreview;
