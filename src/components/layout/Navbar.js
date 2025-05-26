'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setProfileDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      window.location.href = '/';
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      scrolled ? 'bg-background/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
    }`}>
      <div className="container mx-auto">
        <div className="flex justify-between items-center h-16 md:h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="font-bold text-xl md:text-2xl">MyApp</span>
            </Link>
            
            {/* Desktop navigation */}
            <div className="hidden md:flex ml-10 space-x-6">
              <Link 
                href="/#features" 
                className="text-foreground/80 hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link 
                href="/#testimonials" 
                className="text-foreground/80 hover:text-foreground transition-colors"
              >
                Testimonials
              </Link>
              <Link 
                href="/#about" 
                className="text-foreground/80 hover:text-foreground transition-colors"
              >
                About Us
              </Link>
              <Link 
                href="/#contact" 
                className="text-foreground/80 hover:text-foreground transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
          
          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!loading && !user ? (
              <>
                <Link 
                  href="/login" 
                  className="px-4 py-2 rounded-md text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  href="/signup" 
                  className="px-4 py-2 rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            ) : !loading && user ? (
              <div className="relative profile-dropdown">
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-foreground/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center">
                    <span className="text-sm font-medium">{user.name?.charAt(0) || 'U'}</span>
                  </div>
                  <span className="font-medium">{user.name}</span>
                </button>
                
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background rounded-md shadow-lg py-1 border border-foreground/10">
                    <Link 
                      href="/dashboard" 
                      className="block px-4 py-2 text-sm hover:bg-foreground/5"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/settings" 
                      className="block px-4 py-2 text-sm hover:bg-foreground/5"
                    >
                      Settings
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-foreground/5 border-t border-foreground/10"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            {!loading && user && (
              <Link href="/dashboard" className="mr-4">
                <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center">
                  <span className="text-sm font-medium">{user.name?.charAt(0) || 'U'}</span>
                </div>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground/80 hover:text-foreground hover:bg-foreground/5 focus:outline-none"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background pt-16">
          <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Close button at the top right */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-md text-foreground/80 hover:text-foreground hover:bg-foreground/5 focus:outline-none"
              aria-label="Close menu"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="space-y-4">
              <Link 
                href="/#features" 
                className="block text-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="/#testimonials" 
                className="block text-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </Link>
              <Link 
                href="/#about" 
                className="block text-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link 
                href="/#contact" 
                className="block text-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
            
            <div className="pt-6 border-t border-foreground/10">
              {!loading && !user ? (
                <div className="grid grid-cols-1 gap-4">
                  <Link 
                    href="/login" 
                    className="w-full px-4 py-3 text-center rounded-md border border-foreground/20 hover:bg-foreground/5 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link 
                    href="/signup" 
                    className="w-full px-4 py-3 text-center rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              ) : !loading && user ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center">
                      <span className="text-lg font-medium">{user.name?.charAt(0) || 'U'}</span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-foreground/60">{user.email}</p>
                    </div>
                  </div>
                  <Link 
                    href="/dashboard" 
                    className="block w-full px-4 py-3 text-center rounded-md border border-foreground/20 hover:bg-foreground/5 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/settings" 
                    className="block w-full px-4 py-3 text-center rounded-md border border-foreground/20 hover:bg-foreground/5 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full px-4 py-3 text-center rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}


