
"use client";
import React, { useState, useEffect } from "react";
import { Loader2, ShoppingCart, CreditCard, Home } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderDetails, setOrderDetails] = useState({
    name: "",
    city: "",
    address: "",
    town: "",
    phone: "",
    altPhone: "",
  });

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch("/api/cart", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load cart");
        const data = await res.json();
        setCart(data.items || []);
      } catch (err) {
        console.error("Cart fetch error:", err.message);
        toast.error("Failed to load cart", {
          style: {
            background: '#FFFFFF',
            color: '#1F2937',
            border: '1px solid #EF4444',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
          },
          iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handleChange = (e) => {
    setOrderDetails({ ...orderDetails, [e.target.name]: e.target.value });
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!orderDetails.name || !orderDetails.city || !orderDetails.address || !orderDetails.town || !orderDetails.phone) {
      toast.error("Please fill all required fields", {
        style: {
          background: '#FFFFFF',
          color: '#1F2937',
          border: '1px solid #EF4444',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
        },
        iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
      });
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty", {
        style: {
          background: '#FFFFFF',
          color: '#1F2937',
          border: '1px solid #EF4444',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
        },
        iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          paymentMethod,
          shippingDetails: orderDetails,
          status: "Pending",
        }),
        credentials: "include",
      });

      if (!orderRes.ok) {
        const contentType = orderRes.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response from orders API');
        }
        const data = await orderRes.json();
        throw new Error(data.message || "Failed to place order");
      }

      const clearCartRes = await fetch("/api/cart", {
        method: "DELETE",
        credentials: "include",
      });

      if (!clearCartRes.ok) {
        console.warn("Failed to clear cart in backend, but order was placed");
      }

      setCart([]);
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { count: 0 } }));

      setOrderDetails({
        name: "",
        city: "",
        address: "",
        town: "",
        phone: "",
        altPhone: "",
      });

      toast.success("Order placed successfully!", {
        style: {
          background: '#FFFFFF',
          color: '#1F2937',
          border: '1px solid #F85606',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(248, 86, 6, 0.2)',
        },
        iconTheme: { primary: '#F85606', secondary: '#FFFFFF' },
      });

      router.push("/pages/orders");
    } catch (err) {
      console.error("Order submission error:", err.message);
      toast.error(err.message || "Failed to place order", {
        style: {
          background: '#FFFFFF',
          color: '#1F2937',
          border: '1px solid #EF4444',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
        },
        iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <Loader2 className="w-10 h-10 text-orange-600 dark:text-orange-400 animate-spin" />
        </motion.div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 font-poppins">
        <ShoppingCart className="w-12 h-12 mb-4 text-orange-600 dark:text-orange-400" />
        <p className="text-lg">Your cart is empty.</p>
        <Link
          href="/"
          className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200"
        >
          <Home className="w-5 h-5" /> Return to Home
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 font-poppins"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
    >
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Checkout</h1>
          <Link
            href="/carts"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200"
          >
            <ShoppingCart className="w-5 h-5" /> Back to Cart
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cart Summary */}
          <motion.div
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Order Summary</h2>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.productId} className="flex justify-between items-center text-gray-700 dark:text-gray-200">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.product?.image || "/placeholder.png"}
                      alt={item.product?.title || "Product"}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <span className="block text-sm font-medium">{item.product?.title || "Unknown Product"}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">x{item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-medium">${((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold border-t border-gray-200 dark:border-gray-700 pt-4 mt-6 text-lg">
              <span>Total:</span>
              <span className="text-orange-600 dark:text-orange-400">Rs{total.toFixed(2)}</span>
            </div>
          </motion.div>

          {/* Checkout Form */}
          <motion.form
            onSubmit={handleOrderSubmit}
            className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Shipping Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {["name", "city", "address", "town", "phone", "altPhone"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {field === "name" ? "Name *" :
                     field === "city" ? "City *" :
                     field === "address" ? "Address *" :
                     field === "town" ? "Town *" :
                     field === "phone" ? "Phone Number *" :
                     "Alternative Phone Number"}
                  </label>
                  <input
                    type={field.includes("phone") ? "tel" : "text"}
                    name={field}
                    value={orderDetails[field]}
                    onChange={handleChange}
                    required={["name", "city", "address", "town", "phone"].includes(field)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all duration-200 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
                    disabled={isSubmitting}
                    placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                  />
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Payment Method</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  type="button"
                  className={`flex items-center px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors duration-200 ${
                    paymentMethod === "cod"
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                      : "border-gray-200 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-400 text-gray-700 dark:text-gray-200"
                  }`}
                  onClick={() => setPaymentMethod("cod")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isSubmitting}
                >
                  <Home className="w-5 h-5 mr-2" /> Cash on Delivery
                </motion.button>
                <motion.button
                  type="button"
                  className={`flex items-center px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors duration-200 ${
                    paymentMethod === "online"
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                      : "border-gray-200 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-400 text-gray-700 dark:text-gray-200"
                  }`}
                  onClick={() => {
                    setPaymentMethod("online");
                    toast.success("Redirecting to payment gateway...", {
                      style: {
                        background: '#FFFFFF',
                        color: '#1F2937',
                        border: '1px solid #F85606',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(248, 86, 6, 0.2)',
                      },
                      iconTheme: { primary: '#F85606', secondary: '#FFFFFF' },
                    });
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isSubmitting}
                >
                  <CreditCard className="w-5 h-5 mr-2" /> Online Payment
                </motion.button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white py-3 rounded-lg font-semibold flex justify-center items-center hover:from-orange-600 hover:to-orange-700 dark:hover:from-orange-700 dark:hover:to-orange-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </motion.div>
  );
}
