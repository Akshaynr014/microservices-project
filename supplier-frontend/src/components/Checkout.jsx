import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';
import Breadcrumb from './Breadcrumb';
import RazorpayPayment from './RazorpayPayment';

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const [showProcessing, setShowProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [orderIds, setOrderIds] = useState([]);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null); // ✅ Add this
  
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (cartItems.length === 0 && !isProcessingOrder) {
      navigate('/cart');
    }
  }, [cartItems.length, navigate, isProcessingOrder]);

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const createOrders = async () => {
    setIsProcessingOrder(true);
    setShowProcessing(true);

    try {
      const createdOrders = [];
      
      for (const item of cartItems) {
        const orderResponse = await API.post('/orders', {
          productId: item.id,
          userId: user.id,
          totalAmount: item.price * item.quantity
        });
        createdOrders.push(orderResponse.data);
      }
      
      const orderIdList = createdOrders.map(o => o.id);
      setOrderIds(orderIdList);
      setCreatedOrderId(orderIdList[0]); // ✅ Store the first order ID
      console.log('Orders created:', orderIdList);
      return orderIdList[0]; // Return first order ID for payment
      
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('Failed to create order');
      setShowProcessing(false);
      throw error;
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const handlePaymentSuccess = async (paymentResponse) => {
  console.log('Payment success, orderIds:', orderIds);
  console.log('Created order ID:', createdOrderId);
  
  setShowProcessing(false);
  setShowSuccess(true);
  
  // Use createdOrderId or orderIds[0]
  const orderIdToUse = createdOrderId || (orderIds.length > 0 ? orderIds[0] : null);
  
  if (orderIdToUse) {
    try {
      await API.put(`/orders/${orderIdToUse}/status?status=PAID`);
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  }
  
  clearCart();
  
  setTimeout(() => {
    setShowSuccess(false);
    // ✅ Redirect to Orders page (My Orders)
    navigate('/orders');
  }, 1500);
};

  const handlePaymentFailure = () => {
    setShowProcessing(false);
    setShowFailed(true);
    setLoading(false);
  };

 const handlePlaceOrder = async () => {
  if (!address.fullName || !address.phone || !address.addressLine || !address.city || !address.state || !address.pincode) {
    toast.error('Please fill all address fields');
    return;
  }

  if (paymentMethod === 'COD') {
    setLoading(true);
    try {
      await createOrders();
      clearCart();
      toast.success('Order placed successfully! (Cash on Delivery)');
      navigate('/orders'); // ✅ Redirect to Orders page
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  }
};

  const taxAmount = cartTotal * 0.1;
  const grandTotal = cartTotal + taxAmount;

  if (cartItems.length === 0 && !isProcessingOrder) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {showProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center"
            >
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Creating Order</h3>
              <p className="text-gray-500">Please wait...</p>
            </motion.div>
          </motion.div>
        )}
        
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 bg-green-500/90 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="text-center text-white">
              <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              <h2 className="text-3xl font-bold">Payment Successful!</h2>
              <p className="mt-2">Your order has been placed successfully</p>
            </div>
          </motion.div>
        )}
        
        {showFailed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 bg-red-500/90 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="text-center text-white">
              <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <h2 className="text-3xl font-bold">Payment Failed!</h2>
              <p className="mt-2 mb-4">Please try again</p>
              <button
                onClick={() => setShowFailed(false)}
                className="bg-white text-red-500 px-6 py-2 rounded-lg font-medium"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumb />

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Address Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">📦 Delivery Address</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={address.fullName}
                    onChange={handleAddressChange}
                    className="w-full p-2 border rounded-lg"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={address.phone}
                    onChange={handleAddressChange}
                    className="w-full p-2 border rounded-lg"
                    placeholder="9876543210"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line *</label>
                  <textarea
                    name="addressLine"
                    value={address.addressLine}
                    onChange={handleAddressChange}
                    rows="2"
                    className="w-full p-2 border rounded-lg"
                    placeholder="House No, Street, Area"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Maharashtra"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={address.pincode}
                    onChange={handleAddressChange}
                    className="w-full p-2 border rounded-lg"
                    placeholder="400001"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">💳 Payment Method</h2>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="RAZORPAY"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="flex-1">💳 Razorpay (Card/UPI/NetBanking)</span>
                </label>
                
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="flex-1">💵 Cash on Delivery</span>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%)</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-indigo-600">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
              
              {paymentMethod === 'RAZORPAY' ? (
                <RazorpayPayment 
                  amount={grandTotal}
                  createOrder={createOrders}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentFailure}
                />
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? 'Placing Order...' : 'Place Order (COD)'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Checkout;