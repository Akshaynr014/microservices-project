import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Breadcrumb from './Breadcrumb';


function Cart() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with back button */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition"
            >
              ← Back to Shopping
            </button>
          </div>
        </div>
        
        {/* Empty Cart Content */}
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-sm p-12">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added any items yet</p>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition"
            >
              🛍️ Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cartTotal;
  const tax = subtotal * 0.1;
  const shipping = 0;
  const total = subtotal + tax + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Amazon-style Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition text-sm font-medium"
            >
              ← Back to Shopping
            </button>
            <h1 className="text-xl font-bold text-gray-800">Shopping Cart</h1>
            <div className="w-24"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      {/* Main Cart Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
                <Breadcrumb />

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Cart Items Section - Amazon style */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Cart Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b text-sm font-medium text-gray-600">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {/* Cart Items */}
              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Product Image */}
                      <div className="w-28 h-28 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        <img 
                          src={item.image || `https://picsum.photos/id/${item.id}/112/112`}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-gray-800 hover:text-indigo-600">
                              <button onClick={() => navigate(`/product/${item.id}`)} className="hover:underline">
                                {item.name}
                              </button>
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-green-600 text-sm">In Stock</span>
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="text-sm text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          
                          {/* Mobile Price */}
                          <div className="md:hidden flex justify-between items-center pt-2 border-t">
                            <span className="text-gray-600">Price:</span>
                            <span className="font-semibold">${item.price.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        {/* Quantity and Total - Amazon style */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 pt-3 md:pt-0">
                          {/* Quantity Selector */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 mr-2 hidden md:inline">Quantity:</span>
                            <div className="flex items-center border rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-9 h-9 bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium transition"
                              >
                                -
                              </button>
                              <span className="w-12 text-center text-gray-700 font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-9 h-9 bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium transition"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          
                          {/* Item Total */}
                          <div className="flex items-center justify-between mt-3 md:mt-0">
                            <span className="text-gray-600 md:hidden">Total:</span>
                            <span className="text-lg font-bold text-indigo-600">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
                <button
                  onClick={clearCart}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Clear Cart
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  + Add More Items
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary - Flipkart style */}
          <div className="lg:w-96">
            <div className="bg-white rounded-xl shadow-sm sticky top-24">
              <div className="p-5 border-b">
                <h2 className="text-lg font-bold text-gray-800">Price Details</h2>
              </div>
              
              <div className="p-5 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Price ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 mt-2">
                  <div className="flex justify-between font-bold text-gray-800 text-lg">
                    <span>Total Amount</span>
                    <span className="text-indigo-600">${total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-green-600 mt-2">You'll save ${(subtotal * 0.15).toFixed(2)} on this order</p>
                </div>
              </div>
              
              <div className="p-5 border-t">
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition"
                >
                  Proceed to Checkout →
                </button>
                <p className="text-xs text-gray-400 text-center mt-3">
                  Secure payment • Easy returns • 24/7 support
                </p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-white rounded-xl shadow-sm p-4 mt-4">
              <div className="flex items-center justify-around text-center">
                <div>
                  <div className="text-xl mb-1">🔒</div>
                  <p className="text-xs text-gray-500">Secure<br/>Payment</p>
                </div>
                <div>
                  <div className="text-xl mb-1">🚚</div>
                  <p className="text-xs text-gray-500">Free<br/>Delivery</p>
                </div>
                <div>
                  <div className="text-xl mb-1">↺</div>
                  <p className="text-xs text-gray-500">7 Days<br/>Return</p>
                </div>
                <div>
                  <div className="text-xl mb-1">⭐</div>
                  <p className="text-xs text-gray-500">Trusted<br/>by 10k+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;