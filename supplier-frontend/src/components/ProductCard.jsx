import { useState } from 'react';
import { toast } from 'react-hot-toast';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import ProductReviews from './ProductReviews';


// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function ProductCard({ product, onOrderPlaced }) {
  const { addToCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const totalAmount = product.price * quantity;
  
  // Dynamic image resolution using your logic
  const productImage = product.imageUrl 
    ? product.imageUrl.startsWith('http') 
      ? product.imageUrl 
      : `http://localhost:8086${product.imageUrl}` 
    : defaultImage;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleBuyNow = () => {
    setShowModal(true);
    setQuantity(1);
  };

  const handleRazorpayPayment = async () => {
    setCreatingOrder(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        setCreatingOrder(false);
        return;
      }

      // Get user details
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      let user;
      try {
        user = JSON.parse(userStr);
      } catch (err) {
        toast.error('Session error');
        setCreatingOrder(false);
        return;
      }

      // Create order in backend
      const orderResponse = await API.post('/orders', {
        productId: product.id,
        userId: user.id,
        totalAmount: totalAmount
      });

      const order = orderResponse.data;
      console.log('Order created:', order);

      // Create Razorpay order
      const razorpayOrderResponse = await API.post('/payments/create-order', {
        amount: Number(totalAmount),
        orderId: String(order.id)
      });

      console.log('Razorpay order:', razorpayOrderResponse.data);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrderResponse.data.amount,
        currency: razorpayOrderResponse.data.currency,
        name: 'MicroShop',
        description: `Order #${order.id}`,
        order_id: razorpayOrderResponse.data.id,
        handler: async (response) => {
          console.log('Payment success:', response);
          
          // Process payment in backend
          await API.post('/payments', {
            orderId: order.id,
            amount: totalAmount,
            paymentMethod: 'RAZORPAY',
            transactionId: response.razorpay_payment_id,
            remarks: `Order for ${product.name} x${quantity}`
          });

          // Update order status to PAID
          await API.put(`/orders/${order.id}/status?status=PAID`);

          toast.success(`Order placed successfully for ${product.name}!`);
          setShowModal(false);
          if (onOrderPlaced) onOrderPlaced();
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
        },
        theme: {
          color: '#4F46E5',
        },
        modal: {
          ondismiss: () => {
            setCreatingOrder(false);
            toast.error('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function(response) {
        console.error('Payment failed:', response.error);
        toast.error(response.error.description || 'Payment failed');
        setCreatingOrder(false);
      });
      
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to process payment');
    } finally {
      setCreatingOrder(false);
    }
  };

  return (
    <>
      {/* Product Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 overflow-y-auto max-h-[90vh]">
            <div className="h-64 overflow-hidden bg-slate-50 flex items-center justify-center">
              <img 
                src={productImage} 
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = defaultImage;
                }}
              />
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
              <p className="text-gray-500 mt-2">{product.description || 'No description available'}</p>
              
              <div className="mt-4 flex items-center justify-between">
                <span className="text-2xl font-bold text-indigo-600">${product.price?.toFixed(2)}</span>
                <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
                </span>
              </div>
              
              {/* Quantity Selector */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-xl font-bold disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-xl font-bold disabled:opacity-50"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500">Available: {product.stock}</span>
                </div>
              </div>
              
              {/* Price Summary */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="text-2xl font-bold text-indigo-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Product Reviews */}
              <ProductReviews productId={product.id} />
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRazorpayPayment}
                  disabled={creatingOrder}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
                >
                  {creatingOrder ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Pay Now'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group flex flex-col">
        <div className="relative h-48 overflow-hidden cursor-pointer bg-slate-50 flex items-center justify-center" onClick={handleBuyNow}>
          <img 
            src={productImage} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = defaultImage;
            }}
          />
          <button className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 truncate pr-2">{product.name}</h3>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-yellow-400">★</span>
              <span className="text-sm text-gray-600">4.5</span>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-1 line-clamp-2 flex-1">{product.description || 'No description available'}</p>
          
          <div className="mt-3 flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-indigo-600">${product.price?.toFixed(2)}</span>
              {product.oldPrice && (
                <span className="text-sm text-gray-400 line-through ml-2">${product.oldPrice}</span>
              )}
            </div>
            <span className={`text-xs px-2 py-1 rounded ${product.stock > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
              {product.stock > 0 ? `In Stock` : 'Out of stock'}
            </span>
          </div>
          
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-white border-2 border-indigo-600 text-indigo-600 py-2 rounded-lg font-medium hover:bg-indigo-50 transition disabled:opacity-50"
            >
              🛒 Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductCard;