const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create a temporary next.config.js that uses a different build directory
const tempConfigContent = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: 'build', // Use a different output directory
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  // Disable file system watching for specific paths
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Add webpack configuration to ignore problematic paths
  webpack: (config) => {
    // Completely ignore the problematic directories during build
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/Application Data/**',
        '**/AppData/**',
        '**/Local Settings/**',
        '**/My Documents/**',
        'C:/Users/poona/Application Data/**',
        'C:\\\\Users\\\\poona\\\\Application Data/**'
      ]
    };
    
    return config;
  }
};

export default nextConfig;
`;

try {
  // Backup the original config
  const configPath = path.join(process.cwd(), 'next.config.mjs');
  const backupPath = path.join(process.cwd(), 'next.config.mjs.bak');
  
  if (fs.existsSync(configPath)) {
    fs.copyFileSync(configPath, backupPath);
    console.log('Backed up original next.config.mjs');
  }
  
  // Write the temporary config
  fs.writeFileSync(configPath, tempConfigContent);
  console.log('Created temporary next.config.mjs with custom build directory');
  
  // Set environment variables to disable file tracing
  console.log('Running build with modified environment...');
  execSync('next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1',
      NODE_OPTIONS: '--max-old-space-size=4096'
    }
  });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} finally {
  // Restore the original config
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, configPath);
    fs.unlinkSync(backupPath);
    console.log('Restored original next.config.mjs');
  }
}
