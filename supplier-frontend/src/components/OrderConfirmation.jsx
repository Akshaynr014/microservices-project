import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import API from '../services/api';
import Breadcrumb from './Breadcrumb';

function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      toast.error('Invalid order ID');
      navigate('/orders');
    }
  }, [orderId]);

  useEffect(() => {
    // Auto redirect to orders page after 5 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const fetchOrderDetails = async () => {
    try {
      console.log('Fetching order details for ID:', orderId);
      const response = await API.get(`/orders/${orderId}`);
      console.log('Order details:', response.data);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto px-4 py-8"
    >
      <Breadcrumb />

      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Order Confirmed!</h1>
        <p className="text-gray-500 mt-2">Thank you for your purchase</p>
      </motion.div>

      {/* Order Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        {/* Order Header */}
        <div className="bg-indigo-50 px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-indigo-600">Order ID</p>
              <p className="text-lg font-bold text-gray-800">#{order?.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-indigo-600">Order Date</p>
              <p className="text-gray-600">{new Date(order?.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">{order?.productDetails?.name || 'Product'}</h4>
              <p className="text-sm text-gray-500">Quantity: 1</p>
              <p className="text-indigo-600 font-bold mt-1">₹{order?.totalAmount?.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-800 mb-3">Payment Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>₹{order?.totalAmount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tax (10%)</span>
              <span>₹{((order?.totalAmount || 0) * 0.1).toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-bold">Total Paid</span>
              <span className="font-bold text-indigo-600">₹{((order?.totalAmount || 0) * 1.1).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="px-6 py-4">
          <h3 className="font-semibold text-gray-800 mb-4">Order Status</h3>
          <div className="flex justify-between">
            {['Order Placed', 'Confirmed', 'Shipped', 'Delivered'].map((step, index) => (
              <div key={step} className="text-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  index === 0 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {index === 0 ? '✓' : index + 1}
                </div>
                <p className={`text-xs ${index === 0 ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex gap-4 mt-6"
      >
        <button
          onClick={() => navigate('/orders')}
          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          View My Orders
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex-1 border border-indigo-600 text-indigo-600 py-2 rounded-lg font-medium hover:bg-indigo-50 transition"
        >
          Continue Shopping
        </button>
      </motion.div>

      {/* Auto redirect message */}
      <p className="text-center text-gray-400 text-sm mt-6">
        Redirecting to orders page in {countdown} seconds...
      </p>
    </motion.div>
  );
}

export default OrderConfirmation;