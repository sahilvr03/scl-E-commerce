'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Sun,
  Moon,
  Home,
  Grid,
  Tag,
  Sparkles,
  LogOut,
  ChevronDown,
  Package,
  LogIn,
  UserPlus,
  Heart,
  Zap,
  Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false); // New state for profile dropdown
  const router = useRouter();
  const dropdownRef = useRef(null); // Ref to track the dropdown

  // Persist dark mode in local storage
  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Fetch session and cart data
  useEffect(() => {
    async function fetchSessionAndData() {
      setError(null);
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
        });
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response from session API');
        }
        const data = await response.json();
        if (response.ok && data.session && data.session.user) {
          setIsLoggedIn(true);
          setUserDetails(data.session.user);
          const cartResponse = await fetch(`/api/cart?userId=${data.session.user.id}`, {
            credentials: 'include',
          });
          const cartContentType = cartResponse.headers.get('content-type');
          if (!cartContentType || !cartContentType.includes('application/json')) {
            throw new Error('Received non-JSON response from cart API');
          }
          const cartData = await cartResponse.json();
          if (cartResponse.ok) {
            const count = cartData.items ? cartData.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
            setCartCount(count);
          } else {
            throw new Error(cartData.error || 'Failed to fetch cart');
          }
        } else {
          setIsLoggedIn(false);
          setUserDetails(null);
          setCartCount(0);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        setError('Failed to fetch session data. Please try again later.');
        toast.error('Invalid session. Please log in.', {
          style: {
            background: '#FFFFFF',
            color: '#1F2937',
            border: '1px solid #F85606',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(248, 86, 6, 0.2)',
          },
          iconTheme: { primary: '#F85606', secondary: '#FFFFFF' },
        });
        router.push('/pages/login');
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
        toast.error('Failed to load categories.', {
          style: {
            background: '#FFFFFF',
            color: '#1F2937',
            border: '1px solid #F85606',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(248, 86, 6, 0.2)',
          },
          iconTheme: { primary: '#F85606', secondary: '#FFFFFF' },
        });
      }
    }

    fetchSessionAndData();

    const handleCartUpdate = (e) => {
      setCartCount(e.detail.count);
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [router]);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {error && (
        <motion.div
          className="bg-red-500 text-white p-4 text-center text-sm font-medium"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.div>
      )}
      <motion.header
        className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 font-poppins"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Navbar */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <motion.button
                className="md:hidden p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-gray-800 transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                <Menu className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </motion.button>
              <Link
                href="/"
                className="text-2xl sm:text-3xl font-extrabold text-orange-600 dark:text-orange-400 tracking-tight flex items-center gap-2"
              >
                <Package className="h-8 w-8" />
                Dropwear
              </Link>
            </div>
            <div className="hidden md:flex flex-grow mx-4">
              <form onSubmit={handleSearch} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for products, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full py-2.5 pl-12 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 shadow-sm"
                  aria-label="Search products"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-600 dark:text-orange-400" />
                {searchQuery && (
                  <motion.button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Clear search"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                )}
              </form>
            </div>
            <div className="flex items-center sm:space-x-3">
              <motion.button
                className="md:hidden p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-gray-800 transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Toggle search"
              >
                <Search className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </motion.button>
              <Link
                href="/pages/orders"
                className="flex items-center p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-gray-800 transition-colors duration-300"
              >
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </motion.div>
                <span className="ml-2 text-sm font-medium hidden lg:inline text-gray-700 dark:text-gray-200">Orders</span>
              </Link>
              {isLoggedIn ? (
                <div className="relative group" onMouseEnter={() => setProfileDropdownOpen(true)} onMouseLeave={() => setProfileDropdownOpen(false)}>
                  <Link
                    href="/account"
                    className="flex items-center p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-gray-800 transition-colors duration-300"
                  >
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <div className="w-7 h-7 rounded-full bg-orange-600 dark:bg-orange-400 flex items-center justify-center text-white font-medium text-sm shadow-sm">
                        {userDetails?.name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                      </div>
                    </motion.div>
                    <span className="ml-2 text-sm font-medium hidden lg:inline text-gray-700 dark:text-gray-200">
                      {userDetails?.name || 'Account'}
                    </span>
                  </Link>
                  <motion.div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-xl rounded-lg py-2 z-60 border border-gray-200 dark:border-gray-700"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: profileDropdownOpen ? 1 : 0, y: profileDropdownOpen ? 0 : -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/wishlist"
                      className="block px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Wishlist
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </motion.div>
                </div>
              ) : (
                <>
                  <Link
                    href="/pages/login"
                    className="flex items-center p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-gray-800 transition-colors duration-300"
                  >
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <LogIn className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </motion.div>
                    <span className="ml-2 text-sm font-medium hidden lg:inline text-gray-700 dark:text-gray-200">Login</span>
                  </Link>
                  <Link
                    href="/pages/signup"
                    className="flex items-center p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-gray-800 transition-colors duration-300"
                  >
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <UserPlus className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </motion.div>
                    <span className="ml-2 text-sm font-medium hidden lg:inline text-gray-700 dark:text-gray-200">Sign Up</span>
                  </Link>
                </>
              )}
              <Link href="/carts" className="relative p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-gray-800 transition-colors duration-300">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <ShoppingCart className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  {cartCount > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm"
                      animate={{ scale: [1, 1.2, 1], transition: { repeat: Infinity, duration: 1.5 } }}
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            </div>
          </div>
          {/* Mobile Search Bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                className="md:hidden mb-4"
                initial={{ opacity: 0, maxHeight: 0 }}
                animate={{ opacity: 1, maxHeight: 100 }}
                exit={{ opacity: 0, maxHeight: 0 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search for products, categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full py-2.5 pl-12 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 shadow-sm"
                    aria-label="Search products"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-600 dark:text-orange-400" />
                  {searchQuery && (
                    <motion.button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Clear search"
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                  )}
                </form>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Secondary Navigation */}
          <div className="hidden md:flex items-center justify-center gap-6 py-2 border-t border-gray-200 dark:border-gray-700">
            <Link href="/" className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200">
              <Home className="h-4 w-4" /> Home
            </Link>
            <Link href="/pages/FlashSalePage" className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200">
              <Zap className="h-4 w-4" /> Flash Sale
            </Link>
            <Link href="/pages/RecommendedPage" className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200">
              <Star className="h-4 w-4" /> Recommended
            </Link>
            <Link href="/pages/ForYouPage" className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200">
              <Heart className="h-4 w-4" /> For You
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200">
                <Grid className="h-4 w-4" /> Categories
                <ChevronDown className="h-4 w-4" />
              </button>
              <motion.div
                className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-xl rounded-lg py-2 z-60 border border-gray-200 dark:border-gray-700 hidden group-hover:block"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: categoryMenuOpen ? 1 : 0, y: categoryMenuOpen ? 0 : -10 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                onMouseEnter={() => setCategoryMenuOpen(true)}
                onMouseLeave={() => setCategoryMenuOpen(false)}
              >
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <Link
                      key={category._id}
                      href={`/pages/CategoryPage/${category._id}`}
                      className="block px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200"
                    >
                      {category.name}
                    </Link>
                  ))
                ) : (
                  <p className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">No categories available</p>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-2xl fixed inset-0 z-70 pt-16 overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="container mx-auto px-4 py-6">
              <motion.button
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-gray-800 transition-colors duration-300"
                onClick={() => setMobileMenuOpen(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close menu"
              >
                <X className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </motion.button>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                    Explore
                  </h3>
                  <nav className="space-y-2">
                    <Link
                      href="/"
                      className="block py-2 px-3 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 flex items-center text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Home className="w-5 h-5 mr-3" /> Home
                    </Link>
                    <Link
                      href="/pages/FlashSalePage"
                      className="block py-2 px-3 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 flex items-center text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Zap className="w-5 h-5 mr-3" /> Flash Sale
                    </Link>
                    <Link
                      href="/pages/RecommendedPage"
                      className="block py-2 px-3 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 flex items-center text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Star className="w-5 h-5 mr-3" /> Recommended
                    </Link>
                    <Link
                      href="/pages/ForYouPage"
                      className="block py-2 px-3 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 flex items-center text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Heart className="w-5 h-5 mr-3" /> For You
                    </Link>
                    <div className="relative">
                      <button
                        className="w-full text-left py-2 px-3 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 flex items-center text-sm"
                        onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                      >
                        <Grid className="w-5 h-5 mr-3" /> Categories
                        <ChevronDown className={`w-5 h-5 ml-auto transition-transform ${categoryMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {categoryMenuOpen && (
                          <motion.div
                            className="pl-6 space-y-1 mt-2"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {categories.length > 0 ? (
                              categories.map((category) => (
                                <Link
                                  key={category._id}
                                  href={`/pages/categoryPage/${category._id}`}
                                  className="block py-2 px-3 rounded-lg text-sm text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {category.name}
                                </Link>
                              ))
                            ) : (
                              <p className="py-2 px-3 text-sm text-gray-500 dark:text-gray-400">No categories available</p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <Link
                      href="/deals"
                      className="block py-2 px-3 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 flex items-center text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Tag className="w-5 h-5 mr-3" /> Deals
                    </Link>
                    <Link
                      href="/new-arrivals"
                      className="block py-2 px-3 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 flex items-center text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Sparkles className="w-5 h-5 mr-3" /> New Arrivals
                    </Link>
                  </nav>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                    My Account
                  </h3>
                  <nav className="space-y-2">
                    {isLoggedIn ? (
                      <>
                        <Link
                          href="/account"
                          className="block py-2 px-3 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 flex items-center text-sm"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <div className="w-5 h-5 rounded-full bg-orange-600 dark:bg-orange-400 flex items-center justify-center text-white text-xs font-medium mr-3">
                            {userDetails?.name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                          </div>
                          Account
                        </Link>
                        <Link
                          href="/wishlist"
                          className="block py-2 px-3 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 flex items-center text-sm"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Heart className="w-5 h-5 mr-3" /> Wishlist
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full text-left py-2 px-3 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 flex items-center text-sm"
                        >
                          <LogOut className="w-5 h-5 mr-3" /> Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/pages/login"
                          className="block py-2 px-3 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 flex items-center text-sm"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <LogIn className="w-5 h-5 mr-3" /> Sign In
                        </Link>
                        <Link
                          href="/pages/signup"
                          className="block py-2 px-3 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 flex items-center text-sm"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <UserPlus className="w-5 h-5 mr-3" /> Sign Up
                        </Link>
                      </>
                    )}
                    <Link
                      href="/orders"
                      className="block py-2 px-3 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 flex items-center text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Package className="w-5 h-5 mr-3" /> My Orders
                    </Link>
                  </nav>
                </div>
                <motion.button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center py-2 px-3 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200 text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isDarkMode ? (
                    <>
                      <Sun className="h-5 w-5 mr-3 text-yellow-400" />
                      Switch to Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5 mr-3 text-orange-600" />
                      Switch to Dark Mode
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}