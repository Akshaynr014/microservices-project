import { useState } from "react";
import API from "../services/api";
import { toast } from 'react-hot-toast';

function OrderDetails() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOrder = async () => {
    if (!orderId) {
      toast.error("Please enter an Order ID");
      return;
    }
    
    setLoading(true);
    setOrder(null);
    
    try {
      const response = await API.get(`/orders/${orderId}`);
      setOrder(response.data);
      toast.success("Order found!");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Order not found");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-5">Order Details</h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="number"
          placeholder="Enter Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
        />
        <button
          onClick={fetchOrder}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "Loading..." : "Fetch Order"}
        </button>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-500">
          Loading order details...
        </div>
      )}

      {/* Show order details with both User and Product info */}
      {order && !loading && (
        <div className="mt-4 space-y-4">
          {/* Order Information */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-lg mb-2 text-gray-700">📋 Order Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><strong>Order ID:</strong> {order.id || order.orderIdValue}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                  order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {order.status || 'PENDING'}
                </span>
              </p>
              <p><strong>Total Amount:</strong> ${order.totalAmount?.toFixed(2) || 'N/A'}</p>
              <p><strong>Product ID:</strong> {order.productId}</p>
              <p><strong>User ID:</strong> {order.userId}</p>
            </div>
          </div>

          {/* Product Details */}
          {order.productDetails && (
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-bold text-lg mb-2 text-purple-700">📦 Product Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><strong>Product ID:</strong> {order.productDetails.id}</p>
                <p><strong>Name:</strong> {order.productDetails.name}</p>
                <p><strong>Description:</strong> {order.productDetails.description || 'N/A'}</p>
                <p><strong>Price:</strong> ${order.productDetails.price?.toFixed(2)}</p>
                <p><strong>Stock:</strong> {order.productDetails.stock}</p>
              </div>
            </div>
          )}

          {/* User Details */}
          {order.userDetails && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-lg mb-2 text-blue-700">👤 User Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><strong>User ID:</strong> {order.userDetails.id}</p>
                <p><strong>Name:</strong> {order.userDetails.name}</p>
                <p><strong>Email:</strong> {order.userDetails.email}</p>
              </div>
            </div>
          )}

          {/* Show message if product details not available */}
          {!order.productDetails && order.productId && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-700 text-sm">⚠️ Product details not available. Product ID: {order.productId}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OrderDetails;