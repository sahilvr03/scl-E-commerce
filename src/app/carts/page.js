'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch('/api/cart', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setCartItems(data.items || []);
        } else {
          const errorData = await response.json();
          if (errorData.message.includes('Not authenticated')) {
            toast.error('Please log in to view your cart.');
            router.push('/login?redirect=/carts');
          } else {
            toast.error(errorData.message || 'Failed to fetch cart.');
          }
        }
      } catch (error) {
        console.error('Cart fetch error:', error);
        toast.error('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [router]);

  const handleRemoveItem = async (productId) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
        toast.success('Item removed from cart.');
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: data.items.length } }));
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to remove item.');
      }
    } catch (error) {
      console.error('Remove item error:', error);
      toast.error('An unexpected error occurred.');
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.productId}
              className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
            >
              <img
                src={item.product.imageUrl}
                alt={item.product.title}
                className="w-20 h-20 object-cover rounded-md mr-4"
              />
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.product.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">${item.product.price} x {item.quantity}</p>
              </div>
              <button
                onClick={() => handleRemoveItem(item.productId)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              Total: $
              {cartItems
                .reduce((sum, item) => sum + item.product.price * item.quantity, 0)
                .toFixed(2)}
            </p>
            <button
              onClick={() => router.push('/checkout')}
              className="mt-4 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}