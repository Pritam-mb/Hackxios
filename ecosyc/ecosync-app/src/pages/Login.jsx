import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackgroundLayout from '../components/BackgroundLayout';
import { Icon } from '@iconify/react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <BackgroundLayout>
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 bg-white/80 backdrop-blur-md border border-white/40 px-5 py-2.5 rounded-full text-[#1B4332] font-bold text-sm shadow-lg shadow-[#1B4332]/5 hover:bg-white hover:scale-105 transition-all duration-300 z-20 group"
      >
        <Icon icon="lucide:arrow-left" width="18" className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>
      <div className="flex-1 flex items-center justify-center p-6 relative z-10 pt-24 min-h-[calc(100vh-80px)]">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#1B4332] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#1B4332]/20">
              <Icon icon="lucide:leaf" className="text-[#B7E4C7]" width="32" />
            </div>
            <h1 className="text-4xl font-bold text-[#1B4332] mb-2 tracking-tight" style={{ fontFamily: "'Google Sans', sans-serif" }}>Welcome Back</h1>
            <p className="text-[#4A453E]/60">Login to continue sharing with your community</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[32px] p-8 shadow-2xl shadow-[#1B4332]/5">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <Icon icon="lucide:alert-circle" width="16" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#1B4332] mb-2 ml-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full bg-[#FAF8F5] border border-[#E8E3DB] rounded-xl px-4 py-3.5 text-[#1B4332] placeholder-[#4A453E]/40 focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1B4332] mb-2 ml-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-[#FAF8F5] border border-[#E8E3DB] rounded-xl px-4 py-3.5 text-[#1B4332] placeholder-[#4A453E]/40 focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold py-4 rounded-full transition-all shadow-lg shadow-[#1B4332]/20 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-[#4A453E]/60">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#1B4332] hover:text-[#2D6A4F] font-bold hover:underline">
                Register here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </BackgroundLayout>
  );
};

export default Login;
