"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ChevronRight, Loader2 } from 'lucide-react';
import ProductCard from './ProductCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 20 } },
};

export default function ForYouSection({ forYouItems, error }) {
  return (
    <section className="mb-12 bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="bg-blue-100 p-2 rounded-lg mr-4">
            <Heart className="h-6 w-6 text-blue-600" fill="currentColor" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">For You</h2>
        </div>
        <Link
          href="/pages/forYou"
          className="bg-white hover:bg-gray-50 text-orange-600 px-4 py-2 rounded-lg flex items-center text-sm font-medium shadow-sm"
        >
          View all <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
      {error && forYouItems.length === 0 ? (
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 300 }}
        >
          <p className="text-lg text-gray-600 mb-4">{error}</p>
        </motion.div>
      ) : forYouItems.length === 0 ? (
        <motion.div
          className="text-center py-8"
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
          <p className="text-lg text-gray-600 mb-4">No products available for you.</p>
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
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {forYouItems.map((product) => (
            <motion.div key={product._id} variants={itemVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}