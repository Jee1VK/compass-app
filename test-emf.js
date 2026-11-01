// test-emf.js
// Unit tests for emf-engine.js
const assert = require('assert');

let EmfEngine;
try {
  EmfEngine = require('./emf-engine.js');
} catch (e) {
  console.log('EmfEngine not yet defined:', e.message);
}

if (!EmfEngine) {
  console.error('FAIL: emf-engine.js is not defined or could not be loaded');
  process.exit(1);
}

console.log('--- Running EMF Engine Tests ---');

// Test 1: Normal Earth Magnetic Field (~45 uT)
EmfEngine.reset();
const normal = EmfEngine.processReading(20, 25, 30); // sqrt(400+625+900) = sqrt(1925) = ~43.87 uT
assert(normal.magnitudeUT > 40 && normal.magnitudeUT < 50, `Normal field should be ~44 uT, got ${normal.magnitudeUT}`);
assert.strictEqual(normal.status, 'NORMAL', `Status should be NORMAL, got ${normal.status}`);

// Test 2: Moderate Interference near speaker or steel desk (~95 uT)
const moderate = EmfEngine.processReading(50, 60, 60); // sqrt(2500+3600+3600) = sqrt(9700) = ~98.48 uT
assert(moderate.magnitudeUT > 90 && moderate.magnitudeUT < 105);
assert.strictEqual(moderate.status, 'CAUTION', `Status should be CAUTION, got ${moderate.status}`);

// Test 3: Severe Magnetic Distortion / Magnet / Wall Rebar (~200 uT)
const severe = EmfEngine.processReading(120, 140, 100); // ~208 uT
assert(severe.magnitudeUT > 200);
assert.strictEqual(severe.status, 'WARNING', `Status should be WARNING, got ${severe.status}`);
assert(severe.isCompromised === true, 'Compass should be marked compromised under severe distortion');

console.log('✅ ALL EMF ENGINE TESTS PASSED!');
