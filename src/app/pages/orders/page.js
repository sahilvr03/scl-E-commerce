'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Loader2, Package } from 'lucide-react';

export default function UserOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/orders', {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Orders</h1>
          {orders.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">You have no orders yet.</p>
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
                  <div className="flex items-center space-x-3">
                    <Package className="w-6 h-6 text-teal-500" />
                    <div>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">Order #{order._id}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Product ID: {order.productId}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Quantity: {order.quantity}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Payment: {order.paymentMethod}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Status: {order.status}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Address: {order.shippingDetails?.address || 'N/A'}, {order.shippingDetails?.town || 'N/A'}, {order.shippingDetails?.city || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Ordered: {new Date(order.createdAt).toLocaleString()}</p>
                    </div>
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