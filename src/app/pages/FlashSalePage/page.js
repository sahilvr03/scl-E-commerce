'use client';
import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/ProductCard';
import { Loader2, Zap, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function FlashSalePage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/products?type=flashSale');
        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Received non-JSON response from server');
          }
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch Flash Sale products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching Flash Sale products:', error);
        toast.error(error.message || 'Failed to load Flash Sale products', {
          style: {
            background: '#FFFFFF',
            color: '#1F2937',
            border: '1px solid #F85606',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(248, 86, 6, 0.2)',
          },
          iconTheme: { primary: '#F85606', secondary: '#FFFFFF' },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 20 } },
  };

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

  return (
    <div className="bg-white min-h-screen font-poppins">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
        {/* Header */}
        <motion.header
          className="sticky top-0 z-20  text-gray-800 shadow-sm py-4 mb-8 rounded-b-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 300 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
                <Zap className="w-8 h-8 mr-2" />
                Flash Sale
              </h1>
              <motion.span
                className="text-xs font-medium bg-white text-orange-600 px-2 py-1 rounded-full"
                animate={{ scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1.5 } }}
              >
                Limited Time Offer
              </motion.span>
            </div>
            <motion.button
              className="flex items-center gap-2 text-white hover:text-orange-200 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
          
            </motion.button>
          </div>
        </motion.header>

        {/* Products Grid or No Products */}
        {products.length === 0 ? (
          <motion.div
            className="text-center py-16 bg-gradient-to-b from-orange-50 to-orange-100 rounded-xl border border-orange-200"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 300 }}
          >
            <svg
              className="w-16 h-16 mx-auto text-orange-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-lg text-gray-600 mb-6">No Flash Sale products available.</p>
            <Link href="/products">
              <motion.button
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md"
                whileHover={{ scale: 1.05, boxShadow: '0 4px 12px rgba(248, 86, 6, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                animate={{ scale: [1, 1.03, 1], transition: { repeat: Infinity, duration: 1.5 } }}
              >
                Explore All Products
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {products.map((product) => (
              <motion.div key={product._id} variants={itemVariants}>
                <ProductCard product={product} isSale={true} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}