import { useState, useEffect } from "react";
import API from "../services/api";
import { toast } from 'react-hot-toast';

function PaymentForm() {
  const [formData, setFormData] = useState({
    orderId: "",
    userId: "",  // ✅ ADDED - For user selection
    amount: "",
    paymentMethod: "CARD",
    remarks: ""
  });
  const [loading, setLoading] = useState(false);
  const [fetchingOrder, setFetchingOrder] = useState(false);
  const [orders, setOrders] = useState([]);  // ✅ ADDED - For orders dropdown
  const [users, setUsers] = useState([]);    // ✅ ADDED - For users dropdown
  const [selectedOrder, setSelectedOrder] = useState(null); // ✅ Store selected order details

  // ✅ Fetch all orders for dropdown
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await API.get("/orders");
        setOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch orders", error);
        toast.error("Could not load orders");
      }
    };
    fetchOrders();
  }, []);

  // ✅ Fetch all users for dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await API.get("/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
        toast.error("Could not load users");
      }
    };
    fetchUsers();
  }, []);

  // ✅ Handle order selection from dropdown
  const handleOrderSelect = async (orderId) => {
    setFormData(prev => ({ ...prev, orderId, userId: "", amount: "" }));
    setSelectedOrder(null);
    
    if (!orderId) return;
    
    setFetchingOrder(true);
    try {
      const response = await API.get(`/orders/${orderId}`);
      const order = response.data;
      setSelectedOrder(order);
      
      // Auto-fill amount and userId
      setFormData(prev => ({
        ...prev,
        orderId: orderId,
        userId: order.userId || "",
        amount: order.totalAmount ? order.totalAmount.toString() : ""
      }));
      
      toast.success(`Order #${orderId} selected - Amount: $${order.totalAmount}`, {
        icon: '💰',
        duration: 2000
      });
    } catch (error) {
      console.error("Order not found:", error);
      toast.error("Could not fetch order details");
    } finally {
      setFetchingOrder(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.orderId) {
      toast.error("Please select an order");
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    setLoading(true);
    
    try {
      await API.post("/payments", {
        orderId: parseInt(formData.orderId),
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        remarks: formData.remarks,
        status: "PENDING"
      });
      toast.success("Payment processed successfully!");
      setFormData({ 
        orderId: "", 
        userId: "",
        amount: "", 
        paymentMethod: "CARD", 
        remarks: "" 
      });
      setSelectedOrder(null);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-slate-200/50">
      <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center">
        <span className="mr-2">💳</span> Process Payment
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* ✅ CHANGED - Order dropdown instead of text input */}
        <div>
          <label className="block text-sm text-slate-600 mb-1">Select Order *</label>
          <select
            value={formData.orderId}
            onChange={(e) => handleOrderSelect(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
            required
            disabled={loading}
          >
            <option value="">-- Select an Order --</option>
            {orders.map(order => (
              <option key={order.id} value={order.id}>
                Order #{order.id} - ${order.totalAmount?.toFixed(2)} - {order.status || 'PENDING'}
              </option>
            ))}
          </select>
          {orders.length === 0 && !loading && (
            <p className="text-xs text-amber-600 mt-1">
              No orders available. Please create an order first.
            </p>
          )}
        </div>

        {/* ✅ ADDED - User dropdown (auto-filled from order, but can be changed) */}
        <div>
          <label className="block text-sm text-slate-600 mb-1">
            User *
            {selectedOrder && <span className="text-xs text-green-500 ml-2">(Auto-filled from order)</span>}
          </label>
          <select
            value={formData.userId}
            onChange={(e) => setFormData({...formData, userId: e.target.value})}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
            required
            disabled={loading || fetchingOrder}
          >
            <option value="">-- Select a User --</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} - {user.email}
              </option>
            ))}
          </select>
          {selectedOrder && (
            <p className="text-xs text-gray-400 mt-1">
              User ID {selectedOrder.userId} from selected order
            </p>
          )}
        </div>
        
        {/* Amount field - auto-filled */}
        <div>
          <label className="block text-sm text-slate-600 mb-1">
            Amount * 
            {fetchingOrder && <span className="text-xs text-green-500 ml-2">(Fetching...)</span>}
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 ${
              formData.amount && !fetchingOrder ? 'bg-green-50' : ''
            }`}
            required
            disabled={loading}
          />
          <p className="text-xs text-gray-400 mt-1">
            Amount is auto-filled from the selected order
          </p>
        </div>
        
        {/* Payment Method */}
        <div>
          <label className="block text-sm text-slate-600 mb-1">Payment Method *</label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
            required
            disabled={loading}
          >
            <option value="CARD">💳 Credit/Debit Card</option>
            <option value="UPI">📱 UPI</option>
            <option value="NET_BANKING">🏦 Net Banking</option>
            <option value="CASH">💵 Cash</option>
          </select>
        </div>
        
        {/* Remarks */}
        <div>
          <label className="block text-sm text-slate-600 mb-1">Remarks (Optional)</label>
          <textarea
            placeholder="Any additional notes"
            value={formData.remarks}
            onChange={(e) => setFormData({...formData, remarks: e.target.value})}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
            rows="2"
            disabled={loading}
          />
        </div>
        
        {/* Show order details preview if selected */}
        {selectedOrder && (
          <div className="bg-blue-50 rounded-lg p-3 text-sm">
            <p className="font-medium text-blue-700 mb-1">📋 Order Summary:</p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium">#{selectedOrder.id}</span>
              <span className="text-gray-600">Product:</span>
              <span className="font-medium">{selectedOrder.productDetails?.name || selectedOrder.productId}</span>
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium text-green-600">${selectedOrder.totalAmount?.toFixed(2)}</span>
              <span className="text-gray-600">Order Status:</span>
              <span className={`font-medium ${selectedOrder.status === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                {selectedOrder.status || 'PENDING'}
              </span>
            </div>
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading || fetchingOrder || !formData.orderId}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "⏳ Processing..." : "💳 Process Payment"}
        </button>
      </form>
    </div>
  );
}

export default PaymentForm;