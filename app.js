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

  // Sensor Calibration & Smoothing
  let calibrationOffset = 0;
  try {
    calibrationOffset = parseFloat(localStorage.getItem('kuberan-compass-offset')) || 0;
  } catch(e) {}
  let smoothedHeading = null;
  const SMOOTHING_FACTOR = 0.25; // low-pass filter — balanced responsiveness + stability
  let sensorAccuracy = null;
  let isAbsoluteOrientation = false;

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
  const calibrationModal = document.getElementById('calibrationModal');
  const btnCloseCalModal = document.getElementById('btnCloseCalModal');
  const btnCalibrate = document.getElementById('btnCalibrate');
  const telemetryCalibrationItem = document.getElementById('telemetryCalibrationItem');
  const btnOffsetMinus5 = document.getElementById('btnOffsetMinus5');
  const btnOffsetMinus1 = document.getElementById('btnOffsetMinus1');
  const btnOffsetReset = document.getElementById('btnOffsetReset');
  const btnOffsetPlus1 = document.getElementById('btnOffsetPlus1');
  const btnOffsetPlus5 = document.getElementById('btnOffsetPlus5');
  const btnZeroToNorth = document.getElementById('btnZeroToNorth');
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
        const isCardinalAngle = (deg === 90 || deg === 180 || deg === 270);
        const textR = isCardinalAngle ? (rOuter - 46) : (rOuter - 30);
        const tx = cx + textR * Math.cos(rad);
        const ty = cy + textR * Math.sin(rad);
        svgContent += `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" fill="var(--dial-text)" font-size="13" font-weight="700" font-family="var(--font-mono)" text-anchor="middle" dominant-baseline="central" transform="rotate(${deg}, ${tx.toFixed(1)}, ${ty.toFixed(1)})">${deg}</text>`;
      }
    }

    // Cardinal & Intercardinal Headings
    const cardinals = [
      { label: 'N', deg: 0, r: rOuter - 30, size: 26, weight: 900, color: 'var(--accent-north)' },
      { label: 'NE', deg: 45, r: rOuter - 26, size: 12, weight: 800, color: 'var(--dial-ticks-major)' },
      { label: 'E', deg: 90, r: rOuter - 25, size: 22, weight: 800, color: 'var(--dial-ticks-major)' },
      { label: 'SE', deg: 135, r: rOuter - 26, size: 12, weight: 800, color: 'var(--dial-ticks-major)' },
      { label: 'S', deg: 180, r: rOuter - 25, size: 22, weight: 800, color: 'var(--dial-ticks-major)' },
      { label: 'SW', deg: 225, r: rOuter - 26, size: 12, weight: 800, color: 'var(--dial-ticks-major)' },
      { label: 'W', deg: 270, r: rOuter - 25, size: 22, weight: 800, color: 'var(--dial-ticks-major)' },
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
      const colB = isNorth ? '#991b1b' : 'var(--dial-ticks)';

      svgContent += `<polygon points="${cx},${cy} ${tipX.toFixed(1)},${tipY.toFixed(1)} ${rightX.toFixed(1)},${rightY.toFixed(1)}" fill="${colA}" fill-opacity="0.85"/>`;
      svgContent += `<polygon points="${cx},${cy} ${tipX.toFixed(1)},${tipY.toFixed(1)} ${leftX.toFixed(1)},${leftY.toFixed(1)}" fill="${colB}" fill-opacity="0.55"/>`;
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

      svgContent += `<polygon points="${cx},${cy} ${tipX.toFixed(1)},${tipY.toFixed(1)} ${rightX.toFixed(1)},${rightY.toFixed(1)}" fill="var(--accent-cyan)" fill-opacity="0.55"/>`;
      svgContent += `<polygon points="${cx},${cy} ${tipX.toFixed(1)},${tipY.toFixed(1)} ${leftX.toFixed(1)},${leftY.toFixed(1)}" fill="var(--dial-ticks)" fill-opacity="0.45"/>`;
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

  // --- Compass Engine Integration ---
  const unwrapper = KuberanHeading.createUnwrapper();
  
  const engine = KuberanHeading.create({
    onHeading: (magHeading, info) => {
      hasSensorData = true;
      if (iosPermissionBanner && !iosPermissionBanner.classList.contains('hidden')) {
        iosPermissionBanner.classList.add('hidden');
      }
      try { localStorage.setItem('kuberan-sensors-enabled', 'true'); } catch(e) {}
      
      sensorAccuracy = info.accuracy != null ? info.accuracy : null;
      isAbsoluteOrientation = (info.source === 'absolute');
      
      rawMagneticHeading = magHeading;
      
      // Calculate final heading including declination and manual offset
      let finalHeading = (magHeading + calibrationOffset) % 360;
      if (finalHeading < 0) finalHeading += 360;
      if (isTrueNorth) {
         finalHeading = (finalHeading + magneticDeclination) % 360;
         if (finalHeading < 0) finalHeading += 360;
      }
      
      currentHeading = finalHeading;
      const rounded = Math.round(finalHeading);
      
      const unwrappedHeading = unwrapper(finalHeading);
      compassCard.style.transform = `rotate(${-unwrappedHeading}deg)`;
      
      headingDegrees.textContent = rounded;
      headingCardinal.textContent = getCardinal(finalHeading);
      milsValue.textContent = Math.round((finalHeading / 360) * 6400);
      backAzimuthValue.textContent = `${Math.round((finalHeading + 180) % 360)}°`;
      
      // Target Deviation logic
      if (targetHeading !== null) {
        targetMarkerRing.style.transform = `rotate(${targetHeading - finalHeading}deg)`;
        let diff = (targetHeading - finalHeading + 540) % 360 - 180;
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
      
      // Update Pitch & Roll
      if (info.beta != null && info.gamma != null) {
        let p = info.beta;
        let r = info.gamma;
        const orientationAngle = info.screenAngle || 0;
        
        if (orientationAngle === 90) {
          const temp = p; p = -r; r = temp;
        } else if (orientationAngle === -90 || orientationAngle === 270) {
          const temp = p; p = r; r = -temp;
        } else if (orientationAngle === 180) {
          p = -p; r = -r;
        }
        
        updateOrientation(p, r);
      }
      
      updateCalibrationUI();
    },
    onStatus: (msg) => {
       console.log('Engine status:', msg);
       if (msg.includes('denied')) {
         showToast('Permission denied for sensors');
       }
    }
  });

  function updateHeading(newHeading) {
     // Used primarily by fallback desktop drag simulation
     rawMagneticHeading = newHeading;
     
     let finalHeading = (newHeading + calibrationOffset) % 360;
     if (finalHeading < 0) finalHeading += 360;
     if (isTrueNorth) {
        finalHeading = (finalHeading + magneticDeclination) % 360;
        if (finalHeading < 0) finalHeading += 360;
     }
     
     currentHeading = finalHeading;
     const rounded = Math.round(finalHeading);
     const unwrappedHeading = unwrapper(finalHeading);
     compassCard.style.transform = `rotate(${-unwrappedHeading}deg)`;
     headingDegrees.textContent = rounded;
     headingCardinal.textContent = getCardinal(finalHeading);
  }

  function initSensors() {
    let previouslyGranted = false;
    try { previouslyGranted = localStorage.getItem('kuberan-sensors-enabled') === 'true'; } catch(e) {}
    
    // Check for URL ?debug=1 parameter to enable debug view
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('debug')) {
      engine.enableDebug();
    }
    
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      if (!previouslyGranted) {
        iosPermissionBanner.classList.remove('hidden');
      } else {
        engine.start({skipPermission: false});
      }

      btnGrantSensor.addEventListener('click', async () => {
        const success = await engine.start({skipPermission: false});
        if (success) {
           iosPermissionBanner.classList.add('hidden');
           try { localStorage.setItem('kuberan-sensors-enabled', 'true'); } catch(e) {}
           showToast('Compass Sensors Activated');
        }
      });
    } else {
      engine.start();
    }
    initDesktopDragSimulation();
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
  function updateGpsReadouts(position) {
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
    gpsAccuracy.textContent = (acc !== null && acc !== undefined && !isNaN(acc)) ? `Accuracy: ±${Math.round(acc)} m` : 'Accuracy: ±-- m';

    // Approximate Magnetic Declination (Simple model)
    calculateDeclination(lat, lng);
  }

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
      updateGpsReadouts,
      (error) => {
        console.warn('GPS error:', error.message);
        gpsLatDec.textContent = 'Location disabled';
        gpsLngDec.textContent = 'Enable GPS in settings';
      },
      options
    );

    // Allow user to tap telemetry panel to re-fetch GPS
    const telemetryGrid = document.querySelector('.telemetry-grid');
    if (telemetryGrid) {
      telemetryGrid.addEventListener('click', () => {
        showToast('Refreshing GPS Position...');
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            updateGpsReadouts(pos);
            showToast('GPS Position Updated');
          },
          (err) => {
            console.warn('GPS refresh error:', err);
            showToast('Could not refresh GPS');
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
      });
    }
  }

  function toDMS(deg, type) {
    if (typeof deg !== 'number' || isNaN(deg)) return '--° --\' --"';
    const absolute = Math.abs(deg);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.min(Math.floor(minutesNotTruncated), 59);
    const seconds = Math.min(Math.floor((minutesNotTruncated - minutes) * 60), 59);

    const direction = type === 'lat'
      ? (deg >= 0 ? 'N' : 'S')
      : (deg >= 0 ? 'E' : 'W');

    return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
  }

  // Approximation formula for Magnetic Declination
  function calculateDeclination(lat, lng) {
    // World Magnetic Model approximation for rough declination estimation
    const decl = (lng - 80) * Math.sin(lat * Math.PI / 180) * 0.15;
    let rounded = Math.round(decl * 10) / 10;
    if (Object.is(rounded, -0) || Math.abs(rounded) === 0) rounded = 0;
    magneticDeclination = rounded;
    gpsDeclination.textContent = `${magneticDeclination > 0 ? '+' : ''}${magneticDeclination.toFixed(1)}°`;
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
      btnBearingLock.setAttribute('aria-pressed', 'true');
      btnBearingLock.setAttribute('aria-label', `Unlock Target Bearing (Currently locked to ${targetHeading}°)`);
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
    btnBearingLock.setAttribute('aria-pressed', 'false');
    btnBearingLock.setAttribute('aria-label', 'Lock Bearing');
  }

  btnClearTarget.addEventListener('click', clearTarget);

  // --- True North vs Magnetic North Toggle ---
  btnToggleNorth.addEventListener('click', () => {
    isTrueNorth = !isTrueNorth;
    if (isTrueNorth) {
      northPill.textContent = 'TRUE';
      northModeLabel.textContent = 'TRUE NORTH';
      btnToggleNorth.style.borderColor = 'var(--accent-cyan)';
      btnToggleNorth.setAttribute('aria-label', 'Current: True North. Tap to switch to Magnetic North');
      showToast('Switched to True North');
    } else {
      northPill.textContent = 'MAG';
      northModeLabel.textContent = 'MAGNETIC NORTH';
      btnToggleNorth.style.borderColor = '';
      btnToggleNorth.setAttribute('aria-label', 'Current: Magnetic North. Tap to switch to True North');
      showToast('Switched to Magnetic North');
    }
    updateHeading(rawMagneticHeading);
  });

  // --- Theme Switcher (Defaults to Marine Brass) ---
  const THEME_COLORS = {
    'theme-marine': '#08111e',
    'theme-tactical': '#07090e',
    'theme-minimal': '#09090b',
    'theme-night': '#050000'
  };

  function applyThemeMetaColor(themeName) {
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme && THEME_COLORS[themeName]) {
      metaTheme.setAttribute('content', THEME_COLORS[themeName]);
    }
  }

  btnTheme.addEventListener('click', () => {
    document.body.classList.remove(THEMES[currentThemeIndex]);
    currentThemeIndex = (currentThemeIndex + 1) % THEMES.length;
    const newTheme = THEMES[currentThemeIndex];
    document.body.classList.add(newTheme);
    applyThemeMetaColor(newTheme);
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
    applyThemeMetaColor(savedTheme);
  } else {
    document.body.classList.add('theme-marine');
    currentThemeIndex = 0;
    applyThemeMetaColor('theme-marine');
  }


  // --- Copy Coordinates ---
  btnCopyCoords.addEventListener('click', async () => {
    const textToCopy = `Coordinates: ${gpsLat.textContent}, ${gpsLng.textContent} (${gpsLatDec.textContent}, ${gpsLngDec.textContent}) | Altitude: ${gpsAlt.textContent}`;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
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

  // Close info modal on backdrop click
  infoModal.addEventListener('click', (e) => {
    if (e.target === infoModal) infoModal.classList.add('hidden');
  });

  // --- Calibration & Alignment Studio Engine ---
  function updateCalibrationUI() {
    const calActiveOffsetVal = document.getElementById('calActiveOffsetVal');
    const calOffsetBadge = document.getElementById('calOffsetBadge');
    const calSensorBadge = document.getElementById('calSensorBadge');
    const calAccuracyText = document.getElementById('calAccuracyText');
    const sensorAccuracyBadge = document.getElementById('sensorAccuracyBadge');

    const formattedOffset = `${calibrationOffset >= 0 ? '+' : ''}${calibrationOffset.toFixed(1)}°`;
    if (calActiveOffsetVal) calActiveOffsetVal.textContent = formattedOffset;
    if (calOffsetBadge) calOffsetBadge.textContent = formattedOffset;

    let accLabel = 'Acc: ±3° (High)';
    let badgeClass = 'badge-high';

    if (sensorAccuracy !== null) {
      if (sensorAccuracy < 0) {
        accLabel = 'Uncalibrated';
        badgeClass = 'badge-low';
      } else if (sensorAccuracy <= 15) {
        accLabel = `Acc: ±${Math.round(sensorAccuracy)}° (High)`;
        badgeClass = 'badge-high';
      } else if (sensorAccuracy <= 25) {
        accLabel = `Acc: ±${Math.round(sensorAccuracy)}° (Good)`;
        badgeClass = 'badge-med';
      } else {
        accLabel = `Acc: ±${Math.round(sensorAccuracy)}° (Interference)`;
        badgeClass = 'badge-low';
      }
    } else if (isAbsoluteOrientation) {
      accLabel = 'Acc: ±3° (Absolute)';
      badgeClass = 'badge-high';
    } else if (hasSensorData) {
      accLabel = 'Relative Gyro';
      badgeClass = 'badge-med';
    } else {
      accLabel = 'Sensors Inactive';
      badgeClass = 'badge-low';
    }

    if (calAccuracyText) {
      calAccuracyText.textContent = accLabel;
    }
    if (calSensorBadge) {
      calSensorBadge.textContent = (isAbsoluteOrientation || (sensorAccuracy !== null && sensorAccuracy >= 0))
        ? 'Magnetometer Active'
        : 'Sensors Active';
      calSensorBadge.className = `cal-badge ${badgeClass}`;
    }
    if (sensorAccuracyBadge) {
      sensorAccuracyBadge.textContent = accLabel;
    }
  }

  function setCalibrationOffset(offset) {
    calibrationOffset = Math.round(offset * 10) / 10;
    while (calibrationOffset > 180) calibrationOffset -= 360;
    while (calibrationOffset < -180) calibrationOffset += 360;
    try {
      localStorage.setItem('kuberan-compass-offset', calibrationOffset.toString());
    } catch(e) {}
    updateCalibrationUI();
    updateHeading(rawMagneticHeading);
    showToast(`Offset: ${calibrationOffset >= 0 ? '+' : ''}${calibrationOffset.toFixed(1)}°`);
  }

  function adjustCalibrationOffset(delta) {
    setCalibrationOffset(calibrationOffset + delta);
  }

  // Calibration Modal Event Handlers
  if (btnCalibrate) {
    btnCalibrate.addEventListener('click', () => {
      calibrationModal.classList.remove('hidden');
      updateCalibrationUI();
    });
  }

  if (telemetryCalibrationItem) {
    telemetryCalibrationItem.addEventListener('click', () => {
      calibrationModal.classList.remove('hidden');
      updateCalibrationUI();
    });
  }

  if (btnCloseCalModal) {
    btnCloseCalModal.addEventListener('click', () => {
      calibrationModal.classList.add('hidden');
    });
  }

  if (calibrationModal) {
    calibrationModal.addEventListener('click', (e) => {
      if (e.target === calibrationModal) calibrationModal.classList.add('hidden');
    });
  }

  if (btnOffsetMinus5) btnOffsetMinus5.addEventListener('click', () => adjustCalibrationOffset(-5));
  if (btnOffsetMinus1) btnOffsetMinus1.addEventListener('click', () => adjustCalibrationOffset(-1));
  if (btnOffsetReset) btnOffsetReset.addEventListener('click', () => setCalibrationOffset(0));
  if (btnOffsetPlus1) btnOffsetPlus1.addEventListener('click', () => adjustCalibrationOffset(1));
  if (btnOffsetPlus5) btnOffsetPlus5.addEventListener('click', () => adjustCalibrationOffset(5));

  if (btnZeroToNorth) {
    btnZeroToNorth.addEventListener('click', () => {
      // Calculate offset that aligns current raw heading to 0° North
      const neededOffset = (360 - (rawMagneticHeading % 360)) % 360;
      setCalibrationOffset(neededOffset > 180 ? neededOffset - 360 : neededOffset);
      showToast('Zeroed to Current Heading');
    });
  }

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
      navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
        .then((reg) => {
          console.log('KUBERAN Compass ServiceWorker registered:', reg.scope);
          // Check for immediate update
          reg.update();
        })
        .catch((err) => console.log('ServiceWorker registration error:', err));
    });

    let refreshing = false;
    const hadController = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Only reload if the client was already controlled by an older worker (prevent first-install reload)
      if (!refreshing && hadController) {
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

    // Use live GitHub Pages URL if running locally so phone scans open the live app
    let url = 'https://jee1vk.github.io/compass-app/';
    if (window.location.protocol.startsWith('http') && 
        !window.location.hostname.includes('localhost') && 
        !window.location.hostname.includes('127.0.0.1')) {
      url = window.location.origin + window.location.pathname;
    }

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
    updateCalibrationUI();

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
