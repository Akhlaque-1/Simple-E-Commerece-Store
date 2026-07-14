import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { Loader, CreditCard, ChevronLeft, CheckCircle } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if cart is empty
  useEffect(() => {
    if (!loading && (!cart || !cart.items || cart.items.length === 0)) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address || !city || !postalCode || !country) {
      setError('Please fill in all shipping address fields.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post('/api/orders', {
        shippingAddress: {
          address,
          city,
          postalCode,
          country
        },
        paymentMethod
      });
      
      // Clear shopping cart state on success
      await clearCart();
      
      // Navigate to order details
      navigate(`/orders/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return null; // Redirecting...
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back Link */}
        <Link to="/cart" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white font-semibold text-sm transition">
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Cart</span>
        </Link>

        <h1 className="text-3xl font-black tracking-tight">Checkout</h1>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-455 text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns: Shipping Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-850 p-6 md:p-8 rounded-3xl space-y-6">
              <h2 className="text-xl font-bold tracking-tight pb-2 border-b border-slate-850">
                Shipping Information
              </h2>

              <div className="space-y-4">
                {/* Address */}
                <div className="space-y-1.5">
                  <label htmlFor="address" className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    Street Address
                  </label>
                  <input 
                    type="text" 
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    placeholder="e.g. 123 Main St"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition text-white placeholder-slate-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* City */}
                  <div className="space-y-1.5">
                    <label htmlFor="city" className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      City
                    </label>
                    <input 
                      type="text" 
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      placeholder="e.g. New York"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition text-white placeholder-slate-600"
                    />
                  </div>

                  {/* Postal Code */}
                  <div className="space-y-1.5">
                    <label htmlFor="postalCode" className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Postal Code
                    </label>
                    <input 
                      type="text" 
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      required
                      placeholder="e.g. 10001"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition text-white placeholder-slate-600"
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-1.5">
                    <label htmlFor="country" className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Country
                    </label>
                    <input 
                      type="text" 
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                      placeholder="e.g. United States"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition text-white placeholder-slate-600"
                    />
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold tracking-tight pb-2 border-b border-slate-850 pt-2">
                Payment Method
              </h2>

              <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Cash on Delivery</p>
                    <p className="text-xs text-slate-450">Pay when your order is delivered</p>
                  </div>
                </div>
                <input 
                  type="radio" 
                  checked={paymentMethod === 'Cash on Delivery'} 
                  readOnly 
                  className="h-4 w-4 accent-indigo-500" 
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-600/20 hover:scale-[1.01] active:scale-99 transition duration-200 disabled:bg-indigo-600/50 disabled:scale-100"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <span>Place Order — ${cart.totalPrice.toFixed(2)}</span>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Cart items summary */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl h-fit space-y-6">
            <h2 className="text-xl font-bold tracking-tight pb-4 border-b border-slate-850">
              Items
            </h2>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {cart.items.map((item) => {
                if (!item.product) return null;
                return (
                  <div key={item.product._id} className="flex gap-3 items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-10 w-10 bg-slate-950 rounded-lg overflow-hidden flex-shrink-0 border border-slate-850 flex items-center justify-center">
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
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate max-w-[120px]">{item.product.name}</p>
                        <p className="text-[10px] text-slate-500 font-semibold uppercase">{item.product.category}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs font-medium text-slate-400">
                      <p className="text-white font-bold">${(item.product.price * item.quantity).toFixed(2)}</p>
                      <p>Qty: {item.quantity}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-850 flex justify-between items-center text-sm font-bold">
              <span className="text-slate-400">Total Price</span>
              <span className="text-indigo-400 font-black text-lg">${cart.totalPrice.toFixed(2)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
