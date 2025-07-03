'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function FlashSaleCard({ product }) {
  if (!product || !product._id) return null; // ← prevents error during build

  return (
    <Link href={`/flash-sales/${product._id}`} className="block">
      <div className="relative p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <div className="relative w-full h-48 mb-2">
          <Image
            src={product.imageUrl || '/placeholder.jpg'}
            alt={product.title || 'Flash sale product'}
            fill
            className="object-cover rounded-md"
          />
          {product.discount && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {product.discount}% OFF
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{product.title}</h3>
        <p className="text-gray-600 dark:text-gray-400">
          ${product.price}{' '}
          {product.originalPrice && (
            <span className="line-through">${product.originalPrice}</span>
          )}
        </p>
        {/* Optional: you can format endDate below */}
        {/* <p className="text-xs text-gray-500">Ends on: {new Date(product.endDate).toLocaleDateString()}</p> */}
      </div>
    </Link>
  );
}
