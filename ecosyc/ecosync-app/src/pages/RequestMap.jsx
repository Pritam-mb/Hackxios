import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { requestsAPI, itemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BackgroundLayout from '../components/BackgroundLayout';
import { Icon } from '@iconify/react';

// Custom icons for different marker types
const requestIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDIiIHZpZXdCb3g9IjAgMCAzMiA0MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgMEMxMC40NzcgMCA2IDQuNDc3IDYgMTBDNiAxNy41IDE2IDMwIDE2IDMwQzE2IDMwIDI2IDE3LjUgMjYgMTBDMjYgNC40NzcgMjEuNTIzIDAgMTYgMFoiIGZpbGw9IiNFNjM5NDYiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjEwIiByPSI1IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42]
});

const itemIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDIiIHZpZXdCb3g9IjAgMCAzMiA0MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgMEMxMC40NzcgMCA2IDQuNDc3IDYgMTBDNiAxNy41IDE2IDMwIDE2IDMwQzE2IDMwIDI2IDE3LjUgMjYgMTBDMjYgNC40NzcgMjEuNTIzIDAgMTYgMFoiIGZpbGw9IiMyRDZBNEYiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjEwIiByPSI1IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42]
});

const RequestMap = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [items, setItems] = useState([]);
  const [newRequestCoords, setNewRequestCoords] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showFilter, setShowFilter] = useState({ requests: true, items: true });
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    urgency: "normal"
  });
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef();

  // Fetch all requests and items on mount
  useEffect(() => {
    fetchRequests();
    fetchItems();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await requestsAPI.getAll();
      // Convert MongoDB coordinates [lng, lat] to Leaflet [lat, lng]
      const formattedRequests = data.map(req => ({
        id: req._id,
        item: req.itemName,
        user: req.user?.name || 'Anonymous',
        coords: [req.location.coordinates[1], req.location.coordinates[0]],
        urgency: req.urgency,
        description: req.description,
        type: 'request'
      }));
      setRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const data = await itemsAPI.getAll();
      // Convert MongoDB coordinates [lng, lat] to Leaflet [lat, lng]
      const formattedItems = data.map(item => ({
        id: item._id,
        title: item.title,
        description: item.description,
        owner: item.owner?.name || 'Anonymous',
        coords: [item.location.coordinates[1], item.location.coordinates[0]],
        category: item.category,
        type: item.type,
        price: item.price,
        status: item.status,
        imageUrl: item.imageUrl,
        itemType: 'item'
      }));
      setItems(formattedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);
          setNewRequestCoords(coords);
          if (mapRef.current) {
            mapRef.current.setView(coords, 15);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please click on the map to set it manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Sub-component to handle map clicks
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        setNewRequestCoords([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!newRequestCoords) {
      alert("Please click on the map to set your location first!");
      return;
    }
    
    setLoading(true);
    try {
      const requestData = {
        itemName: formData.itemName,
        description: formData.description,
        urgency: formData.urgency,
        coordinates: newRequestCoords,
        userId: user?.id || '000000000000000000000000'
      };
      
      await requestsAPI.create(requestData);
      
      // Refresh requests list
      await fetchRequests();
      
      setNewRequestCoords(null);
      setFormData({ itemName: "", description: "", urgency: "normal" });
      setShowRequestForm(false);
      alert('🚨 Request raised successfully!');
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to create request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundLayout>
      <div className="flex flex-col h-[calc(100vh-80px)] pt-20">
        {/* Header */}
        <div className="p-6 bg-white/80 backdrop-blur-md border-b border-[#E8E3DB] flex justify-between items-center relative z-20">
          <div>
            <h2 className="text-2xl font-bold text-[#1B4332]" style={{ fontFamily: "'Google Sans', sans-serif" }}>Explore Map</h2>
            <p className="text-[#4A453E]/60 text-sm">Discover items and requests in your community</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Filter Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilter({ ...showFilter, items: !showFilter.items })}
                className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${
                  showFilter.items 
                    ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]' 
                    : 'bg-white text-[#2D6A4F] border-[#2D6A4F]'
                }`}
              >
                📦 Items ({items.length})
              </button>
              <button
                onClick={() => setShowFilter({ ...showFilter, requests: !showFilter.requests })}
                className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${
                  showFilter.requests 
                    ? 'bg-[#E63946] text-white border-[#E63946]' 
                    : 'bg-white text-[#E63946] border-[#E63946]'
                }`}
              >
                🚨 Requests ({requests.length})
              </button>
            </div>
            <button
              onClick={() => setShowRequestForm(true)}
              className="px-6 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold rounded-full transition-all shadow-lg shadow-[#1B4332]/20 hover:-translate-y-1"
            >
              + Raise Request
            </button>
          </div>
        </div>

        <div className="flex-1 relative z-10">
          <button
            onClick={getCurrentLocation}
            className="absolute z-1000 top-4 right-4 bg-white hover:bg-[#F5F1EA] text-[#1B4332] px-4 py-2 rounded-xl shadow-xl border border-[#E8E3DB] font-bold transition-all flex items-center gap-2"
          >
            <Icon icon="heroicons:map-pin" /> My Location
          </button>
          
          <MapContainer
            center={[51.505, -0.09]}
            zoom={13}
            className="h-full w-full"
            ref={mapRef}
            zoomControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            <MapClickHandler />
            
            {/* User's Current Location Marker */}
            {userLocation && (
              <Marker position={userLocation}>
                <Popup>
                  <div className="text-[#1B4332]">
                    <p className="font-bold">📍 Your Location</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Render Existing Requests */}
            {showFilter.requests && requests.map(req => (
              <Marker key={req.id} position={req.coords} icon={requestIcon}>
                <Popup>
                  <div className="text-[#4A453E] min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🚨</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        req.urgency === 'high' ? 'bg-red-100 text-red-700' :
                        req.urgency === 'normal' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {req.urgency}
                      </span>
                    </div>
                    <p className="font-bold text-[#1B4332] mb-1">Need: {req.item}</p>
                    {req.description && (
                      <p className="text-xs text-[#9B9486] mb-2">{req.description}</p>
                    )}
                    <p className="text-xs text-[#9B9486] mb-3">Requested by {req.user}</p>
                    <button className="w-full bg-[#E63946] text-white py-2 rounded-lg font-bold text-xs hover:bg-[#D62828] transition-colors">
                      I have this!
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Render Available Items */}
            {showFilter.items && items.map(item => (
              <Marker key={item.id} position={item.coords} icon={itemIcon}>
                <Popup>
                  <div className="text-[#4A453E] min-w-[200px]">
                    {item.imageUrl && (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">📦</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.status === 'available' ? 'bg-green-100 text-green-700' :
                        item.status === 'in-use' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="font-bold text-[#1B4332] mb-1">{item.title}</p>
                    <p className="text-xs text-[#9B9486] mb-2 line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs text-[#9B9486]">by {item.owner}</span>
                      <span className="text-sm font-bold text-[#2D6A4F]">
                        {item.type === 'lend' ? 'Free' : `₹${item.price}`}
                      </span>
                    </div>
                    <button className="w-full bg-[#2D6A4F] text-white py-2 rounded-lg font-bold text-xs hover:bg-[#1B4332] transition-colors">
                      {item.type === 'lend' ? 'Borrow' : item.type === 'rent' ? 'Rent' : 'View'}
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Temporary Marker for new request placement */}
            {newRequestCoords && !showRequestForm && (
              <Marker position={newRequestCoords}>
                <Popup autoOpen>
                  <div className="text-[#4A453E] p-1">
                    <p className="font-bold mb-2 text-[#1B4332]">📍 Location Selected</p>
                    <button 
                      onClick={() => setShowRequestForm(true)}
                      className="w-full bg-[#E63946] text-white py-2 rounded-lg font-bold hover:bg-[#D62828] transition-colors text-xs"
                    >
                      Raise Request Here
                    </button>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-10 left-10 z-1000 bg-white/90 p-4 rounded-2xl border border-[#E8E3DB] backdrop-blur-md shadow-xl">
            <h4 className="text-sm font-bold text-[#1B4332] mb-3">Map Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#2D6A4F] rounded-full"></div>
                <span className="text-xs text-[#4A453E]">Available Items</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#E63946] rounded-full"></div>
                <span className="text-xs text-[#4A453E]">Active Requests</span>
              </div>
            </div>
            <p className="text-xs text-[#4A453E] leading-relaxed mt-3 pt-3 border-t border-[#E8E3DB]">
              <span className="text-[#1B4332] font-bold">Tip:</span> Click markers to view details and take action
            </p>
          </div>
        </div>

        {/* Request Form Modal */}
        {showRequestForm && (
          <div className="fixed inset-0 bg-[#1B4332]/20 backdrop-blur-sm z-2000 flex items-center justify-center p-4">
            <div className="bg-white border border-[#E8E3DB] rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-[#1B4332]" style={{ fontFamily: "'Google Sans', sans-serif" }}>Raise a Request</h3>
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="w-8 h-8 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#4A453E] hover:bg-[#E8E3DB] transition-colors"
                >
                  <Icon icon="heroicons:x-mark" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Item Name */}
                <div>
                  <label className="block text-sm font-bold text-[#1B4332] mb-2 ml-1">What do you need?</label>
                  <input
                    type="text"
                    placeholder="e.g. Power Drill, Ladder, Lawn Mower"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E8E3DB] rounded-xl px-4 py-3 text-[#1B4332] placeholder-[#4A453E]/40 focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] transition-all"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-[#1B4332] mb-2 ml-1">Description (Optional)</label>
                  <textarea
                    placeholder="Any specific requirements or details..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E8E3DB] rounded-xl px-4 py-3 text-[#1B4332] placeholder-[#4A453E]/40 focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] transition-all h-24 resize-none"
                  />
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-sm font-bold text-[#1B4332] mb-2 ml-1">Urgency</label>
                  <div className="relative">
                    <select
                      value={formData.urgency}
                      onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E8E3DB] rounded-xl px-4 py-3 text-[#1B4332] focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] appearance-none cursor-pointer"
                    >
                      <option value="low">Low - Can wait a few days</option>
                      <option value="normal">Normal - Within 24 hours</option>
                      <option value="high">High - Need it ASAP!</option>
                    </select>
                    <Icon icon="heroicons:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A453E]/40 pointer-events-none" />
                  </div>
                </div>

                {/* Location Status */}
                <div className="bg-[#FAF8F5] border border-[#E8E3DB] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {newRequestCoords ? (
                        <>
                          <div className="w-3 h-3 bg-[#2D6A4F] rounded-full animate-pulse"></div>
                          <span className="text-sm text-[#2D6A4F] font-medium">Location set</span>
                        </>
                      ) : (
                        <>
                          <div className="w-3 h-3 bg-[#E63946] rounded-full"></div>
                          <span className="text-sm text-[#E63946] font-medium">Set your location</span>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="px-3 py-1.5 bg-white border border-[#E8E3DB] hover:border-[#1B4332] text-[#1B4332] text-xs font-bold rounded-lg transition-all shadow-sm"
                    >
                      📍 Use Current
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#1B4332]/20 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? 'Creating...' : 'Raise Beacon'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </BackgroundLayout>
  );
};

export default RequestMap;
