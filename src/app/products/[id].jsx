"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Star, Share2, Heart, ShieldCheck, MapPin, Truck, Box, Plus, Minus } from 'lucide-react';

// Placeholder product data (in a real app, this would come from an API or database)
const products = [
  { id: 1, imageUrl: '/images/product1.jpeg', title: 'Imported Hand bags for girls with Stylish Golden...', price: 'Rs. 349', originalPrice: 'Rs. 2053', discount: 83, rating: 4, reviews: 120, brand: 'Style Co', thumbnails: ['https://placehold.co/300x300/e8e8e8/333?text=Side', 'https://placehold.co/300x300/dcdcdc/333?text=Top'], description: 'A stylish handbag with golden accents, perfect for any occasion.' },
  { id: 2, imageUrl: '/images/product1.jpeg', title: 'Life Style New Arrival Ladies Handbags With...', price: 'Rs. 349', originalPrice: 'Rs. 1586', discount: 78, rating: 5, reviews: 98, brand: 'Fashion+', thumbnails: [], description: 'Trendy handbag with ample space and modern design.' },
  { id: 3, imageUrl: '/images/product1.jpeg', title: 'AirPods Pro 2nd Generation Wireless...', price: 'Rs. 759', originalPrice: 'Rs. 3450', discount: 78, rating: 4, reviews: 250, brand: 'Generic', thumbnails: [], description: 'High-quality wireless earbuds with noise cancellation.' },
  { id: 4, imageUrl: '/images/product1.jpeg', title: 'Summar Men\'s Kurta Shalwar For Summer...', price: 'Rs. 1,624', originalPrice: 'Rs. 2800', discount: 42, rating: 3, reviews: 45, brand: 'Ethnic Wear', thumbnails: [], description: 'Comfortable kurta shalwar set for summer wear.' },
  { id: 5, imageUrl: '/images/product1.jpeg', title: 'Ladies Bags Cross Body Shoulder Bags at...', price: 'Rs. 339', originalPrice: 'Rs. 1700', discount: 80, rating: 4, reviews: 150, brand: 'Bags R Us', thumbnails: [], description: 'Versatile cross-body bag for everyday use.' },
  { id: 6, imageUrl: '/images/product1.jpeg', title: 'Mens Wear Premium unstiched Lawn...', price: 'Rs. 1,726', originalPrice: 'Rs. 2975', discount: 42, rating: 5, reviews: 78, brand: 'Summer Collection', thumbnails: [], description: 'Premium unstitched lawn fabric for men.' },
  { id: 7, imageUrl: '/images/product1.jpeg', title: 'Men\'s Classic Chronograph Watch with Leather Strap', price: 'Rs. 2,499', originalPrice: 'Rs. 4,999', discount: 50, rating: 5, reviews: 180, brand: 'Timeless', thumbnails: [], description: 'Elegant chronograph watch with leather strap.' },
  { id: 8, imageUrl: '/images/product1.jpeg', title: 'Unisex Casual Canvas Sneakers for Everyday Wear', price: 'Rs. 1,299', originalPrice: 'Rs. 2,199', discount: 41, rating: 4, reviews: 210, brand: 'WalkEasy', thumbnails: [], description: 'Comfortable canvas sneakers for casual wear.' },
  { id: 9, imageUrl: '/images/product1.jpeg', title: 'High-Speed Nutrient Extractor and Blender', price: 'Rs. 3,999', originalPrice: 'Rs. 6,500', discount: 38, rating: 4, reviews: 95, brand: 'KitchenPro', thumbnails: [], description: 'Powerful blender for smoothies and more.' },
  { id: 10, imageUrl: '/images/product1.jpeg', title: 'Noise Cancelling Over-Ear Bluetooth Headphones', price: 'Rs. 5,999', originalPrice: 'Rs. 9,999', discount: 40, rating: 5, reviews: 300, brand: 'SoundWave', thumbnails: [], description: 'Immersive audio with noise cancellation.' },
  { id: 11, imageUrl: '/images/product1.jpeg', title: 'Pack of 3 Basic Cotton Round Neck T-Shirts', price: 'Rs. 999', originalPrice: 'Rs. 1,800', discount: 44, rating: 4, reviews: 450, brand: 'Basics Co.', thumbnails: [], description: 'Soft and durable cotton t-shirts.' },
  { id: 12, imageUrl: '/images/product1.jpeg', title: 'Water-Resistant Laptop Backpack with USB Charging Port', price: 'Rs. 1,899', originalPrice: 'Rs. 3,500', discount: 46, rating: 5, reviews: 220, brand: 'UrbanPack', thumbnails: [], description: 'Durable backpack with USB charging.' },
];

