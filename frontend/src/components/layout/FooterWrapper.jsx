'use client';
import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function FooterWrapper() {
  const pathname = usePathname();
  const hideFooter = pathname === '/professionals/portfolio' || pathname === '/professionals/mini-them';
  if (hideFooter) return null;
  return <Footer />;
}
