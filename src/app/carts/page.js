'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ShoppingCart, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const userId = 'mock-user-id-123'; // Replace with actual user authentication

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/cart?userId=${userId}`);
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response from cart API');
        }
        const data = await response.json();
        if (response.ok) {
          const itemsWithDetails = await Promise.all(
            (data.items || []).map(async (item) => {
              if (!item.product) {
                const productResponse = await fetch(`/api/products/${item.productId}`);
                const productData = await productResponse.json();
                return { ...item, product: productData || { price: 0, title: 'Unknown', imageUrl: '/placeholder.jpg' } };
              }
              return item;
            })
          );
          setCartItems(itemsWithDetails);
        } else {
          throw new Error(data.error || 'Failed to fetch cart');
        }
      } catch (error) {
        console.error('Error fetching cart items:', error);
        toast.error('Failed to load cart data');
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, quantity: newQuantity }),
      });
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response from cart API');
        }
        const data = await response.json();
        throw new Error(data.error || 'Failed to update cart');
      }
      const data = await response.json();
      setCartItems(data.items || []);
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: data.items.reduce((sum, item) => sum + item.quantity, 0) } }));
      toast.success('Cart updated!');
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error(error.message || 'Failed to update cart');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId }),
      });
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response from cart API');
        }
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove item');
      }
      const data = await response.json();
      setCartItems(data.items || []);
      setSelectedItems(selectedItems.filter(id => id !== productId));
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: data.items.reduce((sum, item) => sum + item.quantity, 0) } }));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error(error.message || 'Failed to remove item');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) {
      toast.error('No items selected for deletion');
      return;
    }
    try {
      await Promise.all(
        selectedItems.map(async (productId) => {
          const response = await fetch('/api/cart', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, productId }),
          });
          if (!response.ok) {
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              throw new Error('Received non-JSON response from cart API');
            }
            const data = await response.json();
            throw new Error(data.error || 'Failed to remove item');
          }
        })
      );
      const response = await fetch(`/api/cart?userId=${userId}`);
      const data = await response.json();
      setCartItems(data.items || []);
      setSelectedItems([]);
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: data.items.reduce((sum, item) => sum + item.quantity, 0) } }));
      toast.success('Selected items removed from cart');
    } catch (error) {
      console.error('Error removing selected items:', error);
      toast.error(error.message || 'Failed to remove selected items');
    }
  };

  const handleSelectItem = (productId) => {
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const calculateSubtotal = () => {
    return cartItems
      .reduce((total, item) => {
        const price = Number(item.product?.price) || 0;
        return total + price * item.quantity;
      }, 0)
      .toFixed(2);
  };

  const calculateTax = (subtotal) => {
    const taxRate = 0.1; // 10% tax rate, adjust as needed
    return (subtotal * taxRate).toFixed(2);
  };

  const calculateTotal = () => {
    const subtotal = Number(calculateSubtotal());
    const tax = Number(calculateTax(subtotal));
    return (subtotal + tax).toFixed(2);
  };

  const handleProceedToPay = () => {
    toast.success('Redirecting to payment gateway...');
    // Add actual payment gateway integration here
  };

  if (loading) {
    return <p className="text-center mt-10 text-gray-600 dark:text-gray-300">Loading cart...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/" className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center">
            Home
            <ChevronRight className="w-4 h-4 mx-2" />
          </Link>
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
        </div>
        {cartItems.length > 0 && (
          <button
            onClick={handleDeleteSelected}
            className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition duration-300"
          >
            Delete Selected ({selectedItems.length})
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-4">Your cart is empty</p>
          <Link
            href="/"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-3 rounded-lg transition duration-300"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Cart Items ({cartItems.length})</h2>
              {cartItems.map((item) => (
                <div
                  key={item.product?._id || item.productId}
                  className="flex items-center border-b border-gray-200 dark:border-gray-700 py-4 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.product?._id || item.productId)}
                    onChange={() => handleSelectItem(item.product?._id || item.productId)}
                    className="mr-4"
                  />
                  <div className="w-24 h-24 mr-4">
                    <Image
                      src={item.product?.imageUrl || '/placeholder.jpg'}
                      alt={item.product?.title || 'Unknown Product'}
                      width={96}
                      height={96}
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-grow">
                    <Link
                      href={`/products/${item.product?._id || item.productId}`}
                      className="text-lg font-medium text-gray-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400"
                    >
                      {item.product?.title || 'Unknown Product'}
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      ${Number(item.product?.price || 0).toFixed(2)} x {item.quantity}
                    </p>
                    <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 mt-1">
                      ${(Number(item.product?.price || 0) * item.quantity).toFixed(2)}
                    </p>
                    <div className="flex items-center mt-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.product?._id || item.productId, item.quantity - 1)}
                        className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-l-md"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(item.product?._id || item.productId, Number(e.target.value))}
                        className="w-12 text-center border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        min="1"
                      />
                      <button
                        onClick={() => handleUpdateQuantity(item.product?._id || item.productId, item.quantity + 1)}
                        className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-r-md"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.product?._id || item.productId)}
                    className="ml-4 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              <div className="flex justify-between mb-4">
                <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                <span className="font-medium">${calculateSubtotal()}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-600 dark:text-gray-300">Tax (10%)</span>
                <span className="font-medium">${calculateTax(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between mb-6">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-semibold">${calculateTotal()}</span>
              </div>
              <button
                onClick={handleProceedToPay}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg transition duration-300"
                disabled={cartItems.length === 0}
              >
                Proceed to Pay
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}