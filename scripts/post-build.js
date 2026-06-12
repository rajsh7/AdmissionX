const fs = require('fs');
const path = require('path');

function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(source)) {
    console.warn(`⚠️ Source path does not exist: ${source}`);
    return;
  }
  try {
    fs.cpSync(source, target, { recursive: true, force: true });
  } catch (err) {
    console.error(`❌ Failed to copy ${source} to ${target}:`, err);
  }
}

try {
  console.log('🚀 Starting post-build assets copy...');
  
  const standalonePath = path.join(__dirname, '..', '.next', 'standalone');
  if (fs.existsSync(standalonePath)) {
    // 1. Copy .next/static -> .next/standalone/.next/static
    const staticSource = path.join(__dirname, '..', '.next', 'static');
    const staticTarget = path.join(standalonePath, '.next', 'static');
    
    // Ensure .next/standalone/.next directory exists
    fs.mkdirSync(path.join(standalonePath, '.next'), { recursive: true });
    
    copyFolderRecursiveSync(staticSource, staticTarget);
    console.log('✅ Successfully copied .next/static to standalone folder.');

    // 2. Copy public -> .next/standalone/public
    const publicSource = path.join(__dirname, '..', 'public');
    const publicTarget = path.join(standalonePath, 'public');
    
    copyFolderRecursiveSync(publicSource, publicTarget);
    console.log('✅ Successfully copied public directory to standalone folder.');
    
    console.log('🎉 Post-build assets copy completed successfully.');
  } else {
    console.warn('⚠️ Standalone directory not found at .next/standalone. Make sure output is configured as standalone in next.config.ts');
  }
} catch (err) {
  console.error('❌ Post-build copy failed:', err);
}
