/*! KUBERAN Compass - Celestial Astronomy Engine v1.0
 *  100% Offline Solar & Lunar Ephemeris, Golden Hour, and Moon Phase calculations.
 *  Uses NOAA Solar Position Algorithms and Meeus Astronomical Models.
 *  Zero external dependencies.
 */
(function (root) {
  'use strict';

  var D2R = Math.PI / 180;
  var R2D = 180 / Math.PI;

  function norm360(deg) {
    return ((deg % 360) + 360) % 360;
  }

  function toJulian(date) {
    return (date.getTime() / 86400000.0) + 2440587.5;
  }

  /* -------------------------------------------------------------------------
   * Solar Calculations (NOAA Solar Position Algorithm)
   * ------------------------------------------------------------------------- */
  function getSolarPosition(lat, lng, date) {
    date = date || new Date();
    var jd = toJulian(date);
    var t = (jd - 2451545.0) / 36525.0;

    // Geometric Mean Longitude of Sun (deg)
    var l0 = norm360(280.46646 + t * (36000.76983 + 0.0003032 * t));

    // Geometric Mean Anomaly of Sun (deg)
    var m = norm360(357.52911 + t * (35999.05029 - 0.0001537 * t));
    var mRad = m * D2R;

    // Eccentricity of Earth orbit
    var e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);

    // Sun Equation of the Center
    var c = Math.sin(mRad) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
            Math.sin(2 * mRad) * (0.019993 - 0.000101 * t) +
            Math.sin(3 * mRad) * 0.000289;

    // Sun True Longitude & Apparent Longitude (deg)
    var trueLong = l0 + c;
    var omega = 125.04 - 1934.136 * t;
    var lambda = trueLong - 0.00569 - 0.00478 * Math.sin(omega * D2R);

    // Mean Obliquity of Ecliptic & Corrected Obliquity (deg)
    var seconds = 21.448 - t * (46.8150 + t * (0.00059 - t * 0.001813));
    var ob0 = 23.0 + (26.0 + (seconds / 60.0)) / 60.0;
    var ob = ob0 + 0.00256 * Math.cos(omega * D2R);
    var obRad = ob * D2R;

    // Sun Declination & Right Ascension
    var sinDec = Math.sin(obRad) * Math.sin(lambda * D2R);
    var dec = Math.asin(sinDec); // radians

    var y = Math.tan(obRad / 2.0);
    y *= y;

    // Equation of Time (minutes)
    var sin2l0 = Math.sin(2.0 * l0 * D2R);
    var sinm = Math.sin(mRad);
    var cos2l0 = Math.cos(2.0 * l0 * D2R);
    var sin4l0 = Math.sin(4.0 * l0 * D2R);
    var sin2m = Math.sin(2.0 * mRad);

    var eqTime = 4.0 * R2D * (
      y * sin2l0 -
      2.0 * e * sinm +
      4.0 * e * y * sinm * cos2l0 -
      0.5 * y * y * sin4l0 -
      1.25 * e * e * sin2m
    );

    // Local Time calculations
    var utcHours = date.getUTCHours() + date.getUTCMinutes() / 60.0 + date.getUTCSeconds() / 3600.0;
    var trueSolarTime = (utcHours * 60.0 + eqTime + 4.0 * lng) % 1440;
    if (trueSolarTime < 0) trueSolarTime += 1440;

    var hourAngle = trueSolarTime / 4.0 - 180.0;
    if (hourAngle < -180.0) hourAngle += 360.0;
    var haRad = hourAngle * D2R;

    var latRad = lat * D2R;

    // Solar Zenith & Elevation Angle
    var cosZenith = Math.sin(latRad) * sinDec + Math.cos(latRad) * Math.cos(dec) * Math.cos(haRad);
    cosZenith = Math.min(1.0, Math.max(-1.0, cosZenith));
    var zenith = Math.acos(cosZenith);
    var elevation = 90.0 - (zenith * R2D);

    // Atmospheric Refraction Correction
    var refraction = 0;
    if (elevation > -0.575) {
      refraction = 1.02 / Math.tan((elevation + 10.3 / (elevation + 5.11)) * D2R) / 60.0;
    }
    var correctedElevation = elevation + refraction;

    // Solar Azimuth Angle (clockwise from North, 0..360)
    var azimuthRad;
    var cosAzimuth = (Math.sin(dec) - Math.sin(latRad) * cosZenith) / (Math.cos(latRad) * Math.sin(zenith));
    cosAzimuth = Math.min(1.0, Math.max(-1.0, cosAzimuth));
    azimuthRad = Math.acos(cosAzimuth);

    var azimuth = azimuthRad * R2D;
    if (hourAngle > 0) {
      azimuth = (azimuth + 180.0) % 360.0;
    } else {
      azimuth = (540.0 - azimuth) % 360.0;
    }

    return {
      azimuth: norm360(azimuth),
      elevation: correctedElevation,
      declination: dec * R2D,
      isDaylight: correctedElevation > -0.833,
      isGoldenHour: correctedElevation >= -4.0 && correctedElevation <= 6.0,
      isBlueHour: correctedElevation >= -6.0 && correctedElevation < -4.0
    };
  }

  /* -------------------------------------------------------------------------
   * Solar Times (Sunrise, Sunset, Solar Noon, Golden Hour)
   * ------------------------------------------------------------------------- */
  function getSolarTimes(lat, lng, date) {
    date = date || new Date();
    var midnight = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
    var jd = toJulian(midnight);
    var t = (jd - 2451545.0) / 36525.0;

    var l0 = norm360(280.46646 + t * (36000.76983 + 0.0003032 * t));
    var m = norm360(357.52911 + t * (35999.05029 - 0.0001537 * t));
    var mRad = m * D2R;
    var e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
    var c = Math.sin(mRad) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
            Math.sin(2 * mRad) * (0.019993 - 0.000101 * t);
    var lambda = l0 + c - 0.00569 - 0.00478 * Math.sin((125.04 - 1934.136 * t) * D2R);
    var ob = 23.4392911 - t * 0.0130042;
    var sinDec = Math.sin(ob * D2R) * Math.sin(lambda * D2R);
    var dec = Math.asin(sinDec);
    var latRad = lat * D2R;

    var y = Math.tan((ob * D2R) / 2.0);
    y *= y;
    var eqTime = 4.0 * R2D * (
      y * Math.sin(2.0 * l0 * D2R) -
      2.0 * e * Math.sin(mRad) +
      4.0 * e * y * Math.sin(mRad) * Math.cos(2.0 * l0 * D2R)
    );

    // Solar noon in UTC minutes from midnight
    var solarNoonMinutes = 720 - (4 * lng) - eqTime;
    var solarNoonDate = new Date(midnight.getTime() + solarNoonMinutes * 60000);

    function hourAngleForAngle(h0Deg) {
      var cosH = (Math.sin(h0Deg * D2R) - Math.sin(latRad) * Math.sin(dec)) / (Math.cos(latRad) * Math.cos(dec));
      if (cosH > 1) return null;  // Polar night: Sun never rises
      if (cosH < -1) return -1;  // Polar day: Sun never sets
      return Math.acos(cosH) * R2D; // degrees
    }

    var haSunrise = hourAngleForAngle(-0.833);
    var haGoldenStart = hourAngleForAngle(6.0);
    var haGoldenEnd = hourAngleForAngle(-4.0);

    var sunriseDate = null, sunsetDate = null, dayLengthMinutes = 0;
    var polarState = 'normal';

    if (haSunrise === null) {
      polarState = 'polar_night';
    } else if (haSunrise === -1) {
      polarState = 'polar_day';
      dayLengthMinutes = 1440;
    } else {
      var halfDayMinutes = haSunrise * 4;
      sunriseDate = new Date(solarNoonDate.getTime() - halfDayMinutes * 60000);
      sunsetDate = new Date(solarNoonDate.getTime() + halfDayMinutes * 60000);
      dayLengthMinutes = Math.round(halfDayMinutes * 2);
    }

    return {
      solarNoon: solarNoonDate,
      sunrise: sunriseDate,
      sunset: sunsetDate,
      dayLengthMinutes: dayLengthMinutes,
      polarState: polarState,
      goldenHourMorning: (haGoldenEnd && haGoldenStart && haGoldenEnd !== -1 && haGoldenStart !== -1)
        ? {
            start: new Date(solarNoonDate.getTime() - haGoldenEnd * 4 * 60000),
            end: new Date(solarNoonDate.getTime() - haGoldenStart * 4 * 60000)
          }
        : null,
      goldenHourEvening: (haGoldenStart && haGoldenEnd && haGoldenStart !== -1 && haGoldenEnd !== -1)
        ? {
            start: new Date(solarNoonDate.getTime() + haGoldenStart * 4 * 60000),
            end: new Date(solarNoonDate.getTime() + haGoldenEnd * 4 * 60000)
          }
        : null
    };
  }

  /* -------------------------------------------------------------------------
   * Lunar Calculations (Moon Phase, Illumination, Lunar Azimuth)
   * ------------------------------------------------------------------------- */
  var MOON_PHASE_NAMES = [
    'New Moon',
    'Waxing Crescent',
    'First Quarter',
    'Waxing Gibbous',
    'Full Moon',
    'Waning Gibbous',
    'Last Quarter',
    'Waning Crescent'
  ];

  var MOON_PHASE_ICONS = [
    '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'
  ];

  function getLunarPosition(lat, lng, date) {
    date = date || new Date();
    var jd = toJulian(date);
    var t = (jd - 2451545.0) / 36525.0;

    // Synodic Month = 29.53058867 days
    // Reference New Moon: Jan 6, 2000 at 18:14 UTC (JD 2451549.26)
    var daysSinceRef = jd - 2451549.26;
    var phaseValue = (daysSinceRef / 29.53058867) % 1.0;
    if (phaseValue < 0) phaseValue += 1.0;

    var ageDays = phaseValue * 29.53058867;
    var illuminationFraction = (1.0 - Math.cos(phaseValue * 2 * Math.PI)) / 2.0;
    var illuminationPercent = Math.round(illuminationFraction * 100);

    // 8 Phases (each ~0.125 slice of orbit)
    var phaseIndex = Math.floor((phaseValue + 0.0625) * 8) % 8;

    // Approximate Lunar Azimuth from Moon's mean longitude & Greenwich Sidereal Time
    var lMoon = norm360(218.316 + 481267.8813 * t);
    var mSun = norm360(357.5291 + 35999.0503 * t);
    var mMoon = norm360(134.963 + 477198.8676 * t);
    var dMoon = norm360(297.850 + 445267.1115 * t);

    // Ecliptic longitude of Moon
    var lambdaMoon = lMoon + 6.289 * Math.sin(mMoon * D2R) - 1.274 * Math.sin((2 * dMoon - mMoon) * D2R);
    var betaMoon = 5.128 * Math.sin(norm360(93.272 + 483202.0175 * t) * D2R);

    // Equatorial coordinates of Moon
    var ob = (23.4392911 - t * 0.0130042) * D2R;
    var sinDecM = Math.sin(betaMoon * D2R) * Math.cos(ob) + Math.cos(betaMoon * D2R) * Math.sin(ob) * Math.sin(lambdaMoon * D2R);
    var decM = Math.asin(sinDecM);

    var yM = Math.sin(lambdaMoon * D2R) * Math.cos(ob) - Math.tan(betaMoon * D2R) * Math.sin(ob);
    var xM = Math.cos(lambdaMoon * D2R);
    var raM = norm360(Math.atan2(yM, xM) * R2D);

    // Greenwich Mean Sidereal Time (deg)
    var gmst = norm360(280.46061837 + 360.98564736629 * (jd - 2451545.0));
    var localHourAngle = norm360(gmst + lng - raM);
    var lhaRad = localHourAngle * D2R;
    var latRad = lat * D2R;

    // Horizontal coordinates
    var sinAlt = Math.sin(latRad) * Math.sin(decM) + Math.cos(latRad) * Math.cos(decM) * Math.cos(lhaRad);
    var moonElevation = Math.asin(sinAlt) * R2D;

    var cosAz = (Math.sin(decM) - Math.sin(latRad) * sinAlt) / (Math.cos(latRad) * Math.cos(Math.asin(sinAlt)));
    cosAz = Math.min(1.0, Math.max(-1.0, cosAz));
    var moonAz = Math.acos(cosAz) * R2D;
    if (Math.sin(lhaRad) > 0) {
      moonAz = 360.0 - moonAz;
    }

    return {
      phaseIndex: phaseIndex,
      phaseName: MOON_PHASE_NAMES[phaseIndex],
      phaseIcon: MOON_PHASE_ICONS[phaseIndex],
      ageDays: Math.round(ageDays * 10) / 10,
      illuminationPercent: illuminationPercent,
      azimuth: norm360(moonAz),
      elevation: moonElevation,
      isAboveHorizon: moonElevation > -0.5
    };
  }

  /* -------------------------------------------------------------------------
   * Export API
   * ------------------------------------------------------------------------- */
  var api = {
    getSolarPosition: getSolarPosition,
    getSolarTimes: getSolarTimes,
    getLunarPosition: getLunarPosition,
    MOON_PHASE_NAMES: MOON_PHASE_NAMES,
    MOON_PHASE_ICONS: MOON_PHASE_ICONS
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.CelestialEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
