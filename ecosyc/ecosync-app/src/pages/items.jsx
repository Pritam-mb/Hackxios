import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';

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
    tools: 'bg-blue-500',
    kitchen: 'bg-green-500',
    electronics: 'bg-orange-500',
    outdoor: 'bg-purple-500',
    sports: 'bg-pink-500',
    other: 'bg-gray-500'
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Browse Items</h1>
            <p className="text-slate-400">Discover what your neighbors are sharing</p>
          </div>
          <button
            onClick={() => navigate('/list')}
            className="px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-full transition-all"
          >
            + List an Item
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {['all', 'tools', 'kitchen', 'electronics', 'outdoor', 'sports', 'other'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full capitalize transition-all whitespace-nowrap ${
                filter === cat 
                  ? 'bg-green-500 text-black' 
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            <p className="mt-4 text-slate-400">Loading items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">No items found. Be the first to list something!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div
                key={item._id}
                onClick={() => navigate(`/items/${item._id}`)}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-green-500 transition-all cursor-pointer group"
              >
                {/* Image */}
                <div className="h-48 bg-slate-800 relative overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      📦
                    </div>
                  )}
                  <div className={`absolute top-3 right-3 ${categoryColors[item.category]} px-3 py-1 rounded-full text-xs font-bold text-white`}>
                    {item.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-sm">
                        {item.owner?.name?.[0] || '?'}
                      </div>
                      <span className="text-sm text-slate-400">{item.owner?.name || 'Anonymous'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.type === 'rent' && item.price > 0 && (
                        <span className="text-green-400 font-bold">${item.price}/day</span>
                      )}
                      {item.type === 'lend' && (
                        <span className="text-green-400 font-bold">Free</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Items;
