'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ShoppingCart, Star, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductCard({ product }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      const sessionResponse = await fetch('/api/auth/session', {
        credentials: 'include',
      });

      if (!sessionResponse.ok || !(await sessionResponse.json()).session) {
        toast.error('Please log in to add items to your cart.');
        router.push(`/login?redirect=/products/${product._id}`);
        return;
      }

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });

      if (response.ok) {
        toast.success('Added to cart!');
        const cart = await (await fetch('/api/cart', { credentials: 'include' })).json();
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: cart.items.length } }));
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add to cart.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    router.push(`/checkout?productId=${product._id}&quantity=1`);
  };

  return (
    <div className="relative bg-white rounded-lg shadow-md overflow-hidden group transition hover:shadow-lg">
      <Link href={`/products/${product._id}`} className="block">
        <Image
          src={product.imageUrl || '/placeholder.jpg'}
          alt={product.title}
          width={400}
          height={400}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {product.discount && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          -{product.discount}%
        </span>
      )}

      <div className="p-4">
        <Link href={`/products/${product._id}`}>
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
            {product.title}
          </h3>
        </Link>

        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-teal-600 font-bold text-lg">
              ${product.price}
              {product.originalPrice && (
                <span className="ml-2 text-sm line-through text-gray-500">
                  ${product.originalPrice}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleAddToCart}
            disabled={loading}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-sm px-4 py-2 rounded-md flex items-center justify-center disabled:opacity-50"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            {loading ? 'Adding...' : 'Add to Cart'}
          </button>

          <button
            onClick={handleBuyNow}
            className="flex-1 bg-white border border-teal-600 text-teal-600 hover:bg-gray-100 text-sm px-4 py-2 rounded-md flex items-center justify-center"
          >
            <Zap className="w-4 h-4 mr-1" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}