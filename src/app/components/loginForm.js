'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Loader2, Eye, EyeOff, LogIn, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      toast.error(errorData.message || 'Login failed.');
      setLoading(false);
      return;
    }

    const data = await response.json();
    toast.success(data.message || 'Login successful!');

    // ✅ Save token in localStorage for authentication
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }

    // Optional: Save basic user info
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
      })
    );

    // Fetch session to verify user
    const sessionResponse = await fetch('/api/auth/session', {
      credentials: 'include',
    });

    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();

      if (sessionData.session && sessionData.session.user) {
        // ✅ Admin Role Logic
        if (sessionData.session.user.role === 'admin') {
          toast.success('Admin login successful! Redirecting to dashboard...');
          router.push('/pages/admin');

          // 🚀 Full refresh AFTER navigation
          setTimeout(() => {
            window.location.reload();
          }, 100);
          return;
        }

        // ✅ Normal User Logic
        toast.success('Welcome back! Continue shopping.');
        router.push("/");

        // 🚀 Full refresh AFTER navigation
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        // ❌ Session verification failed
        toast.error('Failed to verify session. Redirecting to home.');
        router.push('/');

        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } else {
      // ❌ Session endpoint error
      toast.error('Failed to verify session. Redirecting to home.');
      router.push('/');

      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  } catch (error) {
    console.error('Login error:', error);
    toast.error('An unexpected error occurred. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const buttonHover = { scale: 1.03, boxShadow: '0 6px 16px rgba(248, 86, 6, 0.3)' };
  const buttonTap = { scale: 0.98 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-500 dark:to-gray-800 flex items-center justify-center p-4">
      <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} scale={1.02} transitionSpeed={1000}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Decorative elements */}
          <div className="absolute -top-14 -right-10 w-28 h-28 bg-orange-500/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-teal-500/10 rounded-full blur-xl"></div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 relative overflow-hidden">
            {/* Shimmer effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-teal-500"></div>
            
            {/* Animated background elements */}
            <div className="absolute -z-10 top-0 left-0 w-full h-full opacity-5">
              <div className="absolute top-10 left-10 w-20 h-20 bg-orange-500 rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-16 h-16 bg-teal-500 rounded-full"></div>
            </div>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center mb-6"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-teal-500 rounded-2xl shadow-lg mb-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-teal-600 bg-clip-text text-transparent">
                Welcome Back
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Sign in to continue your shopping journey
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-2"
              >
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg disabled:opacity-50"
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Logging In...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Login
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400"
            >
              <p>
                Don t have an account?{' '}
                <Link 
                  href="/pages/signup" 
                  className="font-medium text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 transition-colors duration-200 underline underline-offset-2"
                >
                  Sign Up Now
                </Link>
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-center"
            >
              
            </motion.div>
          </div>
        </motion.div>
      </Tilt>
    </div>
  );
}