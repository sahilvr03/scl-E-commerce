'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Star, ShoppingCart, ChevronLeft, Heart, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const ProductCard = ({ product }) => {
  const optimizedImageUrl = product.imageUrl
    ? `${product.imageUrl.split('/upload/')[0]}/upload/w_300,h_300,c_fill/${product.imageUrl.split('/upload/')[1]}`
    : '/placeholder.jpg';

  return (
    <Link href={`/products/${product._id}`} className="group">
      <motion.div 
        className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden h-full flex flex-col"
        whileHover={{ y: -5, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div className="relative aspect-square bg-gray-50 dark:bg-gray-700 overflow-hidden">
          <Image
            width={300}
            height={300}
            src={optimizedImageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
            priority
          />
          {product.discount && (
            <motion.span 
              className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              -{product.discount}% OFF
            </motion.span>
          )}
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2 line-clamp-2 leading-tight">
            {product.title}
          </h3>
          <div className="mt-auto">
            <div className="flex items-baseline space-x-2 mb-2">
              <p className="text-lg font-semibold text-teal-600 dark:text-teal-400">
                ${product.price}
              </p>
              {product.originalPrice && (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  ${product.originalPrice}
                </p>
              )}
            </div>
            <div className="flex items-center">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                ({product.reviews} reviews)
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/product/${params.id}`);
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
        toast.error(error.message || 'Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch('/api/products?category=Electronics&limit=4');
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
        toast.error('Failed to load related products');
      }
    };

    if (params.id) {
      fetchProduct();
      fetchRelatedProducts();
    }
  }, [params.id]);

  const handleAddToCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'mock-user-id-123',
          productId: params.id,
          quantity,
        }),
      });
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response from cart API');
        }
        const data = await response.json();
        throw new Error(data.error || 'Failed to add to cart');
      }
      toast.success('Product added to cart!');
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: quantity } }));
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Something went wrong!');
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0 }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
  };

  const buttonHover = {
    scale: 1.03,
    transition: { duration: 0.2 }
  };

  const buttonTap = {
    scale: 0.98
  };

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
      </motion.div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <p className="text-lg text-gray-600 dark:text-gray-400">Failed to load product</p>
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="flex space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/" className="hover:text-teal-600 dark:hover:text-teal-400 transition">Home</Link></li>
              <li><span>/</span></li>
              <li><Link href="/products" className="hover:text-teal-600 dark:hover:text-teal-400 transition">Products</Link></li>
              <li><span>/</span></li>
              <li className="text-gray-700 dark:text-gray-200 font-medium">{product.title}</li>
            </ol>
          </nav>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <motion.div 
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={variants}
          >
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700"
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
                    src={product.images ? product.images[selectedImage] : product.imageUrl || '/placeholder.jpg'}
                    alt={product.title}
                    width={600}
                    height={600}
                    className="object-cover w-full aspect-square"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-teal-500' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image
                      src={img}
                      alt={`${product.title} thumbnail ${index + 1}`}
                      width={100}
                      height={100}
                      className="object-cover w-full aspect-square"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex justify-between items-start">
              <div>
                <motion.h1 
                  className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {product.title}
                </motion.h1>
                <motion.p 
                  className="text-sm text-gray-500 dark:text-gray-400 mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  SKU: {product.sku || 'N/A'}
                </motion.p>
              </div>
              <motion.button
                onClick={toggleWishlist}
                className={`p-2 rounded-full ${isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'} transition-colors`}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart className="w-6 h-6" fill={isWishlisted ? 'currentColor' : 'none'} />
              </motion.button>
            </div>

            <motion.div 
              className="flex items-center mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center mr-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < product.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                    fill={i < product.rating ? 'currentColor' : 'none'}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">({product.reviews} reviews)</span>
              </div>
              <motion.span 
                className="text-sm bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 px-2 py-1 rounded-md"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </motion.span>
            </motion.div>

            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center space-x-4">
                <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                  ${product.price}
                </p>
                {product.originalPrice && (
                  <p className="text-lg text-gray-500 dark:text-gray-400 line-through">
                    ${product.originalPrice}
                  </p>
                )}
                {product.discount && (
                  <motion.span 
                    className="text-sm bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-md font-medium"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      repeat: 1,
                      duration: 0.6,
                      times: [0, 0.3, 0.6, 1]
                    }}
                  >
                    {product.discount}% OFF
                  </motion.span>
                )}
              </div>
            </motion.div>

            <motion.p 
              className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {product.description}
            </motion.p>

            <motion.div 
              className="border-t border-b border-gray-200 dark:border-gray-700 py-4 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <div className="flex items-center space-x-3">
                <label className="text-base font-medium text-gray-700 dark:text-gray-300">Quantity:</label>
                <motion.div 
                  className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
                  whileHover={{ boxShadow: "0 0 8px rgba(13, 148, 136, 0.3)" }}
                >
                  <motion.button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                  >
                    -
                  </motion.button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-16 px-3 py-2 text-center bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-x border-gray-300 dark:border-gray-600"
                  />
                  <motion.button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                  >
                    +
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>

            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              <motion.button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-medium px-6 py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-teal-500/20"
                whileHover={buttonHover}
                whileTap={buttonTap}
              >
                <ShoppingCart className="w-5 h-5 mr-3" />
                Add to Cart
              </motion.button>

              <motion.button
                className="w-full flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium px-6 py-4 rounded-lg transition-colors duration-300"
                whileHover={buttonHover}
                whileTap={buttonTap}
              >
                Buy Now
              </motion.button>
            </motion.div>

            <motion.div 
              className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                <ShieldCheck className="w-5 h-5 text-teal-500" />
                <span>30-day money back guarantee</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Additional product details section */}
        <motion.div 
          className="mt-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <motion.div
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Brand</h3>
                <p className="text-gray-600 dark:text-gray-400">{product.brand || 'N/A'}</p>
              </motion.div>
              <motion.div
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Category</h3>
                <p className="text-gray-600 dark:text-gray-400">{product.category || 'General'}</p>
              </motion.div>
            </div>
            <div className="space-y-4">
              <motion.div
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Weight</h3>
                <p className="text-gray-600 dark:text-gray-400">{product.weight || 'N/A'}</p>
              </motion.div>
              <motion.div
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Dimensions</h3>
                <p className="text-gray-600 dark:text-gray-400">{product.dimensions || 'N/A'}</p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div 
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Electronics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct._id} product={relatedProduct} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}