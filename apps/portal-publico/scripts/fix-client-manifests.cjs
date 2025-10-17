const fs = require('fs');
const path = require('path');

const appDir = path.resolve(__dirname, '..');
const serverAppDir = path.join(appDir, '.next', 'server', 'app');
const manifestName = 'page_client-reference-manifest.js';

function tryCopy(from, to) {
  if (fs.existsSync(from)) {
    try {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
      console.log(`Copied ${from} -> ${to}`);
      return true;
    } catch (err) {
      console.error('Failed to copy manifest:', err.message);
      return false;
    }
  }
  return false;
}

const rootManifest = path.join(serverAppDir, manifestName);
const siteManifest = path.join(serverAppDir, '(site)', manifestName);

if (!fs.existsSync(siteManifest)) {
  if (tryCopy(rootManifest, siteManifest)) process.exit(0);
  // try other possible locations (e.g. encoded folder names)
  const alt = path.join(serverAppDir, '%28site%29', manifestName);
  if (tryCopy(rootManifest, alt)) process.exit(0);
  console.warn('No manifest copied; file still missing:', siteManifest);
} else {
  console.log('Site manifest already exists:', siteManifest);
}

process.exit(0);
