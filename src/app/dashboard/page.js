'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/auth/me');
        
        if (!response.ok) {
          throw new Error('Not authenticated');
        }
        
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-12 gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Logo"
            width={100}
            height={24}
            priority
          />
          <h1 className="text-xl font-bold">MyApp</h1>
        </Link>
        <div className="flex gap-2 sm:gap-4 w-full sm:w-auto justify-center sm:justify-end">
          <Link
            href="/"
            className="px-3 sm:px-4 py-2 rounded-md border border-foreground/20 hover:bg-foreground/5 transition-colors text-sm sm:text-base flex-1 sm:flex-none text-center"
          >
            Home
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 sm:px-4 py-2 rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors text-sm sm:text-base flex-1 sm:flex-none"
          >
            Logout
          </button>
        </div>
      </header>

      <main>
        <div className="max-w-4xl mx-auto">
          <div className="bg-foreground/5 rounded-lg p-4 sm:p-6 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Your Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-foreground/60 text-sm">Name</p>
                <p className="font-medium">{user?.name}</p>
              </div>
              <div>
                <p className="text-foreground/60 text-sm">Email</p>
                <p className="font-medium break-all">{user?.email}</p>
              </div>
              <div>
                <p className="text-foreground/60 text-sm">Location</p>
                <p className="font-medium">{user?.city}, {user?.state}</p>
              </div>
              <div>
                <p className="text-foreground/60 text-sm">Member Since</p>
                <p className="font-medium">{new Date(user?.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="mt-6">
              <Link
                href="/settings"
                className="w-full sm:w-auto px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors inline-block text-center"
              >
                Edit Profile
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-foreground/5 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-3">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 border-b border-foreground/10 pb-3">
                  <div className="w-8 h-8 rounded-full bg-foreground/10 flex-shrink-0 flex items-center justify-center text-sm">
                    <span>📍</span>
                  </div>
                  <div>
                    <p className="font-medium">Location Updated</p>
                    <p className="text-sm text-foreground/60">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 border-b border-foreground/10 pb-3">
                  <div className="w-8 h-8 rounded-full bg-foreground/10 flex-shrink-0 flex items-center justify-center text-sm">
                    <span>🔑</span>
                  </div>
                  <div>
                    <p className="font-medium">Logged In</p>
                    <p className="text-sm text-foreground/60">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-foreground/5 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-background rounded-md border border-foreground/10 hover:border-foreground/20 transition-colors text-left">
                  <p className="font-medium">View Map</p>
                  <p className="text-xs text-foreground/60">See your location</p>
                </button>
                <button className="p-3 bg-background rounded-md border border-foreground/10 hover:border-foreground/20 transition-colors text-left">
                  <p className="font-medium">Download Data</p>
                  <p className="text-xs text-foreground/60">Export your info</p>
                </button>
                <button className="p-3 bg-background rounded-md border border-foreground/10 hover:border-foreground/20 transition-colors text-left">
                  <p className="font-medium">Help Center</p>
                  <p className="text-xs text-foreground/60">Get support</p>
                </button>
                <button className="p-3 bg-background rounded-md border border-foreground/10 hover:border-foreground/20 transition-colors text-left">
                  <p className="font-medium">Settings</p>
                  <p className="text-xs text-foreground/60">Manage account</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}




