'use client';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

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

  const handleProductChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (e) => {
    setCategory({ ...category, [e.target.name]: e.target.value });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (response.ok) {
        toast.success('Product added successfully!');
        setProduct({
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
      } else {
        throw new Error('Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      if (response.ok) {
        toast.success('Category added successfully!');
        setCategory({ name: '', icon: '' });
      } else {
        throw new Error('Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

      {/* Product Form */}
      <div className="mb-12 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Add New Product</h2>
        <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input
              type="text"
              name="title"
              value={product.title}
              onChange={handleProductChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
            <input
              type="text"
              name="price"
              value={product.price}
              onChange={handleProductChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Original Price</label>
            <input
              type="text"
              name="originalPrice"
              value={product.originalPrice}
              onChange={handleProductChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Discount (%)</label>
            <input
              type="number"
              name="discount"
              value={product.discount}
              onChange={handleProductChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rating</label>
            <input
              type="number"
              name="rating"
              value={product.rating}
              onChange={handleProductChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              min="0"
              max="5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reviews</label>
            <input
              type="number"
              name="reviews"
              value={product.reviews}
              onChange={handleProductChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              name="description"
              value={product.description}
              onChange={handleProductChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              rows="4"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
            <input
              type="text"
              name="imageUrl"
              value={product.imageUrl}
              onChange={handleProductChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <input
              type="text"
              name="category"
              value={product.category}
              onChange={handleProductChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>

      {/* Category Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Add New Category</h2>
        <form onSubmit={handleCategorySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category Name</label>
            <input
              type="text"
              name="name"
              value={category.name}
              onChange={handleCategoryChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Icon URL</label>
            <input
              type="text"
              name="icon"
              value={category.icon}
              onChange={handleCategoryChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              required
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
            >
              Add Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}