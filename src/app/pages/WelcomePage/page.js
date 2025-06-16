"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, Bell, Star } from 'lucide-react';

// --- Reusable Product Card Component ---
const ProductCard = ({ product }) => (
  <Link href={`/products/${product.id}`}>
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
    >
      <div className="relative h-56 bg-gray-50 overflow-hidden">
        <Image 
          width={300} 
          height={300} 
          src={product.imageUrl} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" 
        />
        {product.discount && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{product.discount}%
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-800 h-12 mb-2 overflow-hidden line-clamp-2">{product.title}</h3>
        <div className="flex items-center space-x-2">
          <p className="text-xl font-bold text-green-600">{product.price}</p>
          {product.originalPrice && (
            <p className="text-sm text-gray-500 line-through">{product.originalPrice}</p>
          )}
        </div>
        <div className="flex items-center mt-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < product.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" />
          ))}
          <span className="text-xs text-gray-500 ml-2">({product.reviews})</span>
        </div>
      </div>
    </div>
  </Link>
);

// --- Reusable Category Card Component ---
const CategoryCard = ({ icon, name }) => (
  <div className="flex flex-col items-center justify-center text-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md hover:bg-green-50 transition-all duration-200 cursor-pointer">
    <div className="w-14 h-14 flex items-center justify-center mb-2">
      <Image 
        width={80} 
        height={80} 
        src={icon} 
        alt={name} 
        className="max-w-full max-h-full object-contain" 
      />
    </div>
    <p className="text-xs font-medium text-gray-700 h-10 leading-tight line-clamp-2">{name}</p>
  </div>
);

