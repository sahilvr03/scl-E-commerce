import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import CountdownTimer from '../../components/CountdownTimer';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function FlashSaleDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/flashsale/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setProduct(data);
      } catch (err) {
        toast.error('Failed to load flash sale');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) return <p className="p-4 text-gray-600">Loading product details...</p>;
  if (!product) return <p className="p-4 text-red-500">Product not found.</p>;

  return (
    <main className="min-h-screen bg-white text-gray-800 px-4 py-8 container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <Image
          src={product.imageUrl}
          alt={product.title}
          className="rounded-lg shadow-md w-full h-auto"
        />
        <div>
          <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
          <p className="text-lg text-gray-600 mb-4">{product.description}</p>
          <p className="text-xl font-semibold text-green-600 mb-2">
            Rs. {product.price}{" "}
            {product.originalPrice && (
              <span className="text-gray-400 line-through text-base ml-2">
                Rs. {product.originalPrice}
              </span>
            )}
          </p>
          <CountdownTimer endDate={product.endDate} className="text-sm text-red-500" />
        </div>
      </motion.div>
    </main>
  );
}
