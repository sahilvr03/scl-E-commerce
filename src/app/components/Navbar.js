"use client"
import React from 'react'
import { useState } from 'react';
import { Search, ShoppingCart, User, Menu, Sun, Moon, Home, Grid, Tag, Sparkles, LogIn, UserPlus, Package, Heart,Zap,ChevronRight,cartCount   } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {


 const [isDarkMode, setIsDarkMode] = useState(false);

 const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div> <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
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
      )}</div>
  )
}
