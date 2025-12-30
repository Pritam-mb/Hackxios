import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Icon } from '@iconify/react';
import { itemsAPI, transactionsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BackgroundLayout from '../components/BackgroundLayout';

const OrderItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderStep, setOrderStep] = useState('details'); // details, confirm, qr
  const [transaction, setTransaction] = useState(null);
  const [orderData, setOrderData] = useState({
    startDate: '',
    endDate: '',
    duration: 1,
    totalPrice: 0,
    paymentMethod: 'ecopoints' // 'ecopoints' or 'cash'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchItem();
  }, [id, isAuthenticated]);

  const fetchItem = async () => {
    try {
      const data = await itemsAPI.getById(id);
      setItem(data);
      setOrderData(prev => ({
        ...prev,
        totalPrice: data.type === 'rent' ? data.price : 0
      }));
    } catch (error) {
      console.error('Error fetching item:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = () => {
    if (orderData.startDate && orderData.endDate) {
      const start = new Date(orderData.startDate);
      const end = new Date(orderData.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const duration = days > 0 ? days : 1;
      const cashPrice = item.type === 'rent' ? duration * item.price : 0;
      const ecoPointsPrice = Math.ceil(cashPrice * 0.5); // 50% discount with eco points
      
      setOrderData(prev => ({
        ...prev,
        duration,
        totalPrice: cashPrice,
        ecoPointsPrice
      }));
    }
  };

  useEffect(() => {
    if (orderData.startDate && orderData.endDate) {
      calculateDuration();
    }
  }, [orderData.startDate, orderData.endDate]);

  const handleConfirmOrder = async () => {
    try {
      // Check if user has enough eco points
      if (orderData.paymentMethod === 'ecopoints' && user.ecoPoints < orderData.ecoPointsPrice) {
        alert(`Insufficient Eco Points! You need ${orderData.ecoPointsPrice} points but only have ${user.ecoPoints}.`);
        return;
      }

      const transactionData = {
        item: item._id,
        lender: item.owner._id,
        pickupTime: new Date(orderData.startDate),
        returnTime: new Date(orderData.endDate),
        status: 'requested',
        ecoImpactMoney: orderData.paymentMethod === 'ecopoints' ? 0 : orderData.totalPrice,
        paymentMethod: orderData.paymentMethod,
        ecoPointsUsed: orderData.paymentMethod === 'ecopoints' ? orderData.ecoPointsPrice : 0
      };

      const response = await transactionsAPI.create(transactionData);
      
      // Deduct eco points if used
      if (orderData.paymentMethod === 'ecopoints') {
        await usersAPI.updatePoints(user.id, -orderData.ecoPointsPrice);
      }
      
      setTransaction(response.transaction);
      setOrderStep('qr');
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  if (loading) {
    return (
      <BackgroundLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1B4332]"></div>
        </div>
      </BackgroundLayout>
    );
  }

  if (!item) {
    return (
      <BackgroundLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#1B4332] mb-4">Item not found</h2>
            <button onClick={() => navigate('/items')} className="px-6 py-3 bg-[#1B4332] text-white rounded-lg">
              Back to Browse
            </button>
          </div>
        </div>
      </BackgroundLayout>
    );
  }

  return (
    <BackgroundLayout>
      <div className="pt-32 pb-12 px-6 max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            {['Details', 'Confirm', 'QR Code'].map((step, idx) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center gap-2 ${
                  (orderStep === 'details' && idx === 0) ||
                  (orderStep === 'confirm' && idx === 1) ||
                  (orderStep === 'qr' && idx === 2)
                    ? 'text-[#1B4332]'
                    : 'text-[#4A453E]/40'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    (orderStep === 'details' && idx === 0) ||
                    (orderStep === 'confirm' && idx === 1) ||
                    (orderStep === 'qr' && idx === 2)
                      ? 'bg-[#1B4332] text-white'
                      : 'bg-[#E8E3DB] text-[#4A453E]/60'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="font-semibold hidden sm:inline">{step}</span>
                </div>
                {idx < 2 && (
                  <Icon icon="heroicons:chevron-right" className="mx-2 text-[#4A453E]/40" width="20" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Order Details */}
        {orderStep === 'details' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#E8E3DB]">
            <h2 className="text-3xl font-bold text-[#1B4332] mb-6">Order Details</h2>
            
            {/* Item Summary */}
            <div className="flex gap-6 mb-8 pb-8 border-b border-[#E8E3DB]">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title} className="w-32 h-32 object-cover rounded-xl" />
              ) : (
                <div className="w-32 h-32 bg-[#F5F1EA] rounded-xl flex items-center justify-center text-4xl">
                  📦
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-[#1B4332] mb-2">{item.title}</h3>
                <p className="text-[#4A453E]/70 mb-3">{item.description}</p>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[#4A453E]/60">Owner: {item.owner?.name}</span>
                  <span className="text-sm px-3 py-1 bg-[#B7E4C7]/30 text-[#1B4332] rounded-full font-semibold">
                    {item.type === 'rent' ? `₹${item.price}/day` : 'Free'}
                  </span>
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#1B4332] mb-2">Start Date</label>
                <input
                  type="date"
                  value={orderData.startDate}
                  onChange={(e) => setOrderData({ ...orderData, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E8E3DB] rounded-xl focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1B4332] mb-2">End Date</label>
                <input
                  type="date"
                  value={orderData.endDate}
                  onChange={(e) => setOrderData({ ...orderData, endDate: e.target.value })}
                  min={orderData.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E8E3DB] rounded-xl focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              {/* Price Summary */}
              <div className="bg-[#FAF8F5] rounded-xl p-6 border border-[#E8E3DB]">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[#4A453E]">Duration</span>
                  <span className="font-bold text-[#1B4332]">{orderData.duration} day(s)</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[#4A453E]">Price per day</span>
                  <span className="font-bold text-[#1B4332]">
                    {item.type === 'rent' ? `₹${item.price}` : 'Free'}
                  </span>
                </div>
                
                {item.type === 'rent' && orderData.totalPrice > 0 && (
                  <>
                    <div className="border-t border-[#E8E3DB] pt-3 mt-3 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[#4A453E]">Cash Payment</span>
                        <span className="font-bold text-[#1B4332]">₹{orderData.totalPrice}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#4A453E] flex items-center gap-1">
                          <Icon icon="mdi:leaf" className="text-green-600" />
                          Eco Points (50% off)
                        </span>
                        <span className="font-bold text-green-600">{orderData.ecoPointsPrice} points</span>
                      </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-[#1B4332] mb-3">Payment Method</label>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setOrderData({ ...orderData, paymentMethod: 'ecopoints' })}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            orderData.paymentMethod === 'ecopoints'
                              ? 'border-green-500 bg-green-50'
                              : 'border-[#E8E3DB] bg-white hover:border-green-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon icon="mdi:leaf" className="text-2xl text-green-600" />
                              <div>
                                <p className="font-bold text-[#1B4332]">Eco Points</p>
                                <p className="text-xs text-[#4A453E]">
                                  You have {user?.ecoPoints || 0} points
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">{orderData.ecoPointsPrice} pts</p>
                              <p className="text-xs text-green-600">50% off!</p>
                            </div>
                          </div>
                          {user?.ecoPoints < orderData.ecoPointsPrice && (
                            <p className="text-xs text-red-600 mt-2">
                              ⚠️ Insufficient points. Need {orderData.ecoPointsPrice - user?.ecoPoints} more.
                            </p>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setOrderData({ ...orderData, paymentMethod: 'cash' })}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            orderData.paymentMethod === 'cash'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-[#E8E3DB] bg-white hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon icon="mdi:currency-inr" className="text-2xl text-blue-600" />
                              <div>
                                <p className="font-bold text-[#1B4332]">Cash Payment</p>
                                <p className="text-xs text-[#4A453E]">Pay with money</p>
                              </div>
                            </div>
                            <p className="font-bold text-blue-600">₹{orderData.totalPrice}</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div className="border-t border-[#E8E3DB] pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-[#1B4332]">Total</span>
                    <span className="text-2xl font-bold text-[#1B4332]">
                      {item.type === 'rent' 
                        ? orderData.paymentMethod === 'ecopoints'
                          ? `${orderData.ecoPointsPrice} pts`
                          : `₹${orderData.totalPrice}`
                        : 'Free'
                      }
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setOrderStep('confirm')}
                disabled={!orderData.startDate || !orderData.endDate}
                className="w-full py-4 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Confirmation
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Confirmation */}
        {orderStep === 'confirm' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#E8E3DB]">
            <h2 className="text-3xl font-bold text-[#1B4332] mb-6">Confirm Your Order</h2>
            
            <div className="space-y-6 mb-8">
              <div className="flex justify-between py-3 border-b border-[#E8E3DB]">
                <span className="text-[#4A453E]">Item</span>
                <span className="font-bold text-[#1B4332]">{item.title}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-[#E8E3DB]">
                <span className="text-[#4A453E]">Owner</span>
                <span className="font-bold text-[#1B4332]">{item.owner?.name}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-[#E8E3DB]">
                <span className="text-[#4A453E]">Start Date</span>
                <span className="font-bold text-[#1B4332]">{new Date(orderData.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-[#E8E3DB]">
                <span className="text-[#4A453E]">End Date</span>
                <span className="font-bold text-[#1B4332]">{new Date(orderData.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-[#E8E3DB]">
                <span className="text-[#4A453E]">Duration</span>
                <span className="font-bold text-[#1B4332]">{orderData.duration} day(s)</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-lg font-bold text-[#1B4332]">Total Amount</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[#1B4332]">
                    {item.type === 'rent' 
                      ? orderData.paymentMethod === 'ecopoints'
                        ? `${orderData.ecoPointsPrice} pts`
                        : `₹${orderData.totalPrice}`
                      : 'Free'
                    }
                  </span>
                  {item.type === 'rent' && orderData.paymentMethod === 'ecopoints' && (
                    <p className="text-xs text-green-600 mt-1">
                      <Icon icon="mdi:leaf" className="inline" /> Eco Points (50% off)
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setOrderStep('details')}
                className="flex-1 py-4 bg-white border-2 border-[#E8E3DB] hover:border-[#1B4332] text-[#1B4332] font-bold rounded-xl transition-all"
              >
                Back
              </button>
              <button
                onClick={handleConfirmOrder}
                className="flex-1 py-4 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold rounded-xl transition-all"
              >
                Confirm Order
              </button>
            </div>
          </div>
        )}

        {/* Step 3: QR Code */}
        {orderStep === 'qr' && transaction && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#E8E3DB] text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon icon="heroicons:check-circle" className="text-green-600" width="48" />
            </div>
            
            <h2 className="text-3xl font-bold text-[#1B4332] mb-3">Order Confirmed!</h2>
            <p className="text-[#4A453E]/70 mb-8">Show this QR code when picking up or returning the item</p>

            {/* QR Code */}
            <div className="bg-white p-8 rounded-2xl inline-block mb-8 shadow-lg">
              <QRCodeSVG
                value={JSON.stringify({
                  transactionId: transaction._id,
                  itemId: item._id,
                  borrower: user.name,
                  lender: item.owner?.name,
                  startDate: orderData.startDate,
                  endDate: orderData.endDate
                })}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="bg-[#FAF8F5] rounded-xl p-6 mb-8 text-left">
              <h3 className="font-bold text-[#1B4332] mb-4">Transaction Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#4A453E]">Transaction ID:</span>
                  <span className="font-mono text-[#1B4332]">{transaction._id?.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4A453E]">Status:</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                    Pending Pickup
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/profile')}
                className="flex-1 py-4 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold rounded-xl transition-all"
              >
                View My Orders
              </button>
              <button
                onClick={() => navigate('/items')}
                className="flex-1 py-4 bg-white border-2 border-[#E8E3DB] hover:border-[#1B4332] text-[#1B4332] font-bold rounded-xl transition-all"
              >
                Browse More
              </button>
            </div>
          </div>
        )}
      </div>
    </BackgroundLayout>
  );
};

export default OrderItem;
