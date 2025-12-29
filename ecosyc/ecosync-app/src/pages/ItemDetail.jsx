import React from "react";

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
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      {/* Breadcrumbs */}
      <nav className="text-slate-500 text-sm mb-8">
        Home / Search / <span className="text-green-500">{data.category}</span>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-video rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
            <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-xl bg-slate-900 border border-slate-800 hover:border-green-500 transition cursor-pointer"></div>
            ))}
          </div>
        </div>

        {/* RIGHT: Details & Booking Sidebar */}
        <div className="lg:col-span-5">
          <div className="sticky top-12 p-8 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-4xl font-bold">{data.name}</h1>
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-bold">
                {data.price}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-8 text-slate-400 text-sm">
              <span className="flex items-center gap-1 text-yellow-400">★ {data.rating}</span>
              <span>• {data.reviews} Reviews</span>
              <span>• {data.category}</span>
            </div>

            {/* Impact Feature */}
            <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 mb-8 flex items-center gap-4">
              <div className="text-3xl">🍃</div>
              <div>
                <p className="text-green-400 font-bold">Eco-Impact</p>
                <p className="text-sm text-slate-300">By borrowing this, you save <span className="text-white font-bold">{data.co2Saved}</span> of CO2 emissions.</p>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed mb-10">
              {data.desc}
            </p>

            <div className="space-y-4">
              <button className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                Borrow Now
              </button>
              <button className="w-full py-4 border border-slate-700 hover:bg-slate-800 rounded-2xl transition-all flex items-center justify-center gap-2">
                💬 Message {data.owner}
              </button>
            </div>

            {/* Owner Mini-Profile */}
            <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-green-500 to-blue-500"></div>
              <div>
                <p className="font-bold">{data.owner}</p>
                <p className="text-xs text-slate-500">Verified Neighbor • Joined 2023</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;