import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Loader, AlertTriangle, ChevronLeft, MapPin, CreditCard, Clock, CheckCircle } from 'lucide-react';

const OrderDetails = () => {
  const { id } = useParams();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payLoading, setPayLoading] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const { data } = await axios.get(`/api/orders/${id}`);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handlePayOrder = async () => {
    setPayLoading(true);
    try {
      const { data } = await axios.put(`/api/orders/${id}/pay`);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment simulation failed.');
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader className="h-10 w-10 text-indigo-500 animate-spin" />
          <p className="text-slate-400 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-950 text-white px-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-4">
          <div className="inline-flex p-3 bg-rose-500/10 text-rose-455 rounded-xl border border-rose-500/20">
            <AlertTriangle className="h-8 w-8 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold">Error</h2>
          <p className="text-sm text-slate-400">{error || 'Order not found.'}</p>
          <Link 
            to="/myorders" 
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back Link */}
        <Link to="/myorders" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white font-semibold text-sm transition">
          <ChevronLeft className="h-4 w-4" />
          <span>Back to My Orders</span>
        </Link>

        {/* Header Summary */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Order ID</p>
            <h1 className="text-xl md:text-2xl font-black text-indigo-400 truncate">{order._id}</h1>
            <p className="text-xs text-slate-400 font-medium">
              Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-850">
            {/* Payment Status Card */}
            <div className="bg-slate-950/60 border border-slate-855 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${order.isPaid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Payment Status</p>
                  <p className="text-sm font-extrabold">{order.isPaid ? 'Paid' : 'Pending Payment'}</p>
                  {order.isPaid && order.paidAt && (
                    <p className="text-[10px] text-slate-450 font-medium">
                      Paid on {new Date(order.paidAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              
              {!order.isPaid && (
                <button
                  onClick={handlePayOrder}
                  disabled={payLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-md transition disabled:bg-slate-800"
                >
                  {payLoading ? 'Paying...' : 'Simulate Pay'}
                </button>
              )}
            </div>

            {/* Delivery Status Card */}
            <div className="bg-slate-950/60 border border-slate-855 p-4 rounded-2xl flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${order.isDelivered ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Delivery Status</p>
                <p className="text-sm font-extrabold">{order.isDelivered ? 'Delivered' : 'Processing Delivery'}</p>
                {order.isDelivered && order.deliveredAt && (
                  <p className="text-[10px] text-slate-450 font-medium">
                    Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Address and Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Shipping details */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4 md:col-span-1">
            <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-3 border-b border-slate-850">
              <MapPin className="h-4.5 w-4.5 text-indigo-400" />
              <span>Shipping Address</span>
            </h3>
            <div className="text-sm font-medium text-slate-350 space-y-1">
              <p className="text-white font-bold">{order.user?.name || 'Customer'}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
            <div className="pt-2 border-t border-slate-850/50">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Payment Method</p>
              <p className="text-sm font-bold text-white">{order.paymentMethod}</p>
            </div>
          </div>

          {/* Items Summary Table */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4 md:col-span-2 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-850">
                Order Items
              </h3>
              
              <div className="space-y-4 divide-y divide-slate-850 pr-1 max-h-60 overflow-y-auto">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className={`flex items-center justify-between gap-4 ${idx > 0 ? 'pt-4' : ''}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 bg-slate-950 rounded-lg overflow-hidden border border-slate-850 flex-shrink-0 flex items-center justify-center">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate max-w-[200px]">{item.name}</p>
                        <p className="text-xs text-slate-500 font-medium">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>

                    <div className="text-right font-medium text-slate-450 text-sm flex-shrink-0">
                      <p className="text-white font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                      <p>Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-850 flex justify-between items-center text-sm font-bold mt-4">
              <span className="text-slate-400">Total Price Paid</span>
              <span className="text-indigo-400 font-black text-xl">${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderDetails;
