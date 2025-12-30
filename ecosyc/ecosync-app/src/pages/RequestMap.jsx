import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { requestsAPI, itemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import BackgroundLayout from '../components/BackgroundLayout';
import { Icon } from '@iconify/react';

// Custom icons for different marker types
const createCustomIcon = (color, icon) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <span class="iconify" data-icon="${icon}" style="color: white; font-size: 20px;"></span>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

const requestIcon = createCustomIcon('#E63946', 'heroicons:exclamation-triangle');
const itemIcon = createCustomIcon('#2D6A4F', 'heroicons:cube');
const userIcon = createCustomIcon('#1B4332', 'heroicons:map-pin');

const RequestMap = () => {
  const { user } = useAuth();
  const notify = useNotification();
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
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [offerMessage, setOfferMessage] = useState('');
  const mapRef = useRef();

  // Fetch all requests and items on mount
  useEffect(() => {
    fetchRequests();
    fetchItems();
  }, []);

  // Check for matching items when requests are loaded
  useEffect(() => {
    if (requests.length > 0 && items.length > 0) {
      checkForMatches();
    }
  }, [requests, items]);

  const fetchRequests = async () => {
    try {
      const data = await requestsAPI.getAll();
      if (!Array.isArray(data)) return;
      
      // Convert MongoDB coordinates [lng, lat] to Leaflet [lat, lng]
      const formattedRequests = data
        .filter(req => req.location && req.location.coordinates && req.location.coordinates.length === 2)
        .map(req => ({
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
      if (!Array.isArray(data)) return;

      // Convert MongoDB coordinates [lng, lat] to Leaflet [lat, lng]
      const formattedItems = data
        .filter(item => item.location && item.location.coordinates && item.location.coordinates.length === 2)
        .map(item => ({
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

  // Check if any items match pending requests
  const checkForMatches = () => {
    requests.forEach(request => {
      const matchingItems = items.filter(item => 
        item.status === 'available' && 
        item.title.toLowerCase().includes(request.item.toLowerCase())
      );

      if (matchingItems.length > 0) {
        const itemNames = matchingItems.map(i => i.title).join(', ');
        notify.info(
          `🎉 Good news! ${matchingItems.length} item(s) matching "${request.item}" are available: ${itemNames}`,
          8000
        );
      }
    });
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
      notify.success('🚨 Request raised successfully! Your neighbors will be notified.');
    } catch (error) {
      console.error('Error creating request:', error);
      notify.error('Failed to create request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOfferHelp = (request) => {
    if (!user) {
      notify.warning('Please login to offer help!');
      return;
    }
    setSelectedRequest(request);
    setOfferMessage(`Hi! I have a ${request.item} that you can borrow. Let me know when you'd like to pick it up!`);
    setShowOfferModal(true);
  };

  const handleSendOffer = async () => {
    try {
      // In a real app, this would send a message/notification to the requester
      // For now, we'll just show a success message
      console.log('Sending offer:', {
        requestId: selectedRequest.id,
        helper: user.name,
        message: offerMessage
      });
      
      notify.success(`✅ Your offer has been sent to ${selectedRequest.user}! They will contact you soon.`);
      setShowOfferModal(false);
      setSelectedRequest(null);
      setOfferMessage('');
    } catch (error) {
      console.error('Error sending offer:', error);
      notify.error('Failed to send offer. Please try again.');
    }
  };

  return (
    <BackgroundLayout>
      <div className="flex flex-col h-screen max-w-[1600px] mx-auto px-4 pt-28 pb-4 md:px-8 md:pt-32 md:pb-6">
        
        {/* Page Header */}
        <div className="flex-none flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B4332] flex items-center gap-3" style={{ fontFamily: "'Google Sans', sans-serif" }}>
              Explore Map
            </h2>
            <p className="text-[#4A453E]/80 text-lg font-medium mt-1">Discover items and requests in your community</p>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative w-full overflow-hidden rounded-3xl border border-[#E8E3DB] shadow-xl bg-white">
          
          {/* Floating Filters - Top Right */}
          <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2 pointer-events-none">
             <div className="pointer-events-auto bg-white/90 backdrop-blur-md border border-[#E8E3DB] p-1.5 rounded-2xl shadow-sm flex gap-1">
                <button
                  onClick={() => setShowFilter({ ...showFilter, items: !showFilter.items })}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                    showFilter.items 
                      ? 'bg-[#2D6A4F] text-white shadow-sm' 
                      : 'bg-transparent text-[#4A453E] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <Icon icon="heroicons:cube" className="text-lg" />
                  <span className="hidden sm:inline">Items</span>
                  <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-xs ml-1">{items.length}</span>
                </button>
                <button
                  onClick={() => setShowFilter({ ...showFilter, requests: !showFilter.requests })}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                    showFilter.requests 
                      ? 'bg-[#E63946] text-white shadow-sm' 
                      : 'bg-transparent text-[#4A453E] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <Icon icon="heroicons:exclamation-triangle" className="text-lg" />
                  <span className="hidden sm:inline">Requests</span>
                  <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-xs ml-1">{requests.length}</span>
                </button>
             </div>
          </div>

          {/* Map Controls - Bottom Right */}
          <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-3 pointer-events-none">
             <button
              onClick={() => setShowRequestForm(true)}
              className="pointer-events-auto px-5 py-3 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold rounded-2xl transition-all shadow-lg shadow-[#1B4332]/20 hover:-translate-y-1 flex items-center gap-2"
            >
              <Icon icon="heroicons:plus-circle" className="text-xl" />
              <span className="hidden sm:inline">Raise Request</span>
            </button>
            
            <button
              onClick={getCurrentLocation}
              className="pointer-events-auto px-5 py-3 bg-white hover:bg-[#FAF8F5] text-[#1B4332] font-bold rounded-2xl shadow-lg border border-[#E8E3DB] transition-all hover:-translate-y-1 flex items-center gap-2"
              title="My Location"
            >
              <Icon icon="heroicons:map-pin" className="text-xl" />
              <span className="hidden sm:inline">My Location</span>
            </button>
          </div>

        {/* Map */}
        <MapContainer
            center={[51.505, -0.09]}
            zoom={13}
            className="h-full w-full z-0"
            ref={mapRef}
            zoomControl={false}
          >
            <TileLayer 
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <MapClickHandler />
            
            {/* User's Current Location Marker */}
            {userLocation && (
              <Marker position={userLocation} icon={userIcon}>
                <Popup className="custom-popup">
                  <div className="text-[#1B4332] font-bold p-2">
                    📍 Your Location
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Render Existing Requests */}
            {showFilter.requests && requests.map(req => (
              <Marker key={req.id} position={req.coords} icon={requestIcon}>
                <Popup className="custom-popup">
                  <div className="p-1 min-w-[220px]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        req.urgency === 'high' ? 'bg-red-100 text-red-600' :
                        req.urgency === 'normal' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <Icon icon="heroicons:exclamation-triangle" />
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          req.urgency === 'high' ? 'bg-red-100 text-red-700' :
                          req.urgency === 'normal' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {req.urgency} Priority
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-[#1B4332] text-lg leading-tight mb-1">{req.item}</h3>
                    <p className="text-xs text-[#4A453E]/60 mb-3">Requested by {req.user}</p>
                    
                    {req.description && (
                      <div className="bg-[#FAF8F5] p-2 rounded-lg mb-3 border border-[#E8E3DB]">
                        <p className="text-xs text-[#4A453E] italic">"{req.description}"</p>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => handleOfferHelp(req)}
                      className="w-full bg-[#E63946] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#D62828] transition-all shadow-lg shadow-[#E63946]/20 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <Icon icon="heroicons:hand-raised" />
                      I can help!
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Render Available Items */}
            {showFilter.items && items.map(item => (
              <Marker key={item.id} position={item.coords} icon={itemIcon}>
                <Popup className="custom-popup">
                  <div className="p-1 min-w-[240px]">
                    {item.imageUrl && (
                      <div className="relative h-32 mb-3 rounded-xl overflow-hidden">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-[#2D6A4F] shadow-sm">
                          {item.type === 'lend' ? 'Free' : `₹${item.price}`}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        item.status === 'available' ? 'bg-green-100 text-green-700' :
                        item.status === 'in-use' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-[#1B4332] text-lg leading-tight mb-1">{item.title}</h3>
                    <p className="text-xs text-[#4A453E]/60 mb-3">Owned by {item.owner}</p>
                    
                    <p className="text-sm text-[#4A453E] mb-4 line-clamp-2">{item.description}</p>
                    
                    <button className="w-full bg-[#2D6A4F] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#1B4332] transition-all shadow-lg shadow-[#2D6A4F]/20 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                      <Icon icon={item.type === 'lend' ? 'heroicons:arrow-path' : 'heroicons:currency-rupee'} />
                      {item.type === 'lend' ? 'Borrow Item' : item.type === 'rent' ? 'Rent Item' : 'View Details'}
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Temporary Marker for new request placement */}
            {newRequestCoords && !showRequestForm && (
              <Marker position={newRequestCoords} icon={requestIcon}>
                <Popup autoOpen>
                  <div className="text-[#4A453E] p-2 text-center">
                    <p className="font-bold mb-3 text-[#1B4332]">📍 New Request Location</p>
                    <button 
                      onClick={() => setShowRequestForm(true)}
                      className="w-full bg-[#1B4332] text-white py-2 rounded-lg font-bold hover:bg-[#2D6A4F] transition-colors text-xs"
                    >
                      Confirm Location
                    </button>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Legend - Bottom Left */}
          <div className="absolute bottom-6 left-6 z-[1000] pointer-events-none">
            <div className="pointer-events-auto bg-white/90 p-3 rounded-2xl border border-[#E8E3DB] backdrop-blur-md shadow-lg min-w-[160px]">
              <h4 className="text-xs font-bold text-[#1B4332] mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                <Icon icon="heroicons:information-circle" /> Legend
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F]"></div>
                  <span className="text-xs font-medium text-[#4A453E]">Available Items</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E63946]"></div>
                  <span className="text-xs font-medium text-[#4A453E]">Active Requests</span>
                </div>
                 <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1B4332]"></div>
                  <span className="text-xs font-medium text-[#4A453E]">Your Location</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && (
          <div className="fixed inset-0 bg-[#1B4332]/20 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
            <div className="bg-white border border-[#E8E3DB] rounded-4xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200 relative overflow-hidden">
              {/* Decorative background blob */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#B7E4C7] rounded-full opacity-20 blur-3xl pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <h3 className="text-2xl font-bold text-[#1B4332]">Raise a Request</h3>
                  <p className="text-sm text-[#4A453E]/60">Ask your neighbors for help</p>
                </div>
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="w-10 h-10 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#4A453E] hover:bg-[#E8E3DB] transition-colors"
                >
                  <Icon icon="heroicons:x-mark" className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-5 relative z-10">
                {/* Item Name */}
                <div>
                  <label className="block text-sm font-bold text-[#1B4332] mb-2 ml-1">What do you need?</label>
                  <div className="relative">
                    <Icon icon="heroicons:magnifying-glass" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A453E]/40 text-lg" />
                    <input
                      type="text"
                      placeholder="e.g. Power Drill, Ladder, Lawn Mower"
                      value={formData.itemName}
                      onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E8E3DB] rounded-xl pl-12 pr-4 py-3.5 text-[#1B4332] placeholder-[#4A453E]/40 focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-[#1B4332] mb-2 ml-1">Description (Optional)</label>
                  <textarea
                    placeholder="Any specific requirements or details..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E8E3DB] rounded-xl px-4 py-3.5 text-[#1B4332] placeholder-[#4A453E]/40 focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] transition-all h-28 resize-none font-medium"
                  />
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-sm font-bold text-[#1B4332] mb-2 ml-1">Urgency</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'normal', 'high'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData({ ...formData, urgency: level })}
                        className={`py-2.5 rounded-xl text-sm font-bold capitalize transition-all border-2 ${
                          formData.urgency === level
                            ? level === 'high' ? 'bg-[#E63946] text-white border-[#E63946]'
                            : level === 'normal' ? 'bg-[#F4A261] text-white border-[#F4A261]'
                            : 'bg-[#2A9D8F] text-white border-[#2A9D8F]'
                            : 'bg-transparent border-[#E8E3DB] text-[#4A453E] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Status */}
                <div className="bg-[#FAF8F5] border border-[#E8E3DB] rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${newRequestCoords ? 'bg-[#2D6A4F]/10 text-[#2D6A4F]' : 'bg-[#E63946]/10 text-[#E63946]'}`}>
                      <Icon icon="heroicons:map-pin" className="text-xl" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1B4332]">Location</p>
                      <p className="text-xs text-[#4A453E]/60">{newRequestCoords ? 'Coordinates set' : 'Not set yet'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="px-4 py-2 bg-white border border-[#E8E3DB] hover:border-[#1B4332] text-[#1B4332] text-xs font-bold rounded-lg transition-all shadow-sm"
                  >
                    Detect Location
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#1B4332]/20 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Icon icon="eos-icons:loading" className="animate-spin text-xl" />
                      Creating Beacon...
                    </>
                  ) : (
                    <>
                      <Icon icon="heroicons:paper-airplane" className="text-xl" />
                      Raise Beacon
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Offer Help Modal */}
        {showOfferModal && selectedRequest && (
          <div className="fixed inset-0 bg-[#1B4332]/20 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
            <div className="bg-white border border-[#E8E3DB] rounded-4xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200 relative overflow-hidden">
               {/* Decorative background blob */}
               <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#E63946] rounded-full opacity-10 blur-3xl pointer-events-none"></div>

              <div className="flex justify-between items-center mb-6 relative z-10">
                <div>
                  <h3 className="text-2xl font-bold text-[#1B4332]">Offer Help</h3>
                  <p className="text-sm text-[#4A453E]/60">Be a hero for your neighbor</p>
                </div>
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="w-10 h-10 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#4A453E] hover:bg-[#E8E3DB] transition-colors"
                >
                  <Icon icon="heroicons:x-mark" className="text-xl" />
                </button>
              </div>

              <div className="mb-6 relative z-10">
                <div className="bg-[#FAF8F5] rounded-xl p-5 mb-5 border border-[#E8E3DB]">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-lg font-bold">
                      {selectedRequest.user.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm text-[#4A453E]">Request from</p>
                      <p className="font-bold text-[#1B4332] text-lg leading-none">{selectedRequest.user}</p>
                    </div>
                  </div>
                  
                  <div className="pl-13">
                    <p className="text-sm text-[#4A453E] mb-1">Needs:</p>
                    <p className="font-bold text-[#1B4332] text-xl mb-2">{selectedRequest.item}</p>
                    {selectedRequest.description && (
                      <p className="text-sm text-[#4A453E]/80 italic bg-white p-3 rounded-lg border border-[#E8E3DB]">
                        "{selectedRequest.description}"
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1B4332] mb-2 ml-1">Your Message</label>
                  <textarea
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    placeholder="Let them know you can help..."
                    className="w-full bg-[#FAF8F5] border border-[#E8E3DB] rounded-xl px-4 py-3.5 text-[#1B4332] placeholder-[#4A453E]/40 focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] transition-all h-32 resize-none font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-3 relative z-10">
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="flex-1 py-3.5 bg-white border-2 border-[#E8E3DB] hover:border-[#1B4332] text-[#1B4332] font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendOffer}
                  className="flex-1 py-3.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#2D6A4F]/20 flex items-center justify-center gap-2"
                >
                  <Icon icon="heroicons:paper-airplane" />
                  Send Offer
                </button>
              </div>
            </div>
          </div>
        )}
    </BackgroundLayout>
  );
};

export default RequestMap;
