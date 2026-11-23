const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const JavaScriptObfuscator = require('javascript-obfuscator');

const APP_VERSION = '5.1.0';
const OTA_BASE_URL = 'https://jee1vk.github.io/compass-app';
const rootDir = __dirname;
const srcDir = path.join(rootDir, 'src');

console.log('--- Starting Kuberan Compass JS Obfuscation Pipeline with Anti-Debug & UI Deterrents ---');

// 1. Comprehensive Anti-Debug, Anti-Mirror, Anti-Iframe & UI Deterrent Preamble
const securityPreamble = `
/*! (c) 2026 Kuberan Silks Chickpet • All Rights Reserved. Proprietary Navigation Engine. */
(function() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // 1. Anti-Frame / Clickjacking Protection
  try {
    if (window.self !== window.top) {
      window.top.location = window.self.location;
    }
  } catch(e) {}

  // 2. Domain Whitelist Verification (Browser & Capacitor / Native Webview)
  var allowed = ['jee1vk.github.io', 'kuberansilks.com', 'localhost', '127.0.0.1'];
  var proto = window.location.protocol;
  var host = window.location.hostname;
  var isNativeApp = proto === 'capacitor:' || proto === 'ionic:' || proto === 'file:' || host === 'localhost' || host === '127.0.0.1';
  if (!isNativeApp && !allowed.some(function(d) { return host === d || host.endsWith('.' + d); })) {
    try {
      document.documentElement.innerHTML = '<div style="background:#070b14;color:#ef4444;height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-weight:700;font-size:1.1rem;text-align:center;padding:20px;">Unauthorized domain deployment. Redirecting to official Kuberan Silks source...</div>';
      setTimeout(function() { window.location.href = 'https://kuberansilks.com/'; }, 1000);
    } catch(e) {}
    throw new Error('Unauthorized domain');
  }

  // 3. Console Neutralization & Brand Copyright Notice
  try {
    var brandBanner = function() {
      console.clear();
      console.log("%c⛔ STOP! RESTRICTED PROPRIETARY CODE", "color: #ef4444; font-size: 20px; font-weight: 900;");
      console.log("%cKuberan Silks Compass PWA • Copyright © 2026 Kuberan Silks. Chickpet, Bengaluru.\\nUnauthorized extraction, decompilation, or reverse engineering is strictly prohibited under the Copyright Act, 1957.", "color: #e5b842; font-size: 12px; font-weight: 600;");
    };
    brandBanner();
    ['log', 'info', 'warn', 'debug', 'table', 'dir', 'trace'].forEach(function(m) {
      console[m] = function() {};
    });
  } catch(e) {}

  // 4. Timing-based DevTools Detection & Anti-Debugger Trap
  function antiDebug() {
    if (document.hidden) return;
    var t0 = performance.now();
    (function() {
      Function('debugger')();
    })();
    if (!document.hidden && (performance.now() - t0 > 250)) {
      try {
        document.body.innerHTML = '<div style="background:#070b14;color:#ef4444;height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-weight:700;font-size:1.1rem;text-align:center;padding:24px;">Developer Tools detected. Inspection is restricted on proprietary builds. Redirecting...</div>';
        setTimeout(function() { window.location.href = 'https://kuberansilks.com/'; }, 1500);
      } catch(e) {}
    }
  }
  setInterval(antiDebug, 4000);

  // 5. UI & Asset Deterrents: Prevent Context Menu, Copy, Cut, Drag & DevTools Keys
  document.addEventListener('contextmenu', function(e) { e.preventDefault(); }, { passive: false });
  document.addEventListener('copy', function(e) { e.preventDefault(); }, { passive: false });
  document.addEventListener('cut', function(e) { e.preventDefault(); }, { passive: false });
  document.addEventListener('dragstart', function(e) { e.preventDefault(); }, { passive: false });
  document.addEventListener('selectstart', function(e) {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('keydown', function(e) {
    var key = e.key ? e.key.toUpperCase() : '';
    var isCtrlOrMeta = e.ctrlKey || e.metaKey;
    var isDev = (
      e.key === 'F12' ||
      (isCtrlOrMeta && (
        key === 'U' || key === 'S' || key === 'P' ||
        (e.shiftKey && (key === 'I' || key === 'J' || key === 'C'))
      ))
    );
    if (isDev) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
})();
`;

// 2. Engine file order for bundle
const engineFiles = [
  'compass-engine.js',
  'celestial-engine.js',
  'waypoint-engine.js',
  'audio-engine.js',
  'tracking-engine.js',
  'sundial-engine.js',
  'nightvision-engine.js',
  'emf-engine.js',
  'camera-hud-engine.js',
  'app.js'
];

