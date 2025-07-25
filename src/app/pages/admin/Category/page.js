// pages/admin/categories.js
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function CategoriesPage() {
  const [category, setCategory] = useState({
    name: '',
    icon: '',
  });
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
        });
        if (!response.ok) {
          toast.error('Please log in as an admin.');
          router.push('/login?redirect=/pages/admin/categories');
          return;
        }
        const data = await response.json();
        if (!data.session || !data.session.user || data.session.user.role !== 'admin') {
          toast.error('Access denied. Admins only.');
          router.push('/login?redirect=/pages/admin/categories');
          return;
        }
      } catch (error) {
        console.error('Session check error:', error);
        toast.error('An unexpected error occurred.');
        router.push('/login?redirect=/pages/admin/categories');
      }
    };
    checkSession();
  }, [router]);

  const handleCategoryChange = (e) => {
    setCategory({ ...category, [e.target.name]: e.target.value });
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
        credentials: 'include', // Keep for session consistency
      });

      if (!response.ok) {
        const text = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          throw new Error(`Server returned non-JSON response: ${text.slice(0, 100)}...`);
        }
        throw new Error(errorData.error || 'Failed to add category');
      }

      const data = await response.json();
      toast.success(data.message || 'Category added successfully!');
      setCategory({ name: '', icon: '' });
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error(error.message || 'Failed to add category');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Categories</h1>

      {/* Category Form */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Category</h2>
        <form onSubmit={handleCategorySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category Name</label>
            <input
              type="text"
              name="name"
              value={category.name}
              onChange={handleCategoryChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Icon URL (Optional)</label>
            <input
              type="text"
              name="icon"
              value={category.icon}
              onChange={handleCategoryChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="md:col-span-2">
            <motion.button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add Category
            </motion.button>
          </div>
        </form>
      </motion.section>
    </motion.div>
  );
}