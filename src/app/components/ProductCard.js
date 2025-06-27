'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';

const ProductCard = ({ product }) => (
  <Link href={`/products/${product._id}`} className="group">
    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col transform group-hover:-translate-y-1">
      <div className="relative aspect-square bg-gray-50 dark:bg-gray-700 overflow-hidden">
        <Image
          width={300}
          height={300}
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          priority
        />
        {product.discount && (
          <span className="absolute top-3 left-3 bg-teal-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg animate-pulse">
            -{product.discount}% OFF
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2 line-clamp-2 leading-tight">
          {product.title}
        </h3>
        <div className="mt-auto">
          <div className="flex items-baseline space-x-2 mb-2">
            <p className="text-xl font-extrabold text-teal-700 dark:text-teal-400">
              {product.price}
            </p>
            {product.originalPrice && (
              <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                {product.originalPrice}
              </p>
            )}
          </div>
          <div className="flex items-center">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < product.rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                  fill={i < product.rating ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              ({product.reviews} reviews)
            </span>
          </div>
        </div>
      </div>
    </div>
  </Link>
);

export default ProductCard;