const bundleObfuscationOptions = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.35,
  identifierNamesGenerator: 'hexadecimal',
  numbersToExpressions: true,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 8,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.85,
  transformObjectKeys: true,
  unicodeEscapeSequence: false,
  debugProtection: true,
  debugProtectionInterval: 4000
};

const individualObfuscationOptions = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.5,
  deadCodeInjection: false,
  identifierNamesGenerator: 'hexadecimal',
  numbersToExpressions: true,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 8,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
  transformObjectKeys: false,
  renameGlobals: false
};

// 3. Read and concatenate all source files for the unified bundle
let concatenatedCode = securityPreamble + '\n';
engineFiles.forEach(file => {
  const filePath = path.join(srcDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`Bundling: ${file}`);
    concatenatedCode += `\n// --- ${file} ---\n` + fs.readFileSync(filePath, 'utf8') + '\n';
  } else {
    console.error(`Missing required source file: ${filePath}`);
    process.exit(1);
  }
});

console.log('\nObfuscating unified bundle with anti-debugging (compass-bundle.min.js)...');
const obfuscatedBundle = JavaScriptObfuscator.obfuscate(concatenatedCode, bundleObfuscationOptions).getObfuscatedCode();
const bundleOutPath = path.join(rootDir, 'compass-bundle.min.js');
fs.writeFileSync(bundleOutPath, obfuscatedBundle, 'utf8');
console.log(`✓ Created compass-bundle.min.js (${(obfuscatedBundle.length / 1024).toFixed(1)} KB)`);

// 4. Also obfuscate individual files in root directory
console.log('\nObfuscating individual engine files in root directory...');
engineFiles.forEach(file => {
  const srcPath = path.join(srcDir, file);
  const outPath = path.join(rootDir, file);
  const rawCode = fs.readFileSync(srcPath, 'utf8');
  const codeWithPreamble = (file === 'app.js' ? securityPreamble : '') + rawCode;
  const obf = JavaScriptObfuscator.obfuscate(codeWithPreamble, individualObfuscationOptions).getObfuscatedCode();
  fs.writeFileSync(outPath, obf, 'utf8');
  console.log(`✓ Obfuscated ${file} (${(obf.length / 1024).toFixed(1)} KB)`);
});

// 5. Synchronize clean production bundle into dist/ for Capacitor & Store packaging
console.log('\nSynchronizing clean production assets to dist/ for Capacitor & Mobile Store packaging...');
const distDir = path.join(rootDir, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const distFiles = [
  'index.html',
  'privacy.html',
  'style.css',
  'compass-bundle.min.js',
  'qrcode.min.js',
  'manifest.webmanifest',
  'sw.js',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'icon.svg'
];

distFiles.forEach(f => {
  const src = path.join(rootDir, f);
  const dest = path.join(distDir, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
});

// Copy runtime assets/images folder only (exclude store marketing graphics from APK/OTA runtime)
function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(source)) return;
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
  const items = fs.readdirSync(source);
  items.forEach(item => {
    const srcPath = path.join(source, item);
    const targetPath = path.join(target, item);
    if (fs.lstatSync(srcPath).isDirectory()) {
      copyFolderRecursiveSync(srcPath, targetPath);
    } else {
      fs.copyFileSync(srcPath, targetPath);
    }
  });
}
const staleStoreInDist = path.join(distDir, 'assets', 'store');
if (fs.existsSync(staleStoreInDist)) {
  fs.rmSync(staleStoreInDist, { recursive: true, force: true });
}
copyFolderRecursiveSync(path.join(rootDir, 'assets', 'images'), path.join(distDir, 'assets', 'images'));
console.log('✓ Clean distribution assets mirrored to dist/ successfully.');

// 6. Generate PWA-style Native OTA Live Update Bundle (ota-bundle.zip) & Manifest (ota-manifest.json)
console.log('\nGenerating Native OTA Live Update bundle (ota-bundle.zip) & manifest (ota-manifest.json)...');

function collectFilesRecursive(dir, baseDir) {
  let results = [];
  const entries = fs.readdirSync(dir);
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
    if (fs.lstatSync(fullPath).isDirectory()) {
      results = results.concat(collectFilesRecursive(fullPath, baseDir));
    } else {
      results.push({ fullPath, relPath });
    }
  });
  return results.sort((a, b) => a.relPath.localeCompare(b.relPath));
}

// Compute deterministic content hash over all dist/ runtime files (excluding ota-manifest.json)
const runtimeFiles = collectFilesRecursive(distDir, distDir).filter(f => f.relPath !== 'ota-manifest.json');
const contentHasher = crypto.createHash('sha256');
runtimeFiles.forEach(f => {
  contentHasher.update(f.relPath + '\0');
  contentHasher.update(fs.readFileSync(f.fullPath));
  contentHasher.update('\0');
});
const contentHash = contentHasher.digest('hex');
const shortHash = contentHash.slice(0, 8);
const builtAt = new Date().toISOString();

