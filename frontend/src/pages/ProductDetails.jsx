import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Loader, AlertTriangle, ChevronLeft, Plus, Minus, ShoppingCart, CheckCircle } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Product not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleIncrement = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      // Redirect to login if user is not authenticated
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }

    setSuccessMsg(null);
    const result = await addToCart(product._id, quantity);
    if (result.success) {
      setSuccessMsg(`Successfully added ${quantity} ${quantity === 1 ? 'item' : 'items'} to your cart.`);
      // Clear success message after 4 seconds
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setError(result.error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader className="h-10 w-10 text-indigo-500 animate-spin" />
          <p className="text-slate-400 font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-950 text-white px-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-4">
          <div className="inline-flex p-3 bg-rose-500/10 text-rose-455 rounded-xl border border-rose-500/20">
            <AlertTriangle className="h-8 w-8 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold">Error</h2>
          <p className="text-sm text-slate-400">{error || 'Product not found.'}</p>
          <Link 
            to="/" 
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition duration-200"
          >
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white font-semibold text-sm transition">
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Catalog</span>
        </Link>

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-400 animate-fade-in">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-semibold">{successMsg}</p>
          </div>
        )}

        {/* Details Grid */}
        <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse"></div>

          {/* Left Column: Image */}
          <div className="aspect-square bg-slate-950 rounded-2xl overflow-hidden border border-slate-850 flex items-center justify-center">
            <img 
              src={product.image} 
              alt={product.name} 
              className="object-cover w-full h-full"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop';
              }}
            />
          </div>

          {/* Right Column: Content */}
          <div className="flex flex-col justify-between space-y-6 relative z-10">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-xs text-indigo-400 font-bold tracking-wider uppercase bg-slate-950 border border-slate-855 px-3 py-1 rounded-full w-fit block">
                  {product.category}
                </span>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-white">
                  {product.name}
                </h1>
              </div>

              {/* Price & Stock info */}
              <div className="flex flex-wrap items-center gap-6 py-2 border-y border-slate-850">
                <div className="space-y-0.5">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Unit Price</p>
                  <p className="font-black text-3xl text-white">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
                
                <div className="space-y-0.5">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Stock Status</p>
                  {product.stock > 0 ? (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-455">
                      {product.stock} Units Available
                    </span>
                  ) : (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider">Description</h3>
                <p className="text-sm text-slate-300 font-medium leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Cart controls */}
            {product.stock > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-850">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-400 font-semibold uppercase tracking-wider">Quantity</span>
                  
                  {/* Quantity Selector */}
                  <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl overflow-hidden p-1">
                    <button 
                      onClick={handleDecrement}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-sm text-white">
                      {quantity}
                    </span>
                    <button 
                      onClick={handleIncrement}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition"
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-600/20 hover:scale-[1.01] active:scale-99 transition duration-200"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Add {quantity} to Cart — ${(product.price * quantity).toFixed(2)}</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
