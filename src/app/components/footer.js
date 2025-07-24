'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Facebook,
  Instagram,
  Twitter,
  ChevronDown,
  ChevronUp,
  Send,
  X,
} from 'lucide-react';

export default function Footer() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [email, setEmail] = useState('');
  const [openSections, setOpenSections] = useState({
    customerService: false,
    aboutUs: false,
    shop: false,
  });
  const [isClient, setIsClient] = useState(false);

  // Footer link data (replace with API fetch if available)
  const footerLinks = {
    customerService: [
      { href: '/contact', label: 'Contact Us' },
      { href: '/faqs', label: 'FAQs' },
      { href: '/shipping', label: 'Shipping Policy' },
      { href: '/returns', label: 'Returns & Refunds' },
    ],
    aboutUs: [
      { href: '/about', label: 'Our Story' },
      { href: '/careers', label: 'Careers' },
      { href: '/terms', label: 'Terms & Conditions' },
      { href: '/privacy', label: 'Privacy Policy' },
    ],
    shop: [
      { href: '/products', label: 'All Products' },
      { href: '/featured', label: 'Featured' },
      { href: '/new-arrivals', label: 'New Arrivals' },
      { href: '/deals', label: 'Deals' },
    ],
  };

  // Set isClient to true on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync dark mode with localStorage
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const darkMode = localStorage.getItem('darkMode') === 'true';
      setIsDarkMode(darkMode);
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // Toggle collapsible sections on mobile
  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle newsletter subscription
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter a valid email address.', {
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

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Subscribed successfully!', {
          style: {
            background: '#FFFFFF',
            color: '#1F2937',
            border: '1px solid #F85606',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(248, 86, 6, 0.2)',
          },
          iconTheme: { primary: '#F85606', secondary: '#FFFFFF' },
        });
        setEmail('');
      } else {
        toast.error(data.message || 'Failed to subscribe.', {
          style: {
            background: '#FFFFFF',
            color: '#1F2937',
            border: '1px solid #EF4444',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
          },
          iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
        });
      }
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast.error('An error occurred. Please try again.', {
        style: {
          background: '#FFFFFF',
          color: '#1F2937',
          border: '1px solid #EF4444',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
        },
        iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
      });
    }
  };

  // Clear email input
  const clearEmail = () => {
    setEmail('');
  };

  return (
    <motion.footer
      className="bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-800 py-10 sm:py-12 z-10 font-poppins"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 300 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10">
          {/* Customer Service */}
          <div>
            <motion.button
              className="w-full md:cursor-default flex justify-between items-center text-sm font-semibold text-gray-800 dark:text-gray-100 uppercase tracking-wider mb-4 md:mb-5"
              onClick={() => toggleSection('customerService')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-expanded={openSections.customerService}
              aria-controls="customer-service-links"
            >
              Customer Service
              <span className="md:hidden">
                {openSections.customerService ? (
                  <ChevronUp className="h-5 w-5 text-orange-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-orange-500" />
                )}
              </span>
            </motion.button>
            <AnimatePresence>
              {(openSections.customerService || isClient) && (
                <motion.ul
                  id="customer-service-links"
                  className="space-y-3"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {footerLinks.customerService.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
          {/* About Us */}
          <div>
            <motion.button
              className="w-full md:cursor-default flex justify-between items-center text-sm font-semibold text-gray-800 dark:text-gray-100 uppercase tracking-wider mb-4 md:mb-5"
              onClick={() => toggleSection('aboutUs')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-expanded={openSections.aboutUs}
              aria-controls="about-us-links"
            >
              About Us
              <span className="md:hidden">
                {openSections.aboutUs ? (
                  <ChevronUp className="h-5 w-5 text-orange-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-orange-500" />
                )}
              </span>
            </motion.button>
            <AnimatePresence>
              {(openSections.aboutUs || isClient) && (
                <motion.ul
                  id="about-us-links"
                  className="space-y-3"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {footerLinks.aboutUs.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
          {/* Shop */}
          <div>
            <motion.button
              className="w-full md:cursor-default flex justify-between items-center text-sm font-semibold text-gray-800 dark:text-gray-100 uppercase tracking-wider mb-4 md:mb-5"
              onClick={() => toggleSection('shop')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-expanded={openSections.shop}
              aria-controls="shop-links"
            >
              Shop
              <span className="md:hidden">
                {openSections.shop ? (
                  <ChevronUp className="h-5 w-5 text-orange-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-orange-500" />
                )}
              </span>
            </motion.button>
            <AnimatePresence>
              {(openSections.shop || isClient) && (
                <motion.ul
                  id="shop-links"
                  className="space-y-3"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {footerLinks.shop.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
          {/* Stay Connected */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 uppercase tracking-wider mb-4 md:mb-5">
              Stay Connected
            </h3>
            <p className="text-sm mb-4">
              Subscribe to our newsletter for exclusive offers and updates.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-grow">
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-l-lg sm:rounded-r-none px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 transition-all duration-300"
                  aria-label="Newsletter email"
                />
                {email && (
                  <motion.button
                    type="button"
                    onClick={clearEmail}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Clear email"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                )}
              </div>
              <motion.button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg sm:rounded-r-lg sm:rounded-l-none text-sm font-medium transition-colors duration-300 shadow-md hover:shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(248, 86, 6, 0.3)' }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="inline h-4 w-4 mr-2" />
                Join
              </motion.button>
            </form>
          </div>
        </div>
        <div className="pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center text-sm">
          <p className="mb-4 sm:mb-0 text-gray-600 dark:text-gray-300">
            © {new Date().getFullYear()} Dropwear. All rights reserved.
          </p>
          <div className="flex space-x-4 sm:space-x-6">
            <motion.a
              href="https://facebook.com"
              className="text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200"
              whileHover={{ scale: 1.2, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Facebook"
            >
              <Facebook className="h-6 w-6" />
            </motion.a>
            <motion.a
              href="https://instagram.com"
              className="text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200"
              whileHover={{ scale: 1.2, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Instagram"
            >
              <Instagram className="h-6 w-6" />
            </motion.a>
            <motion.a
              href="https://twitter.com"
              className="text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200"
              whileHover={{ scale: 1.2, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Twitter"
            >
              <Twitter className="h-6 w-6" />
            </motion.a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}