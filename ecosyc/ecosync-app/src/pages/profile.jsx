import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI, itemsAPI, transactionsAPI, aiAPI } from '../services/api';
import BackgroundLayout from '../components/BackgroundLayout';
import { Icon } from '@iconify/react';
import { QRCodeSVG } from 'qrcode.react';
import { toast as notify } from 'react-hot-toast';

function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // AI Features State
  const [recommendations, setRecommendations] = useState([]);
  const [ecoInsights, setEcoInsights] = useState([]);
  const [smartBadges, setSmartBadges] = useState([]);
  const [achievementSummary, setAchievementSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Pending Orders State
  const [pendingOrders, setPendingOrders] = useState([]);

  // Transaction Modal State
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  // Nearby Items State
  const [nearbyItems, setNearbyItems] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfileData();
      fetchAIFeatures();
    }
  }, [isAuthenticated, user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const profileData = await usersAPI.getProfile(user.id);
      setUserProfile(profileData.user);

      // Fetch user's items
      const allItems = await itemsAPI.getAll();
      const userItems = allItems.filter(item => item.owner?._id === user.id);
      setMyItems(userItems);

      // Fetch nearby items (not owned by user)
      const nearbyAvailable = allItems
        .filter(item => item.owner?._id !== user.id && item.status === 'available')
        .slice(0, 6); // Show top 6 nearby items
      setNearbyItems(nearbyAvailable);

      // Fetch user's transactions
      const userTransactions = await transactionsAPI.getUserTransactions(user.id);
      setTransactions(userTransactions);

      // Filter pending orders where user is the lender (owner)
      const pending = userTransactions.filter(
        t => t.lender._id === user.id && t.status === 'requested'
      );
      setPendingOrders(pending);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Notify about pending orders
  useEffect(() => {
    if (pendingOrders.length > 0) {
      notify.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <Icon icon="mdi:bell-ring" className="h-10 w-10 text-orange-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">Pending Requests</p>
                <p className="mt-1 text-sm text-gray-500">
                  You have {pendingOrders.length} pending order request{pendingOrders.length > 1 ? 's' : ''}!
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => {
                notify.dismiss(t.id);
                document.getElementById('pending-orders-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              View
            </button>
          </div>
        </div>
      ), { duration: 5000 });
    }
  }, [pendingOrders]);

  const fetchAIFeatures = async () => {
    try {
      setAiLoading(true);
      
      // Fetch AI-powered features
      const [recsData, insightsData, badgesData, summaryData] = await Promise.all([
        aiAPI.getRecommendations().catch(() => ({ recommendations: [] })),
        aiAPI.getEcoInsights().catch(() => ({ insights: [] })),
        aiAPI.getSmartBadges().catch(() => ({ badges: [] })),
        aiAPI.getAchievementSummary().catch(() => ({ summary: '' }))
      ]);

      setRecommendations(recsData.recommendations || []);
      setEcoInsights(insightsData.insights || []);
      setSmartBadges(badgesData.badges || []);
      setAchievementSummary(summaryData.summary || '');
    } catch (error) {
      console.error('Error fetching AI features:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptOrder = async (transactionId) => {
    try {
      await transactionsAPI.updateStatus(transactionId, 'active');
      notify.success('Order accepted successfully!');
      fetchProfileData(); // Refresh data
    } catch (error) {
      console.error('Error accepting order:', error);
      notify.error('Failed to accept order');
    }
  };

  const handleDeclineOrder = async (transactionId) => {
    try {
      await transactionsAPI.updateStatus(transactionId, 'cancelled');
      notify.success('Order declined');
      fetchProfileData(); // Refresh data
    } catch (error) {
      console.error('Error declining order:', error);
      notify.error('Failed to decline order');
    }
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'requested': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'heroicons:arrow-path';
      case 'completed': return 'heroicons:check-circle';
      case 'cancelled': return 'heroicons:x-circle';
      case 'requested': return 'heroicons:clock';
      default: return 'heroicons:question-mark-circle';
    }
  };

  const getLevelBadge = (level) => {
    const badges = {
      seedling: { icon: '🌱', name: 'Seedling', color: 'bg-[#B7E4C7]/30 text-[#2D6A4F] border-[#B7E4C7]' },
      sapling: { icon: '🌿', name: 'Sapling', color: 'bg-[#40916C]/20 text-[#1B4332] border-[#40916C]' },
      oak: { icon: '🌳', name: 'Oak Tree', color: 'bg-[#2D6A4F]/20 text-[#1B4332] border-[#2D6A4F]' },
      champion: { icon: '🏆', name: 'Champion', color: 'bg-[#E8E3DB] text-[#1B4332] border-[#9B9486]' }
    };
    return badges[level] || badges.seedling;
  };

  const calculateCO2Saved = () => {
    // Estimate: Each shared item saves ~5kg CO2
    return (myItems.length * 5 + transactions.length * 3).toFixed(1);
  };

  const calculateMoneySaved = () => {
    // Estimate based on transactions
    return transactions.reduce((total, t) => total + (t.ecoImpactMoney || 50), 0);
  };

  const getAvatarUrl = (seed) => {
    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed || 'User'}&backgroundColor=e8e3db,faf8f5,b7e4c7`;
  };

  if (!isAuthenticated) {
    return (
      <BackgroundLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-[#E8E3DB]">
            <h2 className="text-2xl font-bold mb-4 text-[#1B4332]">Please login to view your profile</h2>
            <a href="/login" className="px-6 py-3 bg-[#1B4332] text-white rounded-lg hover:bg-[#2D6A4F] transition-all shadow-lg hover:shadow-xl">
              Go to Login
            </a>
          </div>
        </div>
      </BackgroundLayout>
    );
  }

  if (loading) {
    return (
      <BackgroundLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#1B4332] mx-auto mb-4"></div>
            <p className="text-[#1B4332] font-medium animate-pulse">Loading your eco-profile...</p>
          </div>
        </div>
      </BackgroundLayout>
    );
  }

  const levelBadge = getLevelBadge(userProfile?.level || user?.level);

  return (
    <BackgroundLayout>
      <div className="p-4 md:p-8 pt-24 md:pt-32 min-h-screen max-w-7xl mx-auto space-y-8">
        
        {/* Profile Header Card */}
        <div className="relative overflow-hidden bg-[#FAF8F5]/80 backdrop-blur-xl rounded-3xl shadow-xl border border-[#E8E3DB] p-6 md:p-10">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#B7E4C7]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-[#E8E3DB]/40 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] shadow-lg">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#FAF8F5]">
                  <img 
                    src={getAvatarUrl(user?.name)} 
                    alt="Profile Avatar" 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md border border-[#E8E3DB]">
                <Icon icon="mdi:camera" className="text-[#1B4332] text-lg" />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-3">
              <div>
                <h1 className="text-4xl font-bold text-[#1B4332] tracking-tight">{user?.name || 'Eco Warrior'}</h1>
                <p className="text-[#4A453E] font-medium flex items-center justify-center md:justify-start gap-2">
                  <Icon icon="mdi:email-outline" />
                  {user?.email}
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${levelBadge.color} backdrop-blur-sm`}>
                  <span className="text-2xl">{levelBadge.icon}</span>
                  <span className="font-bold">{levelBadge.name}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF8F5] text-[#1B4332] border border-[#E8E3DB] backdrop-blur-sm">
                  <Icon icon="mdi:map-marker" className="text-xl" />
                  <span className="font-medium">Local Hero</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 bg-white/50 p-4 rounded-2xl border border-[#E8E3DB] shadow-sm backdrop-blur-sm">
              <div className="text-5xl font-black text-[#1B4332]">
                {userProfile?.ecoPoints || user?.ecoPoints || 0}
              </div>
              <div className="text-sm font-bold text-[#4A453E] uppercase tracking-wider">Eco Points</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto pb-2 gap-2 md:gap-4 no-scrollbar">
          {['overview', 'items', 'activity', 'insights'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-[#1B4332] text-white shadow-lg shadow-[#1B4332]/20 scale-105'
                  : 'bg-[#FAF8F5] text-[#4A453E] border border-[#E8E3DB] hover:bg-white hover:shadow-md'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Stats & Badges */}
          <div className="space-y-8">
            {/* Impact Stats */}
            <div className="bg-[#FAF8F5]/80 backdrop-blur-xl rounded-3xl shadow-lg border border-[#E8E3DB] p-6">
              <h3 className="text-xl font-bold text-[#1B4332] mb-6 flex items-center gap-2">
                <Icon icon="mdi:chart-box-outline" /> Impact Summary
              </h3>
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-4 border border-[#E8E3DB] flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#B7E4C7]/30 rounded-full flex items-center justify-center text-[#2D6A4F] text-2xl">
                    <Icon icon="mdi:leaf" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#1B4332]">{calculateCO2Saved()} kg</div>
                    <div className="text-xs text-[#4A453E] font-medium">CO₂ Emissions Prevented</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-[#E8E3DB] flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#E8E3DB]/50 rounded-full flex items-center justify-center text-[#1B4332] text-2xl">
                    <Icon icon="mdi:currency-usd" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#1B4332]">₹{calculateMoneySaved()}</div>
                    <div className="text-xs text-[#4A453E] font-medium">Estimated Savings</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-[#E8E3DB] flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#FAF8F5] border border-[#E8E3DB] rounded-full flex items-center justify-center text-[#4A453E] text-2xl">
                    <Icon icon="mdi:share-variant" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#1B4332]">{myItems.length}</div>
                    <div className="text-xs text-[#4A453E] font-medium">Active Listings</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-[#FAF8F5]/80 backdrop-blur-xl rounded-3xl shadow-lg border border-[#E8E3DB] p-6">
              <h3 className="text-xl font-bold text-[#1B4332] mb-6 flex items-center gap-2">
                <Icon icon="mdi:medal-outline" /> Achievements
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: '🛡️', name: 'Verified', earned: true },
                  { icon: '🤝', name: 'Trusted', earned: myItems.length > 0 },
                  { icon: '🔨', name: 'Tool Master', earned: myItems.length >= 3 },
                  { icon: '🌱', name: 'Eco Warrior', earned: (userProfile?.ecoPoints || 0) >= 100 },
                  { icon: '⭐', name: 'Top Rated', earned: transactions.length >= 5 },
                  { icon: '🎯', name: 'Active', earned: transactions.length > 0 },
                  { icon: '💚', name: 'Green Hero', earned: calculateCO2Saved() >= 20 },
                  { icon: '🏆', name: 'Champion', earned: (userProfile?.ecoPoints || 0) >= 300 },
                  ...smartBadges.map(b => ({ icon: b.emoji, name: b.name, earned: true }))
                ].slice(0, 9).map((badge, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all ${
                      badge.earned
                        ? 'bg-white border border-[#2D6A4F]/20 shadow-sm'
                        : 'bg-[#E8E3DB]/30 opacity-40 grayscale'
                    }`}
                    title={badge.name}
                  >
                    <div className="text-3xl mb-1">{badge.icon}</div>
                    <div className="text-[10px] font-bold text-[#1B4332] leading-tight">{badge.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Dynamic Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Pending Orders Section */}
            {pendingOrders.length > 0 && (
              <div id="pending-orders-section" className="bg-[#FAF8F5] backdrop-blur-xl rounded-3xl shadow-lg border border-[#E8E3DB] p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#B5651D]/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="p-3 bg-[#E8E3DB]/50 rounded-xl text-[#B5651D]">
                    <Icon icon="mdi:bell-ring" className="text-2xl animate-bounce" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#1B4332]">Action Required</h2>
                    <p className="text-sm text-[#4A453E]">You have pending requests to review</p>
                  </div>
                </div>
                
                <div className="space-y-4 relative z-10">
                  {pendingOrders.map((order) => (
                    <div key={order._id} className="bg-white rounded-2xl p-6 border border-[#E8E3DB] shadow-sm hover:shadow-md transition-all">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex items-center gap-4 md:w-1/3">
                          <img 
                            src={getAvatarUrl(order.borrower?.name)} 
                            alt={order.borrower?.name}
                            className="w-16 h-16 rounded-full bg-[#FAF8F5] border-2 border-white shadow-sm"
                          />
                          <div>
                            <h4 className="font-bold text-[#1B4332] text-lg">{order.borrower?.name}</h4>
                            <p className="text-xs text-[#4A453E] bg-[#FAF8F5] px-2 py-1 rounded-full inline-block mt-1">
                              Wants to borrow
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="bg-[#FAF8F5] rounded-xl p-4 mb-4 border border-[#E8E3DB]">
                            <div className="flex items-center gap-3 mb-3">
                              <Icon icon="mdi:package-variant" className="text-xl text-[#2D6A4F]" />
                              <h5 className="font-bold text-[#1B4332]">{order.item?.title}</h5>
                            </div>
                            <div className="flex gap-4 text-sm">
                              <div className="flex items-center gap-1 text-[#4A453E]">
                                <Icon icon="mdi:calendar-arrow-right" />
                                {new Date(order.pickupTime).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1 text-[#4A453E]">
                                <Icon icon="mdi:calendar-arrow-left" />
                                {new Date(order.returnTime).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAcceptOrder(order._id)}
                              className="flex-1 py-2.5 bg-[#1B4332] hover:bg-[#143024] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#1B4332]/20"
                            >
                              <Icon icon="heroicons:check-circle" width="20" />
                              Accept
                            </button>
                            <button
                              onClick={() => handleDeclineOrder(order._id)}
                              className="flex-1 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                              <Icon icon="heroicons:x-circle" width="20" />
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* AI Summary */}
                {achievementSummary && (
                  <div className="bg-[#FAF8F5] backdrop-blur-xl rounded-3xl p-8 border border-[#E8E3DB] shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-2xl shadow-sm text-[#2D6A4F]">
                        <Icon icon="mdi:robot-excited-outline" className="text-3xl" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#1B4332] mb-2">AI Journey Summary</h3>
                        <p className="text-[#4A453E] leading-relaxed">{achievementSummary}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Activity Preview */}
                <div className="bg-[#FAF8F5]/80 backdrop-blur-xl rounded-3xl shadow-lg border border-[#E8E3DB] p-6 md:p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#1B4332]">Recent Activity</h2>
                    <button onClick={() => setActiveTab('activity')} className="text-[#2D6A4F] font-semibold hover:underline">View All</button>
                  </div>
                  
                  {transactions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#E8E3DB]">
                      <Icon icon="mdi:clipboard-text-off-outline" className="text-4xl text-[#9B9486] mx-auto mb-3" />
                      <p className="text-[#4A453E]">No transactions yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactions.slice(0, 3).map(transaction => (
                        <div 
                          key={transaction._id} 
                          onClick={() => handleViewTransaction(transaction)}
                          className="group flex items-center justify-between p-4 bg-white rounded-2xl border border-[#E8E3DB] hover:border-[#2D6A4F]/30 hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              transaction.borrower._id === user.id ? 'bg-[#B7E4C7]/30 text-[#2D6A4F]' : 'bg-[#E8E3DB] text-[#1B4332]'
                            }`}>
                              <Icon 
                                icon={transaction.borrower._id === user.id ? 'mdi:arrow-down' : 'mdi:arrow-up'} 
                                className="text-2xl"
                              />
                            </div>
                            <div>
                              <div className="font-bold text-[#1B4332] group-hover:text-[#2D6A4F] transition-colors">{transaction.item?.title}</div>
                              <div className="text-xs text-[#9B9486]">
                                {new Date(transaction.pickupTime).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className={`text-xs px-3 py-1.5 rounded-full font-bold border ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'items' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-[#FAF8F5]/80 backdrop-blur-xl rounded-3xl shadow-lg border border-[#E8E3DB] p-6 md:p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#1B4332]">My Shared Items</h2>
                    <a href="/list" className="px-4 py-2 bg-[#1B4332] text-white rounded-xl hover:bg-[#2D6A4F] transition-colors shadow-lg shadow-[#1B4332]/20">
                      + Add Item
                    </a>
                  </div>
                  
                  {myItems.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#E8E3DB]">
                      <Icon icon="mdi:package-variant-closed" className="text-6xl text-[#9B9486] mx-auto mb-4" />
                      <p className="text-[#4A453E] font-medium">You haven't shared any items yet.</p>
                      <p className="text-sm text-[#9B9486] mt-2">Start sharing to earn eco points!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {myItems.map(item => (
                        <div key={item._id} className="group bg-white rounded-2xl overflow-hidden border border-[#E8E3DB] hover:shadow-xl transition-all duration-300">
                          <div className="relative h-48 overflow-hidden">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full bg-[#FAF8F5] flex items-center justify-center">
                                <Icon icon="mdi:package-variant" className="text-6xl text-[#E8E3DB]" />
                              </div>
                            )}
                            <div className="absolute top-3 right-3">
                              <span className={`text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md ${
                                item.status === 'available' ? 'bg-[#2D6A4F]/90 text-white' : 'bg-[#B5651D]/90 text-white'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                          </div>
                          <div className="p-5">
                            <h3 className="font-bold text-[#1B4332] text-lg mb-2 group-hover:text-[#2D6A4F] transition-colors">{item.title}</h3>
                            <p className="text-sm text-[#4A453E] mb-4 line-clamp-2">{item.description}</p>
                            <div className="flex justify-between items-center pt-4 border-t border-[#E8E3DB]">
                              <span className="text-xs font-bold text-[#9B9486] uppercase tracking-wider">{item.type}</span>
                              <button className="text-[#2D6A4F] text-sm font-bold hover:underline">Edit Details</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="bg-[#FAF8F5]/80 backdrop-blur-xl rounded-3xl shadow-lg border border-[#E8E3DB] p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-[#1B4332] mb-6">Transaction History</h2>
                <div className="space-y-4">
                  {transactions.map(transaction => (
                    <div 
                      key={transaction._id} 
                      onClick={() => handleViewTransaction(transaction)}
                      className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white rounded-2xl border border-[#E8E3DB] hover:border-[#2D6A4F]/30 hover:shadow-lg transition-all cursor-pointer gap-4"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                          transaction.borrower._id === user.id ? 'bg-[#B7E4C7]/30 text-[#2D6A4F]' : 'bg-[#E8E3DB] text-[#1B4332]'
                        }`}>
                          <Icon 
                            icon={transaction.borrower._id === user.id ? 'mdi:arrow-down' : 'mdi:arrow-up'} 
                            className="text-3xl"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-[#1B4332] text-lg">{transaction.item?.title}</div>
                          <div className="text-sm text-[#4A453E] flex items-center gap-2">
                            <img 
                              src={getAvatarUrl(transaction.borrower._id === user.id ? transaction.lender?.name : transaction.borrower?.name)} 
                              className="w-5 h-5 rounded-full"
                              alt="Avatar"
                            />
                            {transaction.borrower._id === user.id ? 'Borrowed from' : 'Lent to'} {' '}
                            <span className="font-semibold">
                              {transaction.borrower._id === user.id ? transaction.lender?.name : transaction.borrower?.name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto pl-16 md:pl-0">
                        <div className="text-right">
                          <div className="text-xs text-[#9B9486]">
                            {new Date(transaction.pickupTime).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-[#9B9486]">
                            {new Date(transaction.returnTime).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`text-xs px-4 py-2 rounded-full font-bold border ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Recommendations */}
                <div className="bg-[#FAF8F5]/80 backdrop-blur-xl rounded-3xl shadow-lg border border-[#E8E3DB] p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-[#E8E3DB] rounded-lg text-[#B5651D]">
                      <Icon icon="mdi:lightbulb-on-outline" className="text-2xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#1B4332]">Smart Recommendations</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.map((rec, idx) => (
                      <div key={idx} className="bg-white border border-[#E8E3DB] rounded-2xl p-5 hover:shadow-md transition-all">
                        <div className="flex items-start gap-4">
                          <Icon 
                            icon={rec.type === 'borrow' ? 'mdi:arrow-down-circle' : 'mdi:arrow-up-circle'} 
                            className={`text-3xl ${rec.type === 'borrow' ? 'text-[#2C7DA0]' : 'text-[#2D6A4F]'}`}
                          />
                          <div>
                            <h4 className="font-bold text-[#1B4332] mb-1">{rec.item}</h4>
                            <p className="text-sm text-[#4A453E] leading-relaxed">{rec.reason}</p>
                            <span className={`inline-block mt-3 text-xs px-3 py-1 rounded-full font-medium ${
                              rec.type === 'borrow' ? 'bg-[#2C7DA0]/10 text-[#2C7DA0]' : 'bg-[#2D6A4F]/10 text-[#2D6A4F]'
                            }`}>
                              {rec.type === 'borrow' ? 'Suggestion to Borrow' : 'Suggestion to Share'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Eco Insights */}
                <div className="bg-[#FAF8F5]/80 backdrop-blur-xl rounded-3xl shadow-lg border border-[#E8E3DB] p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-[#B7E4C7]/30 rounded-lg text-[#2D6A4F]">
                      <Icon icon="mdi:leaf-circle-outline" className="text-2xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#1B4332]">Eco Impact Tips</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {ecoInsights.map((insight, idx) => (
                      <div key={idx} className="flex items-start gap-5 p-5 bg-white rounded-2xl border border-[#E8E3DB]">
                        <div className="w-8 h-8 bg-[#1B4332] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-[#1B4332] font-medium mb-2 text-lg">{insight.tip}</p>
                          <p className="text-sm text-[#2D6A4F] font-semibold flex items-center gap-2">
                            <Icon icon="mdi:chart-line-variant" />
                            Potential Impact: {insight.potential_impact}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Transaction Details Modal */}
        {showTransactionModal && selectedTransaction && createPortal(
          <div className="fixed inset-0 bg-[#1B4332]/60 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
            <div className="bg-[#FAF8F5] rounded-3xl max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto border border-[#E8E3DB] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              {/* Header */}
              <div className="sticky top-0 bg-[#FAF8F5]/95 backdrop-blur-sm border-b border-[#E8E3DB] px-8 py-6 flex justify-between items-center rounded-t-3xl z-10">
                <h3 className="text-2xl font-bold text-[#1B4332]">Order Details</h3>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="w-10 h-10 rounded-full bg-[#E8E3DB] hover:bg-[#dcd6cc] flex items-center justify-center transition-colors text-[#1B4332]"
                >
                  <Icon icon="heroicons:x-mark" width="24" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                {/* Status Badge */}
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    selectedTransaction.status === 'completed' ? 'bg-[#B7E4C7]/30 text-[#2D6A4F]' :
                    selectedTransaction.status === 'active' ? 'bg-[#E8E3DB] text-[#1B4332]' :
                    selectedTransaction.status === 'disputed' ? 'bg-red-100 text-red-600' :
                    'bg-[#FAF8F5] border border-[#E8E3DB] text-[#4A453E]'
                  }`}>
                    <Icon icon={getStatusIcon(selectedTransaction.status)} className="text-4xl" />
                  </div>
                  <div className={`px-6 py-2 rounded-full font-bold text-lg border ${getStatusColor(selectedTransaction.status)}`}>
                    {selectedTransaction.status.toUpperCase()}
                  </div>
                </div>

                {/* Item Details */}
                <div className="bg-white rounded-2xl p-6 border border-[#E8E3DB]">
                  <h4 className="font-bold text-[#1B4332] mb-4 flex items-center gap-2 text-lg">
                    <Icon icon="mdi:package-variant" />
                    Item Information
                  </h4>
                  <div className="flex gap-4">
                    {selectedTransaction.item?.imageUrl && (
                      <img 
                        src={selectedTransaction.item.imageUrl} 
                        alt={selectedTransaction.item.title}
                        className="w-24 h-24 object-cover rounded-xl shadow-sm border border-[#E8E3DB]"
                      />
                    )}
                    <div>
                      <h5 className="font-bold text-[#1B4332] text-xl">{selectedTransaction.item?.title}</h5>
                      <p className="text-[#4A453E] mt-1">{selectedTransaction.item?.description}</p>
                    </div>
                  </div>
                </div>

                {/* Parties Involved */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#E8E3DB]/30 rounded-2xl p-5 border border-[#E8E3DB]">
                    <h5 className="font-bold text-[#1B4332] mb-4 flex items-center gap-2">
                      <Icon icon="mdi:arrow-down-circle" className="text-[#2D6A4F]" /> Borrower
                    </h5>
                    <div className="flex items-center gap-4">
                      <img 
                        src={getAvatarUrl(selectedTransaction.borrower?.name)} 
                        className="w-12 h-12 rounded-full bg-[#FAF8F5] shadow-sm border border-[#E8E3DB]"
                        alt="Borrower"
                      />
                      <div>
                        <p className="font-bold text-[#1B4332]">{selectedTransaction.borrower?.name}</p>
                        <p className="text-xs text-[#4A453E]">{selectedTransaction.borrower?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#B7E4C7]/20 rounded-2xl p-5 border border-[#B7E4C7]/50">
                    <h5 className="font-bold text-[#1B4332] mb-4 flex items-center gap-2">
                      <Icon icon="mdi:arrow-up-circle" className="text-[#2D6A4F]" /> Lender
                    </h5>
                    <div className="flex items-center gap-4">
                      <img 
                        src={getAvatarUrl(selectedTransaction.lender?.name)} 
                        className="w-12 h-12 rounded-full bg-[#FAF8F5] shadow-sm border border-[#E8E3DB]"
                        alt="Lender"
                      />
                      <div>
                        <p className="font-bold text-[#1B4332]">{selectedTransaction.lender?.name}</p>
                        <p className="text-xs text-[#4A453E]">{selectedTransaction.lender?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-2xl p-6 border border-[#E8E3DB]">
                  <h4 className="font-bold text-[#1B4332] mb-4 flex items-center gap-2 text-lg">
                    <Icon icon="heroicons:calendar" />
                    Timeline
                  </h4>
                  <div className="flex justify-between items-center text-sm md:text-base">
                    <div className="text-center">
                      <div className="text-[#4A453E] mb-1">Pickup</div>
                      <div className="font-bold text-[#1B4332]">
                        {selectedTransaction.pickupTime ? new Date(selectedTransaction.pickupTime).toLocaleDateString() : 'Pending'}
                      </div>
                    </div>
                    <div className="h-px flex-1 bg-[#E8E3DB] mx-4 relative">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#FAF8F5] px-2 text-xs text-[#4A453E] border border-[#E8E3DB] rounded-full">
                        {selectedTransaction.pickupTime && selectedTransaction.returnTime 
                          ? Math.ceil((new Date(selectedTransaction.returnTime) - new Date(selectedTransaction.pickupTime)) / (1000 * 60 * 60 * 24)) 
                          : '-'} days
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-[#4A453E] mb-1">Return</div>
                      <div className="font-bold text-[#1B4332]">
                        {selectedTransaction.returnTime ? new Date(selectedTransaction.returnTime).toLocaleDateString() : 'Pending'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code Section */}
                {(selectedTransaction.status === 'active' || selectedTransaction.status === 'requested') && (
                  <div className="bg-gradient-to-br from-[#FAF8F5] to-[#E8E3DB] rounded-2xl p-8 border border-[#E8E3DB] text-center">
                    <h4 className="font-bold text-[#1B4332] mb-6 flex items-center justify-center gap-2">
                      <Icon icon="heroicons:qr-code" />
                      Transaction QR Code
                    </h4>
                    <div className="bg-white p-4 rounded-2xl inline-block shadow-lg border border-[#E8E3DB]">
                      <QRCodeSVG
                        value={JSON.stringify({
                          transactionId: selectedTransaction._id,
                          itemId: selectedTransaction.item?._id,
                          status: selectedTransaction.status
                        })}
                        size={180}
                        level="H"
                        includeMargin={true}
                        fgColor="#1B4332"
                      />
                    </div>
                    <p className="text-sm text-[#4A453E] mt-4 font-medium">
                      {selectedTransaction.status === 'active' 
                        ? 'Show this QR code during pickup or return'
                        : 'QR code will be active once order is accepted'
                      }
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedTransaction.status === 'requested' && selectedTransaction.lender._id === user.id && (
                  <div className="flex gap-4 pt-4 border-t border-[#E8E3DB]">
                    <button
                      onClick={() => {
                        handleAcceptOrder(selectedTransaction._id);
                        setShowTransactionModal(false);
                      }}
                      className="flex-1 py-4 bg-[#1B4332] hover:bg-[#143024] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#1B4332]/20"
                    >
                      <Icon icon="heroicons:check-circle" width="24" />
                      Accept Order
                    </button>
                    <button
                      onClick={() => {
                        handleDeclineOrder(selectedTransaction._id);
                        setShowTransactionModal(false);
                      }}
                      className="flex-1 py-4 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Icon icon="heroicons:x-circle" width="24" />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      </div>
    </BackgroundLayout>
  );
}

export default Profile;