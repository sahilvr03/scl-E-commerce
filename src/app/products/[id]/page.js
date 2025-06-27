'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/product/${params.id}`);

        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Received non-JSON response from server');
          }
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error(error.message || 'Failed to load product');
      }
    };
    if (params.id) fetchProduct();
  }, [params.id]);

  const handleAddToCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'mock-user-id-123',
          productId: params.id,
          quantity,
        }),
      });
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response from cart API');
        }
        const data = await response.json();
        throw new Error(data.error || 'Failed to add to cart');
      }
      toast.success('Product added to cart!');
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: quantity } }));
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Something went wrong!');
    }
  };

  if (!product) return <p className="text-center mt-10">Loading product...</p>;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.title}
            width={500}
            height={500}
            className="object-cover w-full h-full"
            priority
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{product.title}</h1>
          <div className="flex items-center mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${i < product.rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                fill={i < product.rating ? 'currentColor' : 'none'}
              />
            ))}
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">({product.reviews} reviews)</span>
          </div>
          <div className="flex items-center space-x-4 mb-4">
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{product.price}</p>
            {product.originalPrice && (
              <p className="text-sm text-gray-500 dark:text-gray-400 line-through">{product.originalPrice}</p>
            )}
            {product.discount && (
              <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded-md font-medium">
                -{product.discount}% OFF
              </span>
            )}
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{product.description}</p>
          <div className="flex items-center space-x-3 mb-6">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
          </div>
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-3 rounded-lg transition duration-300 shadow-md"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}