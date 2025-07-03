'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Loader2, Package } from 'lucide-react';


export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/orders', {
          credentials: 'include',
        });

        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          let errorMessage = 'Failed to fetch orders';
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            errorMessage = data.message || errorMessage;
          } else {
            console.error('Non-JSON response:', await response.text());
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error.message);
        toast.error(error.message || 'Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include',
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to update order status';
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          errorMessage = data.message || errorMessage;
        } else {
          console.error('Non-JSON response:', await response.text());
        }
        throw new Error(errorMessage);
      }

      setOrders(orders.map((order) =>
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success('Order status updated!');
    } catch (error) {
      console.error('Error updating order status:', error.message);
      toast.error(error.message || 'Failed to update order status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Admin: All Orders</h1>
          {orders.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No orders found.</p>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <motion.div
                  key={order._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Package className="w-6 h-6 text-teal-500" />
                      <div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">Order #{order._id}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Product ID: {order.productId}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Quantity: {order.quantity}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Payment: {order.paymentMethod}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Status: {order.status}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Customer: {order.shippingDetails?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Address: {order.shippingDetails?.address || 'N/A'}, {order.shippingDetails?.town || 'N/A'}, {order.shippingDetails?.city || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ordered: {new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}