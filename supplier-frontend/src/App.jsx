import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./components/Dashboard";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import TrackOrder from "./components/TrackOrder";
import OrderConfirmation from "./components/OrderConfirmation";
import OrdersPage from "./components/OrdersPage"; // Create this component or use OrderList


function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/track-order/:id" element={
            <ProtectedRoute>
              <TrackOrder />
            </ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/order-confirmation/:orderId" element={
  <ProtectedRoute>
    <OrderConfirmation />
  </ProtectedRoute>
} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/orders" element={
  <ProtectedRoute>
    <OrdersPage />
  </ProtectedRoute>
} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;