'use client';
import React, { useState } from 'react';
import AdminSidebar from './Sidebar/page';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Toggle Button for Mobile */}
        <button
          className="lg:hidden fixed top-4 left-4 z-50 text-gray-800 hover:text-teal-600"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Main Content Area */}
        <motion.main
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 container mx-auto px-4 py-10 lg:ml-64"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}