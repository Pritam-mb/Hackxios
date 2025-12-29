import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { requestsAPI } from '../services/api';

const RequestMap = () => {
  const [requests, setRequests] = useState([]);
  const [newRequestCoords, setNewRequestCoords] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    urgency: "normal"
  });
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef();

  // Fetch all requests on mount
  useEffect(() => {
    fetchRequests();
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
        description: req.description
      }));
      setRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
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
        coordinates: newRequestCoords, // [lat, lng]
        userId: '000000000000000000000000' // Temporary - will be replaced with auth
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
    <div className="flex flex-col h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="p-6 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Community Beacons</h2>
          <p className="text-slate-400 text-sm">Click the map to set location, then raise your request</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-sm animate-pulse border border-orange-500/30">
            {requests.length} Active Requests
          </div>
          <button
            onClick={() => setShowRequestForm(true)}
            className="px-6 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-full transition-all"
          >
            + Raise Request
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <button
          onClick={getCurrentLocation}
          className="absolute z-[1000] top-4 right-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg transition-all"
        >
          📍 My Location
        </button>
        
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          className="h-full w-full"
          ref={mapRef}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <MapClickHandler />
          
          {/* User's Current Location Marker */}
          {userLocation && (
            <Marker position={userLocation}>
              <Popup>
                <div className="text-slate-900">
                  <p className="font-bold">📍 Your Location</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Render Existing Requests */}
          {requests.map(req => (
            <Marker key={req.id} position={req.coords}>
              <Popup>
                <div className="text-slate-900">
                  <p className="font-bold">Neighbor needs: {req.item}</p>
                  <p className="text-xs text-slate-500 mb-2">Requested by {req.user}</p>
                  <button className="w-full bg-green-600 text-white py-1 rounded hover:bg-green-700">
                    I have this!
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Temporary Marker for new request placement */}
          {newRequestCoords && !showRequestForm && (
            <Marker position={newRequestCoords}>
              <Popup autoOpen>
                <div className="text-slate-900 p-2">
                  <p className="font-bold mb-2">📍 Location Selected</p>
                  <button 
                    onClick={() => setShowRequestForm(true)}
                    className="w-full bg-orange-500 text-white py-2 rounded font-bold hover:bg-orange-600"
                  >
                    Raise Request Here
                  </button>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Legend / Tip */}
        <div className="absolute bottom-10 left-10 z-[1000] bg-slate-900/90 p-4 rounded-xl border border-slate-700 backdrop-blur-md max-w-xs">
          <p className="text-xs text-slate-300">
            <span className="text-orange-500 font-bold">Tip:</span> Beacons stay active for 24 hours. Once a neighbor offers help, you'll be notified in Chat.
          </p>
        </div>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Raise a Request</h3>
              <button
                onClick={() => setShowRequestForm(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium mb-2">What do you need?</label>
                <input
                  type="text"
                  placeholder="e.g. Power Drill, Ladder, Lawn Mower"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <textarea
                  placeholder="Any specific requirements or details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500 h-24 resize-none"
                />
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-medium mb-2">Urgency</label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                >
                  <option value="low">Low - Can wait a few days</option>
                  <option value="normal">Normal - Within 24 hours</option>
                  <option value="high">High - Need it ASAP!</option>
                </select>
              </div>

              {/* Location Status */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {newRequestCoords ? (
                      <>
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-400">Location set</span>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm text-orange-400">Set your location</span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition-all"
                  >
                    📍 Use Current
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : '🚨 Raise Beacon'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestMap;
