import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from 'react-hot-toast';

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await API.get("/orders");
      setOrders(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await API.delete(`/orders/${id}`);
        loadOrders();
        toast.success("Order deleted successfully!");
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.error || "Failed to delete order");
      }
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="text-center py-8 text-gray-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-gray-800">
          Orders 
          <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded ml-2">
            {orders.length} total
          </span>
        </h2>
        <button
          onClick={loadOrders}
          className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="text-left p-3 font-semibold">ID</th>
              <th className="text-left p-3 font-semibold">Product Name</th>
              <th className="text-left p-3 font-semibold">Product Price</th>
              <th className="text-left p-3 font-semibold">User ID</th>
              <th className="text-left p-3 font-semibold">User Name</th>
              <th className="text-left p-3 font-semibold">Email</th>
              <th className="text-left p-3 font-semibold">Status</th>
              <th className="text-left p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-slate-50 transition">
                  <td className="p-3">{order.id}</td>
                  {/* ✅ UPDATED - Show product name from productDetails */}
                  <td className="p-3 font-medium">
                    {order.productDetails?.name || order.product || "—"}
                  </td>
                  {/* ✅ ADDED - Show product price */}
                  <td className="p-3">
                    {order.productDetails?.price ? `$${order.productDetails.price}` : "—"}
                  </td>
                  <td className="p-3">{order.userId}</td>
                  <td className="p-3">{order.userDetails?.name || "—"}</td>
                  <td className="p-3">{order.userDetails?.email || "—"}</td>
                  {/* ✅ ADDED - Show order status with badge */}
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                      order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status || 'PENDING'}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-6 text-gray-500">
                  No Orders Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrderList;