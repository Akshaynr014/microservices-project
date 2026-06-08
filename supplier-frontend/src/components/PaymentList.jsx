import React, { useEffect, useState } from "react";
 import API from "../services/api";
import { toast } from 'react-hot-toast';

function PaymentList() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedPayment, setExpandedPayment] = useState(null);
  const [expandedDetails, setExpandedDetails] = useState({}); // Store fetched details

  const loadPayments = async () => {
    setLoading(true);
    try {
      let url = "/payments";
      if (statusFilter !== "ALL") {
        url = `/payments/status/${statusFilter}`;
      }
      const response = await API.get(url);
      setPayments(response.data);
    } catch (error) {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this payment record?")) {
      try {
        await API.delete(`/payments/${id}`);
        loadPayments();
        toast.success("Payment deleted!");
      } catch (error) {
        toast.error("Failed to delete payment");
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'SUCCESS': return 'text-green-600 bg-green-50';
      case 'PENDING': return 'text-yellow-600 bg-yellow-50';
      case 'FAILED': return 'text-red-600 bg-red-50';
      case 'REFUNDED': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // ✅ Fetch order and user details when expanding
  const toggleExpand = async (paymentId, orderId) => {
    if (expandedPayment === paymentId) {
      setExpandedPayment(null);
      return;
    }
    
    setExpandedPayment(paymentId);
    
    // Fetch details if not already fetched
    if (!expandedDetails[paymentId]) {
      try {
        // Fetch order details
        const orderResponse = await API.get(`/orders/${orderId}`);
        const orderData = orderResponse.data;
        
        // Fetch user details if userId exists in order
        let userData = null;
        if (orderData.userId) {
          try {
            const userResponse = await API.get(`/users/${orderData.userId}`);
            userData = userResponse.data;
          } catch (err) {
            console.error("Failed to fetch user:", err);
          }
        }
        
        setExpandedDetails(prev => ({
          ...prev,
          [paymentId]: { order: orderData, user: userData }
        }));
      } catch (error) {
        console.error("Failed to fetch details:", error);
        toast.error("Could not fetch order details");
      }
    }
  };

  useEffect(() => {
    loadPayments();
  }, [statusFilter]);

  if (loading) {
    return (
      <div className="bg-white/60 rounded-xl p-5">
        <div className="text-center py-8 text-slate-500">Loading payments...</div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-slate-200/50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-700 flex items-center">
          <span className="mr-2">💳</span>
          Payments 
          <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded ml-2">
            {payments.length} total
          </span>
        </h2>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded-lg text-sm"
          >
            <option value="ALL">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <button onClick={loadPayments} className="bg-slate-100 px-3 py-1 rounded-lg text-sm">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Order ID</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Method</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Transaction ID</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Actions</th>
              <th className="p-2 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((payment) => {
                const details = expandedDetails[payment.id];
                return (
                  <React.Fragment key={payment.id}>
                    <tr className="border-b hover:bg-slate-50">
                      <td className="p-2">{payment.id}</td>
                      <td className="p-2">{payment.orderId}</td>
                      <td className="p-2 font-medium">${payment.amount?.toFixed(2)}</td>
                      <td className="p-2">{payment.paymentMethod}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="p-2 text-xs font-mono">{payment.transactionId}</td>
                      <td className="p-2 text-xs">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                      <td className="p-2">
                        <button
                          onClick={() => handleDelete(payment.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => toggleExpand(payment.id, payment.orderId)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                        >
                          {expandedPayment === payment.id ? "▲ Hide" : "▼ View"}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expandable row - Now fetches real data */}
                    {expandedPayment === payment.id && (
                      <tr className="bg-slate-50">
                        <td colSpan="9" className="p-4">
                          {details ? (
                            <div className="grid md:grid-cols-2 gap-4">
                              {/* Order Details */}
                              <div className="bg-white rounded-lg p-3 border">
                                <h4 className="font-bold text-sm text-blue-600 mb-2">📋 Order Details</h4>
                                <div className="space-y-1 text-xs">
                                  <p><strong>Order ID:</strong> {details.order?.id || payment.orderId}</p>
                                  <p><strong>Product ID:</strong> {details.order?.productId || 'N/A'}</p>
                                  <p><strong>User ID:</strong> {details.order?.userId || 'N/A'}</p>
                                  <p><strong>Total Amount:</strong> ${details.order?.totalAmount?.toFixed(2) || 'N/A'}</p>
                                  <p><strong>Status:</strong> 
                                    <span className={`ml-1 px-1 py-0.5 rounded text-xs ${
                                      details.order?.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                      details.order?.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-gray-100'
                                    }`}>
                                      {details.order?.status || 'N/A'}
                                    </span>
                                  </p>
                                </div>
                              </div>
                              
                              {/* User Details */}
                              <div className="bg-white rounded-lg p-3 border">
                                <h4 className="font-bold text-sm text-green-600 mb-2">👤 User Details</h4>
                                {details.user ? (
                                  <div className="space-y-1 text-xs">
                                    <p><strong>User ID:</strong> {details.user.id}</p>
                                    <p><strong>Name:</strong> {details.user.name}</p>
                                    <p><strong>Email:</strong> {details.user.email}</p>
                                  </div>
                                ) : (
                                  <p className="text-gray-400 text-xs">Loading user details...</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                              <p className="text-xs text-gray-400 mt-2">Loading order details...</p>
                            </div>
                          )}
                          
                          {/* Remarks if any */}
                          {payment.remarks && (
                            <div className="mt-3 bg-yellow-50 rounded-lg p-2">
                              <p className="text-xs text-yellow-700">
                                <strong>📝 Remarks:</strong> {payment.remarks}
                              </p>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="text-center p-6 text-slate-400">
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PaymentList;