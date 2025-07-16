'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ShoppingCart, Star, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductCard({ product }) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [orderDetails, setOrderDetails] = useState({
    name: '',
    city: '',
    address: '',
    town: '',
    phone: '',
    altPhone: '',
  });
  const router = useRouter();

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      const sessionResponse = await fetch('/api/auth/session', {
        credentials: 'include',
      });

      if (!sessionResponse.ok || !(await sessionResponse.json()).session) {
        toast.error('Please log in to add items to your cart.');
        router.push(`/login?redirect=/products/${product._id}`);
        return;
      }

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });

      if (response.ok) {
        toast.success('Added to cart!');
        const cart = await (await fetch('/api/cart', { credentials: 'include' })).json();
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: cart.items.length } }));
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add to cart.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    setIsModalOpen(true);
  };

  const handlePaymentMethod = (method) => {
    setPaymentMethod(method);
    if (method === 'online') {
      toast.success('Redirecting to payment gateway...');
      setIsModalOpen(false);
      // Implement online payment logic here (e.g., redirect to payment gateway)
    }
  };

  const handleOrderDetailsChange = (e) => {
    setOrderDetails({ ...orderDetails, [e.target.name]: e.target.value });
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
          paymentMethod,
          shippingDetails: orderDetails,
          status: 'Pending',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to place order');
      }

      toast.success('Order placed successfully!');
      setIsModalOpen(false);
      setPaymentMethod(null);
      setOrderDetails({
        name: '',
        city: '',
        address: '',
        town: '',
        phone: '',
        altPhone: '',
      });
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.message || 'Failed to place order');
    }
  };

  return (
    <>
      <div className="relative bg-white rounded-lg shadow-md overflow-hidden group transition hover:shadow-lg">
        <Link href={`/products/${product._id}`} className="block">
          <Image
            src={product.imageUrl || '/placeholder.jpg'}
            alt={product.title}
            width={400}
            height={400}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {product.discount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{product.discount}%
          </span>
        )}

        <div className="p-4">
          <Link href={`/products/${product._id}`}>
            <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{product.title}</h3>
          </Link>

          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{product.description}</p>

          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-teal-600 font-bold text-lg">
                ${product.price}
                {product.originalPrice && (
                  <span className="ml-2 text-sm line-through text-gray-500">
                    ${product.originalPrice}
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddToCart}
              disabled={loading}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-sm px-4 py-2 rounded-md flex items-center justify-center disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              {loading ? 'Adding...' : 'Add to Cart'}
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 bg-white border border-teal-600 text-teal-600 hover:bg-gray-100 text-sm px-4 py-2 rounded-md flex items-center justify-center"
            >
              <Zap className="w-4 h-4 mr-1" />
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* COD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Choose Payment Method</h2>
              {!paymentMethod ? (
                <div className="space-y-4">
                  <motion.button
                    onClick={() => handlePaymentMethod('cod')}
                    className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cash on Delivery
                  </motion.button>
                  <motion.button
                    onClick={() => handlePaymentMethod('online')}
                    className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Online Payment
                  </motion.button>
                  <motion.button
                    onClick={() => setIsModalOpen(false)}
                    className="w-full text-gray-600 dark:text-gray-400 underline"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              ) : paymentMethod === 'cod' ? (
                <form onSubmit={handleOrderSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={orderDetails.name}
                      onChange={handleOrderDetailsChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                    <input
                      type="text"
                      name="city"
                      value={orderDetails.city}
                      onChange={handleOrderDetailsChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={orderDetails.address}
                      onChange={handleOrderDetailsChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Town</label>
                    <input
                      type="text"
                      name="town"
                      value={orderDetails.town}
                      onChange={handleOrderDetailsChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={orderDetails.phone}
                      onChange={handleOrderDetailsChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Alternative Phone Number</label>
                    <input
                      type="tel"
                      name="altPhone"
                      value={orderDetails.altPhone}
                      onChange={handleOrderDetailsChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Place Order
                  </motion.button>
                  <motion.button
                    onClick={() => setPaymentMethod(null)}
                    className="w-full text-gray-600 dark:text-gray-400 underline"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back
                  </motion.button>
                </form>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}