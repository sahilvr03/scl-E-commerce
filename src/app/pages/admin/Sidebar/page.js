'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  FiBox,
  FiUpload,
  FiTag,
  FiList,
  FiMenu,
  FiX
} from 'react-icons/fi';

export default function Sidebar({ isOpen, setIsOpen }) {
  return (
    <>
      {/* Toggle Button for Mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white/20 backdrop-blur-lg p-2 rounded-full shadow-md text-white"
      >
        {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } transition-transform duration-300 ease-in-out bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 bg-opacity-80 backdrop-blur-lg shadow-xl text-white rounded-r-xl z-40`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-20 tracking-wide">Admin Panel</h1>

          <nav className="space-y-4">
            <NavItem icon={<FiBox />} label="Orders" href="/pages/admin/orders" />
            <NavItem icon={<FiUpload />} label="Upload Product" href="/pages/admin" />
            <NavItem icon={<FiTag />} label="Flash Sale" href="/pages/admin/flashSales" />
            <NavItem icon={<FiList />} label="Categories" href="/pages/admin/Category" />
          </nav>
        </div>
      </aside>

      {/* Overlay for Mobile when Sidebar is Open */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}

function NavItem({ icon, label, href }) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer">
        <div className="text-lg">{icon}</div>
        <span className="text-md font-medium">{label}</span>
      </div>
    </Link>
  );
}