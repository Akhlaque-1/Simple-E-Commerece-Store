import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Loader, AlertTriangle, Package2 } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/api/products');
        setProducts(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader className="h-10 w-10 text-indigo-500 animate-spin" />
          <p className="text-slate-400 font-medium animate-pulse">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-950 text-white px-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-4">
          <div className="inline-flex p-3 bg-rose-500/10 text-rose-455 rounded-xl border border-rose-500/20">
            <AlertTriangle className="h-8 w-8 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold">Error Loading Store</h2>
          <p className="text-sm text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col justify-center space-y-4">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-850 text-indigo-400 text-xs font-semibold">
            <Package2 className="h-3.5 w-3.5" />
            <span>Storefront Active</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Featured Products
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-lg">
            Browse through our premium collection of products. Select any item to view specifications and add it to your cart.
          </p>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-850 rounded-3xl space-y-3">
            <p className="text-slate-400 text-lg font-medium">No products found in the catalog.</p>
            <p className="text-xs text-slate-500">Products added by store administrators will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div 
                key={product._id} 
                className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden hover:border-slate-800 transition duration-300 flex flex-col group"
              >
                {/* Product Image */}
                <div className="aspect-square bg-slate-950 relative overflow-hidden flex items-center justify-center border-b border-slate-850">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop';
                    }}
                  />
                  {product.stock === 0 && (
                    <span className="absolute top-3 right-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Sold Out
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-xs text-indigo-400 font-bold tracking-wider uppercase">
                      {product.category}
                    </span>
                    <h3 className="font-bold text-lg text-white group-hover:text-indigo-300 transition line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Price</p>
                      <p className="font-extrabold text-xl text-white">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                    <Link 
                      to={`/products/${product._id}`}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-4 py-2 rounded-xl transition duration-200"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
