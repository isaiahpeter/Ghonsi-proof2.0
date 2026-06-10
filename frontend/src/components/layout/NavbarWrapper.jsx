'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function NavbarWrapper() {
  const pathname = usePathname();
  const hideHeader = 
  pathname === '/admin/login' || 
  pathname === '/admin/dashboard';
  if (hideHeader) return null;
  return <Navbar />;
}
