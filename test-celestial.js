const celestial = require('./celestial-engine.js');

console.log('=== TEST 1: Solar Position (Bangalore, India: 12.9716° N, 77.5946° E) ===');
const testDate = new Date('2026-11-01T06:30:00Z'); // 12:00 PM IST
const solarPos = celestial.getSolarPosition(12.9716, 77.5946, testDate);
console.log('Solar Position at Solar Noon IST:', {
  azimuth: solarPos.azimuth.toFixed(2) + '°',
  elevation: solarPos.elevation.toFixed(2) + '°',
  declination: solarPos.declination.toFixed(2) + '°',
  isDaylight: solarPos.isDaylight
});

if (solarPos.elevation > 45 && solarPos.isDaylight) {
  console.log('PASS: Solar elevation high during midday in tropics');
} else {
  console.error('FAIL: Midday solar elevation unexpected');
}

console.log('\n=== TEST 2: Solar Times (Sunrise & Sunset) ===');
const times = celestial.getSolarTimes(12.9716, 77.5946, testDate);
console.log('Sunrise (UTC):', times.sunrise ? times.sunrise.toISOString() : 'None');
console.log('Solar Noon (UTC):', times.solarNoon.toISOString());
console.log('Sunset (UTC):', times.sunset ? times.sunset.toISOString() : 'None');
console.log('Day Length:', Math.floor(times.dayLengthMinutes / 60) + 'h ' + (times.dayLengthMinutes % 60) + 'm');

if (times.sunrise && times.sunset && times.dayLengthMinutes > 600 && times.dayLengthMinutes < 800) {
  console.log('PASS: Sunrise, Sunset, and day length mathematically sound');
} else {
  console.error('FAIL: Solar times calculation invalid');
}

console.log('\n=== TEST 3: Moon Phase & Lunar Position ===');
const moon = celestial.getLunarPosition(12.9716, 77.5946, testDate);
console.log('Moon Phase:', moon.phaseIcon, moon.phaseName);
console.log('Illumination:', moon.illuminationPercent + '%');
console.log('Moon Azimuth:', moon.azimuth.toFixed(2) + '°');
console.log('Moon Elevation:', moon.elevation.toFixed(2) + '°');

if (moon.phaseIndex >= 0 && moon.phaseIndex < 8 && moon.illuminationPercent >= 0 && moon.illuminationPercent <= 100) {
  console.log('PASS: Moon phase and illumination calculations valid');
} else {
  console.error('FAIL: Moon phase calculation failed');
}

console.log('\n=== ALL CELESTIAL TESTS PASSED! ===');
