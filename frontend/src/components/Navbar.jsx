import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, User, LogOut, Menu, X, LayoutDashboard, LogIn } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    setShowDropdown(false);
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 text-white transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 font-black text-2xl tracking-wider bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200">
              <ShoppingBag className="h-6 w-6 text-indigo-400" />
              <span>CODEALPHA</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-300 hover:text-white font-medium hover:scale-105 transition duration-200">
              Shop
            </Link>

            {user?.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium hover:scale-105 transition duration-200">
                <LayoutDashboard className="h-4.5 w-4.5" />
                <span>Admin Panel</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                {/* Cart Icon */}
                <Link to="/cart" className="relative p-2 text-gray-300 hover:text-white hover:scale-110 transition duration-200">
                  <ShoppingBag className="h-6 w-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-xs font-bold text-white shadow-md animate-pulse">
                      {cartItemCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 focus:outline-none bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5 hover:bg-slate-850 transition duration-200"
                  >
                    <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-300 hidden lg:inline max-w-[100px] truncate">
                      {user.name}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                      <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1 z-20 animate-fade-in-down">
                        <div className="px-4 py-2 border-b border-slate-800">
                          <p className="text-xs text-gray-400">Signed in as</p>
                          <p className="text-sm font-bold truncate text-indigo-400">{user.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-slate-850 hover:text-white transition"
                        >
                          <User className="h-4 w-4" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/myorders"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-slate-850 hover:text-white transition"
                        >
                          <ShoppingBag className="h-4.5 w-4.5 text-indigo-400" />
                          <span>My Orders</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-slate-850 hover:text-rose-300 transition"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition duration-250 active:scale-95"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            {user && (
              <Link to="/cart" className="relative p-2 text-gray-300 hover:text-white">
                <ShoppingBag className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-[10px] font-bold text-white shadow-md">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-900 focus:outline-none transition"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 animate-fade-in">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:bg-slate-900 hover:text-white transition"
            >
              Shop
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-amber-400 hover:bg-slate-900 hover:text-amber-300 transition"
              >
                Admin Panel
              </Link>
            )}

            {user ? (
              <div className="pt-4 mt-4 border-t border-slate-800">
                <div className="px-3 py-2">
                  <p className="text-sm font-bold text-indigo-400 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:bg-slate-900 hover:text-white transition"
                >
                  <User className="h-4 w-4" />
                  <span>My Profile</span>
                </Link>
                <Link
                  to="/myorders"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:bg-slate-900 hover:text-white transition"
                >
                  <ShoppingBag className="h-4.5 w-4.5 text-indigo-400" />
                  <span>My Orders</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-base font-medium text-rose-455 hover:bg-slate-900 hover:text-rose-300 transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 mt-4 border-t border-slate-800 flex flex-col gap-2 px-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-1.5 w-full text-center px-4 py-2 border border-slate-850 rounded-xl text-base font-medium text-gray-300 hover:bg-slate-900 transition"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-base font-semibold text-white shadow-lg transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