const ProductPage = ({ params }) => {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const product = products.find(p => p.id === parseInt(params.id));
  const [mainImage, setMainImage] = useState(product ? product.imageUrl : '');
  const thumbnails = product ? [product.imageUrl, ...product.thumbnails] : [];

  if (!product) {
    return (
      <main className="container mx-auto px-4 py-10">
        <p className="text-2xl text-gray-800">Product not found</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <button 
        onClick={() => router.back()} 
        className="flex items-center text-green-600 font-medium hover:underline mb-6 transition-colors duration-200"
      >
        ← Back to Results
      </button>
      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Image Gallery */}
          <div className="lg:col-span-1">
            <div className="mb-4 bg-gray-50 rounded-xl overflow-hidden">
              <Image 
                width={400} 
                height={400} 
                src={mainImage} 
                alt={product.title} 
                className="w-full h-auto object-contain max-h-[450px] transition-all duration-300" 
              />
            </div>
            <div className="flex space-x-3">
              {thumbnails.map((thumb, index) => (
                <div 
                  key={index} 
                  className={`w-20 h-20 border-2 rounded-lg cursor-pointer overflow-hidden ${mainImage === thumb ? 'border-green-500' : 'border-gray-200'} hover:border-green-400 transition-all duration-200`}
                  onMouseEnter={() => setMainImage(thumb)}
                >
                  <Image 
                    width={80} 
                    height={80} 
                    src={thumb} 
                    alt={`thumbnail ${index+1}`} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">{product.title}</h1>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <div className="flex items-center mb-4 space-x-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < product.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" />
                ))}
              </div>
              <span className="text-sm text-blue-600 hover:underline cursor-pointer">{product.reviews} Ratings</span>
              <div className="flex items-center space-x-3 text-blue-600">
                <Share2 size={20} className="hover:text-blue-800 transition-colors" />
                <Heart size={20} className="hover:text-red-500 transition-colors" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">Brand: <a href="#" className="text-blue-600 hover:underline">{product.brand}</a> | <a href="#" className="text-blue-600 hover:underline">More from this brand</a></p>
            <hr className="my-4 border-gray-200"/>
            <div>
              <p className="text-3xl font-bold text-green-600 mb-2">{product.price}</p>
              <div className="flex items-center text-sm text-gray-600">
                <span className="line-through mr-2">{product.originalPrice}</span>
                <span className="font-bold text-lg text-gray-700">-{product.discount}%</span>
              </div>
            </div>
            <hr className="my-4 border-gray-200"/>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">Quantity</span>
              <div className="flex items-center border-2 border-gray-200 rounded-lg">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                  className="px-4 py-2 text-lg text-gray-700 hover:bg-gray-100"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 text-gray-800 font-medium">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)} 
                  className="px-4 py-2 text-lg text-gray-700 hover:bg-gray-100"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div className="mt-6 flex space-x-4">
              <button className="flex-1 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all duration-300">Buy Now</button>
              <button className="flex-1 py-3 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-all duration-300">Add to Cart</button>
            </div>
          </div>

          {/* Delivery & Seller Info */}
          <div className="lg:col-span-1 bg-gray-50 p-6 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-3 text-lg">Delivery</h3>
            <div className="flex items-start mb-4">
              <MapPin className="w-5 h-5 text-gray-600 mr-3 mt-1"/>
              <div>
                <p className="text-gray-800 font-medium">Sindh, Karachi - Gulshan-e-Iqbal, Block 15</p>
                <a href="#" className="text-sm text-blue-600 hover:underline">Change</a>
              </div>
            </div>
            <div className="flex items-start mb-4">
              <Truck className="w-5 h-5 text-gray-600 mr-3 mt-1"/>
              <div>
                <p className="font-semibold text-gray-800">Standard Delivery</p>
                <p className="text-sm text-gray-600">5-10 days</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <Box className="w-5 h-5 text-gray-600 mr-3"/>
              <p className="text-gray-800 font-medium">Cash on Delivery Available</p>
            </div>
            <hr className="my-4 border-gray-200"/>
            <h3 className="font-semibold text-gray-800 mb-3 text-lg">Service</h3>
            <div className="flex items-start mb-4">
              <ShieldCheck className="w-5 h-5 text-gray-600 mr-3 mt-1"/>
              <div>
                <p className="font-semibold text-gray-800">14 Days Free & Easy Return</p>
                <p className="text-sm text-gray-600">Change of mind is not applicable</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <ShieldCheck className="w-5 h-5 text-gray-600 mr-3"/>
              <p className="text-gray-800 font-medium">Warranty not available</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

// Since this is a dynamic route, we need to export it correctly
export default ProductPage;

// Optional: Generate dynamic params for static generation (if using SSG)
export async function generateStaticParams() {
  return products.map(product => ({
    id: product.id.toString(),
  }));
}