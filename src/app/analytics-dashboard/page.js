'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

export default function AnalyticsDashboard() {
  const router = useRouter();
  const dropdownRef = useRef(null);
  const [analyticsData, setAnalyticsData] = useState({
    pageViews: [],
    webVitals: [],
    heatmapData: [],
    clicksData: [],
    elementClicksData: [],
    scrollDepthData: [],
    scrollMilestoneData: [],
    sectionVisibilityData: [],
    timeOnPageData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'user', 'anonymous'
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const searchTerm = userSearch.toLowerCase();
    const name = (user.name || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    return name.includes(searchTerm) || email.includes(searchTerm);
  });

  // Fetch all users
  useEffect(() => {
    async function fetchAllUsers() {
      try {
        console.log('Fetching all users...');
        const response = await fetch('/api/users');
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Fetched ${data.users.length} users:`, data.users);
          setUsers(data.users);
        } else {
          console.error('Failed to fetch users:', response.status);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }
    
    fetchAllUsers();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching analytics data with filter mode:', filterMode);
      
      // Build the query parameters based on filter mode
      let queryParams = '';
      if (filterMode === 'user' && selectedUserId) {
        queryParams = `?userId=${selectedUserId}`;
      } else if (filterMode === 'anonymous') {
        queryParams = '?anonymous=true';
      }
      
      const response = await fetch(`/api/analytics/dashboard${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received analytics data:', data);
      
      // Initialize any missing data arrays to prevent errors
      const defaultData = {
        pageViews: [],
        webVitals: [],
        heatmapData: [],
        clicksData: [],
        elementClicksData: [],
        scrollDepthData: [],
        scrollMilestoneData: [],
        sectionVisibilityData: [],
        timeOnPageData: []
      };
      
      setAnalyticsData({...defaultData, ...data});
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data if we're in 'all' mode, 'anonymous' mode, or 'user' mode with a selected user
    if (filterMode === 'all' || filterMode === 'anonymous' || (filterMode === 'user' && selectedUserId)) {
      fetchData();
    }
  }, [filterMode, selectedUserId]);

  const handleRefresh = () => {
    fetchData();
  };

  const handleFilterChange = (mode) => {
    setFilterMode(mode);
    
    // Reset selected user when changing modes
    if (mode !== 'user') {
      setSelectedUserId('');
      setShowUserDropdown(false);
    }
  };

  const handleUserSelect = (userId) => {
    console.log('User selected:', userId);
    setSelectedUserId(userId);
    setShowUserDropdown(false);
    setUserSearch(''); // Clear search when user is selected
    
    // If we're not already in user mode, switch to it
    if (filterMode !== 'user') {
      setFilterMode('user');
    }
  };

  // Make sure the dropdown is visible when clicking the Select User button
  const toggleUserDropdown = () => {
    setShowUserDropdown(prev => !prev);
  };

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add a refresh interval to keep data updated
  useEffect(() => {
    // Only set up refresh if we have active filters
    if (filterMode === 'all' || filterMode === 'anonymous' || (filterMode === 'user' && selectedUserId)) {
      // Initial fetch
      fetchData();
      
      // Set up interval for refreshing data
      const refreshInterval = setInterval(() => {
        fetchData();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(refreshInterval);
    }
  }, [filterMode, selectedUserId]);

  if (loading && !analyticsData.pageViews.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Calculate total page views
  const totalPageViews = analyticsData.pageViews.length;
  
  // Calculate average scroll depth
  const avgScrollDepth = analyticsData.scrollDepthData.length > 0
    ? Math.round(
        analyticsData.scrollDepthData.reduce((sum, item) => sum + item.avgPercentage, 0) / 
        analyticsData.scrollDepthData.length
      )
    : 0;
  
  // Calculate full page reads (100% scroll)
  const fullPageReads = analyticsData.scrollMilestoneData.reduce(
    (sum, item) => sum + (item['100%'] || 0), 
    0
  );
  
  // Calculate engagement score (0-10)
  const engagementScore = Math.min(
    10, 
    Math.round(avgScrollDepth / 10)
  );

  // Get selected user info for display
  const selectedUser = selectedUserId ? users.find(u => u.id === selectedUserId) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* User filter controls */}
          <div className="flex rounded-md overflow-hidden relative z-10">
            <button 
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-2 text-sm ${filterMode === 'all' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'}`}
            >
              All Users
            </button>
            
            {/* User selection dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => {
                  setFilterMode('user');
                  setShowUserDropdown(!showUserDropdown);
                }}
                className={`px-3 py-2 text-sm ${filterMode === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'}`}
              >
                {selectedUser 
                  ? `${selectedUser.name || selectedUser.email?.split('@')[0] || 'Selected User'}`
                  : 'Select User'}
              </button>
              
              {showUserDropdown && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <div className="bg-background rounded-md shadow-lg p-4 w-full max-w-md max-h-96 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Select User</h3>
                      <button onClick={() => setShowUserDropdown(false)} className="text-foreground/60">
                        ✕
                      </button>
                    </div>
                    
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full p-2 text-sm border border-foreground/20 rounded-md bg-background"
                      />
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      {users.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-foreground/60">Loading users...</div>
                      ) : filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                          <button
                            key={user.id}
                            onClick={() => handleUserSelect(user.id)}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-foreground/5"
                          >
                            <div className="font-medium">
                              {user.name || user.email || `User ${user.id.substring(0, 8)}`}
                            </div>
                            {user.name && user.email && (
                              <div className="text-xs text-foreground/60">{user.email}</div>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-foreground/60">No users found</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => handleFilterChange('anonymous')}
              className={`px-3 py-2 text-sm ${filterMode === 'anonymous' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'}`}
            >
              Anonymous Users
            </button>
          </div>
          
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Refresh Data
          </button>
        </div>
      </div>
      
      {/* User context info */}
      <div className="mb-6 p-4 bg-muted/20 rounded-md">
        <p className="text-sm">
          {filterMode === 'all' && 'Showing analytics data for all users'}
          {filterMode === 'user' && selectedUser && 
            `Showing analytics data for ${selectedUser.name || selectedUser.email || 'selected user'}`}
          {filterMode === 'user' && !selectedUserId && 'Please select a user to view their analytics'}
          {filterMode === 'anonymous' && 'Showing analytics data for anonymous users only'}
        </p>
      </div>
      
      {/* Only show analytics if we have data to show */}
      {(filterMode === 'all' || filterMode === 'anonymous' || (filterMode === 'user' && selectedUserId)) ? (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-2">Total Page Views</h2>
              <p className="text-3xl font-bold">{totalPageViews}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {filterMode === 'user' ? 'User page views' : filterMode === 'anonymous' ? 'Anonymous views' : 'All users'}
              </p>
            </div>
            
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-2">Avg Scroll Depth</h2>
              <p className="text-3xl font-bold">{avgScrollDepth}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {filterMode === 'user' ? 'User average' : filterMode === 'anonymous' ? 'Anonymous users' : 'All users'}
              </p>
            </div>
            
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-2">Engagement Score</h2>
              <p className="text-3xl font-bold">{engagementScore}/10</p>
              <p className="text-xs text-muted-foreground mt-1">
                {filterMode === 'user' ? 'User engagement' : filterMode === 'anonymous' ? 'Anonymous users' : 'All users'}
              </p>
            </div>
          </div>
          
          {/* Scroll Depth Analysis */}
          <div className="bg-foreground/5 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Scroll Depth Analysis</h2>
              <button 
                onClick={handleRefresh}
                className="px-3 py-1 bg-primary/10 text-primary rounded-md text-sm"
              >
                Refresh Data
              </button>
            </div>
            
            {analyticsData.scrollDepthData && analyticsData.scrollDepthData.length > 0 ? (
              <div className="space-y-6">
                <div className="bg-background p-4 rounded-md">
                  <h3 className="font-semibold mb-4">Detailed Scroll Analysis</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-foreground/10">
                      <thead className="bg-foreground/5">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Page</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Avg Depth</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Max Depth</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Users</th>
                        </tr>
                      </thead>
                      <tbody className="bg-background divide-y divide-foreground/10">
                        {analyticsData.scrollDepthData
                          .filter(item => !item.path.includes('/analytics-dashboard'))
                          .map((item, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-foreground/5' : 'bg-background'}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{item.path}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{item.avgPercentage}%</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{item.maxPercentage}%</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{item.userCount}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-foreground/60">
                  {filterMode === 'user' 
                    ? "No scroll depth data available for this user yet." 
                    : "No scroll depth data available yet."}
                </p>
              </div>
            )}
          </div>
          
          {/* Element Clicks */}
          <div className="bg-foreground/5 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Element Interactions</h2>
            
            {analyticsData.elementClicksData && analyticsData.elementClicksData.length > 0 ? (
              <div className="bg-background p-4 rounded-md">
                <h3 className="font-semibold mb-4">All Tracked Interactions</h3>
                <div className="overflow-auto max-h-96">
                  <table className="min-w-full divide-y divide-foreground/10">
                    <thead className="bg-foreground/5">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Element</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Path</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Clicks</th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-foreground/10">
                      {analyticsData.elementClicksData
                        .filter(item => !item.path.includes('/analytics-dashboard'))
                        .sort((a, b) => b.count - a.count)
                        .map((item, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-foreground/5' : 'bg-background'}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{item.element}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{item.details?.tag || item.type || 'Unknown'}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{item.path}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{item.count}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-foreground/60">
                  {filterMode === 'user' 
                    ? "No element interaction data available for this user yet." 
                    : "No element interaction data available yet."}
                </p>
              </div>
            )}
          </div>
          
          <div className="text-xs text-foreground/60 text-right">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </>
      ) : (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-foreground/60 mb-4">Please select a user to view their analytics data.</p>
            <button 
              onClick={toggleUserDropdown}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Select User
            </button>
          </div>
        </div>
      )}
    </div>
  );
}











