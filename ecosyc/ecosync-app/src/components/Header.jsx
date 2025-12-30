import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { transactionsAPI, requestsAPI } from '../services/api';
import { Icon } from '@iconify/react';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, loading } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Fetch pending orders (where user is the lender)
        const transactions = await transactionsAPI.getUserTransactions(user.id);
        const pendingOrders = transactions.filter(
          t => t.lender._id === user.id && t.status === 'requested'
        );

        // Fetch user's requests to see if anyone offered help
        // In a real app, you'd have a separate endpoint for offers
        const userRequests = await requestsAPI.getAll();
        const myRequests = userRequests.filter(r => r.user?._id === user.id);

        const notifs = [
          ...pendingOrders.map(order => ({
            id: order._id,
            type: 'order',
            title: 'New Order Request',
            message: `${order.borrower?.name} wants to borrow your ${order.item?.title}`,
            time: new Date(order.createdAt),
            link: '/profile'
          })),
          ...myRequests.map(req => ({
            id: req._id,
            type: 'request',
            title: 'Your Request',
            message: `Looking for: ${req.itemName}`,
            time: new Date(req.createdAt),
            link: '/request-map'
          }))
        ];

        // Sort by time, most recent first
        notifs.sort((a, b) => b.time - a.time);
        
        setNotifications(notifs.slice(0, 5)); // Show only 5 most recent
        setNotificationCount(pendingOrders.length); // Only count pending orders
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (isAuthenticated && user) {
      fetchNotifications();
      // Refresh notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <span className="text-xl font-bold text-white">EcoSync</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/items" className="text-slate-300 hover:text-white transition-colors">
            Browse
          </Link>
          <Link to="/request-map" className="text-slate-300 hover:text-white transition-colors">
            Explore Map
          </Link>
          <Link to="/about" className="text-slate-300 hover:text-white transition-colors">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="text-slate-400">Loading...</div>
          ) : isAuthenticated ? (
            <>
              <Link
                to="/list"
                className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-full transition-all"
              >
                + List Item
              </Link>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-300 hover:text-white transition-colors"
                >
                  <Icon icon="heroicons:bell" width="24" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                      {notificationCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                    <div className="bg-slate-900 px-4 py-3 border-b border-slate-700">
                      <h3 className="text-white font-bold">Notifications</h3>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                          <Icon icon="heroicons:bell-slash" className="mx-auto mb-2" width="32" />
                          <p className="text-sm">No notifications</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <Link
                            key={notif.id}
                            to={notif.link}
                            onClick={() => setShowNotifications(false)}
                            className="block px-4 py-3 hover:bg-slate-50 border-b border-slate-100 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                notif.type === 'order' ? 'bg-orange-100' : 'bg-blue-100'
                              }`}>
                                <Icon 
                                  icon={notif.type === 'order' ? 'heroicons:shopping-bag' : 'heroicons:megaphone'} 
                                  className={notif.type === 'order' ? 'text-orange-600' : 'text-blue-600'}
                                  width="20"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 mb-1">{notif.title}</p>
                                <p className="text-xs text-slate-600 line-clamp-2">{notif.message}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                  {notif.time.toLocaleDateString()} {notif.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <Link
                        to="/profile"
                        onClick={() => setShowNotifications(false)}
                        className="block px-4 py-3 text-center text-sm font-semibold text-green-600 hover:bg-slate-50 border-t border-slate-200"
                      >
                        View All in Profile
                      </Link>
                    )}
                  </div>
                )}
              </div>

              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-all"
              >
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-sm text-green-400 font-bold">
                  {user?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <span className="text-white text-sm">{user?.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-full transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
