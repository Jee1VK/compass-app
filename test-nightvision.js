// test-nightvision.js
// Unit tests for nightvision-engine.js
const assert = require('assert');

let NightVisionEngine;
try {
  NightVisionEngine = require('./nightvision-engine.js');
} catch (e) {
  console.log('NightVisionEngine not yet defined:', e.message);
}

if (!NightVisionEngine) {
  console.error('FAIL: nightvision-engine.js is not defined or could not be loaded');
  process.exit(1);
}

console.log('--- Running Night Vision Engine Tests ---');

// Test 1: Polaris Position
// Bangalore: 12.9716 deg N
const polarisBLR = NightVisionEngine.calculatePolarisPosition(12.9716, 77.5946, new Date('2026-11-01T20:00:00Z'));
assert.strictEqual(polarisBLR.visible, true, 'Polaris must be visible in Northern hemisphere');
assert(polarisBLR.altitude >= 12 && polarisBLR.altitude <= 14, `Polaris altitude should be ~13 deg in Bangalore, got ${polarisBLR.altitude}`);
assert(polarisBLR.azimuth >= 358 || polarisBLR.azimuth <= 2, `Polaris azimuth should be ~0 deg True North, got ${polarisBLR.azimuth}`);

// Sydney: -33.8688 deg S (Southern hemisphere)
const polarisSYD = NightVisionEngine.calculatePolarisPosition(-33.8688, 151.2093, new Date('2026-11-01T20:00:00Z'));
assert.strictEqual(polarisSYD.visible, false, 'Polaris must not be visible in Sydney');

// Test 2: Southern Cross Position
const cruxSYD = NightVisionEngine.calculateSouthernCrossPosition(-33.8688, 151.2093, new Date('2026-05-01T12:00:00Z'));
assert.strictEqual(cruxSYD.visible, true, 'Southern Cross should be visible in Southern skies in May');
assert(cruxSYD.altitude > 0, `Crux altitude should be positive, got ${cruxSYD.altitude}`);

// Test 3: Morse Code SOS Pattern
const pattern = NightVisionEngine.getMorsePattern('SOS');
assert(Array.isArray(pattern), 'Pattern must be an array of pulses');
assert(pattern.length > 10, 'SOS pattern must have multiple dot/dash cycles');

// Verify dots are ~150ms and dashes are ~450ms
const onPulses = pattern.filter(p => p.on);
assert.strictEqual(onPulses.length, 9, 'SOS has 3 dots + 3 dashes + 3 dots = 9 on-pulses');
assert.strictEqual(onPulses[0].durationMs, 150, 'Dot should be 150ms');
assert.strictEqual(onPulses[3].durationMs, 450, 'Dash should be 450ms');

console.log('✅ ALL NIGHT VISION ENGINE TESTS PASSED!');
