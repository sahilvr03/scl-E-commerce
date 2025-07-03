'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

import { motion } from 'framer-motion';

export default function AdminPage() {
  const [product, setProduct] = useState({
    title: '',
    price: '',
    originalPrice: '',
    discount: '',
    rating: '',
    reviews: '',
    description: '',
    imageUrl: '',
    category: '',
  });
  const [category, setCategory] = useState({
    name: '',
    icon: '',
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (!data.session || !data.session.user || data.session.user.role !== 'admin') {
            toast.error('Access denied. Admins only.');
            router.push('/login?redirect=/admin');
          }
        } else {
          toast.error('Please log in as an admin.');
          router.push('/login?redirect=/admin');
        }
      } catch (error) {
        console.error('Session check error:', error);
        toast.error('An unexpected error occurred.');
        router.push('/login?redirect=/admin');
      }
    };
    checkSession();
  }, [router]);

  const handleProductChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (e) => {
    setCategory({ ...category, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = product.imageUrl;

      if (file) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'ecommerce');
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'Upload failed');
        }

        imageUrl = data.secure_url;
        setUploading(false);
      }

      const productData = { ...product, imageUrl };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Product added successfully!');
        setProduct({
          title: '',
          price: '',
          originalPrice: '',
          discount: literature,

System: '',
          rating: '',
          reviews: '',
          description: '',
          imageUrl: '',
          category: '',
        });
        setFile(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(error.message || 'Failed to add product');
      setUploading(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
        credentials: 'include',
      });
      if (response.ok) {
        toast.success('Category added successfully!');
        setCategory({ name: '', icon: '' });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error(error.message || 'Failed to add category');
    }
  };

  return (
    <>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
       

        {/* Product Form */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12 bg-white p-6 rounded-lg shadow-md"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Sale</h2>
          <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                value={product.title}
                onChange={handleProductChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                name="price"
                value={product.price}
                onChange={handleProductChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Original Price</label>
              <input
                type="number"
                name="originalPrice"
                value={product.originalPrice}
                onChange={handleProductChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={product.discount}
                onChange={handleProductChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rating</label>
              <input
                type="number"
                name="rating"
                value={product.rating}
                onChange={handleProductChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="0"
                max="5"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reviews</label>
              <input
                type="number"
                name="reviews"
                value={product.reviews}
                onChange={handleProductChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="0"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={product.description}
                onChange={handleProductChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows="4"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800"
              />
              {file && (
                <p className="text-sm text-gray-600 mt-2">Selected: {file.name}</p>
              )}
              {product.imageUrl && !file && (
                <p className="text-sm text-gray-600 mt-2">Current Image URL: {product.imageUrl}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                name="category"
                value={product.category}
                onChange={handleProductChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Add Product'}
              </button>
            </div>
          </form>
        </motion.section>

       
      </motion.div>
    </>
  );
}
