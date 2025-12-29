import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet Icon Fix
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
    iconUrl: markerIcon, shadowUrl: markerShadow,
    iconSize: [25, 41], iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const Home = () => {
  const navigate = useNavigate();
  const [items] = useState([
    { id: 1, name: "Power Drill", coords: [51.505, -0.09], status: "Available" },
    { id: 2, name: "Mountain Bike", coords: [51.51, -0.1], status: "Available" },
  ]);

  const handleExploreClick = () => {
    console.log('Navigate to /request-map');
    navigate('/request-map');
  };

  return (
    <div className="bg-slate-950 text-white font-sans selection:bg-green-500/30">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Decorative Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          Your Neighborhood, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
            Shared.
          </span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Stop buying things you only use once. Borrow tools, gear, and gadgets from your neighbors and reduce your carbon footprint.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
         <button 
  onClick={handleExploreClick}
  className="px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-full transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
>
  Explore the Map
</button>
          <button className="px-8 py-4 border border-slate-700 hover:bg-slate-800 rounded-full transition-all">
            How it Works
          </button>
        </div>
      </section>

      {/* 2. LIVE MAP PREVIEW SECTION */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-4">Resources near you</h2>
            <p className="text-slate-400 mb-6 italic">Showing live availability in London, UK</p>
            <div className="space-y-4">
               {['Verified Members', 'Safety Insured', 'Zero Rental Fees'].map(text => (
                 <div key={text} className="flex items-center gap-3 text-slate-300">
                    <div className="w-5 h-5 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center text-xs">✓</div>
                    {text}
                 </div>
               ))}
            </div>
          </div>
          
          <div className="flex-[2] w-full h-[400px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              {items.map(item => (
                <Marker key={item.id} position={item.coords}>
                  <Popup className="dark-popup">
                    <div className="p-2">
                      <b className="text-lg">{item.name}</b> <br />
                      <span className="text-green-600 font-medium">● {item.status}</span>
                      <button
                        className="mt-2 block bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                        onClick={() => navigate(`/items/${item.id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </section>

      {/* 3. IMPACT STATS */}
      <section className="bg-slate-900/50 border-y border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-green-400 mb-2">1,240 kg</div>
            <div className="text-slate-500 uppercase tracking-widest text-sm">CO2 Offset</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-400 mb-2">$14,500</div>
            <div className="text-slate-500 uppercase tracking-widest text-sm">Community Savings</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-400 mb-2">450+</div>
            <div className="text-slate-500 uppercase tracking-widest text-sm">Items Shared</div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;