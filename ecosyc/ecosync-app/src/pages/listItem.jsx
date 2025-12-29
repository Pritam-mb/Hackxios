import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BackgroundLayout from '../components/BackgroundLayout';
import { Icon } from '@iconify/react';

const ListItem = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
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

  if (!isAuthenticated) {
    return (
      <BackgroundLayout>
        <div className="flex items-center justify-center p-6 min-h-[calc(100vh-80px)] pt-24">
          <div className="text-center bg-white/80 backdrop-blur-xl border border-white/40 rounded-[32px] p-12 shadow-2xl shadow-[#1B4332]/5">
            <div className="w-20 h-20 bg-[#E8E3DB] rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon icon="lucide:lock" className="text-[#4A453E]/60" width="32" />
            </div>
            <h2 className="text-2xl font-bold text-[#1B4332] mb-4">Please login to list items</h2>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold rounded-full transition-all shadow-lg shadow-[#1B4332]/20 hover:-translate-y-1"
            >
              Go to Login
            </button>
          </div>
        </div>
      </BackgroundLayout>
    );
  }

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
        ownerId: user.id
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
    <BackgroundLayout>
      <div className="relative z-10 pt-32 px-6 pb-12 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1B4332] mb-3 tracking-tight" style={{ fontFamily: "'Google Sans', sans-serif" }}>List an Item</h1>
          <p className="text-[#4A453E]/80 text-lg">Share what you're not using with your community</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[32px] p-8 md:p-10 shadow-2xl shadow-[#1B4332]/5">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-bold text-[#1B4332] mb-2 ml-1">Item Name *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Power Drill, Camping Tent"
                className="w-full bg-[#FAF8F5] border border-[#E8E3DB] rounded-xl px-4 py-3.5 text-[#1B4332] placeholder-[#4A453E]/40 focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1B4332] mb-2 ml-1">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the condition, features, and any usage instructions..."
                rows="4"
                className="w-full bg-[#FAF8F5] border border-[#E8E3DB] rounded-xl px-4 py-3.5 text-[#1B4332] placeholder-[#4A453E]/40 focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#1B4332] mb-2 ml-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#E8E3DB] rounded-xl px-4 py-3.5 text-[#1B4332] focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] transition-all appearance-none"
                >
                  <option value="tools">Tools</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="electronics">Electronics</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="sports">Sports</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1B4332] mb-2 ml-1">Type *</label>
                <div className="flex bg-[#FAF8F5] p-1 rounded-xl border border-[#E8E3DB]">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'lend' })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      formData.type === 'lend' 
                        ? 'bg-white text-[#1B4332] shadow-sm' 
                        : 'text-[#4A453E]/60 hover:text-[#1B4332]'
                    }`}
                  >
                    Lend (Free)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'rent' })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      formData.type === 'rent' 
                        ? 'bg-white text-[#1B4332] shadow-sm' 
                        : 'text-[#4A453E]/60 hover:text-[#1B4332]'
                    }`}
                  >
                    Rent ($)
                  </button>
                </div>
              </div>
            </div>

            {formData.type === 'rent' && (
              <div>
                <label className="block text-sm font-bold text-[#1B4332] mb-2 ml-1">Price per Day ($)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full bg-[#FAF8F5] border border-[#E8E3DB] rounded-xl px-4 py-3.5 text-[#1B4332] placeholder-[#4A453E]/40 focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-[#1B4332] mb-2 ml-1">Image URL (Optional)</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-[#FAF8F5] border border-[#E8E3DB] rounded-xl px-4 py-3.5 text-[#1B4332] placeholder-[#4A453E]/40 focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] transition-all"
              />
            </div>

            <div className="pt-4 border-t border-[#E8E3DB]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${location ? 'bg-[#B7E4C7] text-[#1B4332]' : 'bg-[#E8E3DB] text-[#4A453E]/40'}`}>
                    <Icon icon="lucide:map-pin" width="20" />
                  </div>
                  <div>
                    <p className="font-bold text-[#1B4332]">{location ? 'Location Captured' : 'Location Required'}</p>
                    <p className="text-xs text-[#4A453E]/60">{location ? 'Ready to list' : 'We need your location to show items nearby'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    location 
                      ? 'bg-[#E8E3DB] text-[#4A453E]/60 hover:bg-[#E8E3DB]/80' 
                      : 'bg-[#1B4332] text-white hover:bg-[#2D6A4F]'
                  }`}
                >
                  {location ? 'Update' : 'Set Location'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold py-4 rounded-full transition-all shadow-lg shadow-[#1B4332]/20 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Listing Item...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="lucide:plus-circle" width="20" />
                    <span>List Item Now</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </BackgroundLayout>
  );
};

export default ListItem;
