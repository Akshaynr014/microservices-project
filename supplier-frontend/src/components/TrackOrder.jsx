import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { toast } from 'react-hot-toast';

function TrackOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = async () => {
    try {
      const response = await API.get(`/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Order not found');
      navigate('/dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    
    // Auto-refresh every 10 seconds to get latest status
    const interval = setInterval(() => {
      if (!refreshing) {
        setRefreshing(true);
        fetchOrder();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [id]);

  // Order status steps with actual status mapping
  const steps = [
    { name: 'Order Placed', key: 'PENDING', icon: '📝', description: 'Your order has been received' },
    { name: 'Confirmed', key: 'CONFIRMED', icon: '✅', description: 'Your order has been confirmed' },
    { name: 'Paid', key: 'PAID', icon: '💰', description: 'Payment has been received' },
    { name: 'Shipped', key: 'SHIPPED', icon: '🚚', description: 'Your order is on the way' },
    { name: 'Delivered', key: 'DELIVERED', icon: '🏠', description: 'Your order has been delivered' },
  ];

  const getCurrentStepIndex = () => {
    if (!order) return -1;
    const status = order.status;
    for (let i = 0; i < steps.length; i++) {
      if (steps[i].key === status) {
        return i;
      }
    }
    // If status not found, return based on order
    if (status === 'PAID') return 2;
    if (status === 'SHIPPED') return 3;
    if (status === 'DELIVERED') return 4;
    return 0;
  };

  const currentStep = getCurrentStepIndex();

  // Get estimated delivery date
  const getEstimatedDelivery = () => {
    if (!order) return 'Pending';
    const orderDate = new Date(order.createdAt || Date.now());
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(orderDate.getDate() + 5); // 5 days delivery
    return deliveryDate.toLocaleDateString();
  };

  // Get progress percentage
  const getProgressPercentage = () => {
    if (currentStep === -1) return 0;
    return ((currentStep + 1) / steps.length) * 100;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition"
          >
            ← Back to Orders
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Order Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Order #{order.id}</h1>
              <p className="text-gray-500 mt-1">
                Placed on {new Date(order.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-700' :
                order.status === 'PAID' ? 'bg-blue-100 text-blue-700' :
                order.status === 'CONFIRMED' ? 'bg-indigo-100 text-indigo-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                <span className="w-2 h-2 rounded-full animate-pulse bg-current"></span>
                {order.status || 'PENDING'}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Est. Delivery: {getEstimatedDelivery()}
              </p>
            </div>
          </div>
        </div>

        {/* Order Status Tracker - Amazon Style Progress Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Order Tracking</h2>
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((step, index) => {
              const isCompleted = index <= currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <div 
                  key={step.key}
                  className={`text-center p-3 rounded-lg transition-all ${
                    isCompleted ? 'bg-indigo-50' : 'bg-gray-50'
                  } ${isCurrent ? 'ring-2 ring-indigo-500' : ''}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-xl ${
                    isCompleted ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {isCompleted ? '✓' : step.icon}
                  </div>
                  <p className={`font-medium text-sm ${isCompleted ? 'text-indigo-600' : 'text-gray-500'}`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 hidden md:block">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Product Details */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Order Items</h2>
            <div className="flex gap-4 pb-4 border-b">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{order.productDetails?.name || 'Product'}</h3>
                <p className="text-sm text-gray-500 mt-1">Quantity: 1</p>
                <p className="text-indigo-600 font-bold mt-2">₹{order.totalAmount?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Delivery Address & Payment Summary */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Delivery Address</h2>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-medium text-gray-800">John Doe</p>
                <p>123, Main Street,</p>
                <p>Mumbai, Maharashtra - 400001</p>
                <p>Phone: +91 98765 43210</p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Payment Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{order.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span>₹{(order.totalAmount * 0.1).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-indigo-600">₹{(order.totalAmount * 1.1).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-green-600 mt-3">
                ✓ Payment already made via Razorpay
              </p>
            </div>

            {/* Need Help */}
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600">Need help with your order?</p>
              <button className="text-indigo-600 text-sm font-medium hover:underline mt-1">
                Contact Support →
              </button>
            </div>
          </div>
        </div>

        {/* Auto-refresh indicator */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Page auto-refreshes every 10 seconds for latest updates
        </p>
      </div>
    </div>
  );
}

export default TrackOrder;