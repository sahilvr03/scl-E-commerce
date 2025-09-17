import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, Home, Grid, Tag, Sparkles, LogIn, UserPlus, Package, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header({ mobileMenuOpen, setMobileMenuOpen, searchOpen, setSearchOpen, cartCount, isLoggedIn, userDetails, handleLogout }) {
  return (
    <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden mr-4 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="mr-2" />
            <span className="text-xl font-bold">ShopSphere</span>
          </Link>
        </div>
        <nav className="hidden lg:flex space-x-6">
          <Link href="/" className="flex items-center hover:text-orange-200">
            <Home className="h-5 w-5 mr-1" /> Home
          </Link>
          <Link href="/categories" className="flex items-center hover:text-orange-200">
            <Grid className="h-5 w-5 mr-1" /> Categories
          </Link>
          <Link href="/flashSalesUsers" className="flex items-center hover:text-orange-200">
            <Tag className="h-5 w-5 mr-1" /> Flash Sales
          </Link>
          <Link href="/forYou" className="flex items-center hover:text-orange-200">
            <Sparkles className="h-5 w-5 mr-1" /> For You
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 hover:bg-orange-700 rounded-full transition-all"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link href="/cart" className="relative p-2 hover:bg-orange-700 rounded-full transition-all">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <div className="relative">
            <button className="p-2 hover:bg-orange-700 rounded-full transition-all">
              <User className="h-5 w-5" />
            </button>
            {isLoggedIn && userDetails && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg py-2">
                <div className="px-4 py-2 border-b">
                  <p className="font-medium">{userDetails.name}</p>
                  <p className="text-sm text-gray-500">{userDetails.email}</p>
                </div>
                <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">
                  Profile
                </Link>
                <Link href="/orders" className="block px-4 py-2 hover:bg-gray-100">
                  Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </button>
              </div>
            )}
            {!isLoggedIn && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg py-2">
                <Link href="/pages/login" className="block px-4 py-2 hover:bg-gray-100 flex items-center">
                  <LogIn className="h-4 w-4 mr-2" /> Login
                </Link>
                <Link href="/pages/signup" className="block px-4 py-2 hover:bg-gray-100 flex items-center">
                  <UserPlus className="h-4 w-4 mr-2" /> Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          className="lg:hidden bg-orange-600 overflow-hidden"
        >
          <nav className="flex flex-col p-4 space-y-2">
            <Link href="/" className="flex items-center hover:text-orange-200">
              <Home className="h-5 w-5 mr-1" /> Home
            </Link>
            <Link href="/categories" className="flex items-center hover:text-orange-200">
              <Grid className="h-5 w-5 mr-1" /> Categories
            </Link>
            <Link href="/flashSalesUsers" className="flex items-center hover:text-orange-200">
              <Tag className="h-5 w-5 mr-1" /> Flash Sales
            </Link>
            <Link href="/forYou" className="flex items-center hover:text-orange-200">
              <Sparkles className="h-5 w-5 mr-1" /> For You
            </Link>
          </nav>
        </motion.div>
      )}
      {searchOpen && (
        <div className="bg-white p-4 shadow-lg">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      )}
    </header>
  );
}