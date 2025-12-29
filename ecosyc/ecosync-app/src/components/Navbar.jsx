import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/items', label: 'Browse' },
    { path: '/about', label: 'About' }
  ];

  return (
    <nav 
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[1100px] bg-white/80 backdrop-blur-xl border border-white/40 rounded-full px-4 py-3 shadow-2xl shadow-black/5 transition-all duration-300 hover:bg-white/90"
    >
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 pl-2 group">
          <div className="w-9 h-9 bg-[#1B4332] rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-110 duration-300">
            <Icon icon="lucide:leaf" className="text-[#B7E4C7]" width="18" />
          </div>
          <span className="text-xl font-bold text-[#1B4332] tracking-tight" style={{ fontFamily: "'Google Sans', 'Inter', sans-serif" }}>EcoSync</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-[#FAF8F5] px-2 py-1.5 rounded-full border border-[#E8E3DB]/50 relative">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`relative px-5 py-2 rounded-full text-sm font-medium transition-colors z-10 ${isActive(link.path) ? 'text-[#1B4332]' : 'text-[#4A453E] hover:text-[#1B4332]'}`}
            >
              {isActive(link.path) && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-full shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  style={{ zIndex: -1 }}
                />
              )}
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 pr-1">
          <Link to="/login" className="hidden sm:block px-5 py-2.5 text-sm font-medium text-[#1B4332] hover:bg-[#FAF8F5] rounded-full transition-colors">
            Log in
          </Link>
          <Link to="/register" className="px-5 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-sm font-medium rounded-full shadow-lg shadow-[#1B4332]/20 transition-all hover:shadow-xl hover:shadow-[#1B4332]/30 flex items-center gap-2 group">
            <span>Get Started</span>
            <Icon icon="heroicons:arrow-right" width="14" className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
