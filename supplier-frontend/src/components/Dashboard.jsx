import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';
import ProductCatalog from "./ProductCatalog";
import OrderList from "./OrderList";
import PaymentList from "./PaymentList";
import Breadcrumb from './Breadcrumb';
import CartIcon from './CartIcon';
import Newsletter from './Newsletter';
import API from "../services/api";

const authService = {
  isAuthenticated: () => !!localStorage.getItem('token'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

const WEEKLY_DATA = [
  { day: 'Mon', orders: 55, peak: false },
  { day: 'Tue', orders: 72, peak: false },
  { day: 'Wed', orders: 90, peak: true },
  { day: 'Thu', orders: 61, peak: false },
  { day: 'Fri', orders: 48, peak: false },
  { day: 'Sat', orders: 80, peak: false },
  { day: 'Sun', orders: 68, peak: true },
];

const ACTIVITIES = [
  { color: 'blue',  text: 'New order #4821 placed by Priya S.', time: '2 min ago' },
  { color: 'green', text: 'Payment $2,499 confirmed',           time: '9 min ago' },
  { color: 'amber', text: 'Order #4817 shipped via BlueDart',   time: '25 min ago' },
  { color: 'coral', text: 'Refund $799 raised for #4802',       time: '1 hr ago' },
  { color: 'blue',  text: '3 new users registered today',       time: '2 hr ago' },
];

const ACTIVITY_COLORS = {
  blue:  'bg-blue-400',
  green: 'bg-green-500',
  amber: 'bg-amber-400',
  coral: 'bg-orange-400',
};

const CATEGORY_OPTIONS = [
  { value: 'Electronics',   label: '📱 Electronics' },
  { value: 'Fashion-Men',   label: '👔 Men\'s Fashion' },
  { value: 'Fashion-Women', label: '👗 Women\'s Fashion' },
  { value: 'Food',          label: '🍕 Food & Grocery' },
  { value: 'Beauty',        label: '💄 Beauty' },
  { value: 'Home',          label: '🏠 Home & Kitchen' },
  { value: 'Accessories',   label: '⌚ Accessories' },
  { value: 'Sports',        label: '⚽ Sports' },
  { value: 'Books',         label: '📚 Books' },
];

// ── Moved OUTSIDE all other components so it never remounts on state change ──
function ModalWrapper({ children }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

// ── Sidebar nav items ─────────────────────────────────────────────────────────
const getNavSections = (isAdmin) => {
  const sections = [
    {
      heading: 'Main',
      items: [
        { key: 'overview',  icon: '🏠', label: 'Overview'  },
        { key: 'products',  icon: '🛍️', label: 'Products'  },
        { key: 'orders',    icon: '🛒', label: 'My Orders' },
        { key: 'payments',  icon: '💳', label: 'Payments'  },
      ],
    },
  ];
  if (isAdmin) {
    sections.push({
      heading: 'Admin Panel',
      items: [
        { key: 'admin-products',  icon: '📦', label: 'Manage Products' },
        { key: 'admin-orders',    icon: '🚚', label: 'Manage Orders'   },
        { key: 'admin-users',     icon: '👥', label: 'Manage Users'    },
        { key: 'admin-inventory', icon: '📊', label: 'Inventory'       },
      ],
    });
  }
  sections.push({
    heading: 'Support',
    items: [
      { key: 'helpdesk', icon: '🎧', label: 'Help Desk' },
      { key: 'settings', icon: '⚙️', label: 'Settings'  },
    ],
  });
  return sections;
};

// ── Reusable components ───────────────────────────────────────────────────────
function StatCard({ icon, label, value, trend, trendUp, bgColor, iconColor, loading }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/70 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bgColor}`}>
          <span className={`text-lg ${iconColor}`}>{icon}</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${trendUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </span>
      </div>
      <p className="text-2xl font-semibold text-slate-800">{loading ? '...' : value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

function ComingSoon({ icon, label }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
      <span className="text-5xl">{icon}</span>
      <p className="text-base font-medium text-slate-500">{label}</p>
      <p className="text-sm">This section is coming soon.</p>
    </div>
  );
}

function CategorySelect({ value, onChange }) {
  return (
    <select value={value} onChange={onChange} className="w-full p-2 border border-slate-200 rounded-lg mb-4 text-sm">
      <option value="">-- Select Category --</option>
      {CATEGORY_OPTIONS.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ── Image Upload Field (shared between Add and Edit) ──────────────────────────
function ImageUploadField({ imageUrl, onUpload, onRemove }) {
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await API.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onUpload(res.data.url);
      toast.success('Image uploaded');
    } catch (err) {
      console.error('Upload error:', err.response?.status, err.response?.data);
      toast.error('Image upload failed');
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-slate-600 mb-1">Product Image</label>
      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-[#2874f0] hover:bg-blue-50 transition-colors">
        <span className="text-2xl mb-1">📷</span>
        <span className="text-xs text-slate-500">Click to upload image</span>
        <span className="text-xs text-slate-400 mt-0.5">PNG, JPG up to 5MB</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
      {imageUrl && (
        <div className="relative mt-2">
          <img
            src={`http://localhost:8086${imageUrl}`}
            alt="Preview"
            className="w-full h-32 object-cover rounded-lg border border-slate-200"
          />
          <button
            onClick={onRemove}
            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
          >✕</button>
        </div>
      )}
    </div>
  );
}

