import { useEffect } from 'react';

const Toast = ({ message, isVisible, onClose, type = 'success' }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      default:
        return 'check';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-600';
      case 'info':
        return 'bg-primary';
      default:
        return 'bg-green-600';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="bg-slate-900 dark:bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full ${getBgColor()} flex items-center justify-center`}>
          <span className="material-symbols-outlined text-sm">{getIcon()}</span>
        </div>
        <p className="font-medium">{message}</p>
      </div>
    </div>
  );
};

export default Toast;
