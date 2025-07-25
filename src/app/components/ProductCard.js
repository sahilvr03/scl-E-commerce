'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ShoppingCart, Star, Loader2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import CountdownTimer from './CountdownTimer';

export default function ProductCard({ product, isSale = false }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response from cart API');
        }
        const data = await response.json();
        throw new Error(data.message || 'Failed to add to cart');
      }

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

      // Dispatch custom event for cart update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: 1 } }));
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
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

  const handleBuyNow = (e) => {
    e.stopPropagation();
    // Redirect to product detail page for "Buy Now" flow
    router.push(`/products/${product._id}`);
  };

  const displayPrice = parseFloat(product.price || 0);
  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
  const discount = (originalPrice && displayPrice)
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : product.discount || 0;

  const buttonHover = { scale: 1.05, boxShadow: '0 4px 12px rgba(248, 86, 6, 0.3)' };
  const buttonTap = { scale: 0.95 };

  const getBadge = () => {
    switch (product.type) {
      case 'forYou':
        return (
          <motion.div
            className="absolute top-2 left-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            For You
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
      default:
        return null;
    }
  };

  const optimizedImageUrl = product.images?.[0]
    ? `${product.images[0].split('/upload/')[0]}/upload/w_300,h_300,c_fill/${product.images[0].split('/upload/')[1]}`
    : product.imageUrl && product.imageUrl.trim() !== ''
    ? `${product.imageUrl.split('/upload/')[0]}/upload/w_300,h_300,c_fill/${product.imageUrl.split('/upload/')[1]}`
    : '/placeholder.jpg';

  return (
    <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.05} transitionSpeed={500}>
      <motion.div
        className="relative bg-white rounded-xl shadow-md overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-2 flex flex-col h-full"
        whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(248, 86, 6, 0.2)' }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <Link href={`/products/${product._id}`} className="block flex-grow">
          <div className="relative w-full aspect-square overflow-hidden">
            {optimizedImageUrl && (
              <Image
                src={optimizedImageUrl}
                alt={product.title || 'Product Image'}
                width={300}
                height={300}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                priority={isSale}
              />
            )}
            <motion.div
              className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            />
            {getBadge()}
            {product.type === 'flashSale' && product.endDate && (
              <motion.div
                className="absolute bottom-0 w-full text-white text-center text-xs py-1 font-medium"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <CountdownTimer endDate={product.endDate} />
              </motion.div>
            )}
          </div>
          <div className="p-2 flex flex-col flex-grow">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 leading-tight">
              {product.title || 'Unnamed Product'}
            </h3>
            <div className="flex items-baseline gap-1 mb-1">
              <p className="text-orange-600 font-bold text-base">Rs:{displayPrice.toFixed(2)}</p>
              {originalPrice && (
                <p className="text-gray-500 line-through text-xs">Rs:{originalPrice.toFixed(2)}</p>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < (product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
                <span>({product.reviews || 0} reviews)</span>
              </div>
            </div>
          </div>
        </Link>
        <div className="p-2 space-y-2">
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
            disabled={loading}

            className="w-full bg-white border-2 border-orange-500 hover:bg-orange-50 text-orange-600 text-xs font-medium px-2 py-2 rounded-lg flex items-center justify-center gap-1 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
            whileHover={buttonHover}
            whileTap={buttonTap}
          >
            <ShoppingBag className="w-3 h-3" />
            Buy Now
          </motion.button>
        </div>
      </motion.div>
    </Tilt>
  );
}