// ── Admin: Products ───────────────────────────────────────────────────────────
function AdminProducts() {
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct]     = useState({
    name: '', description: '', price: '', stock: '', category: '', imageUrl: ''
  });

  const fetchProducts = async () => {
    try {
      const res = await API.get('/products');
      setProducts(res.data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleAdd = async () => {
    try {
      await API.post('/products', {
        name:        newProduct.name,
        description: newProduct.description,
        price:       parseFloat(newProduct.price),
        stock:       parseInt(newProduct.stock),
        category:    newProduct.category,
        imageUrl:    newProduct.imageUrl,
      });
      toast.success('Product added');
      setShowAddModal(false);
      setNewProduct({ name: '', description: '', price: '', stock: '', category: '', imageUrl: '' });
      fetchProducts();
    } catch (err) {
      console.error('POST /products error:', err.response?.status, err.response?.data);
      toast.error('Failed to add product');
    }
  };

  const handleUpdate = async () => {
    try {
      await API.put(`/products/${editingProduct.id}`, {
        name:        editingProduct.name,
        description: editingProduct.description,
        price:       parseFloat(editingProduct.price),
        stock:       parseInt(editingProduct.stock),
        category:    editingProduct.category,
        imageUrl:    editingProduct.imageUrl,
      });
      toast.success('Product updated');
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error('PUT /products error:', err.response?.status, err.response?.data);
      toast.error('Failed to update product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  if (loading) return <div className="text-center py-8 text-slate-500">Loading products...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-slate-800">📦 Manage Products</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#2874f0] hover:bg-[#1a5dc8] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Add Product
        </button>
      </div>

      {/* ── Add Modal ── */}
      {showAddModal && (
        <ModalWrapper>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Add Product</h3>

          <input
            type="text"
            placeholder="Name"
            value={newProduct.name}
            onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
            className="w-full p-2 border border-slate-200 rounded-lg mb-3 text-sm"
          />
          <textarea
            placeholder="Description"
            value={newProduct.description}
            onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
            className="w-full p-2 border border-slate-200 rounded-lg mb-3 text-sm"
            rows="2"
          />
          <div className="flex gap-3 mb-3">
            <input
              type="number"
              placeholder="Price (₹)"
              value={newProduct.price}
              onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm"
            />
            <input
              type="number"
              placeholder="Stock"
              value={newProduct.stock}
              onChange={e => setNewProduct(p => ({ ...p, stock: e.target.value }))}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <CategorySelect
            value={newProduct.category}
            onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}
          />

          <ImageUploadField
            imageUrl={newProduct.imageUrl}
            onUpload={url => setNewProduct(p => ({ ...p, imageUrl: url }))}
            onRemove={() => setNewProduct(p => ({ ...p, imageUrl: '' }))}
          />

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAdd}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddModal(false)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* ── Edit Modal ── */}
      {editingProduct && (
        <ModalWrapper>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Edit Product</h3>

          <input
            type="text"
            placeholder="Name"
            value={editingProduct.name}
            onChange={e => setEditingProduct(p => ({ ...p, name: e.target.value }))}
            className="w-full p-2 border border-slate-200 rounded-lg mb-3 text-sm"
          />
          <textarea
            placeholder="Description"
            value={editingProduct.description}
            onChange={e => setEditingProduct(p => ({ ...p, description: e.target.value }))}
            className="w-full p-2 border border-slate-200 rounded-lg mb-3 text-sm"
            rows="2"
          />
          <div className="flex gap-3 mb-3">
            <input
              type="number"
              placeholder="Price (₹)"
              value={editingProduct.price}
              onChange={e => setEditingProduct(p => ({ ...p, price: e.target.value }))}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm"
            />
            <input
              type="number"
              placeholder="Stock"
              value={editingProduct.stock}
              onChange={e => setEditingProduct(p => ({ ...p, stock: e.target.value }))}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <CategorySelect
            value={editingProduct.category || ''}
            onChange={e => setEditingProduct(p => ({ ...p, category: e.target.value }))}
          />

          <ImageUploadField
            imageUrl={editingProduct.imageUrl}
            onUpload={url => setEditingProduct(p => ({ ...p, imageUrl: url }))}
            onRemove={() => setEditingProduct(p => ({ ...p, imageUrl: '' }))}
          />

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleUpdate}
              className="flex-1 bg-[#2874f0] hover:bg-[#1a5dc8] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setEditingProduct(null)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* ── Products Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow flex flex-col">
            {p.imageUrl ? (
              <img
                src={`http://localhost:8086${p.imageUrl}`}
                alt={p.name}
                className="w-full h-32 object-cover rounded-lg mb-3 border border-slate-100"
              />
            ) : (
              <div className="w-full h-32 bg-slate-50 rounded-lg mb-3 border border-slate-100 flex items-center justify-center text-slate-300">
                <span className="text-2xl">📷</span>
              </div>
            )}

            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-slate-800 truncate">{p.name}</h3>
              {p.category && (
                <span className="text-xs bg-blue-50 text-[#2874f0] border border-blue-100 px-2 py-0.5 rounded-full shrink-0 ml-2">
                  {p.category}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 line-clamp-2 flex-1">{p.description}</p>

            <div className="mt-3 flex justify-between items-center">
              <span className="text-[#2874f0] font-bold text-lg">₹{p.price}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${p.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {p.stock > 0 ? `Stock: ${p.stock}` : 'Out of stock'}
              </span>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setEditingProduct(p)}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-slate-800 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Admin: Orders ─────────────────────────────────────────────────────────────
function AdminOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders');
      setOrders(res.data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await API.put(`/orders/${orderId}/status?status=${status}`);
      toast.success(`Order #${orderId} → ${status}`);
      fetchOrders();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const statusColor = (s) => ({
    PENDING:   'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    PAID:      'bg-green-100 text-green-700',
    SHIPPED:   'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-emerald-100 text-emerald-700',
  }[s] || 'bg-gray-100 text-gray-700');

  if (loading) return <div className="text-center py-8 text-slate-500">Loading orders...</div>;

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">🚚 Manage Orders</h2>
      <div className="space-y-3">
        {orders.map(order => (
          <div key={order.id} className="border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-slate-800">Order #{order.id}</p>
                <p className="text-sm text-slate-500 mt-0.5">Product: {order.productDetails?.name || order.productId}</p>
                <p className="text-sm text-slate-500">User ID: {order.userId}</p>
                <p className="font-bold text-[#2874f0] mt-1">₹{order.totalAmount}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(order.status)}`}>
                {order.status || 'PENDING'}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => updateStatus(order.id, 'CONFIRMED')} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Confirm</button>
              <button onClick={() => updateStatus(order.id, 'SHIPPED')}   className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Ship</button>
              <button onClick={() => updateStatus(order.id, 'DELIVERED')} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Deliver</button>
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-center text-slate-400 py-8">No orders found</p>}
      </div>
    </div>
  );
}

// ── Admin: Users ──────────────────────────────────────────────────────────────
function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/users')
      .then(res => setUsers(res.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-8 text-slate-500">Loading users...</div>;

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">👥 Manage Users</h2>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
              <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
              <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
              <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 text-slate-500">{u.id}</td>
                <td className="p-3 font-medium text-slate-700">{u.name}</td>
                <td className="p-3 text-slate-500">{u.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                    {u.role || 'USER'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
function Dashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [stats, setStats]                 = useState({ users: 0, products: 0, orders: 0, payments: 0 });
  const [loading, setLoading]             = useState(true);
  const [searchQuery, setSearchQuery]     = useState("");
  const navigate  = useNavigate();
  const user      = authService.getCurrentUser();
  const isAdmin   = user?.role === 'ADMIN';
  const maxOrders = Math.max(...WEEKLY_DATA.map(d => d.orders));

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, productsRes, ordersRes, paymentsRes] = await Promise.all([
          API.get("/users"), API.get("/products"), API.get("/orders"), API.get("/payments"),
        ]);
        setStats({
          users:    usersRes.data.length,
          products: productsRes.data.length,
          orders:   ordersRes.data.length,
          payments: paymentsRes.data.length,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const u     = localStorage.getItem('user');
    if (!token || !u) navigate('/login');
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0] || 'U').toUpperCase();

  const NAV_SECTIONS = getNavSections(isAdmin);
  const allItems     = NAV_SECTIONS.flatMap(s => s.items);
  const activeItem   = allItems.find(i => i.key === activeSection) ?? allItems[0];

  // ── Sidebar ──
  const Sidebar = (
    <aside
      className={`bg-white border-r border-slate-100 flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${sidebarOpen ? 'w-56' : 'w-16'}`}
      style={{ minHeight: '100%' }}
    >
      <div className={`flex items-center gap-3 px-4 py-4 border-b border-slate-100 ${!sidebarOpen && 'justify-center'}`}>
        <div className="w-8 h-8 shrink-0 rounded-lg bg-[#2874f0] flex items-center justify-center text-white text-sm font-bold">⚡</div>
        {sidebarOpen && (
          <span className="text-base font-bold text-slate-800 whitespace-nowrap">
            <span className="text-[#2874f0]">Micro</span>Shop
          </span>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_SECTIONS.map(section => (
          <div key={section.heading} className="mb-3">
            {sidebarOpen && (
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
                {section.heading}
              </p>
            )}
            {section.items.map(item => {
              const isActive = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`w-full flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors mb-0.5
                    ${isActive ? 'bg-blue-50 text-[#2874f0]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
                    ${!sidebarOpen && 'justify-center'}`}
                >
                  <span className="text-base shrink-0">{item.icon}</span>
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                  {sidebarOpen && isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#2874f0] shrink-0" />}
                </button>
              );
            })}
            {sidebarOpen && <div className="border-b border-slate-100 mt-2 mb-1" />}
          </div>
        ))}
      </nav>
      <div className="border-t border-slate-100 p-3 space-y-2">
        <div className={`flex items-center gap-2 ${!sidebarOpen && 'justify-center'}`}>
          <div className="w-7 h-7 rounded-full bg-[#2874f0] flex items-center justify-center text-white text-xs font-bold shrink-0">{userInitials}</div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-700 truncate">{user?.name || user?.email}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          )}
        </div>
        {sidebarOpen && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block shrink-0" />
            <span className="text-xs text-slate-400">All services up</span>
          </div>
        )}
      </div>
    </aside>
  );

  // ── Content renderer ──
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection stats={stats} loading={loading} maxOrders={maxOrders} />;

      case 'products':
        return (
          <div className="space-y-5">
            <div className="bg-[#2874f0] rounded-xl px-7 py-6 flex items-center justify-between overflow-hidden relative">
              <div className="relative z-10">
                <span className="inline-block bg-white/20 border border-white/30 text-white text-xs px-3 py-1 rounded-full mb-2">
                  🔥 Summer Sale 2026
                </span>
                <h2 className="text-white text-xl font-bold mb-1">Big Billion Days are here!</h2>
                <p className="text-blue-100 text-sm mb-4">Exclusive deals on electronics, fashion & home. Up to 80% off.</p>
                <div className="flex gap-3">
                  <button className="bg-yellow-400 hover:bg-yellow-300 text-slate-800 text-sm font-bold px-5 py-2 rounded-lg transition-colors">Shop Now</button>
                  <button className="bg-transparent text-white text-sm border border-white/50 px-5 py-2 rounded-lg hover:bg-white/10 transition-colors">View Offers</button>
                </div>
              </div>
              <div className="text-white opacity-10 text-8xl absolute right-10 top-1/2 -translate-y-1/2 flex gap-4 pointer-events-none select-none">
                🛒🏷️🎁
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-800">New in Electronics</p>
                  <p className="text-xs text-blue-500 mt-0.5">Laptops, phones & more</p>
                </div>
                <span className="text-3xl">💻</span>
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-orange-800">Fashion Week Deals</p>
                  <p className="text-xs text-orange-500 mt-0.5">Flat 60% on top brands</p>
                </div>
                <span className="text-3xl">👗</span>
              </div>
            </div>
            <ProductCatalog />
          </div>
        );

      case 'orders':
        return (
          <div>
            <SectionHeader icon="🛒" title="My orders" subtitle="View your order history and track shipments" />
            <OrderList />
          </div>
        );

      case 'payments':
        return (
          <div>
            <SectionHeader icon="💳" title="Payment history" subtitle="All your transactions in one place" />
            <PaymentList />
          </div>
        );

      case 'admin-products':  return <AdminProducts />;
      case 'admin-orders':    return <AdminOrders />;
      case 'admin-users':     return <AdminUsers />;
      case 'admin-inventory': return <ComingSoon icon="📊" label="Inventory Management" />;
      default:                return <ComingSoon icon={activeItem.icon} label={activeItem.label} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ── Header ── */}
      <header className="bg-[#2874f0] sticky top-0 z-20 shrink-0">
        <div className="px-4 py-2.5 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="w-8 h-8 flex flex-col items-center justify-center gap-1.5 rounded hover:bg-white/10 transition-colors shrink-0"
            aria-label="Toggle sidebar"
          >
            <span className="block w-5 h-0.5 bg-white rounded" />
            <span className="block w-5 h-0.5 bg-white rounded" />
            <span className="block w-5 h-0.5 bg-white rounded" />
          </button>

          <span className="text-white font-bold text-lg whitespace-nowrap shrink-0 hidden sm:block">
            ⚡ <span className="text-yellow-300">Micro</span>Shop
          </span>

          <div className="flex flex-1 max-w-2xl bg-white rounded-sm overflow-hidden h-9 mx-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products, brands and more..."
              className="flex-1 px-3 text-sm text-slate-700 outline-none"
            />
            <button className="bg-yellow-400 hover:bg-yellow-500 px-4 text-slate-800 transition-colors font-medium text-sm">
              🔍
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <CartIcon />
            <div className="relative cursor-pointer p-1">
              <span className="text-white text-lg">🔔</span>
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-orange-400 rounded-full border border-white" />
            </div>
            <div className="hidden sm:flex items-center gap-2 cursor-pointer hover:bg-white/10 px-2 py-1 rounded transition-colors">
              <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center text-slate-800 text-xs font-bold">
                {userInitials}
              </div>
              <span className="text-white text-sm max-w-[100px] truncate">{user?.name || user?.email}</span>
            </div>
            {isAdmin && (
              <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full font-medium">Admin</span>
            )}
            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="bg-[#1a5dc8] px-4 flex gap-0.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {[
            { key: 'overview',  label: 'Home',         icon: '🏠' },
            { key: 'products',  label: 'All Products', icon: '🏪' },
            { key: 'orders',    label: 'My Orders',    icon: '🛒' },
            { key: 'payments',  label: 'Payments',     icon: '💳' },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2
                ${activeSection === item.key
                  ? 'border-yellow-400 text-white'
                  : 'border-transparent text-blue-100 hover:text-white hover:border-white/30'}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {Sidebar}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-6 space-y-5">
            <Breadcrumb />
            <Newsletter />
            <div className="bg-white border border-slate-200/70 rounded-xl p-6">
              {renderContent()}
            </div>
            <div className="bg-white border border-slate-100 rounded-xl px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                <span className="text-xs text-slate-500">All services operational</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>
                  Avg orders/user:{' '}
                  <strong className="text-slate-600">
                    {loading ? '...' : (stats.users ? (stats.orders / stats.users).toFixed(1) : '0')}
                  </strong>
                </span>
                <span>Auto-refreshes every 10s</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Overview section ──────────────────────────────────────────────────────────
function OverviewSection({ stats, loading, maxOrders }) {
  return (
    <div className="space-y-5">
      <div className="bg-[#2874f0] rounded-xl px-7 py-5 flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10">
          <span className="inline-block bg-white/20 border border-white/30 text-white text-xs px-3 py-1 rounded-full mb-2">
            Summer Sale 2026
          </span>
          <h2 className="text-white text-xl font-bold mb-1">Big Billion Days are here!</h2>
          <p className="text-blue-100 text-sm mb-4">Exclusive deals on electronics, fashion & home. Up to 80% off.</p>
          <div className="flex gap-3">
            <button className="bg-yellow-400 hover:bg-yellow-300 text-slate-800 text-sm font-bold px-5 py-2 rounded-lg transition-colors">Shop Now</button>
            <button className="bg-transparent text-white text-sm border border-white/50 px-5 py-2 rounded-lg hover:bg-white/10 transition-colors">View Offers</button>
          </div>
        </div>
        <div className="text-white opacity-10 text-8xl absolute right-10 top-1/2 -translate-y-1/2 flex gap-4 pointer-events-none select-none">
          🛒🏷️🎁
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="👤" label="Total users"     value={stats.users.toLocaleString()}    trend="12%" trendUp         loading={loading} bgColor="bg-blue-50"   iconColor="text-[#2874f0]" />
        <StatCard icon="📦" label="Products listed" value={stats.products.toLocaleString()} trend="5%"  trendUp         loading={loading} bgColor="bg-green-50"  iconColor="text-green-700" />
        <StatCard icon="🛍️" label="Orders placed"  value={stats.orders.toLocaleString()}   trend="3%"  trendUp={false} loading={loading} bgColor="bg-amber-50"  iconColor="text-amber-700" />
        <StatCard icon="💳" label="Payments"        value={stats.payments.toLocaleString()} trend="18%" trendUp         loading={loading} bgColor="bg-orange-50" iconColor="text-orange-600" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-slate-50 border border-slate-200/70 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-800">Weekly order volume</p>
            <button className="text-xs text-[#2874f0] border border-slate-200 rounded-lg px-3 py-1.5 bg-white hover:bg-slate-50">This month ▾</button>
          </div>
          <div className="flex items-end gap-2 h-24 pt-2">
            {WEEKLY_DATA.map(({ day, orders, peak }) => (
              <div key={day} className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`w-full rounded-t transition-opacity hover:opacity-100 ${peak ? 'bg-yellow-400 opacity-90' : 'bg-[#2874f0] opacity-60'}`}
                  style={{ height: `${(orders / maxOrders) * 100}%` }}
                />
                <span className="text-xs text-slate-400">{day}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#2874f0] opacity-60 inline-block" />Orders
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-yellow-400 inline-block" />Peak days
            </span>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-800">Live activity</p>
            <button className="text-xs text-[#2874f0] hover:underline">View all</button>
          </div>
          <div className="divide-y divide-slate-200/70">
            {ACTIVITIES.map((a, i) => (
              <div key={i} className="flex items-start gap-2.5 py-2.5">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${ACTIVITY_COLORS[a.color]}`} />
                <div>
                  <p className="text-xs text-slate-700 leading-relaxed">{a.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, subtitle, children }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">{icon} {title}</h2>
        <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
}

export default Dashboard;