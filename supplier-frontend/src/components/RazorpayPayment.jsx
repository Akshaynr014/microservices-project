import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import API from '../services/api';

function RazorpayPayment({ amount, createOrder, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        setLoading(false);
        return;
      }

      // First create the order to get orderId
      const orderId = await createOrder();
      
      if (!orderId) {
        toast.error('Failed to create order');
        setLoading(false);
        return;
      }

      console.log('Creating Razorpay order for amount:', amount);
      console.log('Order ID:', orderId);

      // Create Razorpay order on backend
      const orderResponse = await API.post('/payments/create-order', {
        amount: Number(amount),
        orderId: String(orderId)
      });
      
      console.log('Razorpay order response:', orderResponse.data);

      // ✅ CRITICAL: Use 'order_id' (with underscore) not 'orderId'
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: 'MicroShop',
        description: `Order #${orderId}`,
        order_id: orderResponse.data.id,  // ✅ MUST be 'order_id', not 'orderId'
        handler: function(response) {
          console.log('Payment success:', response);
          toast.success('Payment successful!');
          if (onSuccess) onSuccess(response);
        },
        prefill: {
          name: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : '',
          email: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : '',
        },
        theme: {
          color: '#4F46E5',
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast.error('Payment cancelled');
            if (onError) onError('Payment cancelled');
          }
        }
      };

      console.log('Razorpay options:', options);

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function(response) {
        console.error('Payment failed:', response.error);
        toast.error(response.error.description || 'Payment failed');
        setLoading(false);
        if (onError) onError(response.error);
      });
      
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to initiate payment');
      if (onError) onError(error);
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handlePayment}
      disabled={loading}
      className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : (
        '💳 Pay with Razorpay'
      )}
    </motion.button>
  );
}

export default RazorpayPayment;