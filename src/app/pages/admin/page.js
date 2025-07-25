'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Edit, Trash2, X, Loader2, Search } from 'lucide-react';
import Image from 'next/image';

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
    inStock: true,
  });
  const [category, setCategory] = useState({ name: '', icon: '' });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session', { credentials: 'include' });
        const data = await response.json();
        if (!response.ok || !data.session || !data.session.user || data.session.user.role !== 'admin') {
          toast.error('Please log in as an admin.');
          router.push('/login?redirect=/admin');
          return;
        }
        setSessionChecked(true);
      } catch (error) {
        console.error('Session check error:', error);
        toast.error('Failed to verify session');
        router.push('/login?redirect=/admin');
      }
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products', { credentials: 'include' });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        const productsArray = Array.isArray(data) ? data : data.products || [];
        setProducts(productsArray);
        setFilteredProducts(productsArray);
      } catch (error) {
        console.error('Error fetching products:', error.message);
        toast.error('Failed to load products.');
        setProducts([]);
        setFilteredProducts([]);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories', { credentials: 'include' });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching categories:', error.message);
        toast.error('Failed to load categories');
        setCategories([]);
      }
    };

    if (sessionChecked) {
      fetchProducts();
      fetchCategories();
    }
  }, [sessionChecked]);

  useEffect(() => {
    const filtered = products.filter((prod) =>
      prod.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.brand?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    if (name === 'colors') {
      setProduct({ ...product, colors: value.split(',').map(item => item.trim()).filter(item => item) });
    } else if (name === 'inStock') {
      setProduct({ ...product, inStock: e.target.checked });
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
        if (!cloudName) throw new Error('Cloudinary cloud name not configured');
        const uploadPromises = files.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', 'ecommerce');
          const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error?.message || `Failed to upload ${file.name}`);
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
        inStock: product.inStock,
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
        const data = await response.json();
        throw new Error(data.error || editingProductId ? 'Failed to update product' : 'Failed to add product');
      }

      toast.success(editingProductId ? 'Product updated successfully!' : 'Product added successfully!');
      const updatedProductsResponse = await fetch('/api/products', { credentials: 'include' });
      const updatedProducts = await updatedProductsResponse.json();
      setProducts(Array.isArray(updatedProducts) ? updatedProducts : updatedProducts.products || []);
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
        inStock: true,
      });
      setFiles([]);
      setIsModalOpen(false);
      setEditingProductId(null);
    } catch (error) {
      console.error('Error processing product:', error.message);
      toast.error(error.message || 'Failed to process product');
    } finally {
      setUploading(false);
    }
  };

  const handleEditProduct = async (id) => {
    try {
      const response = await fetch(`/api/product/${id}`, { credentials: 'include' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch product');
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
        inStock: productData.inStock !== undefined ? productData.inStock : true,
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
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(`/api/product/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete product');
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
        const data = await response.json();
        throw new Error(data.error || 'Failed to add category');
      }
      toast.success('Category added successfully!');
      const updatedCategoriesResponse = await fetch('/api/categories', { credentials: 'include' });
      const updatedCategories = await updatedCategoriesResponse.json();
      setCategories(Array.isArray(updatedCategories) ? updatedCategories : []);
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
      inStock: true,
    });
    setEditingProductId(null);
    setFiles([]);
    setIsModalOpen(true);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  if (!sessionChecked) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Package className="w-8 h-8 mr-3 text-indigo-500" />
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <motion.button
              onClick={openAddProductModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium flex items-center transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Product
            </motion.button>
          </div>
        </div>

        {/* Products Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Products</h2>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No products found. Try adding some!</p>
              <motion.button
                onClick={openAddProductModal}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add Your First Product
              </motion.button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Image</th>
                    <th className="px-6 py-4 font-semibold">Title</th>
                    <th className="px-6 py-4 font-semibold">Price</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold">Brand</th>
                    <th className="px-6 py-4 font-semibold">Stock</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((prod) => (
                    <motion.tr
                      key={prod._id}
                      className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="px-6 py-4">
                        {prod.images?.[0] ? (
                          <Image height={300} width={300} src={prod.images[0]} alt={prod.title} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                            <span className="text-xs">No Image</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 truncate max-w-xs">{prod.title || 'N/A'}</td>
                      <td className="px-6 py-4">Rs: {parseFloat(prod.price || 0).toFixed(2)}</td>
                      <td className="px-6 py-4">{prod.category || 'N/A'}</td>
                      <td className="px-6 py-4">{prod.brand || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${prod.inStock ? 'text-green-600' : 'text-red-600'}`}>
                          {prod.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex space-x-3">
                        <motion.button
                          onClick={() => handleEditProduct(prod._id)}
                          className="text-indigo-500 hover:text-indigo-600"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Edit product"
                        >
                          <Edit className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteProduct(prod._id)}
                          className="text-red-500 hover:text-red-600"
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

        {/* Categories Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Categories</h2>
          {categories.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-lg">No categories found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <motion.div
                  key={cat._id}
                  className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {cat.icon ? (
                    <Image width={300} height={300} src={cat.icon} alt={cat.name} className="w-12 h-12 object-cover rounded mr-4" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center mr-4">
                      <span className="text-xs">No Icon</span>
                    </div>
                  )}
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{cat.name}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Category Form Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Add New Category</h2>
          <form onSubmit={handleCategorySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category Name</label>
              <input
                type="text"
                name="name"
                value={category.name}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
                placeholder="e.g., Electronics"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon URL (Optional)</label>
              <input
                type="text"
                name="icon"
                value={category.icon}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="e.g., https://example.com/icon.png"
              />
            </div>
            <div className="md:col-span-2">
              <motion.button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
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
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editingProductId ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <motion.button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
                <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={product.title}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      required
                      placeholder="e.g., Wireless Mouse"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price *</label>
                    <input
                      type="number"
                      name="price"
                      value={product.price}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      required
                      min="0"
                      step="0.01"
                      placeholder="e.g., 29.99"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Original Price</label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={product.originalPrice}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      min="0"
                      step="0.01"
                      placeholder="e.g., 39.99"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Discount (%)</label>
                    <input
                      type="number"
                      name="discount"
                      value={product.discount}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      min="0"
                      max="100"
                      placeholder="e.g., 20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                    <input
                      type="number"
                      name="rating"
                      value={product.rating}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      min="0"
                      max="5"
                      step="0.1"
                      placeholder="e.g., 4.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reviews</label>
                    <input
                      type="number"
                      name="reviews"
                      value={product.reviews}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      min="0"
                      placeholder="e.g., 100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Type *</label>
                    <select
                      name="type"
                      value={product.type}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      required
                    >
                      <option value="forYou">For You</option>
                      <option value="recommended">Recommended</option>
                      <option value="flashSale">Flash Sale</option>
                    </select>
                  </div>
                  {product.type === 'flashSale' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Flash Sale End Date *</label>
                      <input
                        type="datetime-local"
                        name="endDate"
                        value={product.endDate}
                        onChange={handleProductChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                    <select
                      name="category"
                      value={product.category}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Colors (comma-separated)</label>
                    <input
                      type="text"
                      name="colors"
                      value={product.colors.join(', ')}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="e.g., Red, Blue, Black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={product.brand}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="e.g., Apple"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Weight</label>
                    <input
                      type="text"
                      name="weight"
                      value={product.weight}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="e.g., 1.5 kg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock Status</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="inStock"
                        checked={product.inStock}
                        onChange={handleProductChange}
                        className="h-4 w-4 text-indigo-500 focus:ring-indigo-400 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={product.description}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      rows="4"
                      placeholder="Enter product description"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Details</label>
                    <textarea
                      name="details"
                      value={product.details}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      rows="4"
                      placeholder="e.g., Material: Aluminum, Warranty: 1 year"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Images (up to 5)</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                    />
                    {files.length > 0 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Selected: {files.map((file) => file.name).join(', ')}
                      </p>
                    )}
                    {editingProductId && product.images.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Existing Images:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {product.images.map((img, index) => (
                            <Image height={300} width={300} key={index} src={img} alt={`Image ${index + 1}`} className="w-24 h-24 object-cover rounded-lg" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2 flex justify-end space-x-4">
                    <motion.button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {editingProductId ? 'Updating...' : 'Adding...'}
                        </>
                      ) : (
                        editingProductId ? 'Update Product' : 'Add Product'
                      )}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:text-gray-100 px-6 py-2.5 rounded-lg font-medium transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={uploading}
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