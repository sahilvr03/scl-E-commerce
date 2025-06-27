'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, Sun, Moon, Home, Grid, Tag, Sparkles, LogIn, UserPlus, Package, Heart,Zap,ChevronRight  } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import ProductCard from '../app/components/ProductCard';
import CategoryCard from '../app/components/CategoryCard';
import SectionHeader from '../app/components/SectionHeader';
import CountdownTimer from '../app/components/CountdownTimer';

export default function HomePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [justForYouProducts, setJustForYouProducts] = useState([]);

  const userId = 'mock-user-id-123'; // Replace with actual user authentication

  useEffect(() => {
    // Fetch cart count
    const fetchCartCount = async () => {
      try {
        const response = await fetch(`/api/cart?userId=${userId}`);
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response from cart API');
        }
        const data = await response.json();
        if (response.ok) {
          const count = data.items ? data.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
          setCartCount(count);
        } else {
          throw new Error(data.error || 'Failed to fetch cart');
        }
      } catch (error) {
        console.error('Error fetching cart count:', error);
        toast.error('Failed to load cart data');
        setCartCount(0);
      }
    };

    // Fetch products
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        if (response.ok) {
          // Assuming first 5 products are flash sale, next 5 are just for you
          setFlashSaleProducts(data.slice(0, 5));
          setJustForYouProducts(data.slice(5, 10));
        } else {
          throw new Error('Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      }
    };

    // Fetch categories
    const fetchCategories = async () => {
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
        toast.error('Failed to load categories');
      }
    };

    fetchCartCount();
    fetchProducts();
    fetchCategories();

    const handleCartUpdate = (e) => {
      setCartCount(e.detail.count);
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Toaster />
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden md:flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-6">
              <a href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Become a Seller</a>
              <a href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Affiliate Program</a>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Help Center</a>
              <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                {isDarkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </button>
              <Link href="/" className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 tracking-tight">
                Scl-E-comm
              </Link>
            </div>
            <div className="hidden md:flex flex-grow mx-8 max-w-xl">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for products, categories, brands..."
                  className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 text-sm"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-300" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Search className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </button>
              <Link href="/account" className="hidden sm:flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <User className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                <span className="ml-2 text-base font-medium hidden lg:inline text-gray-700 dark:text-gray-200">Account</span>
              </Link>
              <Link href="/carts" className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <ShoppingCart className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
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
                  className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 text-sm"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-300" />
              </div>
            </div>
          )}
        </div>
      </header>
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg fixed inset-0 z-40 pt-20 overflow-y-auto transform transition-transform duration-300 ease-in-out">
          <div className="container mx-auto px-4 py-6">
            <div className="space-y-8">
              <div>
                <h3 className="text-base font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
                  Explore
                </h3>
                <nav className="space-y-3">
                  <a href="#" className="block py-2 px-3 rounded-md text-gray-800 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-gray-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center">
                    <Home className="w-5 h-5 mr-3" /> Home
                  </a>
                  <a href="#" className="block py-2 px-3 rounded-md text-gray-800 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-gray-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center">
                    <Grid className="w-5 h-5 mr-3" /> Categories
                  </a>
                  <a href="#" className="block py-2 px-3 rounded-md text-gray-800 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-gray-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center">
                    <Tag className="w-5 h-5 mr-3" /> Deals
                  </a>
                  <a href="#" className="block py-2 px-3 rounded-md text-gray-800 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-gray-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center">
                    <Sparkles className="w-5 h-5 mr-3" /> New Arrivals
                  </a>
                </nav>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
                  My Account
                </h3>
                <nav className="space-y-3">
                  <a href="#" className="block py-2 px-3 rounded-md text-gray-800 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-gray-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center">
                    <LogIn className="w-5 h-5 mr-3" /> Sign In
                  </a>
                  <a href="#" className="block py-2 px-3 rounded-md text-gray-800 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-gray-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center">
                    <UserPlus className="w-5 h-5 mr-3" /> Create Account
                  </a>
                  <a href="#" className="block py-2 px-3 rounded-md text-gray-800 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-gray-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center">
                    <Package className="w-5 h-5 mr-3" /> My Orders
                  </a>
                  <a href="#" className="block py-2 px-3 rounded-md text-gray-800 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-gray-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center">
                    <Heart className="w-5 h-5 mr-3" /> Wishlist
                  </a>
                </nav>
              </div>
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center py-2 px-3 rounded-md text-gray-800 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-gray-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-6 w-6 mr-3 text-yellow-400" />
                    Switch to Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-6 w-6 mr-3 text-indigo-600" />
                    Switch to Dark Mode
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-teal-600 to-emerald-500 text-white rounded-xl mb-12 overflow-hidden shadow-lg animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-0"></div>
          <div className="relative z-10 p-8 md:p-12 lg:p-16 max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight drop-shadow-md">
              Spectacular Summer Savings: Up To 70% Off!
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-95">
              Unbeatable deals on your favorite brands. Dont miss out, offers are for a limited time!
            </p>
            <button className="bg-white text-teal-700 font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition-all duration-300 shadow-xl transform hover:scale-105 active:scale-95">
              Shop All Deals
            </button>
          </div>
        </div>
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-gray-600  flex items-center">
                <Zap className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" />
                Flash Sale
              </h2>
              <CountdownTimer />
            </div>
            <Link
              href="#"
              className="flex items-center text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
            >
              View all
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {flashSaleProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
        <section className="mb-12">
          <SectionHeader title="Shop by Category" linkText="All categories" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {categories.slice(0, 8).map(category => (
              <CategoryCard key={category._id} {...category} />
            ))}
          </div>
        </section>
        <section className="mb-12">
          <SectionHeader title="Recommended For You" linkText="See more" />
          booze
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {justForYouProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
        <section className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center mb-12 shadow-inner">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Join Our Community
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Sign up for our newsletter and get 10% off your first order, plus exclusive deals and updates.
          </p>
          <div className="flex max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
            />
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-r-lg font-medium transition-colors duration-300">
              Subscribe
            </button>
          </div>
        </section>
      </main>
      <footer className="bg-gray-800 dark:bg-gray-900 text-gray-300 dark:text-gray-400 border-t border-gray-700 dark:border-gray-800 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <h3 className="text-sm font-semibold text-gray-200 dark:text-gray-100 uppercase tracking-wider mb-5">
                Customer Service
              </h3>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-teal-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Shipping Policy</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Returns & Refunds</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-200 dark:text-gray-100 uppercase tracking-wider mb-5">
                About Us
              </h3>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-teal-400 transition-colors">Our Story</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-200 dark:text-gray-100 uppercase tracking-wider mb-5">
                Shop
              </h3>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-teal-400 transition-colors">All Products</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Featured</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">New Arrivals</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Deals</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-200 dark:text-gray-100 uppercase tracking-wider mb-5">
                Stay Connected
              </h3>
              <p className="mb-4">
                Subscribe to our newsletter for exclusive offers and updates.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-grow bg-gray-700 dark:bg-gray-800 border border-gray-600 dark:border-gray-700 rounded-l-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500 dark:focus:ring-teal-400"
                />
                <button className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-r-lg text-sm font-medium transition-colors duration-300">
                  Join
                </button>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-700 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="mb-4 md:mb-0">
              © {new Date().getFullYear()} Scl-E-comm. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}