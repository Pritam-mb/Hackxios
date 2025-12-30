import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, loading } = useAuth();

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
