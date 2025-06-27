'use client';
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 34,
    seconds: 56,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 12;
          minutes = 34;
          seconds = 56;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center bg-red-100 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg text-base font-semibold border border-red-200 dark:border-red-800">
      <Clock className="w-5 h-5 mr-2 animate-pulse" />
      <span className="tracking-wide">Ends in: {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
    </div>
  );
};

export default CountdownTimer;