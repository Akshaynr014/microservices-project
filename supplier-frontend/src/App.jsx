import { useState, useEffect } from "react";
import { Toaster } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import UserForm from "./components/UserForm";
import UserList from "./components/UserList";
import OrderForm from "./components/OrderForm";
import OrderDetails from "./components/OrderDetails";
import OrderList from "./components/OrderList";
import ProductForm from "./components/ProductForm";
import ProductList from "./components/ProductList";
import PaymentForm from "./components/PaymentForm";
import PaymentList from "./components/PaymentList";
import API from "./services/api";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    payments: 0
  });
  const [loading, setLoading] = useState(true);

  // Prepare chart data
  const chartData = [
    { name: 'Users', count: stats.users, color: '#3B82F6' },
    { name: 'Products', count: stats.products, color: '#8B5CF6' },
    { name: 'Orders', count: stats.orders, color: '#10B981' },
    { name: 'Payments', count: stats.payments, color: '#F59E0B' },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, productsRes, ordersRes, paymentsRes] = await Promise.all([
          API.get("/users"),
          API.get("/products"),
          API.get("/orders"),
          API.get("/payments")
        ]);
        setStats({
          users: usersRes.data.length,
          products: productsRes.data.length,
          orders: ordersRes.data.length,
          payments: paymentsRes.data.length
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-sm shadow-sm border-b border-slate-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <h1 className="text-3xl font-bold text-slate-700">
            Microservices Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            User • Product • Order • Payment Services | API Gateway | Eureka
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        {/* Statistics Cards - Updated to 6 cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50 p-3 hover:shadow-md transition">
            <p className="text-slate-400 text-xs font-medium">Total Users</p>
            <p className="text-xl font-bold text-slate-600 mt-1">
              {loading ? "..." : stats.users}
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50 p-3 hover:shadow-md transition">
            <p className="text-slate-400 text-xs font-medium">Total Products</p>
            <p className="text-xl font-bold text-slate-600 mt-1">
              {loading ? "..." : stats.products}
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50 p-3 hover:shadow-md transition">
            <p className="text-slate-400 text-xs font-medium">Total Orders</p>
            <p className="text-xl font-bold text-slate-600 mt-1">
              {loading ? "..." : stats.orders}
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50 p-3 hover:shadow-md transition">
            <p className="text-slate-400 text-xs font-medium">Total Payments</p>
            <p className="text-xl font-bold text-slate-600 mt-1">
              {loading ? "..." : stats.payments}
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50 p-3 hover:shadow-md transition">
            <p className="text-slate-400 text-xs font-medium">Services Status</p>
            <p className="text-lg font-bold text-emerald-500 mt-1">
              ● UP
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50 p-3 hover:shadow-md transition">
            <p className="text-slate-400 text-xs font-medium">Avg Orders/User</p>
            <p className="text-xl font-bold text-slate-600 mt-1">
              {loading ? "..." : (stats.users ? (stats.orders / stats.users).toFixed(1) : "0")}
            </p>
          </div>
        </div>

        {/* Tab Navigation - Added Payments Tab */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50 mb-6">
          <div className="border-b border-slate-200/50">
            <nav className="flex flex-wrap -mb-px">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-3 text-sm font-medium transition ${
                  activeTab === "dashboard"
                    ? "border-b-2 border-blue-400 text-blue-500 bg-blue-50/30"
                    : "text-slate-400 hover:text-slate-600 hover:border-slate-300"
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-4 py-3 text-sm font-medium transition ${
                  activeTab === "users"
                    ? "border-b-2 border-blue-400 text-blue-500 bg-blue-50/30"
                    : "text-slate-400 hover:text-slate-600 hover:border-slate-300"
                }`}
              >
                👥 Users
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`px-4 py-3 text-sm font-medium transition ${
                  activeTab === "products"
                    ? "border-b-2 border-purple-400 text-purple-500 bg-purple-50/30"
                    : "text-slate-400 hover:text-slate-600 hover:border-slate-300"
                }`}
              >
                📦 Products
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-4 py-3 text-sm font-medium transition ${
                  activeTab === "orders"
                    ? "border-b-2 border-emerald-400 text-emerald-500 bg-emerald-50/30"
                    : "text-slate-400 hover:text-slate-600 hover:border-slate-300"
                }`}
              >
                🛒 Orders
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`px-4 py-3 text-sm font-medium transition ${
                  activeTab === "payments"
                    ? "border-b-2 border-amber-400 text-amber-500 bg-amber-50/30"
                    : "text-slate-400 hover:text-slate-600 hover:border-slate-300"
                }`}
              >
                💳 Payments
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/40 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50 p-6">
          
          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <div>
              <h2 className="text-xl font-semibold text-slate-600 mb-6">System Overview</h2>
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Chart Section */}
                <div className="bg-white/50 rounded-lg p-5 border border-slate-200/50">
                  <h3 className="text-md font-medium text-slate-500 mb-4 flex items-center">
                    <span className="mr-2">📊</span>
                    System Analytics
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" stroke="#64748B" />
                      <YAxis stroke="#64748B" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0'
                        }}
                      />
                      <Bar dataKey="count" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* System Health Section */}
                <div className="bg-white/50 rounded-lg p-5 border border-slate-200/50">
                  <h3 className="text-md font-medium text-slate-500 mb-4 flex items-center">
                    <span className="mr-2">✅</span>
                    System Health
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-white/40 rounded">
                      <span className="text-slate-600">User Service:</span>
                      <span className="text-emerald-500 font-medium">● Operational</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/40 rounded">
                      <span className="text-slate-600">Product Service:</span>
                      <span className="text-emerald-500 font-medium">● Operational</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/40 rounded">
                      <span className="text-slate-600">Order Service:</span>
                      <span className="text-emerald-500 font-medium">● Operational</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/40 rounded">
                      <span className="text-slate-600">Payment Service:</span>
                      <span className="text-emerald-500 font-medium">● Operational</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/40 rounded">
                      <span className="text-slate-600">API Gateway:</span>
                      <span className="text-emerald-500 font-medium">● Operational</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/40 rounded">
                      <span className="text-slate-600">Eureka Server:</span>
                      <span className="text-emerald-500 font-medium">● Operational</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Section */}
              <div className="mt-6 grid lg:grid-cols-2 gap-6">
                <div className="bg-white/50 rounded-lg p-5 border border-slate-200/50">
                  <h3 className="text-md font-medium text-slate-500 mb-3 flex items-center">
                    <span className="mr-2">📈</span>
                    Quick Statistics
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Users:</span>
                      <span className="text-slate-600 font-medium">{stats.users}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Products:</span>
                      <span className="text-slate-600 font-medium">{stats.products}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Orders:</span>
                      <span className="text-slate-600 font-medium">{stats.orders}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Payments:</span>
                      <span className="text-slate-600 font-medium">{stats.payments}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Orders per User:</span>
                      <span className="text-slate-600 font-medium">
                        {stats.users ? (stats.orders / stats.users).toFixed(2) : "0"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Data Points:</span>
                      <span className="text-slate-600 font-medium">
                        {stats.users + stats.products + stats.orders + stats.payments}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/50 rounded-lg p-5 border border-slate-200/50">
                  <h3 className="text-md font-medium text-slate-500 mb-3 flex items-center">
                    <span className="mr-2">ℹ️</span>
                    System Info
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Version:</span>
                      <span className="text-slate-600">v3.0.0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Microservices:</span>
                      <span className="text-slate-600">4 Services</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Environment:</span>
                      <span className="text-slate-600">Development</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Last Updated:</span>
                      <span className="text-slate-600">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === "users" && (
            <div>
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-600 mb-4">➕ Create User</h2>
                  <UserForm />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-600 mb-4">📋 User List</h2>
                  <UserList />
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === "products" && (
            <div>
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-600 mb-4">➕ Create Product</h2>
                  <ProductForm />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-600 mb-4">📦 Product List</h2>
                  <ProductList />
                </div>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div>
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-600 mb-4">➕ Create Order</h2>
                  <OrderForm />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-600 mb-4">🔍 Find Order</h2>
                  <OrderDetails />
                </div>
              </div>
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-slate-600 mb-4">📋 All Orders</h2>
                <OrderList />
              </div>
            </div>
          )}

          {/* PAYMENTS TAB - NEW */}
          {activeTab === "payments" && (
            <div>
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-600 mb-4">💳 Process Payment</h2>
                  <PaymentForm />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-600 mb-4">📋 Payment History</h2>
                  <PaymentList />
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;