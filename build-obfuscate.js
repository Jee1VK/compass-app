const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

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

  // 2. Domain Whitelist Verification
  var allowed = ['jee1vk.github.io', 'kuberansilks.com', 'localhost', '127.0.0.1'];
  var host = window.location.hostname;
  if (!allowed.some(function(d) { return host === d || host.endsWith('.' + d); })) {
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

console.log('\n✓ ALL JAVASCRIPT ENGINES OBFUSCATED WITH ANTI-DEBUGGING AND UI DETERRENTS!');
