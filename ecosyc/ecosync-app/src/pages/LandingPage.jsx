import { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import BackgroundLayout from '../components/BackgroundLayout';
import SpotlightCard from '../components/SpotlightCard';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from '@iconify/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Map Marker
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<svg width="36" height="48" viewBox="0 0 36 48" fill="none"><path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30c0-9.94-8.06-18-18-18z" fill="${color}"/><circle cx="18" cy="18" r="8" fill="white"/></svg>`,
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -48]
  });
};

const MOCK_ITEMS = [
  { id: 1, title: 'Power Drill', category: 'tools', lat: 51.505, lng: -0.09, color: '#2C7DA0' },
  { id: 2, title: 'Stand Mixer', category: 'kitchen', lat: 51.51, lng: -0.1, color: '#7E9F6D' },
  { id: 3, title: 'DSLR Camera', category: 'electronics', lat: 51.515, lng: -0.085, color: '#B5651D' },
  { id: 4, title: 'Camping Tent', category: 'outdoor', lat: 51.50, lng: -0.08, color: '#A8577C' },
];

const CATEGORIES = [
  { id: 'tools', label: 'Power Tools', icon: 'heroicons:wrench-screwdriver', color: '#2C7DA0', count: 124 },
  { id: 'kitchen', label: 'Kitchen Appliances', icon: 'lucide:utensils', color: '#7E9F6D', count: 89 },
  { id: 'electronics', label: 'Electronics', icon: 'heroicons:device-phone-mobile', color: '#B5651D', count: 156 },
  { id: 'outdoor', label: 'Outdoor Gear', icon: 'lucide:tent', color: '#A8577C', count: 67 },
  { id: 'creative', label: 'Creative Equipment', icon: 'heroicons:paint-brush', color: '#40916C', count: 45 },
  { id: 'home', label: 'Home & Garden', icon: 'heroicons:home', color: '#4A453E', count: 98 },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', location: 'Koramangala', quote: 'Borrowed a drill for my DIY project. Saved ₹3000 and met a great neighbor!', rating: 5 },
  { name: 'Rahul Verma', location: 'Indiranagar', quote: 'Listed my camera and earned ₹2000 this month. Love this community!', rating: 5 },
  { name: 'Ananya Patel', location: 'HSR Layout', quote: 'Got a tent for our weekend trip. The owner was super helpful with tips!', rating: 5 },
];

const STEPS = [
  { icon: 'heroicons:map-pin', title: 'Share Your Location', desc: 'Let us find items and neighbors near you for convenient exchanges.' },
  { icon: 'heroicons:magnifying-glass', title: 'Find What You Need', desc: 'Browse available tools, equipment, and items in your neighborhood.' },
  { icon: 'heroicons:hand-raised', title: 'Connect & Share', desc: 'Request items, meet your neighbors, and build community together.' },
];

