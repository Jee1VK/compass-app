/*! KUBERAN Compass - Heading Engine v4.0
 *  Drop-in replacement for the heading pipeline (sensor -> magnetic heading).
 *  It returns MAGNETIC heading only. Apply declination + manual offset AFTER it.
 *
 *  Fixes the usual causes of a "deflecting" web compass:
 *   1. Android: uses `deviceorientationabsolute` (plain `deviceorientation` alpha
 *      is relative to an arbitrary start direction on Chrome, not north).
 *   2. iOS: uses `webkitCompassHeading` (already tilt-compensated) - no second
 *      tilt correction on top of it.
 *   3. Heading = screen-up axis (phone flat) blended with back-camera axis
 *      (phone upright). The classic W3C formula uses ONLY the back axis, which
 *      is undefined when the phone is flat and swings wildly at small tilts.
 *   4. Screen rotation (portrait/landscape) compensated on both platforms.
 *   5. Low-pass filter works on the shortest angular difference (no jump at 0/360).
 *   6. Unwrapper for the dial so CSS never spins the card the long way round.
 */
(function (root) {
  'use strict';

  var D2R = Math.PI / 180, R2D = 180 / Math.PI;
  function norm360(a) { return ((a % 360) + 360) % 360; }
  function delta(from, to) { return ((to - from + 540) % 360) - 180; } // signed shortest, -180..180
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  function screenAngle() {
    if (root.screen && root.screen.orientation && typeof root.screen.orientation.angle === 'number') {
      return norm360(root.screen.orientation.angle);
    }
    if (typeof root.orientation === 'number') return norm360(root.orientation);
    return 0;
  }

  /* Magnetic heading (deg clockwise from north) from W3C alpha/beta/gamma.
   * scr = screen orientation angle (0, 90, 180, 270).
   * Returns { heading, mag, tilt }. mag ~ confidence (0 = degenerate). */
  function headingFromEuler(alpha, beta, gamma, scr) {
    var a = alpha * D2R, b = beta * D2R, g = gamma * D2R;
    var cA = Math.cos(a), sA = Math.sin(a);
    var cB = Math.cos(b), sB = Math.sin(b);
    var cG = Math.cos(g), sG = Math.sin(g);

    // Device axes expressed in Earth frame [East, North, Up]  (R = Rz(a) Rx(b) Ry(g))
    var X = [cA * cG - sA * sB * sG, sA * cG + cA * sB * sG, -cB * sG]; // right edge
    var Y = [-sA * cB, cA * cB, sB];                                    // top edge
    var Z = [cA * sG + sA * sB * cG, sA * sG - cA * sB * cG, cB * cG];  // out of screen

    // Axis that is "screen up" for the current screen rotation
    var ref, s = 1;
    switch (scr) {
      case 90:  ref = X; s = 1;  break;
      case 180: ref = Y; s = -1; break;
      case 270: ref = X; s = -1; break;
      default:  ref = Y; s = 1;
    }

    // Flat / reclined phone (tilt < 45 deg) -> the screen-up axis carries the direction.
    // Upright phone (tilt > 75 deg)         -> the back-camera axis (-Z) carries it.
    // In between the two unit directions are cross-faded, so there is no jump.
    // (The classic W3C formula uses ONLY the back axis: undefined when flat.)
    var tilt = Math.acos(clamp(Z[2], -1, 1)) * R2D;         // angle of screen normal from vertical
    var w = clamp((tilt - 45) / 30, 0, 1);                  // 0 = use screen-up axis, 1 = use back axis
    var rE = s * ref[0], rN = s * ref[1], rM = Math.sqrt(rE * rE + rN * rN);
    var bE = -Z[0],      bN = -Z[1],      bM = Math.sqrt(bE * bE + bN * bN);
    var e = 0, n = 0;
    if (rM > 1e-3 && w < 1) { e += (1 - w) * rE / rM; n += (1 - w) * rN / rM; }
    if (bM > 1e-3 && w > 0) { e += w * bE / bM;       n += w * bN / bM; }
    return {
      heading: norm360(Math.atan2(e, n) * R2D),
      mag: (1 - w) * rM + w * bM,       // confidence: ~0 means the pose is degenerate
      tilt: tilt
    };
  }

  /* Keeps a continuous (unwrapped) angle so CSS rotate() never spins backwards */
  function createUnwrapper() {
    var cont = 0, last = null;
    return function (h) {
      if (last === null) cont = h; else cont += delta(last, h);
      last = h;
      return cont;
    };
  }

  function create(opts) {
    opts = opts || {};
    var onHeading = opts.onHeading || function () {};
    var onStatus = opts.onStatus || function () {};

    var latest = null, filtered = null, raf = 0, attached = false;
    var relativeOnly = false, hasAbsEvent = ('ondeviceorientationabsolute' in root);
    var debugEl = null, lastInfo = {};

    function onAbs(e) {
      if (e.alpha == null || e.beta == null || e.gamma == null) return;
      latest = { t: 'absolute', a: e.alpha, b: e.beta, g: e.gamma };
    }

    function onRel(e) {
      // iOS Safari: hardware compass heading, already tilt compensated
      if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)) {
        latest = { t: 'ios', h: e.webkitCompassHeading, acc: e.webkitCompassAccuracy, b: e.beta, g: e.gamma };
        return;
      }
      // Firefox etc: deviceorientation itself is absolute
      if (e.absolute === true && !hasAbsEvent && e.alpha != null) {
        latest = { t: 'absolute', a: e.alpha, b: e.beta, g: e.gamma };
        return;
      }
      // Chrome Android relative event: alpha is NOT north -> ignore it for heading
      if (e.alpha != null && !hasAbsEvent) relativeOnly = true;
    }

    function tick() {
      raf = requestAnimationFrame(tick);
      if (!latest) return;
      var s = latest, h, info = { source: s.t, screenAngle: screenAngle() };

      if (s.t === 'ios') {
        h = norm360(s.h + info.screenAngle);
        info.accuracy = s.acc; // degrees; negative = needs calibration
      } else {
        var r = headingFromEuler(s.a, s.b, s.g, info.screenAngle);
        if (r.mag < 0.08) return;          // degenerate pose (screen facing down): hold last value
        h = r.heading;
        info.tilt = r.tilt;
        info.alpha = s.a; info.beta = s.b; info.gamma = s.g;
      }
      info.raw = h;

      // Adaptive low-pass on the shortest angular difference
      if (filtered === null) {
        filtered = h;
      } else {
        var d = delta(filtered, h), ad = Math.abs(d);
        if (ad < 0.25) return;                       // dead-band: kill sensor jitter
        var k = clamp(0.08 + ad / 45, 0.08, 0.6);    // small change = heavy smoothing, big turn = fast
        filtered = norm360(filtered + d * k);
      }
      info.filtered = filtered;
      lastInfo = info;
      onHeading(filtered, info);
      if (debugEl) renderDebug();
    }

    function attach() {
      if (attached) return;
      attached = true;
      if (hasAbsEvent) root.addEventListener('deviceorientationabsolute', onAbs, true);
      root.addEventListener('deviceorientation', onRel, true);
      raf = requestAnimationFrame(tick);
      setTimeout(function () {
        if (!latest) onStatus(relativeOnly
          ? 'This browser only gives relative orientation (no north). Try Chrome on Android or Safari on iOS.'
          : 'No orientation data received. Check sensor permission / HTTPS.');
      }, 2500);
    }

    /* Call from a tap/click handler (iOS requires a user gesture for permission).
     * Pass {skipPermission:true} if your app already requested permission itself. */
    function start(o) {
      o = o || {};
      var needsAsk = !o.skipPermission && typeof root.DeviceOrientationEvent !== 'undefined' &&
        typeof root.DeviceOrientationEvent.requestPermission === 'function';
      var p = needsAsk ? root.DeviceOrientationEvent.requestPermission() : Promise.resolve('granted');
      return p.then(function (res) {
        if (res !== 'granted') { onStatus('Sensor permission denied'); return false; }
        attach();
        return true;
      });
    }

    function stop() {
      if (!attached) return;
      attached = false;
      cancelAnimationFrame(raf);
      root.removeEventListener('deviceorientationabsolute', onAbs, true);
      root.removeEventListener('deviceorientation', onRel, true);
    }

    function reset() { filtered = null; }

    /* Add ?debug=1 to the URL to see live sensor values on screen */
    function enableDebug() {
      if (debugEl || !root.document) return;
      debugEl = root.document.createElement('pre');
      debugEl.style.cssText = 'position:fixed;left:6px;bottom:6px;z-index:9999;margin:0;padding:6px 8px;' +
        'font:11px/1.35 monospace;color:#0f0;background:rgba(0,0,0,.75);border-radius:6px;pointer-events:none;white-space:pre';
      root.document.body.appendChild(debugEl);
    }
    function renderDebug() {
      var i = lastInfo, f = function (v) { return v == null ? '--' : (+v).toFixed(1); };
      debugEl.textContent =
        'src: ' + i.source + '  scr: ' + i.screenAngle + '\n' +
        'raw: ' + f(i.raw) + '  filt: ' + f(i.filtered) + '\n' +
        'a/b/g: ' + f(i.alpha) + ' / ' + f(i.beta) + ' / ' + f(i.gamma) + '\n' +
        'tilt: ' + f(i.tilt) + '  iosAcc: ' + f(i.accuracy);
    }

    return { start: start, stop: stop, reset: reset, enableDebug: enableDebug };
  }

  var api = {
    create: create,
    createUnwrapper: createUnwrapper,
    headingFromEuler: headingFromEuler, // exported for testing
    norm360: norm360,
    delta: delta
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.KuberanHeading = api;
})(typeof window !== 'undefined' ? window : globalThis);
