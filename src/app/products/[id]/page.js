'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Star, ShoppingCart, ChevronLeft, Heart, ShieldCheck, Loader2, Package, Tag, Scale, Info, ShoppingBag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import ProductCard from './../../components/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/product/${params.id}`, { credentials: 'include' });
        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Received non-JSON response from server');
          }
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error(error.message || 'Failed to load product', {
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
        setIsLoading(false);
      }
    };

    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch(`/api/products?category=${encodeURIComponent(product?.category || 'Electronics')}&limit=4`, {
          credentials: 'include',
        });
        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Received non-JSON response from server');
          }
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch related products');
        }
        const data = await response.json();
        setRelatedProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching related products:', error);
        toast.error('Failed to load related products', {
          style: {
            background: '#FFFFFF',
            color: '#1F2937',
            border: '1px solid #EF4444',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
          },
          iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
        });
      }
    };

    if (params.id) {
      fetchProduct();
    }
    if (product?.category) {
      fetchRelatedProducts();
    }
  }, [params.id, product?.category]);

  const handleAddToCart = async () => {
    if (!product?.inStock) {
      toast.error('Product is out of stock', {
        style: {
          background: '#FFFFFF',
          color: '#1F2937',
          border: '1px solid #EF4444',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
        },
        iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: params.id,
          quantity,
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

      toast.success('Product added to cart!', {
        style: {
          background: '#FFFFFF',
          color: '#1F2937',
          border: '1px solid #F85606',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(248, 86, 6, 0.2)',
        },
        iconTheme: { primary: '#F85606', secondary: '#FFFFFF' },
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: quantity } }));
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
      setIsSubmitting(false);
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', {
      style: {
        background: '#FFFFFF',
        color: '#1F2937',
        border: '1px solid #F85606',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(248, 86, 6, 0.2)',
      },
      iconTheme: { primary: '#F85606', secondary: '#FFFFFF' },
    });
  };

  const handleBuyNow = () => {
    if (!product?.inStock) {
      toast.error('Product is out of stock', {
        style: {
          background: '#FFFFFF',
          color: '#1F2937',
          border: '1px solid #EF4444',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
        },
        iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
      });
      return;
    }
    setIsModalOpen(true);
  };

  const handlePaymentMethod = (method) => {
    setPaymentMethod(method);
    if (method === 'online') {
      toast.success('Redirecting to payment gateway...', {
        style: {
          background: '#FFFFFF',
          color: '#1F2937',
          border: '1px solid #F85606',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(248, 86, 6, 0.2)',
        },
        iconTheme: { primary: '#F85606', secondary: '#FFFFFF' },
      });
      setIsModalOpen(false);
    }
  };

  const handleOrderDetailsChange = (e) => {
    setOrderDetails({ ...orderDetails, [e.target.name]: e.target.value });
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!orderDetails.name || !orderDetails.city || !orderDetails.address || !orderDetails.town || !orderDetails.phone) {
      toast.error('Please fill all required fields', {
        style: {
          background: '#FFFFFF',
          color: '#1F2937',
          border: '1px solid #EF4444',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
        },
        iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: params.id,
          quantity,
          paymentMethod,
          shippingDetails: orderDetails,
          status: 'Pending',
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response from orders API');
        }
        const data = await response.json();
        throw new Error(data.message || 'Failed to place order');
      }

      toast.success('Order placed successfully!', {
        style: {
          background: '#FFFFFF',
          color: '#1F2937',
          border: '1px solid #F85606',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(248, 86, 6, 0.2)',
        },
        iconTheme: { primary: '#F85606', secondary: '#FFFFFF' },
      });
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
      toast.error(error.message || 'Failed to place order', {
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
      setIsSubmitting(false);
    }
  };

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: 20 },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  const buttonHover = { scale: 1.05, boxShadow: '0 4px 12px rgba(248, 86, 6, 0.3)' };
  const buttonTap = { scale: 0.95 };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
        </motion.div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.p
          className="text-lg text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Failed to load product
        </motion.p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-poppins">
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6 max-w-7xl">
        {/* Breadcrumb */}
        <motion.nav
          className="flex mb-4 text-xs sm:text-sm text-gray-600"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
        >
          <ol className="flex flex-wrap items-center space-x-1 sm:space-x-2">
            <li>
              <Link href="/" className="hover:text-orange-600 transition-colors duration-200">
                Home
              </Link>
            </li>
            <li><ChevronLeft className="w-3 h-3 sm:w-4 h-4 text-gray-400" /></li>
            <li>
              <Link href="/products" className="hover:text-orange-600 transition-colors duration-200">
                Products
              </Link>
            </li>
            <li><ChevronLeft className="w-3 h-3 sm:w-4 h-4 text-gray-400" /></li>
            <li className="text-gray-900 font-medium truncate max-w-xs">{product.title}</li>
          </ol>
        </motion.nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Product Images */}
          <motion.div
            className="space-y-2"
            initial="hidden"
            animate="visible"
            variants={variants}
          >
            <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} scale={1.02} transitionSpeed={500}>
              <motion.div
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
                variants={imageVariants}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={(product.images?.[selectedImage] || product.imageUrl || '').trim() || '/placeholder.jpg'}
                      alt={product.title || 'Product Image'}
                      width={300}
                      height={300}
                      className="object-cover w-full aspect-square rounded-xl"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </Tilt>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 sm:gap-2">
                {product.images.map((img, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === index ? 'border-orange-500' : 'border-gray-200 hover:border-orange-300'
                    }`}
                    whileHover={{ scale: 1.1, boxShadow: '0 2px 8px rgba(248, 86, 6, 0.2)' }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Image
                      src={img}
                      alt={`${product.title} thumbnail ${index + 1}`}
                      width={60}
                      height={60}
                      className="object-cover w-full aspect-square"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
          >
            <div className="flex justify-between items-start">
              <div>
                <motion.h1
                  className="text-xl sm:text-2xl font-bold text-gray-900"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {product.title || 'Unnamed Product'}
                </motion.h1>
                <motion.p
                  className="text-xs sm:text-sm text-gray-500 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  SKU: {product.sku || 'N/A'}
                </motion.p>
              </div>
              <motion.button
                onClick={toggleWishlist}
                className={`p-2 rounded-full ${
                  isWishlisted ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'
                } transition-colors duration-200`}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                whileHover={{ scale: 1.2, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart className="w-5 h-5 sm:w-6 h-6" fill={isWishlisted ? 'currentColor' : 'none'} />
              </motion.button>
            </div>

            <motion.div
              className="flex items-center space-x-2 sm:space-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 sm:w-5 h-5 ${i < (product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill={i < (product.rating || 0) ? 'currentColor' : 'none'}
                  />
                ))}
                <span className="ml-1 text-xs sm:text-sm text-gray-600">({product.reviews || 0} reviews)</span>
              </div>
              <motion.span
                className={`text-xs sm:text-sm px-2 py-1 rounded-full font-medium ${
                  product.inStock
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </motion.span>
            </motion.div>

            <motion.div
              className="space-y-1 sm:space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center space-x-2 sm:space-x-4">
                <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                  ${parseFloat(product.price || 0).toFixed(2)}
                </p>
                {product.originalPrice && (
                  <p className="text-sm sm:text-lg text-gray-500 line-through">
                    ${parseFloat(product.originalPrice).toFixed(2)}
                  </p>
                )}
                {product.discount && (
                  <motion.span
                    className="text-xs sm:text-sm bg-orange-500 text-white px-2 py-1 rounded-full font-medium"
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: 2, duration: 0.6, times: [0, 0.3, 0.6, 1] }}
                  >
                    {product.discount}% OFF
                  </motion.span>
                )}
              </div>
            </motion.div>

            <motion.p
              className="text-gray-700 text-sm sm:text-base leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {product.description || 'No description available.'}
            </motion.p>

            <motion.div
              className="border-t border-b border-gray-200 py-2 sm:py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <label className="text-sm sm:text-base font-medium text-gray-700">Quantity:</label>
                <motion.div
                  className="flex items-center border border-gray-300 rounded-lg overflow-hidden"
                  whileHover={{ boxShadow: '0 0 12px rgba(248, 86, 6, 0.3)' }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-2 sm:px-4 py-1 sm:py-2 bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600 transition-colors duration-200"
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                    disabled={isSubmitting}
                  >
                    -
                  </motion.button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-12 sm:w-16 px-2 py-1 sm:py-2 text-center bg-white text-gray-900 border-x border-gray-300"
                    disabled={isSubmitting}
                  />
                  <motion.button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-2 sm:px-4 py-1 sm:py-2 bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600 transition-colors duration-200"
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                    disabled={isSubmitting}
                  >
                    +
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="space-y-2 sm:space-y-3 sticky top-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              <motion.button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                whileHover={buttonHover}
                whileTap={buttonTap}
                disabled={isSubmitting || !product.inStock}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 sm:w-5 h-5 mr-1 sm:mr-2 animate-spin" />
                ) : (
                  <ShoppingCart className="w-4 h-4 sm:w-5 h-5 mr-1 sm:mr-2" />
                )}
                {isSubmitting ? 'Adding...' : 'Add to Cart'}
              </motion.button>
              <motion.button
                onClick={handleBuyNow}
                className="w-full flex items-center justify-center bg-white border-2 border-orange-500 hover:bg-orange-50 text-orange-600 font-medium px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                whileHover={buttonHover}
                whileTap={{ scale: 0.95 }}
                disabled={isSubmitting || !product.inStock}
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 h-5 mr-1 sm:mr-2" />
                Buy Now
              </motion.button>
            </motion.div>

            <motion.div
              className="bg-gray-50 p-2 sm:p-4 rounded-lg border border-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <div className="flex items-center space-x-2 sm:space-x-3 text-sm sm:text-base text-gray-600">
                <ShieldCheck className="w-4 h-4 sm:w-5 h-5 text-orange-500" />
                <span>30-day money back guarantee</ span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Product Details Section */}
        <motion.div
          className="mt-6 sm:mt-12 bg-white rounded-xl shadow-md p-2 sm:p-6 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, type: 'spring', stiffness: 300 }}
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 sm:w-6 h-6 mr-1 sm:mr-2 text-orange-500" />
            Product Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6">
            <div className="space-y-2">
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ x: 5, boxShadow: '0 2px 8px rgba(248, 86, 6, 0.1)' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Tag className="w-4 h-4 sm:w-5 h-5 text-orange-500" />
                <div>
                  <h3 className="font-medium text-gray-700 text-sm sm:text-base">Brand</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">{product.brand || 'N/A'}</p>
                </div>
              </motion.div>
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ x: 5, boxShadow: '0 2px 8px rgba(248, 86, 6, 0.1)' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Scale className="w-4 h-4 sm:w-5 h-5 text-orange-500" />
                <div>
                  <h3 className="font-medium text-gray-700 text-sm sm:text-base">Weight</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">{product.weight || 'N/A'}</p>
                </div>
              </motion.div>
            </div>
            <div className="space-y-2">
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ x: 5, boxShadow: '0 2px 8px rgba(248, 86, 6, 0.1)' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Info className="w-4 h-4 sm:w-5 h-5 text-orange-500" />
                <div>
                  <h3 className="font-medium text-gray-700 text-sm sm:text-base">Details</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">{product.details || 'No additional details available.'}</p>
                </div>
              </motion.div>
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ x: 5, boxShadow: '0 2px 8px rgba(248, 86, 6, 0.1)' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Tag className="w-4 h-4 sm:w-5 h-5 text-orange-500" />
                <div>
                  <h3 className="font-medium text-gray-700 text-sm sm:text-base">Category</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">{product.category || 'General'}</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            className="mt-6 sm:mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, type: 'spring', stiffness: 300 }}
          >
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct._id} product={relatedProduct} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Modal for Buy Now */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl p-4 w-full max-w-md mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Choose Payment Method</h2>
                  <motion.button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-600 hover:text-orange-600"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={isSubmitting}
                  >
                    <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
                {!paymentMethod ? (
                  <div className="space-y-2">
                    <motion.button
                      onClick={() => handlePaymentMethod('cod')}
                      className="w-full bg-orange-500 text-white py-2 sm:py-3 rounded-lg hover:bg-orange-600 transition-colors duration-200 shadow-md disabled:opacity-50"
                      whileHover={buttonHover}
                      whileTap={buttonTap}
                      disabled={isSubmitting}
                    >
                      Cash on Delivery
                    </motion.button>
                    <motion.button
                      onClick={() => handlePaymentMethod('online')}
                      className="w-full bg-white border-2 border-orange-500 text-orange-600 py-2 sm:py-3 rounded-lg hover:bg-orange-50 transition-colors duration-200 shadow-md disabled:opacity-50"
                      whileHover={buttonHover}
                      whileTap={buttonTap}
                      disabled={isSubmitting}
                    >
                      Online Payment
                    </motion.button>
                    <motion.button
                      onClick={() => setIsModalOpen(false)}
                      className="w-full text-gray-600 underline hover:text-orange-600 transition-colors duration-200"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </motion.button>
                  </div>
                ) : paymentMethod === 'cod' ? (
                  <form onSubmit={handleOrderSubmit} className="space-y-2">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={orderDetails.name}
                        onChange={handleOrderDetailsChange}
                        required
                        className="w-full px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={orderDetails.city}
                        onChange={handleOrderDetailsChange}
                        required
                        className="w-full px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={orderDetails.address}
                        onChange={handleOrderDetailsChange}
                        required
                        className="w-full px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Town *</label>
                      <input
                        type="text"
                        name="town"
                        value={orderDetails.town}
                        onChange={handleOrderDetailsChange}
                        required
                        className="w-full px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={orderDetails.phone}
                        onChange={handleOrderDetailsChange}
                        required
                        className="w-full px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Alternative Phone Number</label>
                      <input
                        type="tel"
                        name="altPhone"
                        value={orderDetails.altPhone}
                        onChange={handleOrderDetailsChange}
                        className="w-full px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                        disabled={isSubmitting}
                      />
                    </div>
                    <motion.button
                      type="submit"
                      className="w-full bg-orange-500 text-white py-2 sm:py-3 rounded-lg hover:bg-orange-600 transition-colors duration-200 shadow-md disabled:opacity-50"
                      whileHover={buttonHover}
                      whileTap={buttonTap}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 sm:w-5 h-5 inline-block mr-2 animate-spin" />
                      ) : null}
                      {isSubmitting ? 'Placing Order...' : 'Place Order'}
                    </motion.button>
                    <motion.button
                      onClick={() => setPaymentMethod(null)}
                      className="w-full text-gray-600 underline hover:text-orange-600 transition-colors duration-200"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isSubmitting}
                    >
                      Back
                    </motion.button>
                  </form>
                ) : null}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}