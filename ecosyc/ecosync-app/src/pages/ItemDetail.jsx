import React from "react";
import { Icon } from '@iconify/react';
import BackgroundLayout from '../components/BackgroundLayout';

const ItemDetail = ({ item }) => {
  // Mock data for the demo if 'item' isn't passed
  const data = item || {
    name: "Cordless Power Drill",
    owner: "Sarah K.",
    rating: 4.8,
    reviews: 12,
    category: "Tools",
    co2Saved: "12kg",
    price: "Free", // or 5 credits/day
    desc: "Professional grade DeWalt drill with 2 batteries. Perfect for home DIY projects and furniture assembly.",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=1000"
  };

  return (
    <BackgroundLayout>
      <div className="relative z-10 pt-32 px-6 pb-12 max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="text-[#4A453E]/60 text-sm mb-8 font-medium">
          Home / Search / <span className="text-[#1B4332]">{data.category}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-video rounded-[32px] overflow-hidden border border-[#E8E3DB] bg-white shadow-xl shadow-[#1B4332]/5">
              <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-2xl bg-white border border-[#E8E3DB] hover:border-[#1B4332] transition cursor-pointer"></div>
              ))}
            </div>
          </div>

          {/* RIGHT: Details & Booking Sidebar */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 p-8 rounded-[32px] bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl shadow-[#1B4332]/5">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl md:text-4xl font-bold text-[#1B4332] tracking-tight" style={{ fontFamily: "'Google Sans', sans-serif" }}>{data.name}</h1>
                <span className="bg-[#B7E4C7]/30 text-[#1B4332] px-4 py-1.5 rounded-full text-sm font-bold">
                  {data.price}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-8 text-[#4A453E]/60 text-sm font-medium">
                <span className="flex items-center gap-1 text-yellow-500"><Icon icon="heroicons:star-solid" /> {data.rating}</span>
                <span>• {data.reviews} Reviews</span>
                <span>• {data.category}</span>
              </div>

              {/* Impact Feature */}
              <div className="p-5 rounded-2xl bg-[#1B4332]/5 border border-[#1B4332]/10 mb-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1B4332] rounded-full flex items-center justify-center text-white">
                  <Icon icon="lucide:leaf" width="20" />
                </div>
                <div>
                  <p className="text-[#1B4332] font-bold">Eco-Impact</p>
                  <p className="text-sm text-[#4A453E]/80">By borrowing this, you save <span className="text-[#1B4332] font-bold">{data.co2Saved}</span> of CO2 emissions.</p>
                </div>
              </div>

              <p className="text-[#4A453E]/80 leading-relaxed mb-10 text-lg">
                {data.desc}
              </p>

              <div className="space-y-4">
                <button className="w-full py-4 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold rounded-full transition-all shadow-lg shadow-[#1B4332]/20 hover:-translate-y-1">
                  Borrow Now
                </button>
                <button className="w-full py-4 border border-[#E8E3DB] hover:border-[#1B4332] hover:text-[#1B4332] text-[#4A453E] font-medium rounded-full transition-all flex items-center justify-center gap-2 bg-white">
                  <Icon icon="lucide:message-circle" width="18" />
                  Message {data.owner}
                </button>
              </div>

              {/* Owner Mini-Profile */}
              <div className="mt-8 pt-8 border-t border-[#E8E3DB] flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E8E3DB] flex items-center justify-center text-[#1B4332] font-bold text-xl">
                  {data.owner[0]}
                </div>
                <div>
                  <p className="font-bold text-[#1B4332]">{data.owner}</p>
                  <p className="text-xs text-[#4A453E]/60 font-medium">Verified Neighbor • Joined 2023</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BackgroundLayout>
  );
};

export default ItemDetail;