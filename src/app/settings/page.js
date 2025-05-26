'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: '',
    state: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) throw new Error('Not authenticated');
        
        const data = await response.json();
        setUser(data.user);
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          city: data.user.city || '',
          state: data.user.state || ''
        });
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          city: formData.city,
          state: formData.state
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      setUser(data.user);
      setMessage('Profile updated successfully!');
      setMessageType('success');
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    }
  };

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
            href="/dashboard"
            className="px-3 sm:px-4 py-2 rounded-md border border-foreground/20 hover:bg-foreground/5 transition-colors text-sm sm:text-base flex-1 sm:flex-none text-center"
          >
            Dashboard
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
          <div className="bg-foreground/5 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Profile Settings</h2>
            
            {message && (
              <div className={`p-3 mb-4 rounded ${
                messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}
            
            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-foreground/60 text-sm mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border border-foreground/20 rounded-md bg-background"
                  />
                </div>
                
                <div>
                  <label className="block text-foreground/60 text-sm mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full p-2 border border-foreground/20 rounded-md bg-foreground/5"
                  />
                  <p className="text-xs text-foreground/60 mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-foreground/60 text-sm mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-2 border border-foreground/20 rounded-md bg-background"
                  />
                </div>
                
                <div>
                  <label className="block text-foreground/60 text-sm mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full p-2 border border-foreground/20 rounded-md bg-background"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors"
              >
                Save Changes
              </button>
            </form>
          </div>

          <div className="bg-foreground/5 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-3">Account Information</h3>
            <p className="mb-4 text-sm sm:text-base text-foreground/70">View your account details and membership information.</p>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <span className="text-foreground/60 text-sm">Member Since</span>
                <span className="font-medium">{new Date(user?.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <span className="text-foreground/60 text-sm">Account Status</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}



