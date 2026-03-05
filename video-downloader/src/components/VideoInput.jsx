const VideoInput = ({ url, setUrl, onDownload, error, disabled }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative flex items-center p-2 rounded-xl bg-white dark:bg-[#1a1d2e] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800">
        <div className="pl-4 pr-2 text-slate-400">
          <span className="material-symbols-outlined">link</span>
        </div>
        <input
          className="flex-1 border-none focus:ring-0 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 text-base py-3"
          placeholder="Paste video link here..."
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !disabled && onDownload()}
          disabled={disabled}
        />
        <button 
          className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onDownload}
          disabled={disabled}
        >
          <span>Download</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
      {error && (
        <p className="mt-2 text-red-500 dark:text-red-400 text-sm text-center">{error}</p>
      )}
      <p className="mt-4 text-xs text-slate-500 text-center">
        By using our service you accept our <a className="underline" href="#">Terms of Service</a>.
      </p>
    </div>
  );
};

export default VideoInput;
