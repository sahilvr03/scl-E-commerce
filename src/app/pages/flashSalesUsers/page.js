'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Zap, ChevronRight } from 'lucide-react';
import ProductCard from './../../components/ProductCard';
import CountdownTimer from './../../components/CountdownTimer';

export default function FlashSalesPage() {
  const [flashSales, setFlashSales] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFlashSales() {
      try {
        setLoading(true);
        const response = await fetch('/api/flashSales', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Include credentials if authentication is required
        });
        console.log('API Response Status:', response.status);
        const data = await response.json();
        console.log('API Response Data:', data);

        if (response.ok) {
          const now = new Date();
          const activeSales = data.filter((sale) => {
            const endDate = new Date(sale.endDate);
            const isValid = !isNaN(endDate.getTime()) && endDate > now;
            console.log(`Sale: ${sale.title}, End Date: ${endDate}, Valid: ${isValid}`);
            return isValid;
          });
          setFlashSales(activeSales);
          if (activeSales.length === 0) {
            setError('No active flash sales available.');
          }
        } else {
          throw new Error(data.error || 'Failed to fetch flash sales');
        }
      } catch (error) {
        console.error('Error fetching flash sales:', error);
        setError('Failed to load flash sales. Please try again later.');
        toast.error('Failed to load flash sales');
      } finally {
        setLoading(false);
      }
    }

    fetchFlashSales();
  }, []);

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-gray-50">
      <main className="container mx-auto px-4 py-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-xl"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="bg-teal-100 p-2 rounded-lg mr-4">
                <Zap className="h-6 w-6 text-teal-600" fill="currentColor" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Flash Sales</h2>
                <p className="text-sm text-gray-600">Limited-time deals, hurry up!</p>
              </div>
            </div>
            <Link
              href="/products"
              className="bg-white hover:bg-gray-50 text-teal-600 px-4 py-2 rounded-lg flex items-center text-sm font-medium shadow-sm"
            >
              View all products <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          {loading && <p className="text-gray-600">Loading flash sales...</p>}
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {!loading && flashSales.length === 0 && !error && (
            <p className="text-gray-600">No flash sales available at the moment.</p>
          )}
          {flashSales.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {flashSales.map((sale) => (
                <div key={sale._id} className="relative">
                  <ProductCard
                    product={sale}
                    showDiscountBadge={true}
                    className="bg-white hover:shadow-md transition-all"
                  />
                  <CountdownTimer
                    endDate={sale.endDate}
                    className="absolute top-2 right-2 text-xs text-red-600 font-semibold"
                  />
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}