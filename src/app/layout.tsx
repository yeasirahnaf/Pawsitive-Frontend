import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: { default: 'Pawsitive – Find Your Perfect Pet', template: '%s | Pawsitive' },
  description:
    'Browse hundreds of pets and find your perfect companion at Pawsitive – the trusted online pet shop.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="pawsitive" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col bg-base-100 text-base-content" suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
