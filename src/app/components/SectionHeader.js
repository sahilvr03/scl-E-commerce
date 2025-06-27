'use client';
import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const SectionHeader = ({ title, linkText }) => (
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
      {title}
    </h2>
    <Link
      href="#"
      className="flex items-center text-base font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
    >
      {linkText}
      <ChevronRight className="w-5 h-5 ml-1" />
    </Link>
  </div>
);

export default SectionHeader;