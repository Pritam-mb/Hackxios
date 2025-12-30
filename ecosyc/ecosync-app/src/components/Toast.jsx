import { useEffect } from 'react';
import { Icon } from '@iconify/react';

const Toast = ({ message, type = 'success', onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: { icon: 'heroicons:check-circle', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    info: { icon: 'heroicons:information-circle', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    warning: { icon: 'heroicons:exclamation-triangle', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    error: { icon: 'heroicons:x-circle', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
  };

  const style = icons[type] || icons.info;

  return (
    <div className={`fixed top-24 right-6 z-[9999] ${style.bg} ${style.border} border-2 rounded-2xl shadow-2xl p-4 max-w-md animate-in slide-in-from-right duration-300`}>
      <div className="flex items-start gap-3">
        <Icon icon={style.icon} className={`${style.color} flex-shrink-0`} width="24" />
        <div className="flex-1">
          <p className="text-[#1B4332] font-medium leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-[#4A453E] hover:text-[#1B4332] transition-colors"
        >
          <Icon icon="heroicons:x-mark" width="20" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
