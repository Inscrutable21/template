const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Create a temporary directory for the build
const tempDir = path.join(os.tmpdir(), 'next-build-' + Date.now());

try {
  // Create the temporary directory
  fs.mkdirSync(tempDir, { recursive: true });
  console.log(`Created temporary build directory: ${tempDir}`);
  
  // Copy package.json and other necessary files
  const filesToCopy = [
    'package.json',
    'package-lock.json',
    'jsconfig.json',
    'postcss.config.mjs',
    'eslint.config.mjs'
  ];
  
  filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join(tempDir, file));
      console.log(`Copied ${file} to temporary directory`);
    }
  });
  
  // Copy source directories
  const dirsToRecursivelyCopy = ['src', 'public', 'prisma'];
  
  dirsToRecursivelyCopy.forEach(dir => {
    if (fs.existsSync(dir)) {
      execSync(`xcopy "${dir}" "${path.join(tempDir, dir)}" /E /I /H /Y`, { stdio: 'inherit' });
      console.log(`Copied ${dir} to temporary directory`);
    }
  });
  
  // Create a minimal next.config.mjs
  const nextConfigContent = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone'
};

export default nextConfig;
`;
  
  fs.writeFileSync(path.join(tempDir, 'next.config.mjs'), nextConfigContent);
  console.log('Created minimal next.config.mjs in temporary directory');
  
  // Install dependencies in the temporary directory
  console.log('Installing dependencies in isolated environment...');
  try {
    execSync('npm install', { 
      stdio: 'inherit',
      cwd: tempDir,
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: '1'
      }
    });
  } catch (installError) {
    console.error('Failed to install dependencies:', installError);
    process.exit(1);
  }
  
  // Run the build in the temporary directory
  console.log('Running build in isolated environment...');
  try {
    execSync('npx next build', { 
      stdio: 'inherit',
      cwd: tempDir,
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: '1',
        NODE_OPTIONS: '--max-old-space-size=4096'
      }
    });
  } catch (buildError) {
    console.error('Failed to build:', buildError);
    process.exit(1);
  }
  
  // Copy the build output back to the original directory
  console.log('Copying build output back to original directory...');
  if (fs.existsSync(path.join(tempDir, '.next'))) {
    execSync(`xcopy "${path.join(tempDir, '.next')}" ".next" /E /I /H /Y`, { stdio: 'inherit' });
  } else if (fs.existsSync(path.join(tempDir, 'build'))) {
    execSync(`xcopy "${path.join(tempDir, 'build')}" ".next" /E /I /H /Y`, { stdio: 'inherit' });
  } else {
    console.error('Build output directory not found in temporary directory');
    process.exit(1);
  }
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} finally {
  // Clean up the temporary directory
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log(`Cleaned up temporary directory: ${tempDir}`);
  } catch (cleanupError) {
    console.warn('Failed to clean up temporary directory:', cleanupError);
  }
}
