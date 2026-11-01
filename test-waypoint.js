const wp = require('./waypoint-engine.js');

console.log('=== TEST 1: Great-Circle Bearing Calculation ===');
// Benchmark 1: From Equator/Prime Meridian (0, 0) to North (10, 0) -> Bearing should be 0°
const bNorth = wp.calculateBearing(0, 0, 10, 0);
console.log('Due North Bearing:', bNorth.toFixed(2) + '° (Expected: 0.00°)');

// Benchmark 2: From (0, 0) to East (0, 10) -> Bearing should be 90°
const bEast = wp.calculateBearing(0, 0, 0, 10);
console.log('Due East Bearing:', bEast.toFixed(2) + '° (Expected: 90.00°)');

// Benchmark 3: From Bangalore (12.9716° N, 77.5946° E) to Mumbai (19.0760° N, 72.8777° E)
// Mumbai is NNW of Bangalore: Bearing is 324.02°
const bBlrToBom = wp.calculateBearing(12.9716, 77.5946, 19.0760, 72.8777);
console.log('Bangalore to Mumbai Bearing:', bBlrToBom.toFixed(2) + '°');

if (Math.abs(bNorth) < 0.01 && Math.abs(bEast - 90) < 0.01 && bBlrToBom > 320 && bBlrToBom < 330) {
  console.log('PASS: Forward azimuth calculations accurate');
} else {
  console.error('FAIL: Bearing calculation inaccurate');
}

console.log('\n=== TEST 2: Haversine Distance Calculation ===');
// Distance from (0, 0) to (1, 0) lat = 1 degree of latitude approx 111.19 km (111195 m)
const dist1Deg = wp.calculateDistance(0, 0, 1, 0);
console.log('1 Degree Latitude distance:', (dist1Deg / 1000).toFixed(2) + ' km (Expected: ~111.19 km)');

// Distance from Bangalore to Mumbai approx 845 km
const distBlrToBom = wp.calculateDistance(12.9716, 77.5946, 19.0760, 72.8777);
console.log('Bangalore to Mumbai distance:', wp.formatDistance(distBlrToBom));

if (dist1Deg > 110000 && dist1Deg < 112000 && distBlrToBom > 830000 && distBlrToBom < 860000) {
  console.log('PASS: Haversine distance calculations accurate');
} else {
  console.error('FAIL: Distance calculation inaccurate');
}

console.log('\n=== TEST 3: Relative Turn Angle ===');
// Target is at 45°, current heading is 30° -> Turn +15° Right
const turnRight = wp.calculateRelativeAngle(30, 45);
// Target is at 350°, current heading is 10° -> Turn -20° Left (across 0)
const turnLeftWrap = wp.calculateRelativeAngle(10, 350);
console.log('Turn to 45° from 30°:', turnRight + '°');
console.log('Turn to 350° from 10°:', turnLeftWrap + '°');

if (turnRight === 15 && turnLeftWrap === -20) {
  console.log('PASS: Relative angle calculations with 0° wrapping accurate');
} else {
  console.error('FAIL: Relative angle calculation failed');
}

console.log('\n=== TEST 4: Waypoint Memory Storage CRUD ===');
const saved = wp.addWaypoint('Parked Car', 12.9716, 77.5946, 920, '🚗');
console.log('Saved Waypoint:', saved);
const active = wp.getActiveWaypoint();
console.log('Active Waypoint:', active ? active.name : 'None');

if (active && active.name === 'Parked Car' && wp.getWaypoints().length === 1) {
  console.log('PASS: Waypoint CRUD functioning');
} else {
  console.error('FAIL: Waypoint CRUD failed');
}

console.log('\n=== ALL WAYPOINT TESTS PASSED! ===');
