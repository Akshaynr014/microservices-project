import { useState, useEffect } from "react";
import API from "../services/api";
import { toast } from 'react-hot-toast';

function OrderForm() {
  const [formData, setFormData] = useState({
    productId: "",
    userId: ""
  });
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);  // ✅ ADD THIS
  const [totalOrders, setTotalOrders] = useState(0);

  // Fetch products for dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await API.get("/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch products", error);
        toast.error("Could not load products");
      }
    };
    fetchProducts();
  }, []);

  // ✅ ADD THIS - Fetch users for dropdown
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

  // Fetch total orders count
  useEffect(() => {
    const fetchTotalOrders = async () => {
      try {
        const response = await API.get("/orders");
        setTotalOrders(response.data.length);
      } catch (error) {
        console.error("Failed to fetch orders count", error);
      }
    };
    fetchTotalOrders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("Submitting order:", {
        productId: parseInt(formData.productId),
        userId: parseInt(formData.userId)
      });
      
      const response = await API.post("/orders", {
        productId: parseInt(formData.productId),
        userId: parseInt(formData.userId)
      });
      
      toast.success(`Order created successfully! Order ID: ${response.data.id}`);
      setFormData({ productId: "", userId: "" });
      setTotalOrders(prev => prev + 1);
    } catch (error) {
      console.error("Order creation error:", error);
      
      if (error.response?.status === 500) {
        toast.error("Product or User not found! Please select valid IDs.");
      } else {
        toast.error("Failed to create order");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-gray-800">Create Order</h2>
        <span className="text-sm bg-green-100 text-green-800 px-3 py-1.5 rounded-full font-medium">
          📦 Total Orders: {totalOrders}
        </span>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Select Product *
          </label>
          <select
            value={formData.productId}
            onChange={(e) => setFormData({...formData, productId: e.target.value})}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            disabled={loading}
          >
            <option value="">-- Select a Product --</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} - ${product.price} (Stock: {product.stock})
              </option>
            ))}
          </select>
        </div>
        
        {/* ✅ CHANGED - User Dropdown instead of text input */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Select User *
          </label>
          <select
            value={formData.userId}
            onChange={(e) => setFormData({...formData, userId: e.target.value})}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            disabled={loading}
          >
            <option value="">-- Select a User --</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} - {user.email}
              </option>
            ))}
          </select>
          {users.length === 0 && !loading && (
            <p className="text-xs text-amber-600 mt-1">
              No users available. Please create a user first.
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium disabled:opacity-50 transition duration-200"
        >
          {loading ? "⏳ Creating Order..." : "➕ Create Order"}
        </button>
      </form>
    </div>
  );
}

export default OrderForm;