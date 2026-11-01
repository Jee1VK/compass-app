// test-sundial.js
// Unit tests for sundial-engine.js
const assert = require('assert');

let SundialEngine;
try {
  SundialEngine = require('./sundial-engine.js');
} catch (e) {
  console.log('SundialEngine not yet defined:', e.message);
}

if (!SundialEngine) {
  console.error('FAIL: sundial-engine.js is not defined or could not be loaded');
  process.exit(1);
}

console.log('--- Running Sundial Engine Tests ---');

// Test 1: Equation of Time (EoT)
// Around early November (day ~305), EoT reaches peak positive ~+16 minutes.
// Around mid February (day ~43), EoT reaches peak negative ~-14 minutes.
const novDate = new Date(Date.UTC(2026, 10, 1, 12, 0, 0)); // Nov 1
const eotNov = SundialEngine.calculateEquationOfTime(novDate);
assert(eotNov > 14 && eotNov < 17, `Nov 1 EoT should be ~+16.4 mins, got ${eotNov}`);

const febDate = new Date(Date.UTC(2026, 1, 12, 12, 0, 0)); // Feb 12
const eotFeb = SundialEngine.calculateEquationOfTime(febDate);
assert(eotFeb < -13 && eotFeb > -15, `Feb 12 EoT should be ~-14.2 mins, got ${eotFeb}`);

// Test 2: Local Apparent Solar Time
// Bangalore: longitude 77.5946 deg.
// 77.5946 deg / 15 deg/hr = +5.17297 hours (+5h 10m 22s) from UTC.
// IST is UTC+5:30 (82.5 deg).
// Solar noon at Bangalore is ~14 minutes before standard 12:00 IST + EoT.
const testDate = new Date(Date.UTC(2026, 10, 1, 6, 30, 0)); // 12:00 IST
const solarTime = SundialEngine.calculateLocalApparentTime(testDate, 77.5946);
assert(typeof solarTime.hours === 'number', 'Hours should be a number');
assert(typeof solarTime.minutes === 'number', 'Minutes should be a number');
assert(typeof solarTime.formatted === 'string', 'Formatted time should be a string');
console.log('Solar Time Nov 1 12:00 IST at 77.59E:', solarTime.formatted, 'EoT:', solarTime.eotMinutes.toFixed(2), 'm');

// Test 3: Shadow Vector Calculation
// Sun at Azimuth 180 (South), Elevation 45 deg, Compass heading 0 (North)
// Shadow points to 0 (North). On compass dial heading North, dialAngle is 0.
const shadow1 = SundialEngine.calculateShadowVector(45, 180, 0, 150);
assert.strictEqual(shadow1.visible, true, 'Shadow should be visible when elevation > 0');
assert(Math.abs(shadow1.dialAngleDeg - 0) < 0.1 || Math.abs(shadow1.dialAngleDeg - 360) < 0.1, `Shadow dial angle should be 0 deg, got ${shadow1.dialAngleDeg}`);
assert(shadow1.lengthPx > 0 && shadow1.lengthPx <= 150, `Shadow length should be proportional, got ${shadow1.lengthPx}`);

// Night test: Elevation < 0
const shadowNight = SundialEngine.calculateShadowVector(-10, 180, 0, 150);
assert.strictEqual(shadowNight.visible, false, 'Shadow must not be visible at night');
assert.strictEqual(shadowNight.lengthPx, 0, 'Shadow length should be 0 at night');

console.log('✅ ALL SUNDIAL ENGINE TESTS PASSED!');
