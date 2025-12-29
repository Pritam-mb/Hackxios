import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { SmoothCursor } from './ui/smooth-cursor';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const BackgroundLayout = ({ children }) => {
  const location = useLocation();
  const hideNavbarRoutes = ['/login', '/register'];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#4A453E] relative selection:bg-[#1B4332] selection:text-white">
      <SmoothCursor />
      {showNavbar && <Navbar />}
      
      {/* Fixed Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-60" />
        
        {/* Vignette */}
        <div className="absolute inset-0 vignette" />

        {/* Animated Blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#B7E4C7] rounded-full opacity-20 blur-[100px] mix-blend-multiply animate-pulse duration-10000" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#E8E3DB] rounded-full opacity-40 blur-[80px] mix-blend-multiply animate-pulse duration-12000" />
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-[#40916C] rounded-full opacity-10 blur-[90px] mix-blend-multiply animate-pulse duration-15000" />
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default BackgroundLayout;
