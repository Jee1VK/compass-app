/**
 * KUBERAN Compass App - High Precision Mobile Compass & Inclinometer
 * Built for iOS Safari, Android Chrome, and Desktop Browsers.
 */

(function() {
  'use strict';

  // --- State Variables ---
  let currentHeading = 0;
  let rawMagneticHeading = 0;
  let targetHeading = null;
  let isTrueNorth = false;
  let magneticDeclination = 0;
  let pitch = 0;
  let roll = 0;
  let hasSensorData = false;
  let hapticsEnabled = true;
  let deferredPrompt = null;
  let lastVibrateTime = 0;
  let lastVibratedCardinal = -1;

  // Themes list (Marine Brass is default)
  const THEMES = ['theme-marine', 'theme-tactical', 'theme-minimal', 'theme-night'];
  let currentThemeIndex = 0;

  // DOM Elements
  const compassCard = document.getElementById('compassCard');
  const dialSvg = document.getElementById('dialSvg');
  const headingDegrees = document.getElementById('headingDegrees');
  const headingCardinal = document.getElementById('headingCardinal');
  const milsValue = document.getElementById('milsValue');
  const backAzimuthValue = document.getElementById('backAzimuthValue');
  const targetValue = document.getElementById('targetValue');
  const targetMarkerRing = document.getElementById('targetMarkerRing');
  const targetDeviationBar = document.getElementById('targetDeviationBar');
  const devArrow = document.getElementById('devArrow');
  const devText = document.getElementById('devText');
  const btnClearTarget = document.getElementById('btnClearTarget');
  const btnBearingLock = document.getElementById('btnBearingLock');
  const btnToggleNorth = document.getElementById('btnToggleNorth');
  const northPill = document.getElementById('northPill');
  const northModeLabel = document.getElementById('northModeLabel');
  const btnTheme = document.getElementById('btnTheme');
  const btnInfo = document.getElementById('btnInfo');
  const infoModal = document.getElementById('infoModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const iosPermissionBanner = document.getElementById('iosPermissionBanner');
  const btnGrantSensor = document.getElementById('btnGrantSensor');
  const levelHousing = document.getElementById('levelHousing');
  const levelBubble = document.getElementById('levelBubble');
  const pitchGauge = document.getElementById('pitchGauge');
  const rollGauge = document.getElementById('rollGauge');
  const pitchValue = document.getElementById('pitchValue');
  const rollValue = document.getElementById('rollValue');
  const levelStatusCard = document.getElementById('levelStatusCard');
  const levelStatusText = document.getElementById('levelStatusText');
  const gpsLat = document.getElementById('gpsLat');
  const gpsLatDec = document.getElementById('gpsLatDec');
  const gpsLng = document.getElementById('gpsLng');
  const gpsLngDec = document.getElementById('gpsLngDec');
  const gpsAlt = document.getElementById('gpsAlt');
  const gpsAccuracy = document.getElementById('gpsAccuracy');
  const gpsDeclination = document.getElementById('gpsDeclination');
  const sensorStatus = document.getElementById('sensorStatus');
  const btnCopyCoords = document.getElementById('btnCopyCoords');
  const btnInstallApp = document.getElementById('btnInstallApp');
  const toast = document.getElementById('toast');
  const githubRepoLink = document.getElementById('githubRepoLink');

  // --- Initialize Vector Compass Dial SVG ---
  function buildDialSvg() {
    const cx = 250;
    const cy = 250;
    const rOuter = 240;
    let svgContent = '';

    // Outer decorative ring
    svgContent += `<circle cx="${cx}" cy="${cy}" r="${rOuter}" fill="none" stroke="currentColor" stroke-opacity="0.15" stroke-width="2"/>`;
    svgContent += `<circle cx="${cx}" cy="${cy}" r="${rOuter - 18}" fill="none" stroke="currentColor" stroke-opacity="0.1" stroke-width="1"/>`;
    svgContent += `<circle cx="${cx}" cy="${cy}" r="116" fill="none" stroke="currentColor" stroke-opacity="0.15" stroke-width="1" stroke-dasharray="4,4"/>`;

    // Degree Ticks (Every 2°, 10°, 30°)
    for (let deg = 0; deg < 360; deg += 2) {
      const rad = (deg - 90) * (Math.PI / 180);
      const is30 = deg % 30 === 0;
      const is10 = deg % 10 === 0;

      let tickLen = 7;
      let strokeWidth = 1;
      let strokeOpacity = 0.35;

      if (is30) {
        tickLen = 16;
        strokeWidth = 2.5;
        strokeOpacity = 0.9;
      } else if (is10) {
        tickLen = 12;
        strokeWidth = 1.5;
        strokeOpacity = 0.6;
      }

      const x1 = cx + (rOuter - 4) * Math.cos(rad);
      const y1 = cy + (rOuter - 4) * Math.sin(rad);
      const x2 = cx + (rOuter - 4 - tickLen) * Math.cos(rad);
      const y2 = cy + (rOuter - 4 - tickLen) * Math.sin(rad);

      const color = (deg === 0) ? 'var(--accent-north)' : 'currentColor';
      svgContent += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-opacity="${strokeOpacity}" stroke-width="${strokeWidth}"/>`;

      // Numbers for 30° increments
      if (is30 && deg !== 0) {
        const textR = rOuter - 30;
        const tx = cx + textR * Math.cos(rad);
        const ty = cy + textR * Math.sin(rad);
        svgContent += `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" fill="var(--dial-text)" font-size="13" font-weight="700" font-family="var(--font-mono)" text-anchor="middle" dominant-baseline="central" transform="rotate(${deg}, ${tx.toFixed(1)}, ${ty.toFixed(1)})">${deg}</text>`;
      }
    }

    // Cardinal & Intercardinal Headings
    const cardinals = [
      { label: 'N', deg: 0, r: rOuter - 30, size: 26, weight: 900, color: 'var(--accent-north)' },
      { label: 'NE', deg: 45, r: rOuter - 26, size: 12, weight: 800, color: 'var(--dial-ticks-major)' },
      { label: 'E', deg: 90, r: rOuter - 28, size: 22, weight: 800, color: 'var(--dial-ticks-major)' },
      { label: 'SE', deg: 135, r: rOuter - 26, size: 12, weight: 800, color: 'var(--dial-ticks-major)' },
      { label: 'S', deg: 180, r: rOuter - 28, size: 22, weight: 800, color: 'var(--dial-ticks-major)' },
      { label: 'SW', deg: 225, r: rOuter - 26, size: 12, weight: 800, color: 'var(--dial-ticks-major)' },
      { label: 'W', deg: 270, r: rOuter - 28, size: 22, weight: 800, color: 'var(--dial-ticks-major)' },
      { label: 'NW', deg: 315, r: rOuter - 26, size: 12, weight: 800, color: 'var(--dial-ticks-major)' }
    ];

    cardinals.forEach(c => {
      const rad = (c.deg - 90) * (Math.PI / 180);
      const tx = cx + c.r * Math.cos(rad);
      const ty = cy + c.r * Math.sin(rad);
      svgContent += `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" fill="${c.color}" font-size="${c.size}" font-weight="${c.weight}" font-family="var(--font-sans)" text-anchor="middle" dominant-baseline="central" transform="rotate(${c.deg}, ${tx.toFixed(1)}, ${ty.toFixed(1)})">${c.label}</text>`;
    });

    // Mils Indicators on inner circle (NATO 0-64 mils in 800 mils steps)
    for (let mil = 0; mil < 64; mil += 8) {
      const deg = (mil / 64) * 360;
      const rad = (deg - 90) * (Math.PI / 180);
      const mr = 132;
      const mx = cx + mr * Math.cos(rad);
      const my = cy + mr * Math.sin(rad);
      svgContent += `<text x="${mx.toFixed(1)}" y="${my.toFixed(1)}" fill="var(--text-dim)" font-size="9" font-weight="700" font-family="var(--font-mono)" text-anchor="middle" dominant-baseline="central" transform="rotate(${deg}, ${mx.toFixed(1)}, ${my.toFixed(1)})">${mil}</text>`;
    }

    // --- 8-Point Vintage Nautical Compass Rose ---
    const primaryPoints = [0, 90, 180, 270];
    primaryPoints.forEach(deg => {
      const tipRad = (deg - 90) * (Math.PI / 180);
      const leftRad = (deg - 90 - 14) * (Math.PI / 180);
      const rightRad = (deg - 90 + 14) * (Math.PI / 180);
      const rTip = 125;
      const rBase = 58;

      const tipX = cx + rTip * Math.cos(tipRad);
      const tipY = cy + rTip * Math.sin(tipRad);
      const leftX = cx + rBase * Math.cos(leftRad);
      const leftY = cy + rBase * Math.sin(leftRad);
      const rightX = cx + rBase * Math.cos(rightRad);
      const rightY = cy + rBase * Math.sin(rightRad);

      const isNorth = (deg === 0);
      const colA = isNorth ? 'var(--accent-north)' : 'var(--accent-cyan)';
      const colB = isNorth ? '#991b1b' : 'rgba(180, 130, 60, 0.45)';

      svgContent += `<polygon points="${cx},${cy} ${tipX.toFixed(1)},${tipY.toFixed(1)} ${rightX.toFixed(1)},${rightY.toFixed(1)}" fill="${colA}" fill-opacity="0.85"/>`;
      svgContent += `<polygon points="${cx},${cy} ${tipX.toFixed(1)},${tipY.toFixed(1)} ${leftX.toFixed(1)},${leftY.toFixed(1)}" fill="${colB}" fill-opacity="0.75"/>`;
    });

    const secondaryPoints = [45, 135, 225, 315];
    secondaryPoints.forEach(deg => {
      const tipRad = (deg - 90) * (Math.PI / 180);
      const leftRad = (deg - 90 - 11) * (Math.PI / 180);
      const rightRad = (deg - 90 + 11) * (Math.PI / 180);
      const rTip = 100;
      const rBase = 58;

      const tipX = cx + rTip * Math.cos(tipRad);
      const tipY = cy + rTip * Math.sin(tipRad);
      const leftX = cx + rBase * Math.cos(leftRad);
      const leftY = cy + rBase * Math.sin(leftRad);
      const rightX = cx + rBase * Math.cos(rightRad);
      const rightY = cy + rBase * Math.sin(rightRad);

      svgContent += `<polygon points="${cx},${cy} ${tipX.toFixed(1)},${tipY.toFixed(1)} ${rightX.toFixed(1)},${rightY.toFixed(1)}" fill="var(--accent-cyan)" fill-opacity="0.6"/>`;
      svgContent += `<polygon points="${cx},${cy} ${tipX.toFixed(1)},${tipY.toFixed(1)} ${leftX.toFixed(1)},${leftY.toFixed(1)}" fill="rgba(140, 95, 40, 0.35)" fill-opacity="0.6"/>`;
    });

    // Center Crosshairs Accent
    svgContent += `<line x1="${cx}" y1="${cy - 70}" x2="${cx}" y2="${cy - 120}" stroke="currentColor" stroke-opacity="0.2" stroke-width="1.5"/>`;
    svgContent += `<line x1="${cx}" y1="${cy + 70}" x2="${cx}" y2="${cy + 120}" stroke="currentColor" stroke-opacity="0.2" stroke-width="1.5"/>`;
    svgContent += `<line x1="${cx - 70}" y1="${cy}" x2="${cx - 120}" y2="${cy}" stroke="currentColor" stroke-opacity="0.2" stroke-width="1.5"/>`;
    svgContent += `<line x1="${cx + 70}" y1="${cy}" x2="${cx + 120}" y2="${cy}" stroke="currentColor" stroke-opacity="0.2" stroke-width="1.5"/>`;

    dialSvg.innerHTML = svgContent;
  }

  // --- Cardinal Direction Helper ---
  function getCardinal(deg) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round(deg / 22.5) % 16;
    return directions[idx];
  }

  // --- Update Compass Orientation ---
  function updateHeading(rawHeading) {
    if (typeof rawHeading === 'number' && !isNaN(rawHeading)) {
      rawMagneticHeading = ((rawHeading % 360) + 360) % 360;
    }

    let trueHeading = rawMagneticHeading;
    if (isTrueNorth) {
      trueHeading = ((rawMagneticHeading + magneticDeclination) % 360 + 360) % 360;
    }

    currentHeading = trueHeading;
    const rounded = Math.round(trueHeading);

    // Rotate compass dial card (negative rotation so 0° points up to lubber line)
    compassCard.style.transform = `rotate(${-trueHeading}deg)`;

    // Update telemetry readouts
    headingDegrees.textContent = rounded;
    headingCardinal.textContent = getCardinal(trueHeading);
    milsValue.textContent = Math.round((trueHeading / 360) * 6400);
    backAzimuthValue.textContent = `${Math.round((trueHeading + 180) % 360)}°`;

    // Target Deviation logic
    if (targetHeading !== null) {
      targetMarkerRing.style.transform = `rotate(${targetHeading - trueHeading}deg)`;
      let diff = (targetHeading - trueHeading + 540) % 360 - 180;
      const absDiff = Math.abs(Math.round(diff));

      if (absDiff <= 2) {
        devArrow.textContent = '🎯';
        devText.textContent = 'ON TARGET';
        targetDeviationBar.style.borderColor = 'var(--accent-level)';
        targetDeviationBar.style.background = 'rgba(34, 197, 94, 0.15)';
      } else if (diff > 0) {
        devArrow.textContent = '▶';
        devText.textContent = `${absDiff}° RIGHT`;
        targetDeviationBar.style.borderColor = 'var(--accent-target)';
        targetDeviationBar.style.background = 'rgba(245, 158, 11, 0.15)';
      } else {
        devArrow.textContent = '◀';
        devText.textContent = `${absDiff}° LEFT`;
        targetDeviationBar.style.borderColor = 'var(--accent-target)';
        targetDeviationBar.style.background = 'rgba(245, 158, 11, 0.15)';
      }
    }

    // Haptic feedback on cardinal points (0°, 90°, 180°, 270°) - single pulse upon crossing
    if (hapticsEnabled && 'vibrate' in navigator) {
      const cardinalIndex = [0, 90, 180, 270].findIndex(c => Math.abs(rounded - c) <= 1 || (c === 0 && rounded === 360));
      const now = Date.now();
      if (cardinalIndex !== -1 && cardinalIndex !== lastVibratedCardinal && (now - lastVibrateTime > 400)) {
        navigator.vibrate(cardinalIndex === 0 ? [30, 40, 30] : 18);
        lastVibrateTime = now;
        lastVibratedCardinal = cardinalIndex;
      } else if (cardinalIndex === -1) {
        lastVibratedCardinal = -1;
      }
    }
  }

  // --- Dual-Axis Inclinometer / Bubble Level ---
  function updateOrientation(p, r) {
    pitch = p;
    roll = r;

    // Pitch is front-to-back tilt (-90 to +90)
    // Roll is left-to-right tilt (-180 to +180)
    const pitchDeg = Math.round(p);
    const rollDeg = Math.round(r);

    pitchValue.textContent = `${pitchDeg}°`;
    rollValue.textContent = `${rollDeg}°`;

    // Bar gauges (normalized from -45° to +45°)
    const pitchNorm = Math.min(Math.max((p + 45) / 90 * 100, 0), 100);
    const rollNorm = Math.min(Math.max((r + 45) / 90 * 100, 0), 100);
    pitchGauge.style.width = `${pitchNorm}%`;
    rollGauge.style.width = `${rollNorm}%`;

    // Center Level Bubble physics
    // Housing radius ~ 55px, max bubble offset ~ 40px
    const maxOffset = 38;
    const sensFactor = 2.4; // 15° reaches edge
    const offsetX = Math.min(Math.max(r * sensFactor, -maxOffset), maxOffset);
    const offsetY = Math.min(Math.max(p * sensFactor, -maxOffset), maxOffset);

    levelBubble.style.transform = `translate(${offsetX.toFixed(1)}px, ${offsetY.toFixed(1)}px)`;

    const totalTilt = Math.sqrt(p * p + r * r);
    if (totalTilt <= 1.5) {
      levelHousing.classList.add('is-level');
      levelStatusCard.classList.add('level-locked');
      levelStatusText.textContent = 'PERFECTLY LEVEL';

      if (hapticsEnabled && 'vibrate' in navigator && (Date.now() - lastVibrateTime > 1000)) {
        navigator.vibrate(25);
        lastVibrateTime = Date.now();
      }
    } else {
      levelHousing.classList.remove('is-level');
      levelStatusCard.classList.remove('level-locked');
      if (totalTilt <= 5) {
        levelStatusText.textContent = 'NEARLY LEVEL';
      } else {
        levelStatusText.textContent = 'TILTED';
      }
    }
  }

  // --- Device Motion & Orientation Listeners ---
  function initSensors() {
    let previouslyGranted = false;
    try {
      previouslyGranted = localStorage.getItem('kuberan-sensors-enabled') === 'true';
    } catch(e) {}

    // Always attach sensor listeners right away
    attachSensorListeners();

    // 1. Check for iOS 13+ permission requirement
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      // If not previously granted, display the floating hover banner
      if (!previouslyGranted) {
        iosPermissionBanner.classList.remove('hidden');
      }

      btnGrantSensor.addEventListener('click', async () => {
        try {
          const response = await DeviceOrientationEvent.requestPermission();
          if (response === 'granted') {
            iosPermissionBanner.classList.add('hidden');
            try { localStorage.setItem('kuberan-sensors-enabled', 'true'); } catch(e) {}
            attachSensorListeners();
            showToast('Compass Sensors Activated');
          } else {
            showToast('Permission denied for sensors');
          }
        } catch (err) {
          console.error(err);
          // If already granted in a previous prompt or gesture error, attach listeners and hide
          attachSensorListeners();
          iosPermissionBanner.classList.add('hidden');
          try { localStorage.setItem('kuberan-sensors-enabled', 'true'); } catch(e) {}
        }
      });
    }
  }

  function attachSensorListeners() {
    // Primary: deviceorientationabsolute (W3C standard for true/absolute magnetic heading)
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', handleDeviceOrientation, true);
    } else if ('ondeviceorientation' in window) {
      window.addEventListener('deviceorientation', handleDeviceOrientation, true);
    }

    // Fallback manual touch/mouse control if sensors aren't firing on desktop
    initDesktopDragSimulation();
  }

  function handleDeviceOrientation(event) {
    hasSensorData = true;
    sensorStatus.textContent = 'Hardware active';
    // Ensure permission banner is dismissed and saved as enabled once data arrives
    if (iosPermissionBanner && !iosPermissionBanner.classList.contains('hidden')) {
      iosPermissionBanner.classList.add('hidden');
    }
    try { localStorage.setItem('kuberan-sensors-enabled', 'true'); } catch(e) {}

    let heading = 0;

    // iOS provides direct calibrated magnetic heading
    if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
      heading = event.webkitCompassHeading;
    } else if (event.alpha !== null && event.alpha !== undefined) {
      // Android: alpha goes 0-360 counter-clockwise
      heading = ((360 - event.alpha) % 360 + 360) % 360;
      if (event.absolute === false) {
        sensorStatus.textContent = 'Relative gyro';
      }
    }

    updateHeading(heading);

    // Pitch & Roll for bubble level
    let p = event.beta || 0;  // Front-to-back tilt in [-180, 180]
    let r = event.gamma || 0; // Left-to-right tilt in [-90, 90]

    // Handle landscape/portrait orientation adjustments (modern standard + legacy fallback)
    const orientationAngle = (screen.orientation && typeof screen.orientation.angle === 'number')
      ? screen.orientation.angle
      : (typeof window.orientation === 'number' ? window.orientation : 0);

    if (orientationAngle === 90) {
      const temp = p; p = -r; r = temp;
    } else if (orientationAngle === -90 || orientationAngle === 270) {
      const temp = p; p = r; r = -temp;
    } else if (orientationAngle === 180) {
      p = -p; r = -r;
    }

    updateOrientation(p, r);
  }

  // --- Desktop / Fallback Drag Simulation ---
  function initDesktopDragSimulation() {
    let isDragging = false;
    let startAngle = 0;
    let startHeading = 0;

    function getAngle(e) {
      const rect = compassCard.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const clientX = e.touches && e.touches.length ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches && e.touches.length ? e.touches[0].clientY : e.clientY;
      return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
    }

    function onStart(e) {
      if (hasSensorData) return;
      isDragging = true;
      startAngle = getAngle(e);
      startHeading = rawMagneticHeading;
    }

    function onMove(e) {
      if (!isDragging) return;
      const currentAngle = getAngle(e);
      const diff = currentAngle - startAngle;
      const newHeading = (startHeading - diff + 360) % 360;
      updateHeading(newHeading);
    }

    function onEnd() {
      isDragging = false;
    }

    compassCard.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    compassCard.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
  }

  // --- GPS Geolocation Engine ---
  function initGPS() {
    if (!('geolocation' in navigator)) {
      gpsLat.textContent = 'GPS Unavailable';
      gpsLng.textContent = 'No GPS hardware';
      return;
    }

    const options = {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000
    };

    navigator.geolocation.watchPosition(
      (position) => {
        const coords = position.coords;
        const lat = coords.latitude;
        const lng = coords.longitude;
        const alt = coords.altitude;
        const acc = coords.accuracy;

        // Formatted DMS
        gpsLat.textContent = toDMS(lat, 'lat');
        gpsLng.textContent = toDMS(lng, 'lng');

        // Decimal Degrees
        gpsLatDec.textContent = `${lat.toFixed(5)}°`;
        gpsLngDec.textContent = `${lng.toFixed(5)}°`;

        // Altitude
        gpsAlt.textContent = (alt !== null && alt !== undefined && !isNaN(alt)) ? `${Math.round(alt)} m` : '-- m';
        gpsAccuracy.textContent = `Accuracy: ±${Math.round(acc)} m`;

        // Approximate Magnetic Declination (Simple model)
        calculateDeclination(lat, lng);
      },
      (error) => {
        console.warn('GPS error:', error.message);
        gpsLatDec.textContent = 'Location disabled';
        gpsLngDec.textContent = 'Enable GPS in settings';
      },
      options
    );
  }

  function toDMS(deg, type) {
    if (typeof deg !== 'number' || isNaN(deg)) return '--° --\' --"';
    const absolute = Math.abs(deg);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

    const direction = type === 'lat'
      ? (deg >= 0 ? 'N' : 'S')
      : (deg >= 0 ? 'E' : 'W');

    return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
  }

  // Approximation formula for Magnetic Declination
  function calculateDeclination(lat, lng) {
    // World Magnetic Model approximation for rough declination estimation
    const decl = (lng - 80) * Math.sin(lat * Math.PI / 180) * 0.15;
    magneticDeclination = Math.round(decl * 10) / 10;
    gpsDeclination.textContent = `${magneticDeclination >= 0 ? '+' : ''}${magneticDeclination}°`;
    if (isTrueNorth) {
      updateHeading(rawMagneticHeading);
    }
  }

  // --- Target Bearing Lock ---
  btnBearingLock.addEventListener('click', () => {
    if (targetHeading === null) {
      targetHeading = Math.round(currentHeading);
      targetValue.textContent = `${targetHeading}°`;
      targetMarkerRing.style.display = 'block';
      targetDeviationBar.classList.remove('hidden');
      btnBearingLock.style.borderColor = 'var(--accent-target)';
      btnBearingLock.style.color = 'var(--accent-target)';
      showToast(`Bearing Locked: ${targetHeading}°`);
    } else {
      clearTarget();
    }
  });

  function clearTarget() {
    targetHeading = null;
    targetValue.textContent = '--';
    targetMarkerRing.style.display = 'none';
    targetDeviationBar.classList.add('hidden');
    btnBearingLock.style.borderColor = '';
    btnBearingLock.style.color = '';
  }

  btnClearTarget.addEventListener('click', clearTarget);

  // --- True North vs Magnetic North Toggle ---
  btnToggleNorth.addEventListener('click', () => {
    isTrueNorth = !isTrueNorth;
    if (isTrueNorth) {
      northPill.textContent = 'TRUE';
      northModeLabel.textContent = 'TRUE NORTH';
      btnToggleNorth.style.borderColor = 'var(--accent-cyan)';
      showToast('Switched to True North');
    } else {
      northPill.textContent = 'MAG';
      northModeLabel.textContent = 'MAGNETIC NORTH';
      btnToggleNorth.style.borderColor = '';
      showToast('Switched to Magnetic North');
    }
    updateHeading(rawMagneticHeading);
  });

  // --- Theme Switcher (Defaults to Marine Brass) ---
  btnTheme.addEventListener('click', () => {
    document.body.classList.remove(THEMES[currentThemeIndex]);
    currentThemeIndex = (currentThemeIndex + 1) % THEMES.length;
    const newTheme = THEMES[currentThemeIndex];
    document.body.classList.add(newTheme);
    try {
      localStorage.setItem('kuberan-theme-v3', newTheme);
    } catch(e) {}
    buildDialSvg(); // Re-render dial to match theme accent
    showToast(`Theme: ${newTheme.replace('theme-', '').toUpperCase()}`);
  });

  // Clear older stored theme to ensure Marine Brass is active by default for everyone
  try {
    localStorage.removeItem('aerocompass-theme');
    localStorage.removeItem('compass-theme');
  } catch(e) {}

  // Restore Theme: defaults to Marine Brass (theme-marine)
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem('kuberan-theme-v3');
  } catch(e) {}

  THEMES.forEach(t => document.body.classList.remove(t));
  if (savedTheme && THEMES.includes(savedTheme)) {
    document.body.classList.add(savedTheme);
    currentThemeIndex = THEMES.indexOf(savedTheme);
  } else {
    document.body.classList.add('theme-marine');
    currentThemeIndex = 0;
  }


  // --- Copy Coordinates ---
  btnCopyCoords.addEventListener('click', async () => {
    const textToCopy = `Coordinates: ${gpsLat.textContent}, ${gpsLng.textContent} (${gpsLatDec.textContent}, ${gpsLngDec.textContent}) | Altitude: ${gpsAlt.textContent}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('Coordinates Copied to Clipboard!');
    } catch (e) {
      showToast('Could not copy coordinates');
    }
  });

  // --- Info / Install Modal & QR Code ---
  btnInfo.addEventListener('click', () => {
    infoModal.classList.remove('hidden');
    drawQRCode();
  });

  btnCloseModal.addEventListener('click', () => {
    infoModal.classList.add('hidden');
  });

  infoModal.addEventListener('click', (e) => {
    if (e.target === infoModal) infoModal.classList.add('hidden');
  });

  // --- Toast Notification ---
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 2200);
  }

  // --- PWA Installation Banner Handling ---
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    btnInstallApp.classList.remove('hidden');
  });

  btnInstallApp.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('Thank you for installing KUBERAN Compass App!');
      }
      deferredPrompt = null;
      btnInstallApp.classList.add('hidden');
    }
  });

  // --- Register Service Worker for Offline PWA ---
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js?v=3.4.0')
        .then((reg) => {
          console.log('KUBERAN Compass ServiceWorker registered:', reg.scope);
          // Check for immediate update
          reg.update();
        })
        .catch((err) => console.log('ServiceWorker registration error:', err));
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }

  // --- QR Code Generator using QRCode.js ---
  let qrcodeInstance = null;
  function drawQRCode() {
    const qrcodeBox = document.getElementById('qrcodeBox');
    if (!qrcodeBox) return;

    const url = window.location.href;
    qrcodeBox.innerHTML = '';
    
    if (typeof QRCode !== 'undefined') {
      try {
        qrcodeInstance = new QRCode(qrcodeBox, {
          text: url,
          width: 170,
          height: 170,
          colorDark: '#07090e',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });
      } catch (err) {
        console.warn('QR Code rendering fallback:', err);
        qrcodeBox.innerHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#07090e;font-size:12px;font-weight:600;word-break:break-all;text-align:center;">${url}</a>`;
      }
    } else {
      qrcodeBox.innerHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#07090e;font-size:12px;font-weight:600;word-break:break-all;text-align:center;">${url}</a>`;
    }
  }

  // --- Initialize App ---
  function init() {
    buildDialSvg();
    initSensors();
    initGPS();

    // Default heading display
    updateHeading(0);
    updateOrientation(0, 0);

    // Update GitHub repo link based on actual host or default
    if (window.location.hostname.includes('github.io')) {
      const parts = window.location.pathname.split('/').filter(Boolean);
      const repoName = parts[0] || 'compass-app';
      const user = window.location.hostname.split('.')[0];
      githubRepoLink.href = `https://github.com/${user}/${repoName}`;
    }
  }

  init();
})();
