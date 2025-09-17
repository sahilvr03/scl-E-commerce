
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Loader2, Search } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setResults([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch search results");
        }
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Search fetch error:", error.message);
        toast.error("Failed to load search results", {
          style: {
            background: "#FFFFFF",
            color: "#1F2937",
            border: "1px solid #EF4444",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
          },
          iconTheme: { primary: "#EF4444", secondary: "#FFFFFF" },
        });
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSearchResults();
  }, [query]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query", {
        style: {
          background: "#FFFFFF",
          color: "#1F2937",
          border: "1px solid #EF4444",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
        },
        iconTheme: { primary: "#EF4444", secondary: "#FFFFFF" },
      });
      return;
    }
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <Loader2 className="w-10 h-10 text-orange-500 dark:text-orange-400 animate-spin" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-8 lg:px-16 font-poppins">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Search Results for {query}
        </h1>
        <form onSubmit={handleSearch} className="relative mb-8">
          <input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full py-2.5 pl-12 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 shadow-sm"
            aria-label="Search products"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-600 dark:text-orange-400" />
        </form>
        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((product) => (
              <motion.div
                key={product._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={`/products/${product._id}`}>
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    width={200}
                    height={200}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {product.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {product.description}
                  </p>
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400 mt-2">
                    ${product.price.toFixed(2)}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-center">
            No products found for {query}.
          </p>
        )}
      </motion.div>
    </div>
  );
}
