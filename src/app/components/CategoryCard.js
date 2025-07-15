'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const CategoryCard = ({ categories = [], onCategoryChange }) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabVariants = {
    inactive: { scale: 1, opacity: 0.7 },
    active: { scale: 1.05, opacity: 1 },
    hover: { scale: 1.1, opacity: 1 },
  };

  const underlineVariants = {
    hidden: { width: 0 },
    visible: { width: '100%', transition: { duration: 0.3 } },
  };

  return (
    <div className="flex flex-wrap justify-center gap-4 bg-white rounded-xl shadow-md p-4">
      {categories.slice(0, 6).map((category, index) => (
        <motion.div
          key={category._id || index}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer relative"
          variants={tabVariants}
          initial="inactive"
          animate={activeTab === index ? 'active' : 'inactive'}
          whileHover="hover"
          onClick={() => {
            setActiveTab(index);
            onCategoryChange(category.name);
          }}
        >
          <Image
            width={24}
            height={24}
            src={'/ad1.webp'}
            alt={category.name}
            className="object-contain w-6 h-6"
          />
          <span className="text-sm font-semibold text-gray-800">
            {category.name}
          </span>
          {activeTab === index && (
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-teal-600"
              variants={underlineVariants}
              animate="visible"
              layoutId="underline"
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default CategoryCard;