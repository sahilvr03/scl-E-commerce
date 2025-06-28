// pages/admin/add-product.js (Pages Router)
// OR
// app/admin/add-product/page.jsx (App Router)

'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Loader2, ChevronLeft,PlusCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminAddProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [product, setProduct] = useState({
    title: '',
    price: '',
    originalPrice: '',
    discount: '',
    rating: '',
    reviews: '',
    description: '',
    imageUrl: '', // This will be set after Cloudinary upload
    category: '',
    sku: '', // Add SKU field
    brand: '', // Add brand field
    inStock: true, // Default to in stock
    images: [], // For multiple images
  });
  const [file, setFile] = useState(null); // For single file upload
  const [additionalFiles, setAdditionalFiles] = useState([]); // For multiple files
  const [uploading, setUploading] = useState(false);

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (status === 'loading') return; // Do nothing while session is loading

    if (!session) {
      toast.error('You must be logged in to access this page.');
      router.push('/login');
    } else if (session.user?.role !== 'admin') {
      toast.error('Access denied. You are not an admin.');
      router.push('/'); // Redirect non-admins to home
    }
  }, [session, status, router]);

  const handleProductChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct({
      ...product,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleMainFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAdditionalFilesChange = (e) => {
    setAdditionalFiles(Array.from(e.target.files));
  };

  const uploadToCloudinary = async (fileToUpload) => {
    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("upload_preset", "ecommerce"); // Your Cloudinary upload preset
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; // Ensure this is set in .env.local

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "Cloudinary upload failed");
    }
    return data.secure_url;
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    toast.loading('Adding product...');

    if (!session || !session.user?.id) {
      toast.dismiss();
      toast.error('User not authenticated. Please log in.');
      setUploading(false);
      return;
    }

    let mainImageUrl = product.imageUrl;
    const additionalImageUrls = [];

    try {
      // Upload main image
      if (file) {
        mainImageUrl = await uploadToCloudinary(file);
      } else if (!product.imageUrl) {
        // If no file selected and no existing URL, consider it an error or use placeholder
        toast.dismiss();
        toast.error('Please upload a main product image.');
        setUploading(false);
        return;
      }

      // Upload additional images
      for (const extraFile of additionalFiles) {
        const url = await uploadToCloudinary(extraFile);
        additionalImageUrls.push(url);
      }

      const productData = {
        ...product,
        imageUrl: mainImageUrl,
        images: [mainImageUrl, ...additionalImageUrls].filter(Boolean), // Ensure main image is first, filter out null/undefined
        ownerId: session.user.id, // Set the ownerId from the session
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
        discount: product.discount ? Number(product.discount) : undefined,
        rating: product.rating ? Number(product.rating) : 0,
        reviews: product.reviews ? Number(product.reviews) : 0,
      };

      // --- DATA SUBMISSION ---
      // Endpoint: /api/products (POST method)
      // Payload (JSON Body): Full product data including ownerId
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      toast.dismiss(); // Dismiss the "Adding product..." toast

      if (response.ok) {
        toast.success('Product added successfully!');
        setProduct({ // Reset form
          title: '', price: '', originalPrice: '', discount: '', rating: '', reviews: '',
          description: '', imageUrl: '', category: '', sku: '', brand: '', inStock: true, images: []
        });
        setFile(null);
        setAdditionalFiles([]);
        router.push('/admin'); // Redirect back to admin dashboard
      } else {
        throw new Error(data.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(error.message || 'Failed to add product');
    } finally {
      setUploading(false);
    }
  };

  if (status === 'loading' || !session || session.user?.role !== 'admin') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <div className="flex items-center mb-6">
        <Link href="/admin" className="flex items-center text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300">
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Add New Product</h1>

      <div className="mb-12 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price ($)</label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleProductChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              required
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Original Price ($)</label>
            <input
              type="number"
              name="originalPrice"
              value={product.originalPrice}
              onChange={handleProductChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rating (0-5)</label>
            <input
              type="number"
              name="rating"
              value={product.rating}
              onChange={handleProductChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              min="0"
              max="5"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reviews Count</label>
            <input
              type="number"
              name="reviews"
              value={product.reviews}
              onChange={handleProductChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SKU</label>
            <input
              type="text"
              name="sku"
              value={product.sku}
              onChange={handleProductChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Brand</label>
            <input
              type="text"
              name="brand"
              value={product.brand}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Main Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleMainFileChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              required={!product.imageUrl} // Require file if no imageUrl is set
            />
            {file && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Selected: {file.name}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Additional Images (Optional)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleAdditionalFilesChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
            {additionalFiles.length > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Selected: {additionalFiles.map(f => f.name).join(', ')}
              </p>
            )}
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
          <div className="flex items-center mt-4">
            <input
              id="inStock"
              type="checkbox"
              name="inStock"
              checked={product.inStock}
              onChange={handleProductChange}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label htmlFor="inStock" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
              In Stock
            </label>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center disabled:opacity-50"
              disabled={uploading}
            >
              {uploading ? <Loader2 className="animate-spin mr-2" size={20} /> : <PlusCircle className="w-5 h-5 mr-2" />}
              {uploading ? 'Adding Product...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}