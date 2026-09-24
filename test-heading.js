const engine = require('./compass-engine.js');
const headingFromEuler = engine.headingFromEuler;
const cases = [
  {name: 'Flat phone facing North (screen up)', alpha: 0, beta: 0, gamma: 0, scr: 0},
  {name: 'Flat phone facing East', alpha: 270, beta: 0, gamma: 0, scr: 0},
  {name: 'Tilted up 45 deg facing North', alpha: 0, beta: 45, gamma: 0, scr: 0},
  {name: 'Upright (90 deg) facing North', alpha: 0, beta: 90, gamma: 0, scr: 0},
  {name: 'Landscape flat facing North', alpha: 0, beta: 0, gamma: 0, scr: 90},
  {name: 'Landscape tilted 45 deg', alpha: 0, beta: 0, gamma: -45, scr: 90}
];

cases.forEach(c => {
  const r = headingFromEuler(c.alpha, c.beta, c.gamma, c.scr);
  console.log(`${c.name}: H=${r.heading.toFixed(1)}° Tilt=${r.tilt.toFixed(1)}°`);
});
