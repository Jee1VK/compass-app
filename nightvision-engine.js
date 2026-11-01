// nightvision-engine.js
// Tactical Night Vision, Celestial Nav Guides (Polaris & Southern Cross) & SOS Morse Strobe
// Part of Kuberan Compass App v5.0.0

(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.NightVisionEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  // Constants
  const TO_RAD = Math.PI / 180;
  const TO_DEG = 180 / Math.PI;

  /**
   * Calculates Local Sidereal Time (LST) in hours (0 - 24).
   */
  function calculateLST(date, longitudeDeg) {
    const timeMs = date.getTime();
    const JD = timeMs / 86400000 + 2440587.5;
    const D = JD - 2451545.0; // days since J2000.0
    let GMST = (18.697374558 + 24.06570982441908 * D) % 24;
    if (GMST < 0) GMST += 24;

    let LST = (GMST + longitudeDeg / 15) % 24;
    if (LST < 0) LST += 24;
    return LST;
  }

  /**
   * Converts equatorial coordinates (RA, Dec) to horizontal (Altitude, Azimuth).
   */
  function equatorialToHorizontal(raHours, decDeg, latDeg, lonDeg, date) {
    const LST = calculateLST(date, lonDeg);
    let H = (LST - raHours) * 15; // Hour angle in degrees
    H = (H + 360) % 360;

    const phi = latDeg * TO_RAD;
    const delta = decDeg * TO_RAD;
    const hRad = H * TO_RAD;

    // Altitude
    const sinAlt = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(hRad);
    const altitude = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * TO_DEG;

    // Azimuth
    const cosAlt = Math.cos(altitude * TO_RAD);
    let azimuth = 0;
    if (Math.abs(cosAlt) > 1e-6) {
      const cosAz = (Math.sin(delta) - Math.sin(phi) * Math.sin(altitude * TO_RAD)) / (Math.cos(phi) * cosAlt);
      const clampedCosAz = Math.max(-1, Math.min(1, cosAz));
      let az = Math.acos(clampedCosAz) * TO_DEG;
      if (Math.sin(hRad) > 0) {
        az = 360 - az;
      }
      azimuth = (az + 360) % 360;
    }

    return { altitude, azimuth };
  }

  /**
   * Calculates Polaris position.
   * Polaris: RA ~2.53h, Dec ~+89.26 deg
   */
  function calculatePolarisPosition(latDeg, lonDeg, date = new Date()) {
    if (latDeg < -1.0) {
      return { altitude: 0, azimuth: 0, visible: false };
    }
    const coords = equatorialToHorizontal(2.53, 89.26, latDeg, lonDeg, date);
    return {
      altitude: Math.round(coords.altitude * 10) / 10,
      azimuth: Math.round(coords.azimuth * 10) / 10,
      visible: coords.altitude > 0
    };
  }

  /**
   * Calculates Southern Cross (Acrux) position.
   * Acrux: RA ~12.44h, Dec ~-63.1 deg
   */
  function calculateSouthernCrossPosition(latDeg, lonDeg, date = new Date()) {
    // Acrux is never visible above ~27 deg North
    if (latDeg > 27.0) {
      return { altitude: 0, azimuth: 180, visible: false };
    }
    const coords = equatorialToHorizontal(12.44, -63.1, latDeg, lonDeg, date);
    return {
      altitude: Math.round(coords.altitude * 10) / 10,
      azimuth: Math.round(coords.azimuth * 10) / 10,
      visible: coords.altitude > 0
    };
  }

  /**
   * Generates standard international Morse code pulse sequences.
   * SOS: 3 dots, 3 dashes, 3 dots.
   * Dot unit t = 150ms.
   */
  function getMorsePattern(text = 'SOS') {
    const UNIT = 150; // ms
    const MORSE_MAP = {
      'S': '...',
      'O': '---'
    };

    const pattern = [];
    const upper = text.toUpperCase();

    for (let i = 0; i < upper.length; i++) {
      const char = upper[i];
      const code = MORSE_MAP[char] || '...';

      for (let j = 0; j < code.length; j++) {
        const symbol = code[j];
        const isDash = (symbol === '-');
        const duration = isDash ? UNIT * 3 : UNIT;

        pattern.push({ on: true, durationMs: duration });
        // Inter-element space (between dots/dashes within letter)
        if (j < code.length - 1) {
          pattern.push({ on: false, durationMs: UNIT });
        }
      }

      // Inter-letter space (3 units)
      if (i < upper.length - 1) {
        pattern.push({ on: false, durationMs: UNIT * 3 });
      }
    }

    // Word space (7 units between SOS repeats)
    pattern.push({ on: false, durationMs: UNIT * 7 });

    return pattern;
  }

  /**
   * Starts an SOS Morse strobe runner.
   * Toggles videoTrack torch if available, and executes onScreenCallback(isOn) for UI flashing.
   */
  function startMorseStrobe(videoTrack = null, onScreenCallback = null) {
    let running = true;
    let timeoutId = null;
    const pattern = getMorsePattern('SOS');
    let stepIndex = 0;

    async function setTorch(state) {
      if (videoTrack && typeof videoTrack.applyConstraints === 'function') {
        try {
          const caps = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
          if (caps.torch) {
            await videoTrack.applyConstraints({
              advanced: [{ torch: state }]
            });
          }
        } catch (e) {
          // torch constraint error, ignore silently
        }
      }
    }

    function tick() {
      if (!running) return;

      const step = pattern[stepIndex];
      const isOn = step.on;
      const duration = step.durationMs;

      if (onScreenCallback) {
        try { onScreenCallback(isOn); } catch (e) {}
      }
      setTorch(isOn);

      stepIndex = (stepIndex + 1) % pattern.length;
      timeoutId = setTimeout(tick, duration);
    }

    tick();

    return {
      stop: function() {
        running = false;
        if (timeoutId) clearTimeout(timeoutId);
        if (onScreenCallback) {
          try { onScreenCallback(false); } catch (e) {}
        }
        setTorch(false);
      },
      isRunning: function() {
        return running;
      }
    };
  }

  return {
    calculatePolarisPosition,
    calculateSouthernCrossPosition,
    getMorsePattern,
    startMorseStrobe
  };
});
