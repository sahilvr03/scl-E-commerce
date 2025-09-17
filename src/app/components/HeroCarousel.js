"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function HeroCarousel({ promotions, current, setCurrent }) {
  const intervalRef = useRef(null);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % promotions.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + promotions.length) % promotions.length);

  // Auto-play functionality
  useEffect(() => {
    startAutoPlay();
    return () => clearInterval(intervalRef.current);
  }, []);

  const startAutoPlay = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(nextSlide, 5000);
  };

  const stopAutoPlay = () => clearInterval(intervalRef.current);

  return (
    <div
      className="relative w-full h-[28rem] sm:h-[10rem] md:h-[36rem]  overflow-hidden shadow-2xl  mb-10 group"
      onMouseEnter={stopAutoPlay}
      onMouseLeave={startAutoPlay}
    >
      {/* Main Slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={promotions[current].id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${promotions[current].image})` }}
        >
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>

          {/* Content */}
          <div className="relative w-full h-full flex items-center px-6 sm:px-12">
            <div className="max-w-xl space-y-6 bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg">
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl sm:text-5xl font-extrabold text-white drop-shadow-md leading-tight"
              >
                {promotions[current].title}
              </motion.h1>
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white/90 text-base sm:text-lg leading-relaxed"
              >
                {promotions[current].description}
              </motion.p>
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Link href="/pages/ForYouPage">
                  <button className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-semibold px-7 py-3 rounded-lg transition-all duration-300 shadow-md flex items-center overflow-hidden group">
                    <span className="relative z-10">Shop Now</span>
                    <ArrowRight className="ml-2 h-5 w-5 relative z-10" />
                    {/* Glow effect */}
                    <span className="absolute inset-0 bg-orange-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                  </button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <motion.button
        onClick={prevSlide}
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-3 rounded-full text-white transition-all duration-300 shadow-lg"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiChevronLeft size={26} />
      </motion.button>
      <motion.button
        onClick={nextSlide}
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-3 rounded-full text-white transition-all duration-300 shadow-lg"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiChevronRight size={26} />
      </motion.button>

      {/* Progress Indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-1/3 h-1.5 bg-white/30 rounded-full overflow-hidden">
        <motion.div
          key={current}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
          className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
        ></motion.div>
      </div>

      {/* Thumbnail Navigation */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-3">
        {promotions.map((promo, idx) => (
          <motion.div
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`cursor-pointer border-2 rounded-md overflow-hidden shadow-md transition-all duration-300 ${
              current === idx ? "border-orange-500 scale-110" : "border-transparent opacity-60"
            }`}
            whileHover={{ scale: 1.1 }}
          >
            <Image
              width={80}
              height={48}
              src={promo.image}
              alt={promo.title}
              className="h-12 w-20 object-cover"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
