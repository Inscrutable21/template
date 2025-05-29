'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  
  // Don't show navbar/footer on dashboard or analytics pages
  const shouldShowNavbarFooter = !pathname.includes('/dashboard') && 
                                !pathname.includes('/analytics-dashboard');
  
  return (
    <>
      {shouldShowNavbarFooter && <Navbar />}
      <div className="flex-grow">
        {children}
      </div>
      {shouldShowNavbarFooter && <Footer />}
    </>
  );
}