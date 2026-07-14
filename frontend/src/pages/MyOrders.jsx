import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Loader, AlertTriangle, ClipboardList, CheckCircle, Clock } from 'lucide-react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get('/api/orders/myorders');
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order history. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader className="h-10 w-10 text-indigo-500 animate-spin" />
          <p className="text-slate-400 font-medium">Loading your orders...</p>
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
          <h2 className="text-xl font-bold">Error</h2>
          <p className="text-sm text-slate-400">{error}</p>
          <Link 
            to="/" 
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
          <ClipboardList className="h-8 w-8 text-indigo-400" />
          <span>My Orders</span>
        </h1>

        {orders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-850 rounded-3xl p-12 text-center space-y-5">
            <p className="text-slate-400 text-lg font-medium">You haven't placed any orders yet.</p>
            <Link 
              to="/" 
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl transition duration-200"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order._id} 
                className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-800 transition duration-200"
              >
                {/* ID & Date */}
                <div className="space-y-1.5 min-w-0">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Order ID</p>
                  <p className="text-sm font-bold text-indigo-400 truncate max-w-[200px] md:max-w-xs">{order._id}</p>
                  <p className="text-xs text-slate-450 font-medium">
                    Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                {/* Status Summary */}
                <div className="flex flex-wrap gap-3">
                  {/* Payment status */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-slate-950 border-slate-850">
                    {order.isPaid ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-455" />
                        <span className="text-emerald-455">Paid</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-amber-500">Unpaid</span>
                      </>
                    )}
                  </div>

                  {/* Delivery status */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-slate-950 border-slate-850">
                    {order.isDelivered ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-455" />
                        <span className="text-emerald-455">Delivered</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-amber-500">Processing</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Cost & Button */}
                <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t border-slate-850/50 md:border-t-0">
                  <div className="text-left md:text-right">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Price</p>
                    <p className="text-lg font-black text-white">${order.totalPrice.toFixed(2)}</p>
                  </div>
                  <Link 
                    to={`/orders/${order._id}`}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition duration-200"
                  >
                    View Details
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
