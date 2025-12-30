import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { itemsAPI } from '../services/api';
import BackgroundLayout from '../components/BackgroundLayout';
import SpotlightCard from '../components/SpotlightCard';

const Items = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await itemsAPI.getAll();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => item.category === filter);

  const categoryColors = {
    tools: 'bg-[#2C7DA0]',
    kitchen: 'bg-[#7E9F6D]',
    electronics: 'bg-[#B5651D]',
    outdoor: 'bg-[#A8577C]',
    sports: 'bg-[#D62828]',
    other: 'bg-[#4A453E]'
  };

  return (
    <BackgroundLayout>
      <div className="relative z-10 pt-32 px-6 pb-12 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1B4332] mb-3 tracking-tight" style={{ fontFamily: "'Google Sans', sans-serif" }}>Browse Items</h1>
            <p className="text-[#4A453E]/80 text-lg">Discover what your neighbors are sharing nearby.</p>
          </div>
          <button
            onClick={() => navigate('/list')}
            className="px-8 py-4 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-semibold rounded-full shadow-lg shadow-[#1B4332]/20 transition-all hover:-translate-y-1 flex items-center gap-2"
          >
            <Icon icon="lucide:plus" width="20" />
            <span>List an Item</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide">
          {['all', 'tools', 'kitchen', 'electronics', 'outdoor', 'sports', 'other'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2.5 rounded-full capitalize font-medium transition-all whitespace-nowrap border ${
                filter === cat 
                  ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-md' 
                  : 'bg-white text-[#4A453E] border-[#E8E3DB] hover:border-[#1B4332] hover:text-[#1B4332]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-32">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1B4332]"></div>
            <p className="mt-4 text-[#4A453E]/60 font-medium">Loading items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-32 bg-white/50 rounded-[32px] border border-[#E8E3DB]">
            <div className="w-20 h-20 bg-[#E8E3DB]/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon icon="lucide:package-open" className="text-[#4A453E]/40" width="40" />
            </div>
            <h3 className="text-xl font-bold text-[#1B4332] mb-2">No items found</h3>
            <p className="text-[#4A453E]/60 text-lg">Be the first to list something in this category!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map(item => (
              <SpotlightCard
                key={item._id}
                onClick={() => navigate(`/items/${item._id}`)}
                className="p-0 overflow-hidden cursor-pointer group h-full"
              >
                <div className="h-56 bg-[#F5F1EA] relative overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl opacity-50">
                      📦
                    </div>
                  )}
                  <div className={`absolute top-4 right-4 ${categoryColors[item.category] || 'bg-[#4A453E]'} px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-sm`}>
                    {item.category}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#1B4332] mb-2 group-hover:text-[#2D6A4F] transition-colors">{item.title}</h3>
                  <p className="text-[#4A453E]/70 text-sm mb-6 line-clamp-2 leading-relaxed">{item.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-[#E8E3DB]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#1B4332]/10 rounded-full flex items-center justify-center text-sm font-bold text-[#1B4332]">
                        {item.owner?.name?.[0] || '?'}
                      </div>
                      <span className="text-sm font-medium text-[#4A453E]/80">{item.owner?.name || 'Anonymous'}</span>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/order/${item._id}`);
                      }}
                      className="px-4 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold rounded-lg transition-all flex items-center gap-2"
                    >
                      <Icon icon="heroicons:shopping-bag" width="18" />
                      {item.type === 'rent' ? 'Rent' : 'Borrow'}
                    </button>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}
      </div>
    </BackgroundLayout>
  );
};

export default Items;
