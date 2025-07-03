'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Sun,
  Moon,
  Home,
  Grid,
  Tag,
  Sparkles,
  LogIn,
  UserPlus,
  Package,
  Heart,
  LogOut,
  ChevronDown,
} from 'lucide-react';

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  const categories = [
    { _id: '1', name: 'Electronics' },
    { _id: '2', name: 'Fashion' },
    { _id: '3', name: 'Home & Living' },
    { _id: '4', name: 'Beauty' },
  ]; // Mock categories, replace with API fetch if needed

  const getTokenFromCookies = () => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {});
    return cookies.token || null;
  };

  useEffect(() => {
    async function fetchSession() {
      setError(null);
      const token = getTokenFromCookies();
      if (!token) {
        setIsLoggedIn(false);
        setUserDetails(null);
        setCartCount(0);
        return;
      }

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
          setIsLoggedIn(true);
          setUserDetails(data.session.user);
          const cartResponse = await fetch(`/api/cart?userId=${data.session.user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
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
        toast.error('Invalid session. Please log in.');
        router.push('/pages/login');
      }
    }

    fetchSession();

    const handleCartUpdate = (e) => {
      setCartCount(e.detail.count);
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [router]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

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
    <>
      {error && (
        <div className="bg-red-500 text-white p-4 text-center">
          {error}
        </div>
      )}
      <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden md:flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-6">
              <Link href="/" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Home</Link>
              <div className="relative">
                <button
                  onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                  className="flex items-center hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                >
                  Categories <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                {categoryMenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md py-2 z-50">
                    {categories.map(category => (
                      <Link
                        key={category._id}
                        href={`/categories/${category._id}`}
                        className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-500 dark:hover:text-orange-400"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <Link href="/deals" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Deals</Link>
              <Link href="/new-arrivals" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">New Arrivals</Link>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/seller" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Become a Seller</Link>
              <Link href="/affiliate" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Affiliate Program</Link>
              <Link href="/help" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Help Center</Link>
              <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-orange-100 dark:hover:bg-gray-700 transition-colors">
                {isDarkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-orange-500" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-orange-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Menu className="h-6 w-6 text-orange-500 dark:text-orange-400" />
              </button>
              <Link href="/" className="text-3xl font-extrabold text-orange-500 dark:text-orange-400 tracking-tight">
                Dropwear
              </Link>
            </div>
            <div className="flex-grow mx-4 md:mx-8 max-w-2xl">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for products, categories, brands..."
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-500 dark:text-orange-400" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2 rounded-md hover:bg-orange-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Search className="h-6 w-6 text-orange-500 dark:text-orange-400" />
              </button>
              <Link
                href="/pages/orders"
                className="flex items-center p-2 rounded-md hover:bg-orange-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Package className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                <span className="ml-2 text-base font-medium hidden lg:inline text-gray-700 dark:text-gray-200">Orders</span>
              </Link>
              {isLoggedIn ? (
                <div className="relative">
                  <button className="flex items-center p-2 rounded-md hover:bg-orange-100 dark:hover:bg-gray-700 transition-colors">
                    <User className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                    <span className="ml-2 text-base font-medium hidden lg:inline text-gray-700 dark:text-gray-200">
                      {userDetails ? `Hello, ${userDetails.name}` : 'Account'}
                    </span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md py-2 hidden group-hover:block">
                    <Link href="/account" className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700">Account</Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    href="/pages/login"
                    className="flex items-center p-2 rounded-md hover:bg-orange-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <LogIn className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                    <span className="ml-2 text-base font-medium hidden lg:inline text-gray-700 dark:text-gray-200">Login</span>
                  </Link>
                  <Link
                    href="/pages/signup"
                    className="flex items-center p-2 rounded-md hover:bg-orange-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <UserPlus className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                    <span className="ml-2 text-base font-medium hidden lg:inline text-gray-700 dark:text-gray-200">Sign Up</span>
                  </Link>
                </>
              )}
              <Link href="/carts" className="relative p-2 rounded-md hover:bg-orange-100 dark:hover:bg-gray-700 transition-colors">
                <ShoppingCart className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
          {searchOpen && (
            <div className="md:hidden mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products, categories, brands..."
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-500 dark:text-orange-400" />
              </div>
            </div>
          )}
        </div>
      </header>
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/90 dark:bg-gray-900/90 backdrop

-blur-lg shadow-lg fixed inset-0 z-40 pt-20 overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="space-y-8">
              <div>
                <h3 className="text-base font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">Explore</h3>
                <nav className="space-y-3">
                  <Link href="/" className="block py-2 px-3 rounded-md text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-500 dark:hover:text-orange-400 flex items-center">
                    <Home className="w-5 h-5 mr-3" /> Home
                  </Link>
                  <Link href="/categories" className="block py-2 px-3 rounded-md text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-500 dark:hover:text-orange-400 flex items-center">
                    <Grid className="w-5 h-5 mr-3" /> Categories
                  </Link>
                  <Link href="/deals" className="block py-2 px-3 rounded-md text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-500 dark:hover:text-orange-400 flex items-center">
                    <Tag className="w-5 h-5 mr-3" /> Deals
                  </Link>
                  <Link href="/new-arrivals" className="block py-2 px-3 rounded-md text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-500 dark:hover:text-orange-400 flex items-center">
                    <Sparkles className="w-5 h-5 mr-3" /> New Arrivals
                  </Link>
                </nav>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">My Account</h3>
                <nav className="space-y-3">
                  {isLoggedIn ? (
                    <>
                      <Link href="/account" className="block py-2 px-3 rounded-md text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-500 dark:hover:text-orange-400 flex items-center">
                        <User className="w-5 h-5 mr-3" /> Account
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left py-2 px-3 rounded-md text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-500 dark:hover:text-orange-400 flex items-center"
                      >
                        <LogOut className="w-5 h-5 mr-3" /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/pages/login" className="block py-2 px-3 rounded-md text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-500 dark:hover:text-orange-400 flex items-center">
                        <LogIn className="w-5 h-5 mr-3" /> Sign In
                      </Link>
                      <Link href="/pages/signup" className="block py-2 px-3 rounded-md text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-500 dark:hover:text-orange-400 flex items-center">
                        <UserPlus className="w-5 h-5 mr-3" /> Create Account
                      </Link>
                    </>
                  )}
                  <Link href="/orders" className="block py-2 px-3 rounded-md text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-500 dark:hover:text-orange-400 flex items-center">
                    <Package className="w-5 h-5 mr-3" /> My Orders
                  </Link>
                  <Link href="/wishlist" className="block py-2 px-3 rounded-md text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-500 dark:hover:text-orange-400 flex items-center">
                    <Heart className="w-5 h-5 mr-3" /> Wishlist
                  </Link>
                </nav>
              </div>
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center py-2 px-3 rounded-md text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-500 dark:hover:text-orange-400"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-6 w-6 mr-3 text-yellow-400" />
                    Switch to Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-6 w-6 mr-3 text-orange-500" />
                    Switch to Dark Mode
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}