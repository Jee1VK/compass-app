const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const rootDir = __dirname;
const srcDir = path.join(rootDir, 'src');

console.log('--- Starting Kuberan Compass JS Obfuscation Pipeline ---');

// 1. Domain Lock & Anti-Inspection Header
const securityPreamble = `
/*! (c) 2026 Kuberan Silks • All Rights Reserved. Unauthorized copying or redistribution is strictly prohibited. */
(function() {
  var allowed = ['jee1vk.github.io', 'kuberansilks.com', 'localhost', '127.0.0.1'];
  if (typeof window !== 'undefined' && window.location) {
    var host = window.location.hostname;
    if (!allowed.some(function(d) { return host === d || host.endsWith('.' + d); })) {
      try {
        document.documentElement.innerHTML = '<div style="background:#070b14;color:#ef4444;height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-weight:700;font-size:1.1rem;text-align:center;padding:20px;">Unauthorized domain deployment. Redirecting to official Kuberan Silks source...</div>';
        setTimeout(function() { window.location.href = 'https://kuberansilks.com/'; }, 1200);
      } catch(e) {}
      throw new Error('Unauthorized domain');
    }
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
      }
    });
  }
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
  unicodeEscapeSequence: false
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

console.log('\nObfuscating unified bundle (compass-bundle.min.js)...');
const obfuscatedBundle = JavaScriptObfuscator.obfuscate(concatenatedCode, bundleObfuscationOptions).getObfuscatedCode();
const bundleOutPath = path.join(rootDir, 'compass-bundle.min.js');
fs.writeFileSync(bundleOutPath, obfuscatedBundle, 'utf8');
console.log(`✓ Created compass-bundle.min.js (${(obfuscatedBundle.length / 1024).toFixed(1)} KB)`);

// 4. Also obfuscate individual files in root for direct imports or legacy callers
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

console.log('\n✓ ALL JAVASCRIPT FILES SUCCESSFULLY OBFUSCATED!');
