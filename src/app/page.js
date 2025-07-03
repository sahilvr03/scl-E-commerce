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
    title: "Spectacular Summer Savings: Up To 70% Off!",
    description:
      "Unbeatable deals on your favorite brands. Don’t miss out, offers are for a limited time!",
    image: "/ad1.webp",
  },
  {
    id: 2,
    title: "Anime Collection: New Drops Available Now!",
    description:
      "Fresh drop shoulder tees inspired by your favorite anime heroes. Shop now!",
    image: "/ad2.webp",
  },
  {
    id: 3,
    title: "Flash Sale: 50% Off All Tees!",
    description: "Only for 48 hours! Grab your style before it’s gone.",
    image: "/ad3.webp",
  },
];

function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [flashSaleItems, setFlashSaleItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [justForYouProducts, setJustForYouProducts] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loadingFlashSales, setLoadingFlashSales] = useState(true);
  const router = useRouter();

  const getTokenFromCookies = () => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {});
    return cookies.token || null;
  };

  const nextSlide = () => setCurrent((prev) => (prev + 1) % promotions.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + promotions.length) % promotions.length);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchData() {
      setError(null);
      if (router.pathname === '/pages/login' || router.pathname === '/pages/signup') {
        setIsLoggedIn(false);
        setUserDetails(null);
        return;
      }

      const token = getTokenFromCookies();
      console.log('Token from cookies:', token);
      let userId = null;

      if (token) {
        try {
          const response = await fetch('/api/auth/session', {
            credentials: 'include',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log('Session API response status:', response.status);
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Received non-JSON response from session API');
          }
          const data = await response.json();
          console.log('Session API response data:', data);
          if (response.ok && data.session) {
            userId = data.session.user.id;
            setIsLoggedIn(true);
            setUserDetails(data.session.user);
          } else {
            console.log('No valid session, redirecting to login');
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
        console.log('No token found, user not logged in');
        setCartCount(0);
        setIsLoggedIn(false);
        setUserDetails(null);
      }

      if (userId) {
        try {
          const response = await fetch(`/api/cart?userId=${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
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

      // Fetch flash sale items
      try {
        const response = await fetch('/api/flashSales', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        console.log('Flash Sales API Response Status:', response.status);
        const data = await response.json();
        console.log('Flash Sales API Response Data:', data);
        if (response.ok) {
          const now = new Date();
          const activeFlashSales = data
            .filter((sale) => {
              const endDate = new Date(sale.endDate);
              const isValid = !isNaN(endDate.getTime()) && endDate > now;
              console.log(`Sale: ${sale.title}, End Date: ${endDate}, Valid: ${isValid}`);
              return isValid;
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by latest first
            .slice(0, 5); // Limit to 5 items
          setFlashSaleItems(activeFlashSales);
          if (activeFlashSales.length === 0) {
            console.log('No active flash sales found.');
          }
        } else {
          throw new Error(data.error || 'Failed to fetch flash sales');
        }
      } catch (error) {
        console.error('Error fetching flash sales:', error);
        setError('Failed to load flash sales. Please try again later.');
        toast.error('Failed to load flash sales');
      } finally {
        setLoadingFlashSales(false);
      }

      // Fetch regular products
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        if (response.ok) {
          setJustForYouProducts(data.slice(0, 10)); // Show up to 10 regular products
        } else {
          throw new Error('Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
        toast.error('Failed to load products');
      }

      // Fetch categories
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (response.ok) {
          setCategories(data);
        } else {
          throw new Error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please try again later.');
        toast.error('Failed to load categories');
      }
    }

    fetchData();

    const handleCartUpdate = (e) => {
      setCartCount(e.detail.count);
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [router]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (response.ok) {
        toast.success('Logged out successfully!');
        setIsLoggedIn(false);
        setUserDetails(null);
        setCartCount(0);
        document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
        router.push('/pages/login');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Logout failed.');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('An error occurred during logout.');
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-gray-50 transition-colors duration-300">
      <Toaster position="top-center" />
      <main className="container mx-auto px-4 py-6">
        <div className="relative w-full h-64 sm:h-80 md:h-[28rem] rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 mb-6 group">
          <AnimatePresence mode="wait">
            <motion.div
              key={promotions[current].id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${promotions[current].image})`,
              }}
            >
              <div className="w-full h-full bg-gradient-to-r from-black/70 via-black/50 to-transparent flex items-center px-6 sm:px-12">
                <div className="max-w-xl space-y-5">
                  <motion.h1
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl sm:text-4xl font-extrabold text-white drop-shadow-md"
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
                    <button className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 shadow-lg flex items-center">
                      Shop Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white transition-all duration-300"
          >
            <FiChevronLeft size={22} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white transition-all duration-300"
          >
            <FiChevronRight size={22} />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {promotions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  current === idx ? 'bg-white w-6' : 'bg-white/40 w-2.5'
                }`}
              />
            ))}
          </div>
        </div>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Shop by Category</h2>
            <Link
              href="/categories"
              className="text-teal-600 hover:text-teal-700 flex items-center text-sm font-medium"
            >
              View all <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <CategoryCard categories={categories} />
        </section>

        <section className="mb-12 bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="bg-teal-100 p-2 rounded-lg mr-4">
                <Zap className="h-6 w-6 text-teal-600" fill="currentColor" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Flash Sale</h2>
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
              className="bg-white hover:bg-gray-50 text-teal-600 px-4 py-2 rounded-lg flex items-center text-sm font-medium shadow-sm"
            >
              View all <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          {loadingFlashSales && <p className="text-gray-600">Loading flash sales...</p>}
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {!loadingFlashSales && flashSaleItems.length === 0 && !error && (
            <p className="text-gray-600">No active flash sales available.</p>
          )}
          {flashSaleItems.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {flashSaleItems.map((sale) => (
                <div key={sale._id} className="relative">
                  <ProductCard
                    product={sale}
                    showDiscountBadge={true}
                    className="bg-white hover:shadow-md transition-all"
                  />
                  {/* <CountdownTimer
                    endDate={sale.endDate}
                    className="absolute top-6 right-2 text-xs text-red-600 font-semibold"
                  /> */}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recommended For You</h2>
            <Link
              href="/products"
              className="text-teal-600 hover:text-teal-700 flex items-center text-sm font-medium"
            >
              View all <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {justForYouProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                showDiscountBadge={false}
                className="bg-white hover:shadow-md transition-all"
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;