'use client';
import React from 'react';
import Image from 'next/image';

const CategoryCard = ({ icon, name }) => (
  <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 w-28 h-28 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1 hover:scale-105 border border-gray-100 dark:border-gray-700">
   
      <Image
        width={48}
        height={48}
        src="/ad1.webp"
        alt={name}
        className="object-contain w-16 h-16 group-hover:scale-110 transition-transform duration-300 rounded-xl  "
      />
    
    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 text-center leading-tight px-2">
      {name}
    </p>
  </div>
);

export default CategoryCard;