const AnimatedNumber = ({ value, suffix = '', isVisible }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const end = parseInt(value);
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, value]);
  return <span>{count.toLocaleString()}{suffix}</span>;
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  // Animate stats on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <BackgroundLayout>
      
      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-32 pb-24 px-8 overflow-hidden">
        <div className="max-w-[1280px] mx-auto w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Left - Content */}
          <div className="flex flex-col items-start">
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white border border-[#B7E4C7] px-5 py-2 rounded-full mb-8 shadow-sm"
            >
              <span className="text-lg">🌱</span>
              <span className="text-[#2D6A4F] text-sm font-semibold tracking-wide">JOIN 1,000+ NEIGHBORS SHARING</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-[56px] lg:text-[72px] leading-[1.05] font-bold text-[#1B4332] mb-6 tracking-tight" 
              style={{ fontFamily: "'Google Sans', 'Inter', sans-serif" }}
            >
              Borrow. Lend.<br />
              <span className="text-[#2D6A4F]">Build Community.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-[#4A453E] leading-relaxed mb-10 max-w-[540px] font-medium"
            >
              Share tools, equipment, and items with your neighbors. Save money, reduce waste, and strengthen local connections in your area.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <button 
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-3 bg-[#1B4332] hover:bg-[#0D281C] text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:-translate-y-1 shadow-xl shadow-[#1B4332]/20"
              >
                Get Started
                <Icon icon="heroicons:arrow-right" width="24" />
              </button>
              <button 
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-3 bg-white hover:bg-[#F5F1EA] text-[#1B4332] border border-[#E8E3DB] px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:-translate-y-1 shadow-sm"
              >
                See How It Works
              </button>
            </motion.div>

            {/* Social Proof */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center gap-8 text-sm font-medium text-[#4A453E] bg-white/60 backdrop-blur-sm px-6 py-3 rounded-2xl border border-[#E8E3DB]"
            >
              <div className="flex items-center gap-2">
                <div className="flex text-[#F4A261]">
                  {[...Array(5)].map((_, i) => <Icon key={i} icon="heroicons:star-solid" width="18" />)}
                </div>
                <span><strong className="text-[#1B4332]">4.9/5</strong> from 500+ users</span>
              </div>
              <div className="w-px h-4 bg-[#E8E3DB] hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#B7E4C7] flex items-center justify-center text-[#1B4332]">
                  <Icon icon="heroicons:globe-alt" width="14" />
                </div>
                <span><strong className="text-[#1B4332]">2,500kg</strong> CO₂ saved</span>
              </div>
            </motion.div>
          </div>

          {/* Right - Visual (Bento Grid) */}
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              {[
                { img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300&q=80', title: 'Power Drill', distance: '0.8km', delay: '0s' },
                { img: 'https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=300&q=80', title: 'Stand Mixer', distance: '1.2km', delay: '0.5s' },
                { img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=300&q=80', title: 'Camping Tent', distance: '2.1km', delay: '1s' },
                { img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&q=80', title: 'DSLR Camera', distance: '0.5km', delay: '1.5s' },
              ].map((item, i) => (
                <div 
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden border border-[#E8E3DB] hover:border-[#52B788] transition-all hover:-translate-y-1 cursor-pointer"
                  style={{ 
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    animation: `float 3s ease-in-out infinite`,
                    animationDelay: item.delay
                  }}
                >
                  <img src={item.img} alt={item.title} className="w-full h-32 object-cover" />
                  <div className="p-3">
                    <h4 className="font-medium text-[#2C2823] text-sm">{item.title}</h4>
                    <p className="text-xs text-[#9B9486] flex items-center gap-1 mt-1">
                      <Icon icon="heroicons:map-pin" width="12" />
                      {item.distance} away
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <style>{`
              @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
              }
            `}</style>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-32 bg-white relative">
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#1B4332] mb-6 tracking-tight" style={{ fontFamily: "'Google Sans', 'Inter', sans-serif" }}>
              Join EcoSync in 3 Simple Steps
            </h2>
            <p className="text-[#4A453E] text-xl max-w-2xl mx-auto leading-relaxed">
              Start sharing with your community in minutes. It's safe, easy, and impactful.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {STEPS.map((step, i) => (
              <SpotlightCard key={i} className="h-full text-center p-10">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300 border border-[#E8E3DB]">
                  <Icon icon={step.icon} width="40" className="text-[#2D6A4F] group-hover:text-[#1B4332] transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-[#1B4332] mb-4" style={{ fontFamily: "'Google Sans', 'Inter', sans-serif" }}>{step.title}</h3>
                <p className="text-[#4A453E] leading-relaxed text-lg">{step.desc}</p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MAP PREVIEW ===== */}
      <section className="py-32 bg-[#FAF8F5]">
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#1B4332] mb-6 tracking-tight" style={{ fontFamily: "'Google Sans', 'Inter', sans-serif" }}>
              Discover What's Available Near You
            </h2>
            <p className="text-[#4A453E] text-xl max-w-2xl mx-auto leading-relaxed">
              Explore items shared by neighbors in your area. From power tools to camping gear.
            </p>
          </div>

          <div className="relative h-[600px] rounded-[40px] overflow-hidden border-4 border-white shadow-2xl shadow-[#1B4332]/10">
            <MapContainer center={[51.505, -0.09]} zoom={14} scrollWheelZoom={false} className="h-full w-full z-0" zoomControl={false}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution="" />
              {MOCK_ITEMS.map(item => (
                <Marker key={item.id} position={[item.lat, item.lng]} icon={createCustomIcon(item.color)}>
                  <Popup><strong>{item.title}</strong></Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Floating Search */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-1000 bg-white/95 backdrop-blur-md rounded-2xl px-6 py-4 flex items-center gap-4 w-[90%] max-w-[500px] shadow-xl shadow-black/5 border border-[#E8E3DB]">
              <Icon icon="heroicons:map-pin" width="24" className="text-[#2D6A4F] shrink-0" />
              <input type="text" placeholder="Enter your location..." className="flex-1 bg-transparent border-none outline-none text-[#1B4332] placeholder-[#9B9486] text-lg min-w-0" />
              <button className="bg-[#1B4332] hover:bg-[#0D281C] text-white px-6 py-3 rounded-xl text-sm font-semibold shrink-0 transition-colors">Search</button>
            </div>

            {/* Explore Button */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-1000">
              <button onClick={() => navigate('/request-map')} className="bg-white hover:bg-[#F5F1EA] text-[#1B4332] px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all hover:-translate-y-1 shadow-xl shadow-black/10 border border-[#E8E3DB]">
                <Icon icon="heroicons:map" width="24" />
                Explore Full Map
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== IMPACT STATS ===== */}
      <section ref={statsRef} className="py-24 bg-[#1B4332] relative overflow-hidden">
        {/* Decorative patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#B7E4C7 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="max-w-[1280px] mx-auto px-8 relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-white text-center mb-16 tracking-tight" style={{ fontFamily: "'Google Sans', 'Inter', sans-serif" }}>
            Our Community's Impact
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { icon: 'lucide:leaf', value: '2500', suffix: 'kg', label: 'CO₂ Saved' },
              { icon: 'heroicons:users', value: '500', suffix: '+', label: 'Active Users' },
              { icon: 'heroicons:currency-rupee', value: '50000', suffix: '', label: 'Money Saved (₹)' },
              { icon: 'heroicons:face-smile', value: '95', suffix: '%', label: 'Happy Members' },
            ].map((stat, i) => (
              <div key={i} className="group">
                <div className="w-16 h-16 bg-[#2D6A4F] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-black/20">
                  <Icon icon={stat.icon} width="32" className="text-[#B7E4C7]" />
                </div>
                <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 tracking-tight" style={{ fontFamily: "'Google Sans', 'Inter', sans-serif" }}>
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} isVisible={statsVisible} />
                </div>
                <p className="text-[#B7E4C7] text-lg font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-32 bg-white">
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#1B4332] mb-6 tracking-tight" style={{ fontFamily: "'Google Sans', 'Inter', sans-serif" }}>
              What Can You Share?
            </h2>
            <p className="text-[#4A453E] text-xl max-w-2xl mx-auto leading-relaxed">
              Browse by category to find exactly what you need.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {CATEGORIES.map(cat => (
              <SpotlightCard 
                key={cat.id} 
                onClick={() => navigate('/items')} 
                className="p-8 text-center cursor-pointer h-full"
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110 duration-300" style={{ backgroundColor: `${cat.color}15` }}>
                  <Icon icon={cat.icon} width="32" style={{ color: cat.color }} />
                </div>
                <h4 className="font-bold text-[#1B4332] text-lg mb-2">{cat.label}</h4>
                <p className="text-sm text-[#9B9486] font-medium">{cat.count} items</p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-32 bg-[#FAF8F5]">
        <div className="max-w-[1280px] mx-auto px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#1B4332] text-center mb-16 tracking-tight" style={{ fontFamily: "'Google Sans', 'Inter', sans-serif" }}>
            What Our Community Says
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <SpotlightCard key={i} className="p-10 h-full">
                <div className="flex text-[#F4A261] mb-6">
                  {[...Array(t.rating)].map((_, j) => <Icon key={j} icon="heroicons:star-solid" width="20" />)}
                </div>
                <p className="text-[#4A453E] text-lg italic leading-relaxed mb-8">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#1B4332] rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-[#1B4332] text-lg">{t.name}</p>
                    <p className="text-sm text-[#9B9486] font-medium">{t.location}</p>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-32 mx-4 md:mx-8 mb-8 rounded-[48px] relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#40916C] rounded-full opacity-20 blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#B7E4C7] rounded-full opacity-10 blur-[80px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

        <div className="max-w-[800px] mx-auto px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2 rounded-full mb-8">
            <Icon icon="lucide:leaf" width="18" className="text-[#B7E4C7]" />
            <span className="text-[#B7E4C7] text-sm font-semibold tracking-wide">JOIN THE MOVEMENT</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight" style={{ fontFamily: "'Google Sans', 'Inter', sans-serif" }}>
            Start Sharing Today
          </h2>
          <p className="text-xl lg:text-2xl text-[#B7E4C7] mb-12 max-w-2xl mx-auto leading-relaxed">
            Create your account in under 60 seconds and join thousands of neighbors making a difference.
          </p>
          <button 
            onClick={() => navigate('/register')} 
            className="inline-flex items-center gap-3 bg-white hover:bg-[#F5F1EA] text-[#1B4332] px-12 py-5 rounded-2xl font-bold text-xl transition-all hover:-translate-y-1 shadow-2xl shadow-black/20" 
          >
            Get Started - It's Free
            <Icon icon="heroicons:arrow-right" width="24" />
          </button>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#1B4332] text-white/80 py-20 px-8 border-t border-[#2D6A4F]">
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-16">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#2D6A4F] rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
                <Icon icon="lucide:leaf" className="text-white" width="24" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Google Sans', 'Inter', sans-serif" }}>EcoSync</span>
            </div>
            <p className="text-base leading-relaxed text-[#B7E4C7]">Share locally, live sustainably. Building stronger communities through sharing.</p>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Product</h4>
            <ul className="space-y-4 text-base">
              <li><Link to="/items" className="hover:text-white transition-colors text-[#B7E4C7]">Browse Items</Link></li>
              <li><Link to="/list" className="hover:text-white transition-colors text-[#B7E4C7]">List an Item</Link></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors text-[#B7E4C7]">How It Works</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Company</h4>
            <ul className="space-y-4 text-base">
              <li><Link to="/about" className="hover:text-white transition-colors text-[#B7E4C7]">About Us</Link></li>
              <li><a href="#" className="hover:text-white transition-colors text-[#B7E4C7]">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-[#B7E4C7]">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors text-white">
                <Icon icon="mdi:twitter" width="24" />
              </a>
              <a href="#" className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors text-white">
                <Icon icon="mdi:instagram" width="24" />
              </a>
              <a href="#" className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors text-white">
                <Icon icon="mdi:linkedin" width="24" />
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto mt-16 pt-8 border-t border-[#2D6A4F] text-center text-sm text-[#B7E4C7]">
          © 2025 EcoSync. All rights reserved.
        </div>
      </footer>
    </BackgroundLayout>
  );
};

export default LandingPage;
