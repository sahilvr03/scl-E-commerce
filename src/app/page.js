'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import HeroCarousel from './components/HeroCarousel';
import ProductSection from './components/ProductSection';
import { Heart, Star, Zap } from 'lucide-react';

const promotions = [
  {
    id: 1,
    title: 'Spectacular Summer Savings: Up To 70% Off!',
    description: 'Unbeatable deals on your favorite brands. Don’t miss out, offers are for a limited time!',
    image: '/ad1.webp',
  },
  {
    id: 2,
    title: 'Anime Collection: New Drops Available Now!',
    description: 'Fresh drop shoulder tees inspired by your favorite anime heroes. Shop now!',
    image: '/ad2.webp',
  },
  {
    id: 3,
    title: 'Flash Sale: 50% Off All Tees!',
    description: 'Only for 48 hours! Grab your style before it’s gone.',
    image: '/ad3.webp',
  },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [flashSaleItems, setFlashSaleItems] = useState([]);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [forYouItems, setForYouItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState({
    flashSales: true,
    recommended: true,
    forYou: true,
    categories: true,
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredRecommended, setFilteredRecommended] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (selectedCategory) {
      setFilteredRecommended(recommendedItems.filter((product) => product.category === selectedCategory));
    } else {
      setFilteredRecommended(recommendedItems);
    }
  }, [selectedCategory, recommendedItems]);

  useEffect(() => {
    async function fetchData() {
      setError(null);
      let token = null;
      let userId = null;
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [name, value] = cookie.trim().split('=');
          acc[name] = value;
          return acc;
        }, {});
        token = cookies.token || null;
      }
      if (router.pathname === '/pages/login' || router.pathname === '/pages/signup') {
        setIsLoggedIn(false);
        setUserDetails(null);
        return;
      }
      if (token) {
        try {
          const response = await fetch('/api/auth/session', {
            credentials: 'include',
            headers: { Authorization: `Bearer ${token}` },
          });
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Received non-JSON response from session API');
          }
          const data = await response.json();
          if (response.ok && data.session) {
            userId = data.session.user.id;
            setIsLoggedIn(true);
            setUserDetails(data.session.user);
          } else {
            if (router.pathname !== '/pages/login') {
              toast.error('Please log in to continue');
              router.push('/pages/login');
            }
            setIsLoggedIn(false);
            setUserDetails(null);
            return;
          }
        } catch (error) {
          console.error('Error fetching session:', error);
          setError('Failed to fetch session data. Please try again later.');
          if (router.pathname !== '/pages/login') {
            toast.error('Invalid session. Please log in.');
            router.push('/pages/login');
          }
          setIsLoggedIn(false);
          setUserDetails(null);
          return;
        }
      } else {
        setCartCount(0);
        setIsLoggedIn(false);
        setUserDetails(null);
      }
      if (userId) {
        try {
          const response = await fetch(`/api/cart?userId=${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Received non-JSON response from cart API');
          }
          const data = await response.json();
          if (response.ok) {
            const count = data.items ? data.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
            setCartCount(count);
          } else if (response.status === 401) {
            if (router.pathname !== '/pages/login') {
              toast.error('Please log in to view your cart');
              router.push('/pages/login');
            }
            setCartCount(0);
          } else {
            throw new Error(data.error || 'Failed to fetch cart');
          }
        } catch (error) {
          console.error('Error fetching cart count:', error);
          setError('Failed to load cart data. Please try again later.');
          toast.error('Failed to load cart data');
          setCartCount(0);
        }
      }
      try {
        const response = await fetch('/api/products?type=flashSale');
        const data = await response.json();
        if (response.ok) {
          const now = new Date();
          const activeFlashSales = data
            .filter((sale) => {
              const endDate = new Date(sale.endDate);
              return !isNaN(endDate.getTime()) && endDate > now;
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 20);
          setFlashSaleItems(activeFlashSales);
        } else {
          throw new Error(data.error || 'Failed to fetch Flash Sale products');
        }
      } catch (error) {
        console.error('Error fetching Flash Sale products:', error);
        setError('Failed to load Flash Sale products. Please try again later.');
        toast.error('Failed to load Flash Sale products');
      } finally {
        setLoading((prev) => ({ ...prev, flashSales: false }));
      }
      try {
        const response = await fetch('/api/products?type=recommended');
        const data = await response.json();
        if (response.ok) {
          setRecommendedItems(data.slice(0, 20));
        } else {
          throw new Error(data.error || 'Failed to fetch Recommended products');
        }
      } catch (error) {
        console.error('Error fetching Recommended products:', error);
        setError('Failed to load Recommended products. Please try again later.');
        toast.error('Failed to load Recommended products');
      } finally {
        setLoading((prev) => ({ ...prev, recommended: false }));
      }
      try {
        const response = await fetch('/api/products?type=forYou');
        const data = await response.json();
        if (response.ok) {
          setForYouItems(data.slice(0, 20));
        } else {
          throw new Error(data.error || 'Failed to fetch For You products');
        }
      } catch (error) {
        console.error('Error fetching For You products:', error);
        setError('Failed to load For You products. Please try again later.');
        toast.error('Failed to load For You products');
      } finally {
        setLoading((prev) => ({ ...prev, forYou: false }));
      }
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (response.ok) {
          setCategories(data);
        } else {
          throw new Error(data.error || 'Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please try again later.');
        toast.error('Failed to load categories');
      } finally {
        setLoading((prev) => ({ ...prev, categories: false }));
      }
    }
    fetchData();
    if (typeof window !== 'undefined') {
      const handleCartUpdate = (e) => {
        setCartCount(e.detail.count);
      };
      window.addEventListener('cartUpdated', handleCartUpdate);
      return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }
  }, [router]);



  return (
    <div className="min-h-screen  font-poppins bg-white text-gray-800 m-0 p-0">
      <main className="w-full  max-w-[1920px] mx-auto  ">
        {/* Hero Carousel should sit directly under the header */}
        <HeroCarousel promotions={promotions} current={current} setCurrent={setCurrent} />

        <ProductSection
          title="Flash Sale"
          items={flashSaleItems}
          loading={loading.flashSales}
          error={error}
          link="/pages/FlashSalePage"
          icon={<Zap className="h-6 w-6 text-orange-600" fill="currentColor" />}
          
          isSale={true}
          endDate={flashSaleItems[0]?.endDate}
        />

        <ProductSection
          title="For You"
          items={forYouItems}
          loading={loading.forYou}
          error={error}
          link="/pages/ForYouPage"
          icon={<Heart className="h-6 w-6 text-blue-600" fill="currentColor" />}
          
        />
      </main>
    </div>
  );
}