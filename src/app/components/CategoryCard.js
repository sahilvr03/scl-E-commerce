'use client';
import React from 'react';
import Image from 'next/image';

const CategoryCard = ({ icon, name }) => (
  <div className="flex flex-col items-center p-4 bg-white dark:bg-blue-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group transform hover:scale-105">
    <div className="w-16 h-16 flex items-center justify-center mb-3 bg-teal-100 dark:bg-teal-700/30 rounded-full">
      <Image
        width={64}
        height={64}
        src={icon}
        alt={name}
        className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300"
      />
    </div>
    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 text-center line-clamp-2">
      {name}
    </p>
  </div>
);

export default CategoryCard;