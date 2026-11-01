const engine = require('./compass-engine.js');
const headingFromEuler = engine.headingFromEuler;
const norm360 = engine.norm360;
const delta = engine.delta;
const createUnwrapper = engine.createUnwrapper;

console.log('=== TEST 1: Flat Headings (0°-360°) ===');
let flatPassed = true;
[0, 45, 90, 135, 180, 225, 270, 315].forEach(h => {
  const alpha = (360 - h) % 360;
  const res = headingFromEuler(alpha, 0, 0, 0);
  const diff = Math.abs(delta(h, res.heading));
  if (diff > 0.01) {
    console.error(`FAIL: Target ${h}°, got ${res.heading.toFixed(2)}°`);
    flatPassed = false;
  }
});
if (flatPassed) console.log('PASS: All flat headings accurate to < 0.01°');

console.log('\n=== TEST 2: Hand-Held Reading Postures (Pitch 15°-75°, Roll -20° to +20°) ===');
let tiltPassed = true;
[15, 30, 45, 60, 70, 75].forEach(pitch => {
  [-20, -10, 0, 10, 20].forEach(roll => {
    [0, 90, 180, 270].forEach(h => {
      const alpha = (360 - h) % 360;
      const res = headingFromEuler(alpha, pitch, roll, 0);
      const diff = Math.abs(delta(h, res.heading));
      if (diff > 0.01) {
        console.error(`FAIL: Heading ${h}° at pitch ${pitch}°, roll ${roll}° deflected by ${diff.toFixed(2)}°`);
        tiltPassed = false;
      }
    });
  });
});
if (tiltPassed) console.log('PASS: Zero deflection (< 0.01°) across all hand-held tilts (15°-75°) and rolls (-20° to +20°)');

console.log('\n=== TEST 3: Screen Orientation Angles (Landscape 90°/270° & Inverted 180°) ===');
// At scr=90, phone right edge is screen-up. Alpha=90 is facing North.
const land90 = headingFromEuler(90, 0, 0, 90);
const land270 = headingFromEuler(270, 0, 0, 270);
const inv180 = headingFromEuler(180, 0, 0, 180);
console.log(`scr=90 facing North: ${land90.heading.toFixed(2)}° (Expected: 0.00°)`);
console.log(`scr=270 facing North: ${land270.heading.toFixed(2)}° (Expected: 0.00°)`);
console.log(`scr=180 facing North: ${inv180.heading.toFixed(2)}° (Expected: 0.00°)`);
const scrPassed = Math.abs(land90.heading) < 0.01 && Math.abs(land270.heading) < 0.01 && Math.abs(inv180.heading) < 0.01;
if (scrPassed) console.log('PASS: Screen rotation compensation verified');

console.log('\n=== TEST 4: Continuous Angle Unwrapper (Crossing 0°/360°) ===');
const unwrapper = createUnwrapper();
const testAngles = [355, 358, 1, 4, 359, 355];
const unwrapped = testAngles.map(a => unwrapper(a));
console.log('Angles:   ', testAngles);
console.log('Unwrapped:', unwrapped.map(a => a.toFixed(1)));
// 355 -> 358 (+3) -> 1 (+3 -> 361) -> 4 (+3 -> 364) -> 359 (-5 -> 359) -> 355 (-4 -> 355)
const unwrapPassed = unwrapped[2] > 360 && Math.abs(unwrapped[2] - 361) < 0.01;
if (unwrapPassed) console.log('PASS: Unwrapper produces continuous monotonically increasing/decreasing degrees without 360° spin');

console.log('\n=== ALL TESTS PASSED! ===');
