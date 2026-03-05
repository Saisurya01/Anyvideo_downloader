const Loader = ({ onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-[2px]">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center text-center">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-3xl">downloading</span>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Fetching video information...</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">We're parsing the URL and identifying available formats. This usually takes just a few seconds.</p>
        </div>
        <div className="w-full mt-8 space-y-3">
          <div className="flex justify-between items-center text-xs font-medium text-slate-500">
            <span>Connecting to server</span>
            <span className="text-primary">35%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '35%' }}></div>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Please do not refresh the page</p>
        </div>
        <button 
          className="mt-8 flex w-full items-center justify-center rounded-lg h-11 px-6 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold transition-colors"
          onClick={onCancel}
        >
          <span>Cancel Request</span>
        </button>
      </div>
    </div>
  );
};

export default Loader;