// --- Home Page Component ---
const HomePage = ({ flashSaleProducts, categories, justForYouProducts }) => {
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Banner */}
      <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 rounded-2xl mb-10 overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10"></div>
        <h2 className="text-4xl font-extrabold text-center tracking-tight">UP TO 80% OFF TOP DEALS</h2>
        <p className="text-center text-lg mt-2 opacity-90">Shop now and save big on your favorites!</p>
      </div>

      {/* Flash Sale Section */}
      <section className="mb-10 bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Flash Sale</h2>
          <a 
            href="#" 
            className="text-sm font-medium text-green-600 border-2 border-green-600 rounded-full px-6 py-2 hover:bg-green-600 hover:text-white transition-all duration-300"
          >
            Shop All Products
          </a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {flashSaleProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 p-4 bg-white rounded-t-2xl shadow-lg">Categories</h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 bg-gray-100 p-4 rounded-b-2xl">
          {categories.map(category => (
            <CategoryCard key={category.name} {...category} />
          ))}
        </div>
      </section>

      {/* Just For You Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Just For You</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {justForYouProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-8">
          <button 
            className="bg-white text-green-600 border-2 border-green-600 px-8 py-3 rounded-full font-medium hover:bg-green-600 hover:text-white transition-all duration-300"
          >
            Load More
          </button>
        </div>
      </section>
    </main>
  );
};

// --- Main App Component ---
export default function Home() {
  // --- Placeholder Data ---
  const flashSaleProducts = [
    { id: 1, imageUrl: '/images/product1.jpeg', title: 'Imported Hand bags for girls with Stylish Golden...', price: 'Rs. 349', originalPrice: 'Rs. 2053', discount: 83, rating: 4, reviews: 120, brand: 'Style Co' },
    { id: 2, imageUrl: '/images/product1.jpeg', title: 'Life Style New Arrival Ladies Handbags With...', price: 'Rs. 349', originalPrice: 'Rs. 1586', discount: 78, rating: 5, reviews: 98, brand: 'Fashion+' },
    { id: 3, imageUrl: '/images/product1.jpeg', title: 'AirPods Pro 2nd Generation Wireless...', price: 'Rs. 759', originalPrice: 'Rs. 3450', discount: 78, rating: 4, reviews: 250, brand: 'Generic' },
    { id: 4, imageUrl: '/images/product1.jpeg', title: 'Summar Men\'s Kurta Shalwar For Summer...', price: 'Rs. 1,624', originalPrice: 'Rs. 2800', discount: 42, rating: 3, reviews: 45, brand: 'Ethnic Wear' },
    { id: 5, imageUrl: '/images/product1.jpeg', title: 'Ladies Bags Cross Body Shoulder Bags at...', price: 'Rs. 339', originalPrice: 'Rs. 1700', discount: 80, rating: 4, reviews: 150, brand: 'Bags R Us' },
    { id: 6, imageUrl: '/images/product1.jpeg', title: 'Mens Wear Premium unstiched Lawn...', price: 'Rs. 1,726', originalPrice: 'Rs. 2975', discount: 42, rating: 5, reviews: 78, brand: 'Summer Collection' },
  ];

  const justForYouProducts = [
    { id: 7, imageUrl: '/images/product1.jpeg', title: 'Men\'s Classic Chronograph Watch with Leather Strap', price: 'Rs. 2,499', originalPrice: 'Rs. 4,999', discount: 50, rating: 5, reviews: 180, brand: 'Timeless' },
    { id: 8, imageUrl: '/images/product1.jpeg', title: 'Unisex Casual Canvas Sneakers for Everyday Wear', price: 'Rs. 1,299', originalPrice: 'Rs. 2,199', discount: 41, rating: 4, reviews: 210, brand: 'WalkEasy' },
    { id: 9, imageUrl: '/images/product1.jpeg', title: 'High-Speed Nutrient Extractor and Blender', price: 'Rs. 3,999', originalPrice: 'Rs. 6,500', discount: 38, rating: 4, reviews: 95, brand: 'KitchenPro' },
    { id: 10, imageUrl: '/images/product1.jpeg', title: 'Noise Cancelling Over-Ear Bluetooth Headphones', price: 'Rs. 5,999', originalPrice: 'Rs. 9,999', discount: 40, rating: 5, reviews: 300, brand: 'SoundWave' },
    { id: 11, imageUrl: '/images/product1.jpeg', title: 'Pack of 3 Basic Cotton Round Neck T-Shirts', price: 'Rs. 999', originalPrice: 'Rs. 1,800', discount: 44, rating: 4, reviews: 450, brand: 'Basics Co.' },
    { id: 12, imageUrl: '/images/product1.jpeg', title: 'Water-Resistant Laptop Backpack with USB Charging Port', price: 'Rs. 1,899', originalPrice: 'Rs. 3,500', discount: 46, rating: 5, reviews: 220, brand: 'UrbanPack' },
  ];

  const categories = [
    { name: 'Pasta, Noodle & Pizza Tools', icon: 'https://placehold.co/80x80/FEF4E8/FF8B2D?text=🍕' },
    { name: 'SIM Tools', icon: 'https://placehold.co/80x80/E8FEF6/2DFFAB?text=SIM' },
    { name: 'Screen Protectors', icon: 'https://placehold.co/80x80/E8F2FE/2D9BFF?text=📱' },
    { name: 'Casserole Pots', icon: 'https://placehold.co/80x80/FEE8F4/FF2DAA?text=🍲' },
    { name: 'Hoodies & Sweatshirts', icon: 'https://placehold.co/80x80/FEEBE8/FF632D?text=👕' },
    { name: 'Pepper', icon: 'https://placehold.co/80x80/E8FEFA/2DFFF7?text=🌶️' },
    { name: 'Dog & Cat Electric Clippers', icon: 'https://placehold.co/80x80/F9E8FE/D72DFF?text=✂️' },
    { name: 'Dining Sets', icon: 'https://placehold.co/80x80/FEF9E8/FFD72D?text=🍽️' },
    { name: 'Microphones', icon: 'https://placehold.co/80x80/E8FEEB/2DFF63?text=🎤' },
    { name: 'Leashes & Harnesses', icon: 'https://placehold.co/80x80/F4E8FE/AA2DFF?text=🐾' },
    { name: 'Donate to Educate', icon: 'https://placehold.co/80x80/E8F9FE/2DD7FF?text=❤️' },
    { name: 'Heatsinks', icon: 'https://placehold.co/80x80/EBFEE8/63FF2D?text=⚙️' },
    { name: 'Injury Support and Braces', icon: 'https://placehold.co/80x80/FEF4E8/FF8B2D?text=🩹' },
    { name: 'Others', icon: 'https://placehold.co/80x80/E8FEF6/2DFFAB?text=📦' },
    { name: 'Air Dryers, Blowers & Blades', icon: 'https://placehold.co/80x80/E8F2FE/2D9BFF?text=💨' },
    { name: 'Everyday Glassware', icon: 'https://placehold.co/80x80/FEE8F4/FF2DAA?text=🥃' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="hidden md:flex justify-end items-center text-sm text-gray-600 py-2 space-x-6">
            <a href="#" className="hover:text-green-600 transition-colors">Become a Seller</a>
            <a href="#" className="hover:text-green-600 transition-colors">SCL Affiliate Program</a>
            <a href="#" className="hover:text-green-600 transition-colors">Help & Support</a>
          </div>
          <div className="flex items-center justify-between py-4">
            <Link href="/">
              <span className="text-3xl font-extrabold text-green-600 cursor-pointer tracking-tight">
                Scl-E-comm
              </span>
            </Link>
            <div className="flex-grow mx-4 hidden sm:flex">
              <div className="relative w-full max-w-2xl mx-auto">
                <input
                  type="text"
                  placeholder="Search in SLC E-comm"
                  className="w-full bg-gray-100 border-none rounded-full py-3 pl-12 pr-20 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <button className="absolute right-0 top-0 h-full bg-green-600 text-white px-6 rounded-r-full hover:bg-green-700 transition-all duration-300">
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors">
                <User className="h-6 w-6" />
                <span className="hidden lg:inline font-medium">Login</span>
              </a>
              <span className="text-gray-300 hidden lg:inline">|</span>
              <a href="#" className="hidden lg:inline text-gray-700 hover:text-green-600 font-medium transition-colors">Sign Up</a>
              <a href="#" className="relative text-gray-700 hover:text-green-600 transition-colors">
                <ShoppingCart className="h-7 w-7" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-600 text-white text-xs rounded-full flex items-center justify-center">0</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <HomePage 
        flashSaleProducts={flashSaleProducts}
        categories={categories}
        justForYouProducts={[...flashSaleProducts, ...justForYouProducts]}
      />

      {/* Floating Action Buttons */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col space-y-3">
        <button className="bg-white p-3 rounded-full shadow-lg hover:bg-green-50 hover:shadow-xl transition-all duration-300">
          <Menu className="h-5 w-5 text-gray-600"/>
        </button>
        <button className="bg-white p-3 rounded-full shadow-lg hover:bg-green-50 hover:shadow-xl transition-all duration-300">
          <Bell className="h-5 w-5 text-gray-600"/>
        </button>
      </div>
    </div>
  );
}