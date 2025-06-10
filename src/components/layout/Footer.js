'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePersonalization } from '@/hooks/usePersonalization';
import { useState, useEffect } from 'react';

export default function Footer() {
  const { user } = useAuth();
  const { recommendations } = usePersonalization();
  const [footerLinks, setFooterLinks] = useState([
    {
      title: "Product",
      links: [
        { name: "Features", href: "/#features" },
        { name: "Pricing", href: "/pricing" },
        { name: "Testimonials", href: "/#testimonials" },
        { name: "FAQ", href: "/faq" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/#about" },
        { name: "Blog", href: "/blog" },
        { name: "Careers", href: "/careers" },
        { name: "Contact", href: "/#contact" }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "/docs" },
        { name: "Support", href: "/support" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" }
      ]
    }
  ]);

  // Silently reorder footer links based on user interactions
  useEffect(() => {
    if (!recommendations?.topSections || !recommendations.topSections.length) {
      return;
    }
    
    // Create a map to track which links were interacted with
    const interactionMap = new Map();
    
    recommendations.topSections.forEach((section, index) => {
      // Check if this interaction was with a footer link
      if (section) {
        footerLinks.forEach(category => {
          category.links.forEach(link => {
            // Check if the link matches the section identifier or path
            const linkPath = link.href.split('#')[0] || '/';
            
            // Handle different section structures
            const sectionIdentifier = section.identifier || '';
            const sectionPath = section.path ? section.path.split('#')[0] || '/' : '/';
            const sectionText = section.text || '';
            
            if (linkPath === sectionPath || 
                link.href.includes(sectionIdentifier) ||
                link.name.toLowerCase().includes(sectionIdentifier.toLowerCase()) ||
                sectionText.toLowerCase().includes(link.name.toLowerCase())) {
              interactionMap.set(link.name, 10 - index); // Higher priority for more interactions
            }
          });
        });
      }
    });
    
    // Reorder links within each category based on interactions
    const updatedFooterLinks = footerLinks.map(category => {
      const sortedLinks = [...category.links].sort((a, b) => {
        const priorityA = interactionMap.get(a.name) || 0;
        const priorityB = interactionMap.get(b.name) || 0;
        return priorityB - priorityA;
      });
      
      return {
        ...category,
        links: sortedLinks
      };
    });
    
    setFooterLinks(updatedFooterLinks);
  }, [recommendations]);

  return (
    <footer className="bg-foreground/5 border-t border-foreground/10 mt-auto">
      <div className="container mx-auto py-12 md:py-16 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-1 sm:col-span-2">
            <Link href="/" className="text-xl md:text-2xl font-bold flex items-center">
              <span className="w-8 h-8 mr-2 rounded-md bg-foreground text-background flex items-center justify-center font-bold">M</span>
              MyApp
            </Link>
            <p className="mt-4 text-sm md:text-base text-foreground/70 max-w-md">
              A simple application with user authentication and location tracking.
              Sign up today to get started with our powerful features and secure platform.
            </p>
            
            {!user && (
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/signup" 
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors"
                  data-analytics-id="footer-signup-link"
                >
                  Get Started
                </Link>
                <Link 
                  href="/login" 
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-foreground/20 hover:bg-foreground/5 transition-colors"
                  data-analytics-id="footer-login-link"
                >
                  Log In
                </Link>
              </div>
            )}
            
            <div className="mt-8">
              <p className="text-sm font-medium mb-3">Follow us</p>
              <div className="flex space-x-4">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-foreground/10 hover:bg-foreground/20 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-foreground/10 hover:bg-foreground/20 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-foreground/10 hover:bg-foreground/20 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {footerLinks.map((column, idx) => (
            <div key={idx} className="col-span-1">
              <h3 className="text-sm font-semibold uppercase tracking-wider">{column.title}</h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link 
                      href={link.href} 
                      className="text-base text-foreground/70 hover:text-foreground transition-colors"
                      data-analytics-id={`footer-${column.title.toLowerCase()}-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-12 pt-8 border-t border-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-foreground/60">
              © {new Date().getFullYear()} MyApp. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link href="/privacy" className="text-sm text-foreground/60 hover:text-foreground/80">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-foreground/60 hover:text-foreground/80">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-sm text-foreground/60 hover:text-foreground/80">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function AuthCTA() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-10 w-32 bg-foreground/10 rounded-md animate-pulse"></div>
    );
  }
  
  if (user) {
    return (
      <Link 
        href="/dashboard" 
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors"
        data-analytics-id="footer-dashboard-link"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Go to Dashboard
      </Link>
    );
  }
  
  return (
    <>
      <Link 
        href="/signup" 
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors"
        data-analytics-id="footer-signup-link"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Get Started
      </Link>
      <Link 
        href="/login" 
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-foreground/20 hover:bg-foreground/5 transition-colors"
        data-analytics-id="footer-login-link"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        Log In
      </Link>
    </>
  );
}

