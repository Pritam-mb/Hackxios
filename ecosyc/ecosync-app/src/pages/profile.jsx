import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI, itemsAPI, transactionsAPI, aiAPI } from '../services/api';
import BackgroundLayout from '../components/BackgroundLayout';
import { Icon } from '@iconify/react';

function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [ecoInsights, setEcoInsights] = useState([]);
  const [smartBadges, setSmartBadges] = useState([]);
  const [achievementSummary, setAchievementSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

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

      // Fetch user's transactions
      const userTransactions = await transactionsAPI.getUserTransactions(user.id);
      setTransactions(userTransactions);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getLevelBadge = (level) => {
    const badges = {
      seedling: { icon: '🌱', name: 'Seedling', color: 'bg-green-500/20 text-green-400' },
      sapling: { icon: '🌿', name: 'Sapling', color: 'bg-green-600/20 text-green-500' },
      oak: { icon: '🌳', name: 'Oak Tree', color: 'bg-emerald-600/20 text-emerald-400' },
      champion: { icon: '🏆', name: 'Champion', color: 'bg-yellow-500/20 text-yellow-400' }
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

  if (!isAuthenticated) {
    return (
      <BackgroundLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Please login to view your profile</h2>
            <a href="/login" className="px-6 py-3 bg-[#2C7DA0] text-white rounded-lg hover:bg-[#1B4332]">
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2C7DA0] mx-auto mb-4"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </BackgroundLayout>
    );
  }

  const levelBadge = getLevelBadge(userProfile?.level || user?.level);

  return (
    <BackgroundLayout>
      <div className="p-8 pt-32 min-h-screen max-w-7xl mx-auto">
        
        {/* Profile Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-[#2C7DA0] to-[#1B4332] rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-[#1B4332] mb-2">{user?.name || 'User'}</h1>
              <p className="text-[#4A453E] mb-3">{user?.email}</p>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${levelBadge.color}`}>
                <span className="text-2xl">{levelBadge.icon}</span>
                <span className="font-bold">{levelBadge.name}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#2C7DA0]">{userProfile?.ecoPoints || user?.ecoPoints || 0}</div>
              <div className="text-sm text-[#4A453E]">Eco Points</div>
            </div>
          </div>
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20">
            <div className="flex items-center gap-4">
              <Icon icon="mdi:leaf" className="text-5xl text-green-600" />
              <div>
                <div className="text-3xl font-bold text-[#1B4332]">{calculateCO2Saved()} kg</div>
                <div className="text-sm text-[#4A453E]">CO₂ Saved</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
            <div className="flex items-center gap-4">
              <Icon icon="mdi:currency-usd" className="text-5xl text-blue-600" />
              <div>
                <div className="text-3xl font-bold text-[#1B4332]">₹{calculateMoneySaved()}</div>
                <div className="text-sm text-[#4A453E]">Money Saved</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center gap-4">
              <Icon icon="mdi:share-variant" className="text-5xl text-purple-600" />
              <div>
                <div className="text-3xl font-bold text-[#1B4332]">{myItems.length}</div>
                <div className="text-sm text-[#4A453E]">Items Shared</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Achievement Summary */}
        {achievementSummary && (
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-purple-500/30">
            <div className="flex items-start gap-4">
              <Icon icon="mdi:trophy" className="text-4xl text-yellow-500 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-[#1B4332] mb-2">Your Journey</h3>
                <p className="text-[#4A453E] leading-relaxed">{achievementSummary}</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Icon icon="mdi:lightbulb" className="text-3xl text-yellow-500" />
              <h2 className="text-2xl font-bold text-[#1B4332]">Recommended For You</h2>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">AI Powered</span>
            </div>
            <p className="text-sm text-[#4A453E] mb-6">Based on your rental history and interests</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <Icon 
                      icon={rec.type === 'borrow' ? 'mdi:arrow-down-circle' : 'mdi:arrow-up-circle'} 
                      className={`text-2xl ${rec.type === 'borrow' ? 'text-blue-600' : 'text-green-600'}`}
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-[#1B4332] mb-1">{rec.item}</h4>
                      <p className="text-sm text-[#4A453E]">{rec.reason}</p>
                      <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                        rec.type === 'borrow' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {rec.type === 'borrow' ? 'You might need' : 'Consider sharing'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Eco Insights */}
        {ecoInsights.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Icon icon="mdi:leaf" className="text-3xl text-green-600" />
              <h2 className="text-2xl font-bold text-[#1B4332]">Eco-Impact Tips</h2>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">AI Insights</span>
            </div>
            
            <div className="space-y-4">
              {ecoInsights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-[#1B4332] font-medium mb-1">{insight.tip}</p>
                    <p className="text-sm text-green-700">
                      <Icon icon="mdi:chart-line-variant" className="inline mr-1" />
                      Potential Impact: {insight.potential_impact}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Smart AI Badges */}
        {smartBadges.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Icon icon="mdi:star-circle" className="text-3xl text-yellow-500" />
              <h2 className="text-2xl font-bold text-[#1B4332]">AI-Generated Badges</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {smartBadges.map((badge, idx) => (
                <div key={idx} className="p-6 rounded-xl text-center bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300">
                  <div className="text-5xl mb-3">{badge.emoji}</div>
                  <h4 className="font-bold text-[#1B4332] mb-2">{badge.name}</h4>
                  <p className="text-sm text-[#4A453E]">{badge.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#1B4332] mb-6">Your Badges</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🛡️', name: 'Verified', earned: true },
              { icon: '🤝', name: 'Trusted', earned: myItems.length > 0 },
              { icon: '🔨', name: 'Tool Master', earned: myItems.length >= 3 },
              { icon: '🌱', name: 'Eco Warrior', earned: (userProfile?.ecoPoints || 0) >= 100 },
              { icon: '⭐', name: 'Top Rated', earned: transactions.length >= 5 },
              { icon: '🎯', name: 'Active', earned: transactions.length > 0 },
              { icon: '💚', name: 'Green Hero', earned: calculateCO2Saved() >= 20 },
              { icon: '🏆', name: 'Champion', earned: (userProfile?.ecoPoints || 0) >= 300 }
            ].map((badge, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl text-center transition-all ${
                  badge.earned
                    ? 'bg-gradient-to-br from-[#2C7DA0]/20 to-[#1B4332]/10 border-2 border-[#2C7DA0]'
                    : 'bg-gray-200 opacity-50 grayscale'
                }`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <div className="text-sm font-semibold text-[#1B4332]">{badge.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* My Shared Items */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#1B4332]">My Shared Items</h2>
            <a href="/list" className="px-4 py-2 bg-[#2C7DA0] text-white rounded-lg hover:bg-[#1B4332]">
              + Add Item
            </a>
          </div>
          
          {myItems.length === 0 ? (
            <p className="text-center text-[#4A453E] py-8">You haven't shared any items yet. Start sharing to earn eco points!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {myItems.map(item => (
                <div key={item._id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-[#2C7DA0]/20 to-[#1B4332]/10 flex items-center justify-center">
                      <Icon icon="mdi:package-variant" className="text-6xl text-[#2C7DA0]" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-[#1B4332] mb-2">{item.title}</h3>
                    <p className="text-sm text-[#4A453E] mb-2 line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-xs text-[#4A453E] capitalize">{item.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#1B4332] mb-6">Recent Activity</h2>
          
          {transactions.length === 0 ? (
            <p className="text-center text-[#4A453E] py-8">No transactions yet. Start borrowing or lending items!</p>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 5).map(transaction => (
                <div key={transaction._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <Icon 
                      icon={transaction.borrower._id === user.id ? 'mdi:arrow-down' : 'mdi:arrow-up'} 
                      className={`text-2xl ${transaction.borrower._id === user.id ? 'text-blue-600' : 'text-green-600'}`}
                    />
                    <div>
                      <div className="font-semibold text-[#1B4332]">{transaction.item?.title}</div>
                      <div className="text-sm text-[#4A453E]">
                        {transaction.borrower._id === user.id ? 'Borrowed from' : 'Lent to'} {' '}
                        {transaction.borrower._id === user.id ? transaction.lender?.name : transaction.borrower?.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                      transaction.status === 'active' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {transaction.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </BackgroundLayout>
  );
}

export default Profile;