// Write embedded dist/ota-manifest.json so native APK knows its exact built-in bundle hash
const embeddedManifest = {
  appId: 'com.kuberansilks.compass',
  version: APP_VERSION,
  buildId: `${APP_VERSION}+${shortHash}`,
  hash: contentHash,
  minNativeVersionCode: 1,
  builtAt
};
fs.writeFileSync(path.join(distDir, 'ota-manifest.json'), JSON.stringify(embeddedManifest, null, 2) + '\n', 'utf8');

// Pure-Node deterministic PKZIP builder (guaranteed POSIX '/' paths for Android ZipInputStream)
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}
function createZipBuffer(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  files.forEach(({ fullPath, relPath }) => {
    const raw = fs.readFileSync(fullPath);
    const compressed = zlib.deflateRawSync(raw, { level: 9 });
    const nameBuf = Buffer.from(relPath, 'utf8');
    const crc = crc32(raw);

    // Local File Header (30 bytes + name)
    const localHdr = Buffer.alloc(30);
    localHdr.writeUInt32LE(0x04034b50, 0); // signature
    localHdr.writeUInt16LE(20, 4);         // version needed
    localHdr.writeUInt16LE(0x0800, 6);     // UTF-8 flag
    localHdr.writeUInt16LE(8, 8);          // method: deflate
    localHdr.writeUInt16LE(0, 10);         // mod time
    localHdr.writeUInt16LE(0x5421, 12);    // mod date
    localHdr.writeUInt32LE(crc, 14);
    localHdr.writeUInt32LE(compressed.length, 18);
    localHdr.writeUInt32LE(raw.length, 22);
    localHdr.writeUInt16LE(nameBuf.length, 26);
    localHdr.writeUInt16LE(0, 28);         // extra len

    localParts.push(localHdr, nameBuf, compressed);

    // Central Directory Header (46 bytes + name)
    const centralHdr = Buffer.alloc(46);
    centralHdr.writeUInt32LE(0x02014b50, 0); // signature
    centralHdr.writeUInt16LE(20, 4);         // version made by
    centralHdr.writeUInt16LE(20, 6);         // version needed
    centralHdr.writeUInt16LE(0x0800, 8);     // UTF-8 flag
    centralHdr.writeUInt16LE(8, 10);         // deflate
    centralHdr.writeUInt16LE(0, 12);
    centralHdr.writeUInt16LE(0x5421, 14);
    centralHdr.writeUInt32LE(crc, 16);
    centralHdr.writeUInt32LE(compressed.length, 20);
    centralHdr.writeUInt32LE(raw.length, 24);
    centralHdr.writeUInt16LE(nameBuf.length, 28);
    centralHdr.writeUInt16LE(0, 30);         // extra len
    centralHdr.writeUInt16LE(0, 32);         // comment len
    centralHdr.writeUInt16LE(0, 34);         // disk start
    centralHdr.writeUInt16LE(0, 36);         // internal attr
    centralHdr.writeUInt32LE(0, 38);         // external attr
    centralHdr.writeUInt32LE(offset, 42);    // local header offset

    centralParts.push(centralHdr, nameBuf);
    offset += localHdr.length + nameBuf.length + compressed.length;
  });

  const centralDirBuf = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralDirBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirBuf, eocd]);
}

const zipFiles = collectFilesRecursive(distDir, distDir);
const otaZipBuf = createZipBuffer(zipFiles);
const otaZipPath = path.join(rootDir, 'ota-bundle.zip');
fs.writeFileSync(otaZipPath, otaZipBuf);

const zipSha256 = crypto.createHash('sha256').update(otaZipBuf).digest('hex');
const publicManifest = {
  ...embeddedManifest,
  bundleUrl: `${OTA_BASE_URL}/ota-bundle.zip`,
  sha256: zipSha256,
  sizeBytes: otaZipBuf.length,
  releaseNotes: 'Kuberan Compass live web update (60fps engine, AR HUD, Celestial & GPX)'
};
fs.writeFileSync(path.join(rootDir, 'ota-manifest.json'), JSON.stringify(publicManifest, null, 2) + '\n', 'utf8');

console.log(`✓ Created ota-bundle.zip (${(otaZipBuf.length / 1024).toFixed(1)} KB, SHA-256: ${zipSha256.slice(0, 12)}...)`);
console.log(`✓ Created ota-manifest.json (Build ID: ${publicManifest.buildId})`);
console.log('\n✓ ALL JAVASCRIPT ENGINES OBFUSCATED & PACKAGED FOR STORE + OTA DISTRIBUTION!');
