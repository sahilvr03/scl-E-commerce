import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Header from './components/header';
import Footer from './components/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'DropWear',
  description: 'E-commerce platform with great deals',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen m-0 p-0`}>
        <Header />
        {/* Make sure no extra gap here */}
        <main className="flex-1 m-0 p-0">{children}</main>
        <div className="z-[1000]">
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
