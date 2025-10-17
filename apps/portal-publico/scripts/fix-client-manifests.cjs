const fs = require('fs');
const path = require('path');

const appDir = path.resolve(__dirname, '..');
const nextAppDir = path.join(appDir, '.next', 'server', 'app');

function log(...args) {
  console.log('[fix-client-manifests]', ...args);
}

try {
  log('cwd', process.cwd());
  log('nextAppDir', nextAppDir);

  if (!fs.existsSync(nextAppDir)) {
    log('No .next/server/app directory found, nothing to do.');
    process.exit(0);
  }

  const rootManifest = path.join(nextAppDir, 'page_client-reference-manifest.js');
  const siteDir = path.join(nextAppDir, '(site)');
  const siteManifest = path.join(siteDir, 'page_client-reference-manifest.js');

  if (!fs.existsSync(rootManifest)) {
    log('Root manifest not found at', rootManifest);
    process.exit(0);
  }

  if (!fs.existsSync(siteDir)) {
    log('(site) directory does not exist, creating it');
    fs.mkdirSync(siteDir, { recursive: true });
  }

  fs.copyFileSync(rootManifest, siteManifest);
  log('Copied', rootManifest, '->', siteManifest);
  process.exit(0);
} catch (err) {
  console.error('[fix-client-manifests] error', err);
  process.exit(1);
}
