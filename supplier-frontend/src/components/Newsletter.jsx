import { useState } from 'react';
import { toast } from 'react-hot-toast';
import API from '../services/api';
import { motion } from 'framer-motion';

function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    
    setLoading(true);
    
    try {
      await API.post('/newsletter/subscribe', { email });
      toast.success('Successfully subscribed to newsletter!');
      setSubscribed(true);
      setEmail('');
      
      // Reset after 5 seconds
      setTimeout(() => setSubscribed(false), 5000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Subscription failed';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
            <span className="text-2xl">📧</span>
            <h3 className="text-lg font-bold">Subscribe to Newsletter</h3>
          </div>
          <p className="text-indigo-100 text-sm">
            Get the latest updates on new products and exclusive offers!
          </p>
        </div>
        
        <form onSubmit={handleSubscribe} className="flex-1 flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-2 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
            disabled={loading || subscribed}
          />
          <button
            type="submit"
            disabled={loading || subscribed}
            className="px-6 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition disabled:opacity-50"
          >
            {loading ? 'Subscribing...' : subscribed ? 'Subscribed! ✓' : 'Subscribe'}
          </button>
        </form>
      </div>
      
      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-indigo-200">
        <span className="flex items-center gap-1">🔒 No spam</span>
        <span className="flex items-center gap-1">📧 Unsubscribe anytime</span>
        <span className="flex items-center gap-1">🎁 10% off on first order</span>
      </div>
    </motion.div>
  );
}

export default Newsletter;