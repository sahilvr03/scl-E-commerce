'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  ShoppingCart,
  Star,
  Loader2,
  ShoppingBag,
  XCircle,
  LogIn,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import CountdownTimer from './CountdownTimer';

export default function ProductCard({ product, isSale = false }) {
  const [loading, setLoading] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  // -------------- CHECK SESSION FUNCTION --------------
  const checkSession = async () => {
    try {
      const sessionRes = await fetch('/api/auth/session', { credentials: 'include' });
      const sessionData = await sessionRes.json();
      return sessionData?.session?.user || null;
    } catch (error) {
      console.error('Session check failed:', error);
      return null;
    }
  };

  // -------------- ADD TO CART HANDLER --------------
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (loading || showAuthModal) return; // Prevent multiple clicks or modal re-trigger
    setLoading(true);
    const user = await checkSession();
    if (!user) {
      setShowAuthModal(true);
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
        credentials: 'include',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add to cart');
      }
      // Fetch updated cart
      const cartResponse = await fetch('/api/cart', { credentials: 'include' });
      const cartData = await cartResponse.json();
      const count = cartData.items
        ? cartData.items.reduce((sum, item) => sum + item.quantity, 0)
        : 0;
      toast.success(`${product.title} added to cart!`, {
        style: {
          background: '#FFFFFF',
          color: '#1F2937',
          border: '1px solid #F85606',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(248, 86, 6, 0.2)',
        },
        iconTheme: { primary: '#F85606', secondary: '#FFFFFF' },
      });
      // Update cart count globally
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count } }));
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add to cart', {
        style: {
          background: '#FFFFFF',
          color: '#1F2937',
          border: '1px solid #EF4444',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
        },
        iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
      });
    } finally {
      setLoading(false);
    }
  };

  // -------------- BUY NOW HANDLER --------------
  const handleBuyNow = async (e) => {
    e.stopPropagation();
    if (buyLoading || showAuthModal) return; // Prevent multiple clicks or modal re-trigger
    setBuyLoading(true);
    const user = await checkSession();
    if (!user) {
      setShowAuthModal(true);
      setBuyLoading(false);
      return;
    }
    router.push(`/products/${product._id}`);
    setBuyLoading(false);
  };

  // -------------- PRICE & BADGES --------------
  const displayPrice = parseFloat(product.price || 0);
  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
  const discount =
    originalPrice && displayPrice
      ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
      : product.discount || 0;

  const buttonHover = { scale: 1.05, boxShadow: '0 4px 12px rgba(248, 86, 6, 0.3)' };
  const buttonTap = { scale: 0.95 };

  const getBadge = () => {
    switch (product.type) {
      case 'flashSale':
        return (
          <motion.div
            className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            {discount > 0 ? `${discount}% OFF` : 'Flash Sale'}
          </motion.div>
        );
      case 'recommended':
        return (
          <motion.div
            className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            Recommended
          </motion.div>
        );
      default:
        return null;
    }
  };

  const optimizedImageUrl = product.images?.[0]
    ? `${product.images[0].split('/upload/')[0]}/upload/w_400,h_400,c_fill/${product.images[0].split('/upload/')[1]}`
    : product.imageUrl?.trim()
    ? `${product.imageUrl.split('/upload/')[0]}/upload/w_400,h_400,c_fill/${product.imageUrl.split('/upload/')[1]}`
    : '/placeholder.jpg';

  // -------------- AUTH MODAL --------------
  const AuthModal = () => (
    <AnimatePresence>
      {showAuthModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          key="auth-modal-backdrop"
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl p-6 w-80 text-center relative"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            key="auth-modal-content"
            role="dialog"
            aria-labelledby="auth-modal-title"
            aria-modal="true"
          >
            <motion.button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Close login modal"
            >
              <XCircle className="w-5 h-5" />
            </motion.button>
            <LogIn className="w-12 h-12 text-orange-500 mx-auto mb-3" />
            <h2 id="auth-modal-title" className="text-lg font-bold text-gray-800 mb-2">
              Sign in Required
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Please sign in to continue with this action.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  router.push(`/pages/login?redirect=/products/${product._id}`);
                  setShowAuthModal(false); // Close modal on login redirect
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md"
                whileHover={buttonHover}
                whileTap={buttonTap}
              >
                Go to Login
              </button>
              <motion.button
                onClick={() => setShowAuthModal(false)}
                className="w-full text-gray-600 underline hover:text-orange-600 transition-colors duration-200"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // -------------- FINAL UI --------------
  return (
    <>
      <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} scale={1.03} transitionSpeed={400}>
        <motion.div
          className="relative bg-white rounded-xl shadow-lg overflow-hidden group flex flex-col h-full border border-gray-100 hover:border-orange-300 transition-all duration-300"
          whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(248, 86, 6, 0.15)' }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <Link href={`/products/${product._id}`} className="block flex-grow">
            <div className="relative w-full aspect-square overflow-hidden">
              <Image
                src={optimizedImageUrl}
                alt={product.title || 'Product Image'}
                width={400}
                height={400}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                priority={isSale}
              />
              {getBadge()}
              {product.type === 'flashSale' && product.endDate && (
                <motion.div
                  className="absolute bottom-0 w-full text-white text-center text-xs py-1 font-medium bg-gradient-to-r from-orange-500 to-orange-600"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <CountdownTimer endDate={product.endDate} />
                </motion.div>
              )}
            </div>
            <div className="p-3 flex flex-col flex-grow">
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 leading-tight group-hover:text-orange-600 transition-colors">
                {product.title || 'Unnamed Product'}
              </h3>
              <div className="flex items-baseline gap-1 mb-1">
                <p className="text-orange-600 font-bold text-base">
                  Rs:{displayPrice.toFixed(2)}
                </p>
                {originalPrice && (
                  <p className="text-gray-400 line-through text-xs">
                    Rs:{originalPrice.toFixed(2)}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < (product.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span>({product.reviews || 0} reviews)</span>
                </div>
              </div>
            </div>
          </Link>
          {/* Action Buttons */}
          <div className="p-3 space-y-2 bg-gray-50">
            <motion.button
              onClick={handleAddToCart}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-medium px-2 py-2 rounded-lg flex items-center justify-center gap-1 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
              whileHover={buttonHover}
              whileTap={buttonTap}
            >
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <ShoppingCart className="w-3 h-3" />
              )}
              {loading ? 'Adding...' : 'Add to Cart'}
            </motion.button>
            <motion.button
              onClick={handleBuyNow}
              disabled={buyLoading}
              className="w-full bg-white border-2 border-orange-500 hover:bg-orange-50 text-orange-600 text-xs font-medium px-2 py-2 rounded-lg flex items-center justify-center gap-1 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
              whileHover={buttonHover}
              whileTap={buttonTap}
            >
              {buyLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <ShoppingBag className="w-3 h-3" />
              )}
              {buyLoading ? 'Processing...' : 'Buy Now'}
            </motion.button>
          </div>
        </motion.div>
      </Tilt>
      {/* Auth Modal */}
      <AuthModal />
    </>
  );
}