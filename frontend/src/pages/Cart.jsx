import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Loader, Trash2, ArrowRight, Minus, Plus, ShoppingBag, ShoppingCart } from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    loading, 
    error, 
    updateCartItemQty, 
    removeFromCart, 
    clearCart 
  } = useCart();

  const handleQtyChange = async (productId, currentQty, newQty, stock) => {
    if (newQty < 1) return;
    if (newQty > stock) return; // Prevent exceeding stock
    await updateCartItemQty(productId, newQty);
  };

  if (loading && (!cart || !cart.items || cart.items.length === 0)) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader className="h-10 w-10 text-indigo-500 animate-spin" />
          <p className="text-slate-400 font-medium">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
          <ShoppingCart className="h-8 w-8 text-indigo-400" />
          <span>Shopping Cart</span>
        </h1>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-455 text-sm font-semibold">
            {error}
          </div>
        )}

        {!cart || !cart.items || cart.items.length === 0 ? (
          <div className="bg-slate-900 border border-slate-850 rounded-3xl p-12 text-center space-y-6 flex flex-col items-center justify-center">
            <div className="p-4 bg-slate-950 rounded-full border border-slate-850 text-slate-500">
              <ShoppingBag className="h-12 w-12" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Your cart is empty</h2>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">
                Looks like you haven't added any products to your cart yet.
              </p>
            </div>
            <Link 
              to="/" 
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl transition duration-200"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 border border-slate-850 rounded-3xl overflow-hidden divide-y divide-slate-850">
                {cart.items.map((item) => {
                  if (!item.product) return null;
                  return (
                    <div key={item.product._id} className="p-5 flex gap-4 items-center sm:items-start justify-between">
                      {/* Thumbnail */}
                      <div className="h-16 w-16 sm:h-20 sm:w-20 bg-slate-950 rounded-xl overflow-hidden border border-slate-850 flex-shrink-0 flex items-center justify-center">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop';
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="font-bold text-white text-sm sm:text-base truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
                          {item.product.category}
                        </p>
                        <p className="text-sm font-semibold text-slate-400">
                          ${item.product.price.toFixed(2)} each
                        </p>
                      </div>

                      {/* Controls */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 sm:gap-6 flex-shrink-0">
                        {/* Quantity adjust */}
                        <div className="flex items-center bg-slate-950 border border-slate-855 rounded-xl p-0.5">
                          <button 
                            onClick={() => handleQtyChange(item.product._id, item.quantity, item.quantity - 1, item.product.stock)}
                            className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-900 rounded-lg transition"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center font-bold text-xs text-white">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => handleQtyChange(item.product._id, item.quantity, item.quantity + 1, item.product.stock)}
                            className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-900 rounded-lg transition"
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button 
                          onClick={() => removeFromCart(item.product._id)}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-950/40 rounded-xl border border-transparent hover:border-slate-850 transition"
                          title="Remove item"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Clear Cart button */}
              <button 
                onClick={clearCart}
                className="text-xs font-bold text-slate-500 hover:text-rose-455 uppercase tracking-wider transition px-1"
              >
                Clear Cart
              </button>
            </div>

            {/* Right Column: Order Summary */}
            <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 h-fit space-y-6">
              <h2 className="text-xl font-bold tracking-tight pb-4 border-b border-slate-850">
                Order Summary
              </h2>

              <div className="space-y-4 text-sm font-medium">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-white font-semibold">
                    ${cart.totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Shipping</span>
                  <span className="text-emerald-455 font-bold uppercase tracking-wider text-xs">
                    Free
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pb-4 border-b border-slate-850">
                  <span>Tax</span>
                  <span className="text-white font-semibold">$0.00</span>
                </div>
                
                <div className="flex justify-between text-base font-bold pt-2">
                  <span>Estimated Total</span>
                  <span className="text-indigo-400 font-black text-xl">
                    ${cart.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-600/20 hover:scale-[1.01] active:scale-99 transition duration-200"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
