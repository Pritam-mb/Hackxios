import { createContext, useContext, useState } from 'react';
import Toast from '../components/Toast';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type, duration }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const notify = {
    success: (message, duration) => addNotification(message, 'success', duration),
    info: (message, duration) => addNotification(message, 'info', duration),
    warning: (message, duration) => addNotification(message, 'warning', duration),
    error: (message, duration) => addNotification(message, 'error', duration)
  };

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      <div className="fixed top-0 right-0 z-[9999] pointer-events-none">
        <div className="flex flex-col gap-3 p-6 pointer-events-auto">
          {notifications.map((notif) => (
            <Toast
              key={notif.id}
              message={notif.message}
              type={notif.type}
              duration={notif.duration}
              onClose={() => removeNotification(notif.id)}
            />
          ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
};
