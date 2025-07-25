'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Home,
  Grid,
  Tag,
  Sparkles,
  LogIn,
  UserPlus,
  Package,
  Heart,
  Zap,
  ChevronRight,
  LogOut,
  ArrowRight,
  Loader2,
  Star,
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import ProductCard from './components/ProductCard';
import CategoryCard from './components/CategoryCard';
import CountdownTimer from './components/CountdownTimer';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const promotions = [
  {
    id: 1,
    title: 'Spectacular Summer Savings: Up To 70% Off!',
    description: 'Unbeatable deals on your favorite brands. Don’t miss out, offers are for a limited time!',
    image: '/ad1.webp',
  },
  {
    id: 2,
    title: 'Anime Collection: New Drops Available Now!',
    description: 'Fresh drop shoulder tees inspired by your favorite anime heroes. Shop now!',
    image: '/ad2.webp',
  },
  {
    id: 3,
    title: 'Flash Sale: 50% Off All Tees!',
    description: 'Only for 48 hours! Grab your style before it’s gone.',
    image: '/ad3.webp',
  },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [flashSaleItems, setFlashSaleItems] = useState([]);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [forYouItems, setForYouItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState({
    flashSales: true,
    recommended: true,
    forYou: true,
    categories: true,
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredRecommended, setFilteredRecommended] = useState([]);
  const router = useRouter();

  const nextSlide = () => setCurrent((prev) => (prev + 1) % promotions.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + promotions.length) % promotions.length);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredRecommended(recommendedItems.filter((product) => product.category === selectedCategory));
    } else {
      setFilteredRecommended(recommendedItems);
    }
  }, [selectedCategory, recommendedItems]);

  useEffect(() => {
    async function fetchData() {
      setError(null);

      // Handle cookie access for token
      let token = null;
      let userId = null;
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [name, value] = cookie.trim().split('=');
          acc[name] = value;
          return acc;
        }, {});
        token = cookies.token || null;
      }

      // Skip session check if on login or signup pages
      if (router.pathname === '/pages/login' || router.pathname === '/pages/signup') {
        setIsLoggedIn(false);
        setUserDetails(null);
        return;
      }

      // Fetch user session
      if (token) {
        try {
          const response = await fetch('/api/auth/session', {
            credentials: 'include',
            headers: { Authorization: `Bearer ${token}` },
          });
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Received non-JSON response from session API');
          }
          const data = await response.json();
          if (response.ok && data.session) {
            userId = data.session.user.id;
            setIsLoggedIn(true);
            setUserDetails(data.session.user);
          } else {
            if (router.pathname !== '/pages/login') {
              toast.error('Please log in to continue');
              router.push('/pages/login');
            }
            setIsLoggedIn(false);
            setUserDetails(null);
            return;
          }
        } catch (error) {
          console.error('Error fetching session:', error);
          setError('Failed to fetch session data. Please try again later.');
          if (router.pathname !== '/pages/login') {
            toast.error('Invalid session. Please log in.');
            router.push('/pages/login');
          }
          setIsLoggedIn(false);
          setUserDetails(null);
          return;
        }
      } else {
        setCartCount(0);
        setIsLoggedIn(false);
        setUserDetails(null);
      }

      // Fetch cart count
      if (userId) {
        try {
          const response = await fetch(`/api/cart?userId=${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Received non-JSON response from cart API');
          }
          const data = await response.json();
          if (response.ok) {
            const count = data.items ? data.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
            setCartCount(count);
          } else if (response.status === 401) {
            if (router.pathname !== '/pages/login') {
              toast.error('Please log in to view your cart');
              router.push('/pages/login');
            }
            setCartCount(0);
          } else {
            throw new Error(data.error || 'Failed to fetch cart');
          }
        } catch (error) {
          console.error('Error fetching cart count:', error);
          setError('Failed to load cart data. Please try again later.');
          toast.error('Failed to load cart data');
          setCartCount(0);
        }
      }

      // Fetch Flash Sale items
      try {
        const response = await fetch('/api/products?type=flashSale');
        const data = await response.json();
        if (response.ok) {
          const now = new Date();
          const activeFlashSales = data
            .filter((sale) => {
              const endDate = new Date(sale.endDate);
              return !isNaN(endDate.getTime()) && endDate > now;
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 20);
          setFlashSaleItems(activeFlashSales);
        } else {
          throw new Error(data.error || 'Failed to fetch Flash Sale products');
        }
      } catch (error) {
        console.error('Error fetching Flash Sale products:', error);
        setError('Failed to load Flash Sale products. Please try again later.');
        toast.error('Failed to load Flash Sale products');
      } finally {
        setLoading((prev) => ({ ...prev, flashSales: false }));
      }

      // Fetch Recommended items
      try {
        const response = await fetch('/api/products?type=recommended');
        const data = await response.json();
        if (response.ok) {
          setRecommendedItems(data.slice(0, 20));
        } else {
          throw new Error(data.error || 'Failed to fetch Recommended products');
        }
      } catch (error) {
        console.error('Error fetching Recommended products:', error);
        setError('Failed to load Recommended products. Please try again later.');
        toast.error('Failed to load Recommended products');
      } finally {
        setLoading((prev) => ({ ...prev, recommended: false }));
      }

      // Fetch For You items
      try {
        const response = await fetch('/api/products?type=forYou');
        const data = await response.json();
        if (response.ok) {
          setForYouItems(data.slice(0, 20));
        } else {
          throw new Error(data.error || 'Failed to fetch For You products');
        }
      } catch (error) {
        console.error('Error fetching For You products:', error);
        setError('Failed to load For You products. Please try again later.');
        toast.error('Failed to load For You products');
      } finally {
        setLoading((prev) => ({ ...prev, forYou: false }));
      }

      // Fetch categories
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (response.ok) {
          setCategories(data);
        } else {
          throw new Error(data.error || 'Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please try again later.');
        toast.error('Failed to load categories');
      } finally {
        setLoading((prev) => ({ ...prev, categories: false }));
      }
    }

    fetchData();

    // Handle cart update event listener
    if (typeof window !== 'undefined') {
      const handleCartUpdate = (e) => {
        setCartCount(e.detail.count);
      };
      window.addEventListener('cartUpdated', handleCartUpdate);
      return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (response.ok) {
        toast.success('Logged out successfully!', {
          style: {
            background: '#FFFFFF',
            color: '#1F2937',
            border: '1px solid #F85606',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(248, 86, 6, 0.2)',
          },
          iconTheme: { primary: '#F85606', secondary: '#FFFFFF' },
        });
        setIsLoggedIn(false);
        setUserDetails(null);
        setCartCount(0);
        if (typeof document !== 'undefined') {
          document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
        }
        router.push('/pages/login');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Logout failed.', {
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
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('An error occurred during logout.', {
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

  return (
    <div className="min-h-screen font-poppins bg-white text-gray-800">
      <Toaster position="top-center" />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        {/* Hero Carousel */}
        <div className="relative w-full h-64 sm:h-80 md:h-[28rem] rounded-2xl overflow-hidden shadow-xl border border-gray-200 mb-8 group">
          <AnimatePresence mode="wait">
            <motion.div
              key={promotions[current].id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${promotions[current].image})` }}
            >
              <div className="w-full h-full bg-gradient-to-r from-black/70 via-black/50 to-transparent flex items-center px-6 sm:px-12">
                <div className="max-w-xl space-y-5">
                  <motion.h1
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl sm:text-4xl font-bold text-white drop-shadow-md"
                  >
                    {promotions[current].title}
                  </motion.h1>
                  <motion.p
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/90 text-sm sm:text-lg leading-relaxed"
                  >
                    {promotions[current].description}
                  </motion.p>
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Link href="/products">
                      <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 shadow-md flex items-center">
                        Shop Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <motion.button
            onClick={prevSlide}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiChevronLeft size={22} />
          </motion.button>
          <motion.button
            onClick={nextSlide}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiChevronRight size={22} />
          </motion.button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {promotions.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  current === idx ? 'bg-orange-500 w-6' : 'bg-white/40 w-2.5'
                }`}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
        </div>

        {/* Flash Sale Section */}
        <section className="mb-12 bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="bg-orange-100 p-2 rounded-lg mr-4">
                <Zap className="h-6 w-6 text-orange-600" fill="currentColor" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Flash Sale</h2>
                {flashSaleItems.length > 0 && (
                  <CountdownTimer
                    endDate={flashSaleItems[0].endDate}
                    className="text-sm text-gray-600"
                  />
                )}
              </div>
            </div>
            <Link
              href="/pages/flashSalesUsers"
              className="bg-white hover:bg-gray-50 text-orange-600 px-4 py-2 rounded-lg flex items-center text-sm font-medium shadow-sm"
            >
              View all <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          {loading.flashSales ? (
            <div className="flex justify-center items-center h-40">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              >
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
              </motion.div>
            </div>
          ) : error && flashSaleItems.length === 0 ? (
            <motion.div
              className="text-center py-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 300 }}
            >
              <p className="text-lg text-gray-600 mb-4">{error}</p>
            </motion.div>
          ) : flashSaleItems.length === 0 ? (
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
              <p className="text-lg text-gray-600 mb-4">No active Flash Sales available.</p>
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
              {flashSaleItems.map((sale) => (
                <motion.div key={sale._id} variants={itemVariants}>
                  <ProductCard product={sale} isSale={true} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Recommended Section */}
        <section className="mb-12 bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="bg-green-100 p-2 rounded-lg mr-4">
                <Star className="h-6 w-6 text-green-600" fill="currentColor" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {selectedCategory ? `${selectedCategory} Products` : 'Recommended For You'}
              </h2>
            </div>
            <Link
              href="/pages/recommended"
              className="bg-white hover:bg-gray-50 text-orange-600 px-4 py-2 rounded-lg flex items-center text-sm font-medium shadow-sm"
            >
              View all <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          {/* <CategoryCard categories={categories} onCategoryChange={setSelectedCategory} /> */}
          {loading.recommended ? (
            <div className="flex justify-center items-center h-40">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              >
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
              </motion.div>
            </div>
          ) : error && recommendedItems.length === 0 ? (
            <motion.div
              className="text-center py-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 300 }}
            >
              <p className="text-lg text-gray-600 mb-4">{error}</p>
            </motion.div>
          ) : recommendedItems.length === 0 ? (
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
              <p className="text-lg text-gray-600 mb-4">No recommended products available.</p>
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
              {filteredRecommended.map((product) => (
                <motion.div key={product._id} variants={itemVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* For You Section */}
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
          {loading.forYou ? (
            <div className="flex justify-center items-center h-40">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              >
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
              </motion.div>
            </div>
          ) : error && forYouItems.length === 0 ? (
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
      </main>
    </div>
  );
}