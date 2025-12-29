import React from 'react';
import BackgroundLayout from '../components/BackgroundLayout';
import { Icon } from '@iconify/react';

function About() {
  return (
    <BackgroundLayout>
      <div className="relative z-10 pt-32 px-6 pb-12 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-[#1B4332] mb-6 tracking-tight" style={{ fontFamily: "'Google Sans', sans-serif" }}>About EcoSync</h1>
          <p className="text-xl text-[#4A453E]/80 max-w-2xl mx-auto">Building a sustainable future through community sharing and connection.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[32px] p-8 shadow-xl shadow-[#1B4332]/5">
            <div className="w-12 h-12 bg-[#1B4332] rounded-full flex items-center justify-center text-white mb-6">
              <Icon icon="lucide:leaf" width="24" />
            </div>
            <h3 className="text-2xl font-bold text-[#1B4332] mb-4">Our Mission</h3>
            <p className="text-[#4A453E]/80 leading-relaxed">
              To reduce waste and consumption by empowering communities to share resources, tools, and skills. We believe that everything you need is already in your neighborhood.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[32px] p-8 shadow-xl shadow-[#1B4332]/5">
            <div className="w-12 h-12 bg-[#1B4332] rounded-full flex items-center justify-center text-white mb-6">
              <Icon icon="lucide:users" width="24" />
            </div>
            <h3 className="text-2xl font-bold text-[#1B4332] mb-4">Community First</h3>
            <p className="text-[#4A453E]/80 leading-relaxed">
              EcoSync isn't just a platform; it's a movement. We connect neighbors, build trust, and foster a sense of belonging through the simple act of sharing.
            </p>
          </div>
        </div>
      </div>
    </BackgroundLayout>
  );
}

export default About;
