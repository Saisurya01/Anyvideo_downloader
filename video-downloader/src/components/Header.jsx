import { useState } from 'react';

const Header = ({ onLogoClick }) => {
  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-[#0d0f14]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onLogoClick}>
            <div className="bg-primary rounded-lg p-1.5 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-2xl">download_for_offline</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">UVD</span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:block">Universal Video Downloader</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors cursor-pointer" onClick={(e) => scrollToSection(e, 'hero')}>Home</a>
            <a className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors cursor-pointer" onClick={(e) => scrollToSection(e, 'features')}>Features</a>
            <a className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors cursor-pointer" onClick={(e) => scrollToSection(e, 'how-it-works')}>How It Works</a>
            <a className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors cursor-pointer" onClick={(e) => scrollToSection(e, 'cta')}>About</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm shadow-primary/20" onClick={(e) => scrollToSection(e, 'hero')}>
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
