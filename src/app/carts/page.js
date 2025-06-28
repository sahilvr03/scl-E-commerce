'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ShoppingCart, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  // Mock user ID for demonstration. In a real app, this would come from authentication (e.g., session, auth context).
  const userId = 'mock-user-id-123';

  useEffect(() => {
    /**
     * Fetches cart items from the backend API.
     * It also fetches full product details if they are not already embedded in the cart item data.
     */
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        // --- DATA FETCHING (GET Request) ---
        // Endpoint: /api/cart
        // Payload (Query Parameters): userId
        // Example URL: /api/cart?userId=mock-user-id-123
        const response = await fetch(`/api/cart?userId=${userId}`);
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response from cart API');
        }
        const data = await response.json(); // Expected response: { items: [{ productId, quantity, product: { ...fullProductDetails } }] }

        if (response.ok) {
          // Enhance cart items with full product details if not already present
          // This part handles cases where the cart API might not return full product details
          // (though your /api/cart GET route *does* return them, this adds robustness).
          const itemsWithDetails = await Promise.all(
            (data.items || []).map(async (item) => {
              if (!item.product || !item.product._id) { // Check if product details are missing
                try {
                  // --- DATA FETCHING (Fallback GET Request for Product Details) ---
                  // Endpoint: /api/product/[id]
                  // Payload (URL Parameter): productId
                  // Example URL: /api/product/65a123456789abcdef0123456
                  const productResponse = await fetch(`/api/product/${item.productId}`);
                  if (!productResponse.ok) {
                    throw new Error('Product not found');
                  }
                  const productData = await productResponse.json(); // Expected response: { _id, title, price, imageUrl, ... }

                  // Image optimization for Cloudinary URLs
                  if (
                    productData.imageUrl &&
                    productData.imageUrl.includes('/upload/') &&
                    productData.imageUrl.startsWith('https://res.cloudinary.com')
                  ) {
                    productData.imageUrl = `${productData.imageUrl.split('/upload/')[0]}/upload/w_96,h_96,c_fill/${
                      productData.imageUrl.split('/upload/')[1]
                    }`;
                  } else {
                    productData.imageUrl = '/placeholder.jpg';
                  }
                  return { ...item, product: productData };
                } catch (error) {
                  console.error(`Error fetching product ${item.productId}:`, error);
                  return {
                    ...item,
                    product: {
                      _id: item.productId,
                      title: 'Unknown Product',
                      price: 0,
                      imageUrl: '/placeholder.jpg',
                      sku: 'N/A',
                      brand: 'N/A',
                      category: 'N/A',
                    },
                  };
                }
              }
              // If product details were already fetched by the cart API, just optimize the image
              if (
                item.product?.imageUrl &&
                item.product.imageUrl.includes('/upload/') &&
                item.product.imageUrl.startsWith('https://res.cloudinary.com')
              ) {
                item.product.imageUrl = `${item.product.imageUrl.split('/upload/')[0]}/upload/w_96,h_96,c_fill/${
                  item.product.imageUrl.split('/upload/')[1]
                }`;
              } else {
                item.product.imageUrl = '/placeholder.jpg';
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
        setCartItems([]); // Clear cart on error
      } finally {
        setLoading(false);
      }
    };
    fetchCartItems();
  }, [userId]); // Re-run effect if userId changes

  /**
   * Updates the quantity of a specific product in the cart.
   * @param {string} productId - The ID of the product to update.
   * @param {number} newQuantity - The new quantity for the product.
   */
  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return; // Prevent quantity from going below 1
    try {
      // --- DATA FETCHING (PUT Request) ---
      // Endpoint: /api/cart
      // Payload (JSON Body): { userId, productId, quantity }
      // Example Payload: { "userId": "mock-user-id-123", "productId": "65a123456789abcdef0123456", "quantity": 2 }
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
        const data = await response.json(); // Expected error: { error: "..." }
        throw new Error(data.error || 'Failed to update cart');
      }
      const data = await response.json(); // Expected response: { items: [...updatedCartItemsWithDetails] }
      setCartItems(data.items || []); // Update cart items with the fresh data from the server
      // Dispatch custom event to update cart count in other components (e.g., header)
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: data.items.reduce((sum, item) => sum + item.quantity, 0) } }));
      toast.success('Cart updated!');
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error(error.message || 'Failed to update cart');
    }
  };

  /**
   * Removes a specific product from the cart.
   * @param {string} productId - The ID of the product to remove.
   */
  const handleRemoveItem = async (productId) => {
    try {
      // --- DATA FETCHING (DELETE Request) ---
      // Endpoint: /api/cart
      // Payload (JSON Body): { userId, productId }
      // Example Payload: { "userId": "mock-user-id-123", "productId": "65a123456789abcdef0123456" }
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
        const data = await response.json(); // Expected error: { error: "..." }
        throw new Error(data.error || 'Failed to remove item');
      }
      const data = await response.json(); // Expected response: { items: [...updatedCartItemsWithDetails] }
      setCartItems(data.items || []); // Update cart items with the fresh data from the server
      setSelectedItems(selectedItems.filter(id => id !== productId)); // Deselect the removed item
      // Dispatch custom event to update cart count
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: data.items.reduce((sum, item) => sum + item.quantity, 0) } }));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error(error.message || 'Failed to remove item');
    }
  };

  /**
   * Deletes all selected items from the cart.
   */
  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) {
      toast.error('No items selected for deletion');
      return;
    }
    try {
      // --- DATA FETCHING (Multiple DELETE Requests for selected items) ---
      // This sends a DELETE request for each selected item.
      // A more efficient approach for many items might be a single DELETE endpoint
      // that accepts an array of product IDs.
      await Promise.all(
        selectedItems.map(async (productId) => {
          // Endpoint: /api/cart
          // Payload (JSON Body): { userId, productId }
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
      // After all deletions, re-fetch the entire cart to ensure state is synchronized
      // --- DATA FETCHING (GET Request after multiple deletions) ---
      // Endpoint: /api/cart
      // Payload (Query Parameters): userId
      const response = await fetch(`/api/cart?userId=${userId}`);
      const data = await response.json();
      setCartItems(data.items || []);
      setSelectedItems([]); // Clear selected items after deletion
      // Dispatch custom event to update cart count
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: data.items.reduce((sum, item) => sum + item.quantity, 0) } }));
      toast.success('Selected items removed from cart');
    } catch (error) {
      console.error('Error removing selected items:', error);
      toast.error(error.message || 'Failed to remove selected items');
    }
  };

  /**
   * Toggles the selection state of a cart item.
   * @param {string} productId - The ID of the product to select/deselect.
   */
  const handleSelectItem = (productId) => {
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Utility function to calculate subtotal for a given set of items
  const calculateSubtotal = (items = cartItems) => {
    return items
      .reduce((total, item) => {
        const price = Number(item.product?.price) || 0;
        return total + price * item.quantity;
      }, 0)
      .toFixed(2);
  };

  // Utility function to calculate tax
  const calculateTax = (subtotal) => {
    const taxRate = 0.1; // 10% tax
    return (subtotal * taxRate).toFixed(2);
  };

  // Utility function to calculate total
  const calculateTotal = (items = cartItems) => {
    const subtotal = Number(calculateSubtotal(items));
    const tax = Number(calculateTax(subtotal));
    return (subtotal + tax).toFixed(2);
  };

  // Calculate subtotal for only the selected items
  const calculateSelectedSubtotal = () => {
    const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.product?._id || item.productId));
    return calculateSubtotal(selectedCartItems);
  };

  // Calculate total for only the selected items
  const calculateSelectedTotal = () => {
    const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.product?._id || item.productId));
    return calculateTotal(selectedCartItems);
  };

  /**
   * Handles the action when the user proceeds to payment.
   * In a real application, this would redirect to a checkout page or payment gateway.
   */
  const handleProceedToPay = () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to proceed to payment');
      return;
    }
    // In a real app, you would send the selectedItems or calculate a new order based on them
    // and then redirect to a checkout page.
    toast.success('Redirecting to payment gateway...');
    // Example: router.push('/checkout?items=' + JSON.stringify(selectedItems));
  };

  // Framer Motion animation variants for buttons
  const buttonHover = {
    scale: 1.03,
    transition: { duration: 0.2 }
  };
  const buttonTap = {
    scale: 0.98
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <ShoppingCart className="w-12 h-12 text-teal-500 animate-spin" />
        </motion.div>
      </div>
    );
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
          <motion.button
            onClick={handleDeleteSelected}
            className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition duration-300"
            whileHover={buttonHover}
            whileTap={buttonTap}
          >
            Delete Selected ({selectedItems.length})
          </motion.button>
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
              {cartItems.map((item) => {
                // Ensure imageUrl is optimized before rendering Image component
                const optimizedImageUrl =
                  item.product?.imageUrl &&
                  item.product.imageUrl.includes('/upload/') &&
                  item.product.imageUrl.startsWith('https://res.cloudinary.com')
                    ? item.product.imageUrl
                    : '/placeholder.jpg';
                return (
                  <motion.div
                    key={item.product?._id || item.productId} // Use product._id if available, otherwise productId
                    className="flex items-center border-b border-gray-200 dark:border-gray-700 py-4 last:border-b-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.product?._id || item.productId)}
                      onChange={() => handleSelectItem(item.product?._id || item.productId)}
                      className="mr-4 h-5 w-5 text-teal-600"
                    />
                    <div className="w-24 h-24 mr-4 flex-shrink-0">
                      <Image
                        src={optimizedImageUrl}
                        alt={item.product?.title || 'Unknown Product'}
                        width={96}
                        height={96}
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-grow">
                      <Link href={`/products/${item.product?._id || item.productId}`}>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                          {item.product?.title || 'Unknown Product'}
                        </h3>
                      </Link>
                      <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                        <p><span className="font-medium">Price:</span> ${item.product?.price ? item.product.price : '0.00'}</p>
                        <p><span className="font-medium">SKU:</span> {item.product?.sku || 'N/A'}</p>
                        <p><span className="font-medium">Brand:</span> {item.product?.brand || 'N/A'}</p>
                        <p><span className="font-medium">Category:</span> {item.product?.category || 'N/A'}</p>
                        {item.product?.discount && (
                          <p><span className="font-medium">Discount:</span> {item.product.discount}% OFF</p>
                        )}
                        <p><span className="font-medium">Subtotal:</span> ${(item.product?.price * item.quantity || 0).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center mt-2">
                        <motion.button
                          onClick={() => handleUpdateQuantity(item.product?._id || item.productId, item.quantity - 1)}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l-lg transition-colors"
                          whileHover={buttonHover}
                          whileTap={buttonTap}
                        >
                          -
                        </motion.button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.product?._id || item.productId, Number(e.target.value))}
                          className="w-16 px-3 py-1 text-center bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-x border-gray-300 dark:border-gray-600"
                        />
                        <motion.button
                          onClick={() => handleUpdateQuantity(item.product?._id || item.productId, item.quantity + 1)}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r-lg transition-colors"
                          whileHover={buttonHover}
                          whileTap={buttonTap}
                        >
                          +
                        </motion.button>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => handleRemoveItem(item.product?._id || item.productId)}
                      className="p-2 text-red-500 hover:text-red-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </div>
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Subtotal (All Items)</span>
                  <span className="font-medium">${calculateSubtotal()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Tax (10%)</span>
                  <span className="font-medium">${calculateTax(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total (All Items)</span>
                  <span className="text-lg font-semibold">${calculateTotal()}</span>
                </div>
                {selectedItems.length > 0 && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h3 className="text-lg font-semibold mb-2">Selected Items ({selectedItems.length})</h3>
                      <div className="space-y-2">
                        {cartItems
                          .filter(item => selectedItems.includes(item.product?._id || item.productId))
                          .map(item => (
                            <div key={item.product?._id || item.productId} className="flex justify-between text-sm">
                              <span>{item.product?.title || 'Unknown Product'} (x{item.quantity})</span>
                              <span>${(item.product?.price * item.quantity || 0).toFixed(2)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Selected Subtotal</span>
                      <span className="font-medium">${calculateSelectedSubtotal()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Tax (10%)</span>
                      <span className="font-medium">${calculateTax(calculateSelectedSubtotal())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Selected Total</span>
                      <span className="text-lg font-semibold">${calculateSelectedTotal()}</span>
                    </div>
                  </>
                )}
              </div>
              <motion.button
                onClick={handleProceedToPay}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg transition duration-300 mt-6"
                disabled={cartItems.length === 0}
                whileHover={buttonHover}
                whileTap={buttonTap}
              >
                Proceed to Pay
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}