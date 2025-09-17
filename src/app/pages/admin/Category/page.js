// pages/admin/categories.js
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Loader2,
} from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '',
    description: '',
    parentId: '',
  });
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
        });
        if (!response.ok) {
          toast.error('Please log in as an admin.');
          router.push('/login?redirect=/admin/categories');
          return;
        }
        const data = await response.json();
        if (!data.session || !data.session.user || data.session.user.role !== 'admin') {
          toast.error('Access denied. Admins only.');
          router.push('/login?redirect=/admin/categories');
          return;
        }
        fetchCategories();
      } catch (error) {
        console.error('Session check error:', error);
        toast.error('An unexpected error occurred.');
        router.push('/login?redirect=/admin/categories');
      }
    };
    checkSession();
  }, [router]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(buildCategoryTree(data));
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  const buildCategoryTree = (categories) => {
    const map = {};
    categories.forEach((cat) => {
      map[cat._id] = { ...cat, children: [] };
    });
    const tree = [];
    categories.forEach((cat) => {
      if (cat.parentId) {
        if (map[cat.parentId]) {
          map[cat.parentId].children.push(map[cat._id]);
        }
      } else {
        tree.push(map[cat._id]);
      }
    });
    return tree;
  };

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  const handleNewCategoryChange = (e) => {
    setNewCategory({ ...newCategory, [e.target.name]: e.target.value });
  };

  const handleNewCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add category');
      }

      const data = await response.json();
      toast.success('Category added successfully!');
      setNewCategory({ name: '', icon: '', description: '', parentId: '' });
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error(error.message || 'Failed to add category');
    }
  };

  const handleEditCategory = async (category) => {
    if (editingCategory && editingCategory._id === category._id) {
      // Save changes
      try {
        const response = await fetch(`/api/categories/${category._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingCategory),
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update category');
        }

        toast.success('Category updated successfully!');
        setEditingCategory(null);
        fetchCategories();
      } catch (error) {
        console.error('Error updating category:', error);
        toast.error(error.message || 'Failed to update category');
      }
    } else {
      // Start editing
      setEditingCategory({ ...category });
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }

      toast.success('Category deleted successfully!');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.message || 'Failed to delete category');
    }
  };

  const updateEditingField = (field, value) => {
    setEditingCategory({ ...editingCategory, [field]: value });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const renderCategory = (category, level = 0) => (
    <motion.li key={category._id} className={`flex items-center justify-between p-4 border-b border-gray-200 ${level > 0 ? 'ml-4 pl-4 border-l-2 border-gray-300' : ''}`}>
      <div className="flex items-center flex-1">
        <button
          onClick={() => toggleExpanded(category._id)}
          className="mr-2 text-gray-500 hover:text-gray-700"
        >
          {category.children && category.children.length > 0 ? (
            expandedCategories.has(category._id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          ) : null}
        </button>
        {editingCategory?._id === category._id ? (
          <input
            type="text"
            value={editingCategory.name}
            onChange={(e) => updateEditingField('name', e.target.value)}
            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        ) : (
          <span className="font-medium text-gray-900">{category.name}</span>
        )}
        {category.icon && (
          <span className="ml-2 text-sm text-gray-500">({category.icon})</span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleEditCategory(category)}
          className="p-1 text-blue-600 hover:text-blue-800"
          title={editingCategory?._id === category._id ? 'Save' : 'Edit'}
        >
          <Edit size={16} />
        </button>
        <button
          onClick={() => handleDeleteCategory(category._id)}
          className="p-1 text-red-600 hover:text-red-800"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
      {category.children && category.children.length > 0 && expandedCategories.has(category._id) && (
        <ul className="ml-4 mt-2">
          {category.children.map((child) => renderCategory(child, level + 1))}
        </ul>
      )}
    </motion.li>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Categories</h1>
        <motion.button
          onClick={() => setShowForm(!showForm)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          <span>{showForm ? 'Hide Form' : 'Add Category'}</span>
        </motion.button>
      </div>

      {/* Add New Category Form */}
      <AnimatePresence>
        {showForm && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-md mb-6"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Category</h2>
            <form onSubmit={handleNewCategorySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  name="name"
                  value={newCategory.name}
                  onChange={handleNewCategoryChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon Name (Lucide, optional)</label>
                <input
                  type="text"
                  name="icon"
                  value={newCategory.icon}
                  onChange={handleNewCategoryChange}
                  placeholder="e.g., Home, Grid"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  name="description"
                  value={newCategory.description}
                  onChange={handleNewCategoryChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category (optional)</label>
                <select
                  name="parentId"
                  value={newCategory.parentId}
                  onChange={handleNewCategoryChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">None (Top-level)</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <motion.button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Add Category
                </motion.button>
              </div>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Categories List */}
      <section className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold text-gray-800 p-4 border-b border-gray-200">Categories Hierarchy</h2>
        <ul className="divide-y divide-gray-200">
          {categories.length === 0 ? (
            <li className="p-4 text-center text-gray-500">No categories found. Add one above!</li>
          ) : (
            categories.map((category) => renderCategory(category))
          )}
        </ul>
      </section>

      {/* Quick Links */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 p-4 bg-gray-50 rounded-lg"
      >
        <h3 className="font-medium text-gray-800 mb-2">Quick Actions</h3>
        <div className="flex space-x-4">
          <Link href="/admin/products" className="text-teal-600 hover:text-teal-800">Manage Products</Link>
          <Link href="/admin" className="text-teal-600 hover:text-teal-800">Dashboard</Link>
        </div>
      </motion.section>
    </motion.div>
  );
}