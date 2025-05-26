import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

export default function HeroSection() {
  const { user, loading } = useAuth();

  return (
    <div className="relative bg-gradient-to-b from-foreground/5 to-background overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle at 25px 25px, currentColor 2px, transparent 0)', 
          backgroundSize: '50px 50px' 
        }}></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-foreground/10 text-sm font-medium mb-6">
              <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
              New feature: Real-time location sharing
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Track Your Location with Ease
            </h1>
            
            <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-foreground/80 max-w-3xl">
              A simple application with powerful features. Sign up today to get started with location tracking and more.
            </p>
            
            <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row gap-4">
              <HeroCTA />
            </div>
            
            <div className="mt-8 sm:mt-12 flex items-center">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-foreground/20 to-foreground/10 border-2 border-background flex items-center justify-center text-xs font-medium">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-foreground/80 mr-1"></div>
                  ))}
                  <div className="ml-2 text-foreground/80">+5</div>
                </div>
                <div className="text-foreground/60 text-sm">Active users</div>
              </div>
            </div>
          </div>
          {/* Image or illustration can go here */}
        </div>
      </div>
    </div>
  );
}

function HeroCTA() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return null;
  }
  
  if (user) {
    return (
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-background bg-foreground hover:bg-foreground/90 md:py-4 md:text-lg md:px-8 transition-colors"
      >
        Go to Dashboard
      </Link>
    );
  }
  
  return (
    <>
      <Link
        href="/signup"
        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-background bg-foreground hover:bg-foreground/90 md:py-4 md:text-lg md:px-8 transition-colors"
      >
        Get Started
      </Link>
      <Link
        href="/login"
        className="inline-flex items-center justify-center px-6 py-3 border border-foreground/20 text-base font-medium rounded-md text-foreground bg-transparent hover:bg-foreground/5 md:py-4 md:text-lg md:px-8 transition-colors"
      >
        Log In
      </Link>
    </>
  );
}


