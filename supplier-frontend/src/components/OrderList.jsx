import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  PAID:      { label: 'Paid',      bg: 'bg-green-50',   text: 'text-green-700',  dot: 'bg-green-500',  icon: '✓' },
  CONFIRMED: { label: 'Confirmed', bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-500',   icon: '✓' },
  SHIPPED:   { label: 'Shipped',   bg: 'bg-purple-50',  text: 'text-purple-700', dot: 'bg-purple-500', icon: '🚚' },
  DELIVERED: { label: 'Delivered', bg: 'bg-emerald-50', text: 'text-emerald-700',dot: 'bg-emerald-500',icon: '📦' },
  PENDING:   { label: 'Pending',   bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-400',  icon: '⏳' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-red-50',     text: 'text-red-600',    dot: 'bg-red-400',    icon: '✕' },
};

const PRODUCT_ICONS = {
  default: '📦',
  phone: '📱', mobile: '📱', samsung: '📱', iphone: '📱', redmi: '📱', oneplus: '📱',
  laptop: '💻', hp: '💻', dell: '💻', lenovo: '💻', macbook: '💻',
  headphone: '🎧', earphone: '🎧', sony: '🎧', boat: '🎧',
  shirt: '👕', jeans: '👖', shoe: '👟', watch: '⌚',
  tv: '📺', led: '📺', refrigerator: '🧊', washing: '🫧',
  book: '📚', camera: '📷',
};

function getProductIcon(name = '') {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(PRODUCT_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return PRODUCT_ICONS.default;
}

const formatPrice = (amount) => {
  if (!amount) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// ✅ Custom Cancel Confirmation Modal
function CancelModal({ order, onConfirm, onClose }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Cancel Order?</h3>
          <p className="text-gray-500 text-sm mt-1">
            Are you sure you want to cancel Order #{order.id} for "{order.productDetails?.name}"?
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Amount:</span>
            <span className="font-bold text-indigo-600">{formatPrice(order.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">Status:</span>
            <span className="text-amber-600">PENDING</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-400 text-center mb-4">
          This action cannot be undone. The order will be cancelled permanently.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Keep Order
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition"
          >
            Yes, Cancel Order
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, onTrack, onCancelClick }) {
  const status   = order.status || 'PENDING';
  const cfg      = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const icon     = getProductIcon(order.productDetails?.name);
  const date     = new Date(order.createdAt || Date.now());
  const dateStr  = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="group border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 flex items-center justify-center text-2xl shrink-0">
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-slate-800">
              {order.productDetails?.name || 'Product'}
            </span>
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
              {cfg.label}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-400 mb-2">
            <span>Order <span className="font-mono text-slate-500">#{order.id}</span></span>
            <span>Qty: 1</span>
            <span>{dateStr}</span>
          </div>
        </div>

        <div className="text-right shrink-0 flex flex-col items-end gap-2">
          <p className="text-lg font-bold text-indigo-600">
            {formatPrice(order.totalAmount)}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onTrack(order.id)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              Track order →
            </button>
            {status === 'PENDING' && (
              <button
                onClick={() => onCancelClick(order)}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [cancelOrder, setCancelOrder] = useState(null);
  const navigate = useNavigate();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user?.id) { setOrders([]); return; }
      const res = await API.get(`/orders/user/${user.id}`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelOrder) return;
    
    try {
      await API.put(`/orders/${cancelOrder.id}/cancel`);
      toast.success('Order cancelled successfully');
      setCancelOrder(null);
      loadOrders();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const FILTERS = ['ALL', 'PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  const visible = filter === 'ALL' ? orders : orders.filter(o => (o.status || 'PENDING') === filter);

  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const deliveredCount = orders.filter(o => o.status === 'DELIVERED').length;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* ✅ Custom Cancel Modal */}
      <CancelModal 
        order={cancelOrder}
        onConfirm={handleCancel}
        onClose={() => setCancelOrder(null)}
      />

      <div className="space-y-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200 ${
                  filter === f
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'ALL' ? `All (${orders.length})` : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <button
            onClick={loadOrders}
            className="text-xs text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Summary Stats */}
        {orders.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl px-4 py-3 border border-slate-100">
              <p className="text-xs text-slate-400 mb-0.5">Total Orders</p>
              <p className="text-xl font-bold text-slate-800">{orders.length}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl px-4 py-3 border border-indigo-100">
              <p className="text-xs text-slate-400 mb-0.5">Total Spent</p>
              <p className="text-xl font-bold text-indigo-600">{formatPrice(totalSpent)}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl px-4 py-3 border border-emerald-100">
              <p className="text-xs text-slate-400 mb-0.5">Delivered</p>
              <p className="text-xl font-bold text-emerald-600">{deliveredCount}</p>
            </div>
          </div>
        )}

        {/* Order cards */}
        {visible.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <div className="text-5xl mb-4">🛒</div>
            <p className="text-sm font-medium text-slate-500">
              {filter === 'ALL' ? "You haven't placed any orders yet." : `No ${filter.toLowerCase()} orders.`}
            </p>
            {filter === 'ALL' && (
              <p className="text-xs text-slate-400 mt-1">Go to Products tab to start shopping!</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onTrack={id => navigate(`/track-order/${id}`)}
                onCancelClick={setCancelOrder}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default OrderList;