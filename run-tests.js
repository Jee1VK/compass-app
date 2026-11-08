const path = require('path');
const { spawnSync } = require('child_process');

const tests = [
  'test-heading.js',
  'test-celestial.js',
  'test-waypoint.js',
  'test-tracking.js',
  'test-sundial.js',
  'test-nightvision.js',
  'test-emf.js'
];

console.log('Running test suite for Kuberan Compass...\n');
let allPassed = true;
for (const test of tests) {
  const testPath = path.join(__dirname, test);
  const res = spawnSync(process.execPath, [testPath], { stdio: 'inherit', cwd: __dirname });
  if (res.status !== 0) {
    allPassed = false;
    console.error(`\n❌ Test failed: ${test}`);
    break;
  }
}

if (allPassed) {
  console.log('\n✅ ALL 7 SUITES PASSED ON OBFUSCATED MODULES!');
  process.exit(0);
} else {
  process.exit(1);
}
