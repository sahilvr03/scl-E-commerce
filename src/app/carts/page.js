
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Trash2, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch('/api/cart', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          // Filter out invalid items where product is undefined or missing price
          const validItems = (data.items || []).filter(
            (item) => item.product && typeof item.product.price === 'number'
          );
          if (validItems.length < data.items.length) {
            console.warn('Some cart items have invalid product data:', data.items);
            toast.error('Some cart items are invalid and have been removed.');
          }
          setCartItems(validItems);
        } else {
          const errorData = await response.json();
          if (errorData.message.includes('Not authenticated')) {
            toast.error('Please log in to view your cart.');
            router.push('/login?redirect=/carts');
          } else {
            toast.error(errorData.message || 'Failed to fetch cart.');
          }
        }
      } catch (error) {
        console.error('Cart fetch error:', error);
        toast.error('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [router]);

  const handleRemoveItem = async (productId) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Filter valid items again after deletion
        const validItems = (data.items || []).filter(
          (item) => item.product && typeof item.product.price === 'number'
        );
        setCartItems(validItems);
        toast.success('Item removed from cart.');
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: validItems.length } }));
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to remove item.');
      }
    } catch (error) {
      console.error('Remove item error:', error);
      toast.error('An unexpected error occurred.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <ShoppingCart className="w-12 h-12 text-indigo-500" />
        </motion.div>
      </div>
    );
  }

  const total = cartItems
    .reduce((sum, item) => {
      if (item.product && typeof item.product.price === 'number') {
        return sum + item.product.price * item.quantity;
      }
      return sum;
    }, 0)
    .toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <ShoppingCart className="w-8 h-8 mr-3 text-indigo-500" />
            Your Cart
          </h1>
          <button
            onClick={() => router.push('/products')}
            className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
          >
            Continue Shopping
          </button>
        </div>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
          >
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">Your cart is empty.</p>
            <button
              onClick={() => router.push('/products')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium"
            >
              Shop Now
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {cartItems.map((item) => (
              <motion.div
                key={item.productId}
                className="flex items-center bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {item.product?.imageUrl && item.product.imageUrl !== '' ? (
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.title || 'Product'}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md mr-4 sm:mr-6"
                    width={96}
                    height={96}
                    priority
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center mr-4 sm:mr-6">
                    <span className="text-xs text-gray-500 dark:text-gray-400">No Image</span>
                  </div>
                )}
                <div className="flex-grow">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    {item.product?.title || 'Unknown Product'}
                  </h3>
                  {item.product && typeof item.product.price === 'number' ? (
                    <p className="text-gray-600 dark:text-gray-300">
                      ${item.product.price.toFixed(2)} x {item.quantity} = $
                      {(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  ) : (
                    <p className="text-red-500 dark:text-red-400 text-sm">
                      Product data is invalid
                    </p>
                  )}
                </div>
                <motion.button
                  onClick={() => handleRemoveItem(item.productId)}
                  className="text-red-500 hover:text-red-600"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              </motion.div>
            ))}
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-right"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Total: ${total}
              </p>
              <button
                onClick={() => router.push('/checkout')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                Proceed to Checkout
              </button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
