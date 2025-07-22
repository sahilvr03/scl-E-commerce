'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Edit, Trash2, X } from 'lucide-react';

export default function AdminPage() {
  const [product, setProduct] = useState({
    title: '',
    price: '',
    originalPrice: '',
    discount: '',
    rating: '',
    reviews: '',
    description: '',
    images: [],
    category: '',
    type: 'forYou',
    endDate: '',
    colors: [],
    brand: '',
    weight: '',
    details: '',
  });
  const [category, setCategory] = useState({
    name: '',
    icon: '',
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
        });
        if (!response.ok) {
          toast.error('Please log in as an admin.');
          router.push('/login?redirect=/admin');
          return;
        }
        const data = await response.json();
        if (!data.session || !data.session.user || data.session.user.role !== 'admin') {
          toast.error('Access denied. Admins only.');
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      }
    };
    fetchProducts();
  }, []);

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    if (name === 'colors') {
      setProduct({ ...product, [name]: value.split(',').map((item) => item.trim()).filter((item) => item) });
    } else {
      setProduct({ ...product, [name]: value });
    }
  };

  const handleCategoryChange = (e) => {
    setCategory({ ...category, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 5) {
      toast.error('Maximum 5 images allowed.');
      return;
    }
    setFiles(selectedFiles);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let images = editingProductId ? [...product.images] : [];

      if (files.length > 0) {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        if (!cloudName) {
          throw new Error('Cloudinary cloud name not configured');
        }
        const uploadPromises = files.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', 'ecommerce');

          const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error?.message || `Failed to upload ${file.name}`);
          }
          return data.secure_url;
        });

        const newImages = await Promise.all(uploadPromises);
        images = [...images, ...newImages];
      }

      const productData = {
        ...product,
        images,
        price: parseFloat(product.price) || 0,
        originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : null,
        discount: product.discount ? parseInt(product.discount) : null,
        rating: product.rating ? parseFloat(product.rating) : null,
        reviews: product.reviews ? parseInt(product.reviews) : null,
        endDate: product.type === 'flashSale' && product.endDate ? product.endDate : null,
        brand: product.brand || null,
        weight: product.weight || null,
        details: product.details || null,
      };

      const url = editingProductId ? `/api/products/${editingProductId}` : '/api/products';
      const method = editingProductId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
        credentials: 'include',
      });

      if (!response.ok) {
        const text = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          throw new Error(`Server returned non-JSON response: ${text.slice(0, 100)}...`);
        }
        throw new Error(errorData.error || editingProductId ? 'Failed to update product' : 'Failed to add product');
      }

      const updatedProduct = await response.json();
      toast.success(editingProductId ? 'Product updated successfully!' : 'Product added successfully!');
      
      // Refresh products list
      const updatedProductsResponse = await fetch('/api/products');
      if (!updatedProductsResponse.ok) {
        throw new Error(`Failed to refresh products list: ${updatedProductsResponse.status} ${updatedProductsResponse.statusText}`);
      }
      const updatedProducts = await updatedProductsResponse.json();
      setProducts(updatedProducts || []);

      // Reset form
      setProduct({
        title: '',
        price: '',
        originalPrice: '',
        discount: '',
        rating: '',
        reviews: '',
        description: '',
        images: [],
        category: '',
        type: 'forYou',
        endDate: '',
        colors: [],
        brand: '',
        weight: '',
        details: '',
      });
      setFiles([]);
      setIsModalOpen(false);
      setEditingProductId(null);
    } catch (error) {
      console.error('Error processing product:', error);
      toast.error(error.message || 'Failed to process product');
    } finally {
      setUploading(false);
    }
  };

  const handleEditProduct = async (id) => {
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        throw new Error('Invalid product ID format');
      }
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        const text = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          throw new Error(`Server returned non-JSON response: ${text.slice(0, 100)}...`);
        }
        throw new Error(errorData.error || 'Failed to fetch product');
      }
      const productData = await response.json();
      setProduct({
        ...productData,
        price: productData.price.toString(),
        originalPrice: productData.originalPrice?.toString() || '',
        discount: productData.discount?.toString() || '',
        rating: productData.rating?.toString() || '',
        reviews: productData.reviews?.toString() || '',
        colors: productData.colors || [],
        brand: productData.brand || '',
        weight: productData.weight || '',
        details: productData.details || '',
        images: productData.images || [],
      });
      setEditingProductId(id);
      setFiles([]);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching product for edit:', error);
      toast.error(error.message || 'Failed to load product for editing');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product? This will also remove associated flash sale entries.')) return;
    try {
      if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        throw new Error('Invalid product ID format');
      }
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const text = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          throw new Error(`Server returned non-JSON response: ${text.slice(0, 100)}...`);
        }
        throw new Error(errorData.error || 'Failed to delete product');
      }
      toast.success('Product deleted successfully!');
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product');
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
      toast.success('Category added successfully!');
      setCategory({ name: '', icon: '' });
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error(error.message || 'Failed to add category');
    }
  };

  const openAddProductModal = () => {
    setProduct({
      title: '',
      price: '',
      originalPrice: '',
      discount: '',
      rating: '',
      reviews: '',
      description: '',
      images: [],
      category: '',
      type: 'forYou',
      endDate: '',
      colors: [],
      brand: '',
      weight: '',
      details: '',
    });
    setEditingProductId(null);
    setFiles([]);
    setIsModalOpen(true);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
            <Package className="w-8 h-8 mr-2 text-teal-500" />
            Admin Dashboard
          </h1>
          <motion.button
            onClick={openAddProductModal}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </motion.button>
        </div>

        {/* Products List */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-12"
        >
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Products</h2>
          {products.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No products found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Brand</th>
                    <th className="px-4 py-3 font-medium">Weight</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <motion.tr
                      key={prod._id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="px-4 py-3">{prod.title}</td>
                      <td className="px-4 py-3">${parseFloat(prod.price || 0).toFixed(2)}</td>
                      <td className="px-4 py-3">{prod.category || 'N/A'}</td>
                      <td className="px-4 py-3">{prod.brand || 'N/A'}</td>
                      <td className="px-4 py-3">{prod.weight || 'N/A'}</td>
                      <td className="px-4 py-3 flex space-x-2">
                        <motion.button
                          onClick={() => handleEditProduct(prod._id)}
                          className="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Edit product"
                        >
                          <Edit className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteProduct(prod._id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Delete product"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.section>

        {/* Category Form */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
          id="category"
        >
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Add New Category</h2>
          <form onSubmit={handleCategorySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category Name</label>
              <input
                type="text"
                name="name"
                value={category.name}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
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

        {/* Product Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editingProductId ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <motion.button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Close"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
                <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={product.title}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
                    <input
                      type="number"
                      name="price"
                      value={product.price}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Original Price</label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={product.originalPrice}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Discount (%)</label>
                    <input
                      type="number"
                      name="discount"
                      value={product.discount}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rating</label>
                    <input
                      type="number"
                      name="rating"
                      value={product.rating}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      min="0"
                      max="5"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reviews</label>
                    <input
                      type="number"
                      name="reviews"
                      value={product.reviews}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Type</label>
                    <select
                      name="type"
                      value={product.type}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    >
                      <option value="forYou">For You</option>
                      <option value="recommended">Recommended</option>
                      <option value="flashSale">Flash Sale</option>
                    </select>
                  </div>
                  {product.type === 'flashSale' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Flash Sale End Date</label>
                      <input
                        type="datetime-local"
                        name="endDate"
                        value={product.endDate}
                        onChange={handleProductChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={product.brand}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weight</label>
                    <input
                      type="text"
                      name="weight"
                      value={product.weight}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., 1.5 kg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea
                      name="description"
                      value={product.description}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      rows="4"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Details</label>
                    <textarea
                      name="details"
                      value={product.details}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      rows="4"
                      placeholder="e.g., Material: Aluminum, Warranty: 1 year"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Images (up to 5)</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                    />
                    {files.length > 0 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Selected: {files.map((file) => file.name).join(', ')}
                      </p>
                    )}
                    {editingProductId && product.images.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Existing Images:</p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc pl-5">
                          {product.images.map((img, index) => (
                            <li key={index} className="truncate">{img}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Colors (comma-separated, e.g., red,blue,black)</label>
                    <input
                      type="text"
                      name="colors"
                      value={product.colors.join(',')}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="red,blue,black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                    <input
                      type="text"
                      name="category"
                      value={product.category}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="md:col-span-2 flex space-x-4">
                    <motion.button
                      type="submit"
                      className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 flex-1"
                      disabled={uploading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {uploading ? 'Processing...' : editingProductId ? 'Update Product' : 'Add Product'}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-lg font-medium transition-colors duration-300 flex-1"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}