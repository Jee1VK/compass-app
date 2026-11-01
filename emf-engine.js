// emf-engine.js
// Magnetic Anomaly, Microtesla (uT) Flux Density & Metal/Interference Detection Engine
// Part of Kuberan Compass App v5.0.0

(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EmfEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  // Earth's natural magnetic field is ~25 to 65 uT
  const EARTH_MIN_UT = 20;
  const EARTH_MAX_UT = 70;
  const CAUTION_THRESHOLD_UT = 85;
  const SEVERE_THRESHOLD_UT = 135;

  let emaMagnitude = 45;
  let history = [];

  function reset() {
    emaMagnitude = 45;
    history = [];
  }

  /**
   * Processes raw 3-axis magnetometer readings (x, y, z) in microteslas (uT).
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {Object} { magnitudeUT, deltaUT, status, isCompromised, message }
   */
  function processReading(x = 0, y = 0, z = 0) {
    const rawMag = Math.sqrt(x * x + y * y + z * z);
    const magnitudeUT = Math.round(rawMag * 10) / 10;

    // Exponential moving average for baseline tracking
    const alpha = 0.15;
    emaMagnitude = (alpha * magnitudeUT) + ((1 - alpha) * emaMagnitude);
    const deltaUT = Math.round(Math.abs(magnitudeUT - emaMagnitude) * 10) / 10;

    let status = 'NORMAL';
    let isCompromised = false;
    let message = 'Natural geomagnetic field';

    if (magnitudeUT > SEVERE_THRESHOLD_UT || magnitudeUT < 10) {
      status = 'WARNING';
      isCompromised = true;
      message = 'Severe magnetic interference! Nearby metal or magnetic source detected.';
    } else if (magnitudeUT > CAUTION_THRESHOLD_UT || deltaUT > 12) {
      status = 'CAUTION';
      isCompromised = false;
      message = 'Mild magnetic distortion detected. Keep away from metallic objects.';
    }

    history.push(magnitudeUT);
    if (history.length > 50) history.shift();

    return {
      magnitudeUT,
      deltaUT,
      status,
      isCompromised,
      message,
      baselineUT: Math.round(emaMagnitude * 10) / 10
    };
  }

  function getHistory() {
    return [...history];
  }

  return {
    reset,
    processReading,
    getHistory
  };
});
