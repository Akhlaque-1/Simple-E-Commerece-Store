import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import { ShieldCheck, User as UserIcon, Calendar, ArrowRight } from 'lucide-react';

// Premium Profile Page Component
const Profile = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10 animate-fade-in">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pb-6 border-b border-slate-800">
          <div className="h-20 w-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-indigo-600/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h2 className="text-3xl font-black tracking-tight">{user.name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase ${
                user.role === 'admin' 
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' 
                  : 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400'
              }`}>
                {user.role}
              </span>
            </div>
            <p className="text-slate-400 font-medium">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
          <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Account ID</p>
              <p className="text-sm font-semibold truncate text-slate-350">{user._id || user.id || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Member Since</p>
              <p className="text-sm font-semibold text-slate-350">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'July 2026'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Premium Admin Dashboard Page Component
const AdminDashboard = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white flex items-center justify-center px-4 relative overflow-hidden">
      <div className="w-full max-w-4xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10 animate-fade-in text-center space-y-6">
        <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 text-amber-400 rounded-3xl border border-amber-500/10">
          <ShieldCheck className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tight">Admin Dashboard</h2>
          <p className="text-slate-400 max-w-md mx-auto text-sm md:text-base">
            Authorized store administration panel. Product catalogue editing controls, inventory status updates, and user role management reside here.
          </p>
        </div>
        <div className="max-w-xs mx-auto border border-dashed border-slate-855 p-4 rounded-2xl text-xs text-slate-500 bg-slate-950/40">
          Role-based route guarding verified successfully.
        </div>
      </div>
    </div>
  );
};

// Main routing layout wrapper that consumes useAuth context
const AppContent = () => {
  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-200">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        
        {/* Protected Shopper Routes */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cart" 
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/myorders" 
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders/:id" 
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          } 
        />

        {/* Protected Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
