import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Derive cartItemCount from cart items
  const cartItemCount = cart && cart.items 
    ? cart.items.reduce((total, item) => total + item.quantity, 0)
    : 0;

  // Fetch Cart
  const fetchCart = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get('/api/cart');
      setCart(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  // Add Item to Cart
  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post('/api/cart', { productId, quantity });
      setCart(data);
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to add item to cart';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Update Item Quantity in Cart
  const updateCartItemQty = async (productId, quantity) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.put(`/api/cart/${productId}`, { quantity });
      setCart(data);
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update quantity';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Remove Item from Cart
  const removeFromCart = async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.delete(`/api/cart/${productId}`);
      setCart(data);
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to remove item';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Clear Cart
  const clearCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.delete('/api/cart');
      setCart(data);
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to clear cart';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart automatically when user logging status changes
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart({ items: [], totalPrice: 0 });
    }
  }, [user]);

  const clearCartError = () => setError(null);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItemCount,
        loading,
        error,
        fetchCart,
        addToCart,
        updateCartItemQty,
        removeFromCart,
        clearCart,
        clearCartError
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
