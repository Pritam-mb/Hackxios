import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';

const ListItem = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'tools',
    type: 'lend',
    price: 0,
    imageUrl: ''
  });
  const [location, setLocation] = useState(null);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation([position.coords.latitude, position.coords.longitude]);
          alert('✅ Location captured!');
        },
        (error) => {
          console.error(error);
          alert('Unable to get location. Please enable location services.');
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!location) {
      alert('Please set your location first!');
      return;
    }

    setLoading(true);
    try {
      const itemData = {
        ...formData,
        coordinates: location,
        ownerId: '000000000000000000000000' // Temporary - will be replaced with auth
      };

      await itemsAPI.create(itemData);
      alert('🎉 Item listed successfully!');
      navigate('/items');
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Failed to list item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">List an Item</h1>
        <p className="text-slate-400 mb-8">Share what you're not using with your community</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Item Name *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Power Drill, Camping Tent"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the item, its condition, and any special notes..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500 h-32 resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
            >
              <option value="tools">🔧 Tools</option>
              <option value="kitchen">🍳 Kitchen</option>
              <option value="electronics">📦 Electronics</option>
              <option value="outdoor">🎪 Outdoor</option>
              <option value="sports">⚽ Sports</option>
              <option value="other">📌 Other</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Availability Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
            >
              <option value="lend">Lend (Free)</option>
              <option value="rent">Rent (Paid)</option>
              <option value="sell">Sell</option>
            </select>
          </div>

          {/* Price (if rent/sell) */}
          {(formData.type === 'rent' || formData.type === 'sell') && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Price ({formData.type === 'rent' ? 'per day' : 'total'}) *
              </label>
              <input
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
              />
            </div>
          )}

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium mb-2">Image URL (Optional)</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Location */}
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {location ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400">Location set</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-orange-400">Location required</span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-all"
              >
                📍 Get My Location
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Listing...' : '🌱 List Item'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ListItem;
