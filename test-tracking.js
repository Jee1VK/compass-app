// test-tracking.js
// Unit tests for tracking-engine.js
const assert = require('assert');

// Try requiring tracking-engine
let TrackingEngine;
try {
  TrackingEngine = require('./tracking-engine.js');
} catch (e) {
  // Expected to fail before file exists
  console.log('TrackingEngine not yet defined:', e.message);
}

if (!TrackingEngine) {
  console.error('FAIL: tracking-engine.js is not defined or could not be loaded');
  process.exit(1);
}

console.log('--- Running Tracking Engine Tests ---');

// Test 1: Start recording and add breadcrumbs
TrackingEngine.reset();
assert.strictEqual(TrackingEngine.isRecording(), false, 'Should not be recording initially');

TrackingEngine.startRecording();
assert.strictEqual(TrackingEngine.isRecording(), true, 'Should be recording after startRecording()');

// Point 1: Bangalore Chickpet
const pt1 = { lat: 12.9716, lon: 77.5946, ele: 920, time: 1700000000000, speed: 1.2 };
const r1 = TrackingEngine.addBreadcrumb(pt1.lat, pt1.lon, pt1.ele, pt1.time, pt1.speed);
assert.strictEqual(r1.added, true, 'First point must be added');
assert.strictEqual(TrackingEngine.getTrackPoints().length, 1, 'Should have 1 point');
assert.strictEqual(TrackingEngine.getTotalDistanceMeters(), 0, 'Distance of 1st point should be 0');

// Point 2: 100 meters away (approx ~0.0009 deg)
const pt2 = { lat: 12.9725, lon: 77.5946, ele: 921, time: 1700000060000, speed: 1.5 };
const r2 = TrackingEngine.addBreadcrumb(pt2.lat, pt2.lon, pt2.ele, pt2.time, pt2.speed);
assert.strictEqual(r2.added, true, 'Second point 100m away should be added');
assert.strictEqual(TrackingEngine.getTrackPoints().length, 2, 'Should have 2 points');
const dist = TrackingEngine.getTotalDistanceMeters();
assert(dist > 90 && dist < 110, `Distance should be ~100m, got ${dist}`);

// Point 3: duplicate / jitter within 1 meter should be throttled/rejected
const pt3 = { lat: 12.972505, lon: 77.5946, ele: 921, time: 1700000062000, speed: 0.1 };
const r3 = TrackingEngine.addBreadcrumb(pt3.lat, pt3.lon, pt3.ele, pt3.time, pt3.speed);
assert.strictEqual(r3.added, false, 'Jitter within 2 meters should be rejected');

// Test 2: Backtrack calculation
const backtrack = TrackingEngine.computeBacktrack(pt2.lat, pt2.lon);
assert(backtrack !== null, 'Backtrack should return valid vector');
assert(backtrack.bearing >= 170 && backtrack.bearing <= 190, `Backtrack to South should be ~180 deg, got ${backtrack.bearing}`);
assert(backtrack.distance >= 90 && backtrack.distance <= 110, `Backtrack distance should be ~100m, got ${backtrack.distance}`);

// Test 3: Export GPX 1.1
const waypoints = [
  { id: 'w1', name: 'Chickpet Store', lat: 12.9716, lon: 77.5946, icon: '🏛️' }
];
const gpxStr = TrackingEngine.exportGPX('Morning Trek', waypoints);
assert(gpxStr.includes('<?xml version="1.0" encoding="UTF-8"?>'), 'GPX must have XML declaration');
assert(gpxStr.includes('<gpx version="1.1"'), 'GPX must declare version 1.1');
assert(gpxStr.includes('<wpt lat="12.9716" lon="77.5946">'), 'GPX must include waypoint');
assert(gpxStr.includes('<name>Chickpet Store</name>'), 'GPX must include waypoint name');
assert(gpxStr.includes('<trk>'), 'GPX must contain <trk>');
assert(gpxStr.includes('<trkpt lat="12.9716" lon="77.5946">'), 'GPX must contain trackpoints');
assert(gpxStr.includes('</gpx>'), 'GPX must close </gpx>');

// Test 4: Parse GPX 1.1
const parsed = TrackingEngine.parseGPX(gpxStr);
assert.strictEqual(parsed.trackName, 'Morning Trek', 'Parsed trackName should match');
assert.strictEqual(parsed.waypoints.length, 1, 'Parsed waypoints count should be 1');
assert.strictEqual(parsed.waypoints[0].name, 'Chickpet Store');
assert.strictEqual(parsed.trackPoints.length, 2, 'Parsed trackpoints count should be 2');

console.log('✅ ALL TRACKING ENGINE TESTS PASSED!');
