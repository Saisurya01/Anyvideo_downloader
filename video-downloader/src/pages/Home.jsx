import { useState } from 'react';
import Header from '../components/Header';
import VideoInput from '../components/VideoInput';
import Loader from '../components/Loader';
import VideoPreview from '../components/VideoPreview';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { getVideoInfo, downloadVideo } from '../api';
import { logDownloadRequest } from '../firebase';

const Home = () => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState({ message: '', isVisible: false, type: 'success' });
  const [videoData, setVideoData] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(null);

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleDownload = async () => {
    setError('');

    if (!url.trim()) {
      setError('Please paste a video URL');
      return;
    }

    if (!isValidUrl(url)) {
      setError('Invalid video link');
      return;
    }

    setIsLoading(true);
    setShowPreview(false);
    setVideoData(null);

    try {
      const info = await getVideoInfo(url);
      setVideoData(info);
      setShowPreview(true);
      
      // Log to Firebase
      logDownloadRequest({
        url: url,
        platform: info.platform,
        videoTitle: info.title,
        availableFormats: info.formats.map(f => f.quality),
      });
    } catch (err) {
      console.error('Error fetching video:', err);
      const errorMessage = err.message || 'Failed to fetch video information. Please check the URL and try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsLoading(false);
  };

  const handleReset = () => {
    setUrl('');
    setShowPreview(false);
    setError('');
    setVideoData(null);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, isVisible: true, type });
  };

  const hideToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  const handleFormatDownload = async (format) => {
    showToast('Download started...', 'info');
    
    try {
      await downloadVideo(url, format);
      showToast('Download completed!', 'success');
    } catch (err) {
      const errorMessage = err.message || 'Download failed. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#0a0b10]">
      <Header onLogoClick={handleReset} />

      <main>
        {!showPreview && !isLoading && (
          <section id="hero" className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_rgba(36,99,235,0.12)_0%,_transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,_rgba(36,99,235,0.2)_0%,_transparent_70%)]"></div>
            <div className="max-w-4xl mx-auto px-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                TRUSTED BY 1M+ USERS
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                Download Videos from <span className="text-primary">Any Link</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
                The fastest way to save your favorite content from across the web. Paste a video URL and download it in seconds.
              </p>
              <VideoInput 
                url={url} 
                setUrl={setUrl} 
                onDownload={handleDownload}
                error={error}
                disabled={isLoading}
              />
            </div>
          </section>
        )}

        {isLoading && (
          <div className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40 filter blur-sm opacity-50 pointer-events-none">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_rgba(36,99,235,0.12)_0%,_transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,_rgba(36,99,235,0.2)_0%,_transparent_70%)]"></div>
            <div className="max-w-4xl mx-auto px-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                TRUSTED BY 1M+ USERS
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                Download Videos from <span className="text-primary">Any Link</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
                The fastest way to save your favorite content from across the web. Paste a video URL and download it in seconds.
              </p>
              <VideoInput 
                url={url} 
                setUrl={setUrl} 
                onDownload={handleDownload}
                error={error}
                disabled={true}
              />
            </div>
          </div>
        )}

        {showPreview && videoData && (
          <section className="py-10 px-4">
            <div className="max-w-5xl mx-auto">
              <VideoPreview 
                video={videoData} 
                onDownloadFormat={handleFormatDownload}
                showToast={showToast}
              />
            </div>
          </section>
        )}

        {!showPreview && !isLoading && (
          <>
            <section id="features" className="py-20 bg-white dark:bg-[#111320]">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Powerful Features</h2>
                  <p className="text-slate-600 dark:text-slate-400">Everything you need for a seamless downloading experience.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="p-8 rounded-2xl bg-slate-50 dark:bg-[#1a1d2e] border border-slate-200 dark:border-slate-800 hover:border-primary/40 dark:hover:border-primary/40 transition-all group">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">bolt</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Fast Downloads</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">High-speed servers and optimized data pipelines ensure your downloads finish in the blink of an eye.</p>
                  </div>
                  <div className="p-8 rounded-2xl bg-slate-50 dark:bg-[#1a1d2e] border border-slate-200 dark:border-slate-800 hover:border-primary/40 dark:hover:border-primary/40 transition-all group">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">video_settings</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Multiple Formats</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Support for MP4, MKV, AVI, and many more. Choose from 480p up to 4K resolution options.</p>
                  </div>
                  <div className="p-8 rounded-2xl bg-slate-50 dark:bg-[#1a1d2e] border border-slate-200 dark:border-slate-800 hover:border-primary/40 dark:hover:border-primary/40 transition-all group">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">no_accounts</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">No Signup Required</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">We value your privacy. Start downloading immediately without ever needing to create an account.</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="how-it-works" className="py-24 bg-[#f6f6f8] dark:bg-[#0a0b10]">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">How It Works</h2>
                  <p className="text-slate-600 dark:text-slate-400">Save your favorite videos in three simple steps.</p>
                </div>
                <div className="relative">
                  <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-10"></div>
                  <div className="grid md:grid-cols-3 gap-12">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-24 h-24 rounded-full bg-white dark:bg-[#1a1d2e] border-4 border-[#f6f6f8] dark:border-[#0a0b10] shadow-xl flex items-center justify-center text-primary mb-6">
                        <span className="material-symbols-outlined text-4xl">content_copy</span>
                      </div>
                      <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-4">STEP 01</div>
                      <h4 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Paste Link</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">Copy the video URL from your browser address bar and paste it above.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-24 h-24 rounded-full bg-white dark:bg-[#1a1d2e] border-4 border-[#f6f6f8] dark:border-[#0a0b10] shadow-xl flex items-center justify-center text-primary mb-6">
                        <span className="material-symbols-outlined text-4xl">settings_input_component</span>
                      </div>
                      <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-4">STEP 02</div>
                      <h4 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Select Format</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">Choose your preferred quality (HD, Full HD, or 4K) and file format.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-24 h-24 rounded-full bg-white dark:bg-[#1a1d2e] border-4 border-[#f6f6f8] dark:border-[#0a0b10] shadow-xl flex items-center justify-center text-primary mb-6">
                        <span className="material-symbols-outlined text-4xl">download_done</span>
                      </div>
                      <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-4">STEP 03</div>
                      <h4 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Download</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">Hit the download button and your file will be saved directly to your device.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="cta" className="py-20 bg-white dark:bg-[#111320]">
              <div className="max-w-5xl mx-auto px-4">
                <div className="bg-primary rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-black/20 rounded-full blur-3xl"></div>
                  <h2 className="text-3xl md:text-4xl font-black mb-6 relative z-10">Ready to start downloading?</h2>
                  <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto relative z-10">Join millions of users who trust UVD for their offline video needs every single day.</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                    <button className="w-full sm:w-auto bg-white text-primary px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-lg" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                      Go to Downloader
                    </button>
                    <button className="w-full sm:w-auto bg-white/20 border border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/30 transition-colors backdrop-blur-sm">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />

      {isLoading && <Loader onCancel={handleCancel} />}
      
      <Toast 
        message={toast.message} 
        isVisible={toast.isVisible} 
        onClose={hideToast}
        type={toast.type}
      />
    </div>
  );
};

export default Home;
