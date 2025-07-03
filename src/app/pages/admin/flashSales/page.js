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
  const [flashSale, setFlashSale] = useState({
    title: '',
    price: '',
    originalPrice: '',
    discount: '',
    endDate: '',
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
  const [flashSales, setFlashSales] = useState([]);
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

    const fetchFlashSales = async () => {
      try {
        const response = await fetch('/api/flashSales');
        const data = await response.json();
        if (response.ok) {
          setFlashSales(data);
        } else {
          throw new Error('Failed to fetch flash sales');
        }
      } catch (error) {
        console.error('Error fetching flash sales:', error);
        toast.error('Failed to load flash sales');
      }
    };
    fetchFlashSales();
  }, [router]);

  const handleProductChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleFlashSaleChange = (e) => {
    setFlashSale({ ...flashSale, [e.target.name]: e.target.value });
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
          discount: '',
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

  const handleFlashSaleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = flashSale.imageUrl;

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

      const flashSaleData = { ...flashSale, imageUrl };

      const response = await fetch('/api/flashSales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flashSaleData),
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Flash sale added successfully!');
        setFlashSale({
          title: '',
          price: '',
          originalPrice: '',
          discount: '',
          endDate: '',
          description: '',
          imageUrl: '',
          category: '',
        });
        setFile(null);
        const newFlashSale = await response.json();
        setFlashSales([...flashSales, newFlashSale]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add flash sale');
      }
    } catch (error) {
      console.error('Error adding flash sale:', error);
      toast.error(error.message || 'Failed to add flash sale');
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

  const handleFlashSaleUpdate = async (id, updatedData) => {
    try {
      const response = await fetch('/api/flashSales', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updatedData }),
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Flash sale updated successfully!');
        setFlashSales(flashSales.map((sale) => (sale._id === id ? { ...sale, ...updatedData } : sale)));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update flash sale');
      }
    } catch (error) {
      console.error('Error updating flash sale:', error);
      toast.error(error.message || 'Failed to update flash sale');
    }
  };

  const handleFlashSaleDelete = async (id) => {
    try {
      const response = await fetch('/api/flashSales', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Flash sale deleted successfully!');
        setFlashSales(flashSales.filter((sale) => sale._id !== id));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete flash sale');
      }
    } catch (error) {
      console.error('Error deleting flash sale:',所在的0, 'Failed to delete flash sale:', error);
      toast.error(error.message || 'Failed to delete flash sale');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-6"
    >
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {/* Product Form */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-12 bg-white p-6 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Product</h2>
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

      {/* Flash Sale Form */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-12 bg-white p-6 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Flash Sale</h2>
        <form onSubmit={handleFlashSaleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={flashSale.title}
              onChange={handleFlashSaleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              name="price"
              value={flashSale.price}
              onChange={handleFlashSaleChange}
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
              value={flashSale.originalPrice}
              onChange={handleFlashSaleChange}
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
              value={flashSale.discount}
              onChange={handleFlashSaleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="datetime-local"
              name="endDate"
              value={flashSale.endDate}
              onChange={handleFlashSaleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={flashSale.description}
              onChange={handleFlashSaleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows="4"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Flash Sale Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800"
            />
            {file && (
              <p className="text-sm text-gray-600 mt-2">Selected: {file.name}</p>
            )}
            {flashSale.imageUrl && !file && (
              <p className="text-sm text-gray-600 mt-2">Current Image URL: {flashSale.imageUrl}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              name="category"
              value={flashSale.category}
              onChange={handleFlashSaleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Add Flash Sale'}
            </button>
          </div>
        </form>
      </motion.section>

      {/* Flash Sale Management */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mb-12 bg-white p-6 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Manage Flash Sales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flashSales.map((sale) => (
            <div key={sale._id} className="border border-gray-300 rounded-lg p-4">
              <h3 className="text-lg font-semibold">{sale.title}</h3>
              <p>Price: ${sale.price}</p>
              <p>Discount: {sale.discount}%</p>
              <p>End Date: {new Date(sale.endDate).toLocaleString()}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setFlashSale({ ...sale, endDate: sale.endDate.slice(0, 16) });
                    setFile(null);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleFlashSaleDelete(sale._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Category Form */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mb-12 bg-white p-6 rounded-lg shadow-md"
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
            <label className="block text-sm font-medium text-gray-700">Icon URL</label>
            <input
              type="text"
              name="icon"
              value={category.icon}
              onChange={handleCategoryChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
      </motion.section>
    </motion.div>
  );
}