// sundial-engine.js
// Equation of Time (EoT), Local Apparent Solar Time (LAT), and Virtual Gnomon Shadow Engine
// Part of Kuberan Compass App v5.0.0

(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SundialEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  /**
   * Calculates the Equation of Time (EoT) in minutes using the NOAA / Spencer Fourier series.
   * EoT is positive when apparent solar time is ahead of mean solar time (e.g., Nov: ~+16m).
   * EoT is negative when apparent solar time is behind mean solar time (e.g., Feb: ~-14m).
   * @param {Date} date - UTC Date
   * @returns {number} EoT in minutes
   */
  function calculateEquationOfTime(date = new Date()) {
    const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000) + 1;
    const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

    // Fractional year in radians
    const gamma = (2 * Math.PI / 365) * (dayOfYear - 1 + (hour - 12) / 24);

    // Spencer (1971) Equation of Time series (minutes)
    const eot = 229.18 * (
      0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma)
    );

    return eot;
  }

  /**
   * Calculates Local Apparent Solar Time (LAT) at a given longitude.
   * True solar time where 12:00:00 is exact solar noon.
   * @param {Date} date
   * @param {number} longitude - degrees (-180 to +180)
   * @returns {Object} { hours, minutes, seconds, decimalHours, formatted, eotMinutes }
   */
  function calculateLocalApparentTime(date = new Date(), longitude = 0) {
    const eotMinutes = calculateEquationOfTime(date);

    // Decimal UTC hours
    const utcHours = date.getUTCHours() +
                     date.getUTCMinutes() / 60 +
                     date.getUTCSeconds() / 3600 +
                     date.getUTCMilliseconds() / 3600000;

    // Solar hours: UTC + (lon / 15 deg/hr) + (EoT / 60 mins/hr)
    let solarHours = utcHours + (longitude / 15) + (eotMinutes / 60);
    solarHours = (solarHours % 24 + 24) % 24;

    const hours = Math.floor(solarHours);
    const fractionalMinutes = (solarHours - hours) * 60;
    const minutes = Math.floor(fractionalMinutes);
    const seconds = Math.floor((fractionalMinutes - minutes) * 60);

    const pad = n => String(n).padStart(2, '0');
    const h12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formatted = `${pad(h12)}:${pad(minutes)}:${pad(seconds)} ${ampm}`;

    return {
      hours,
      minutes,
      seconds,
      decimalHours: solarHours,
      formatted,
      eotMinutes
    };
  }

  /**
   * Calculates the virtual gnomon shadow vector relative to the compass dial.
   * @param {number} solarElevationDeg - Solar altitude above horizon (-90 to +90)
   * @param {number} solarAzimuthDeg - Solar azimuth from North (0 to 360)
   * @param {number} compassHeadingDeg - Current phone heading (0 to 360)
   * @param {number} dialRadiusPx - Pixel radius of compass dial (e.g., 140px)
   * @returns {Object} { visible, lengthPx, dialAngleDeg, tipX, tipY }
   */
  function calculateShadowVector(solarElevationDeg, solarAzimuthDeg, compassHeadingDeg = 0, dialRadiusPx = 140) {
    if (solarElevationDeg <= 0) {
      return {
        visible: false,
        lengthPx: 0,
        dialAngleDeg: 0,
        tipX: 0,
        tipY: 0
      };
    }

    // Shadow azimuth is 180 degrees opposite the sun
    const shadowAzimuth = (solarAzimuthDeg + 180) % 360;

    // Relative to the compass card heading
    const dialAngleDeg = (shadowAzimuth - compassHeadingDeg + 360) % 360;

    // Height of virtual gnomon pin: ~35% of dial radius
    const gnomonHeight = dialRadiusPx * 0.35;

    // Standard shadow length: H / tan(elevation)
    // Clamp elevation to min 4 degrees to avoid infinite length at horizon
    const effectiveElevRad = Math.max(4, solarElevationDeg) * Math.PI / 180;
    const rawLength = gnomonHeight / Math.tan(effectiveElevRad);

    // Clamp maximum shadow length to 92% of dial radius
    const lengthPx = Math.min(dialRadiusPx * 0.92, Math.max(8, rawLength));

    // Screen coordinates (where 0 deg is North / -Y axis)
    const angleRad = dialAngleDeg * Math.PI / 180;
    const tipX = lengthPx * Math.sin(angleRad);
    const tipY = -lengthPx * Math.cos(angleRad);

    return {
      visible: true,
      lengthPx,
      dialAngleDeg,
      tipX,
      tipY
    };
  }

  return {
    calculateEquationOfTime,
    calculateLocalApparentTime,
    calculateShadowVector
  };
});
