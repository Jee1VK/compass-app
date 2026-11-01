/**
 * KUBERAN Compass App - High Precision Mobile Compass & Inclinometer
 * Built for iOS Safari, Android Chrome, and Desktop Browsers.
 * Version 5.0.0 • Official Kuberan Silks Edition
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
  let sensorAccuracy = null;
  let isAbsoluteOrientation = false;

  // Celestial, Waypoint & Tracking State
  let currentGpsPos = null;
  let selectedWpIcon = '🚗';
  let activeSosController = null;
  let trekTimerInterval = null;

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

  // Audio & Navigation DOM Elements
  const btnAudioToggle = document.getElementById('btnAudioToggle');
  const audioPill = document.getElementById('audioPill');
  const bearingContainer = document.getElementById('bearingContainer');

  // AR Camera DOM Elements
  const btnToggleAr = document.getElementById('btnToggleAr');
  const arCameraContainer = document.getElementById('arCameraContainer');
  const arVideoFeed = document.getElementById('arVideoFeed');
  const btnArSnapshot = document.getElementById('btnArSnapshot');
  const btnCloseAr = document.getElementById('btnCloseAr');
  const arHeadingText = document.getElementById('arHeadingText');
  const arTiltText = document.getElementById('arTiltText');

  // Tactical Night Vision & SOS Morse Elements
  const btnToggleNightVision = document.getElementById('btnToggleNightVision');
  const nightPill = document.getElementById('nightPill');
  const btnToggleSos = document.getElementById('btnToggleSos');
  const sosOverlay = document.getElementById('sosOverlay');
  const btnStopSos = document.getElementById('btnStopSos');

  // EMF Anomaly Elements
  const emfPill = document.getElementById('emfPill');
  const emfValue = document.getElementById('emfValue');
  const emfWarningBanner = document.getElementById('emfWarningBanner');
  const emfBannerTitle = document.getElementById('emfBannerTitle');
  const emfBannerMsg = document.getElementById('emfBannerMsg');
  const btnDismissEmf = document.getElementById('btnDismissEmf');

  // Sundial Virtual Shadow & Star Markers
  const sundialShadow = document.getElementById('sundialShadow');
  const solarTimeVal = document.getElementById('solarTimeVal');
  const eotVal = document.getElementById('eotVal');
  const shadowLengthVal = document.getElementById('shadowLengthVal');
  const sundialStatusBadge = document.getElementById('sundialStatusBadge');
  const polarisMarker = document.getElementById('polarisMarker');
  const cruxMarker = document.getElementById('cruxMarker');

  // Celestial Markers & Readouts
  const sunMarker = document.getElementById('sunMarker');
  const moonMarker = document.getElementById('moonMarker');
  const moonFlag = document.getElementById('moonFlag');
  const sunAzimuthVal = document.getElementById('sunAzimuthVal');
  const sunElevationVal = document.getElementById('sunElevationVal');
  const solarNoonVal = document.getElementById('solarNoonVal');
  const sunriseTimeVal = document.getElementById('sunriseTimeVal');
  const sunsetTimeVal = document.getElementById('sunsetTimeVal');
  const dayLengthVal = document.getElementById('dayLengthVal');
  const goldenHourVal = document.getElementById('goldenHourVal');
  const solarDayState = document.getElementById('solarDayState');
  const lunarPhaseIcon = document.getElementById('lunarPhaseIcon');
  const lunarPhaseTitle = document.getElementById('lunarPhaseTitle');
  const lunarIllumBadge = document.getElementById('lunarIllumBadge');
  const moonAzimuthVal = document.getElementById('moonAzimuthVal');
  const moonElevationVal = document.getElementById('moonElevationVal');
  const moonAgeVal = document.getElementById('moonAgeVal');

  // Waypoint Elements
  const waypointBeaconRing = document.getElementById('waypointBeaconRing');
  const waypointBeaconArrow = document.getElementById('waypointBeaconArrow');
  const waypointHud = document.getElementById('waypointHud');
  const wpActiveIcon = document.getElementById('wpActiveIcon');
  const wpActiveName = document.getElementById('wpActiveName');
  const wpActiveDist = document.getElementById('wpActiveDist');
  const wpActiveTurn = document.getElementById('wpActiveTurn');
  const btnDismissActiveWp = document.getElementById('btnDismissActiveWp');
  const btnMarkSpotAction = document.getElementById('btnMarkSpotAction');
  const btnOpenMarkModal = document.getElementById('btnOpenMarkModal');
  const btnEmptyMark = document.getElementById('btnEmptyMark');
  const waypointModal = document.getElementById('waypointModal');
  const btnCloseWpModal = document.getElementById('btnCloseWpModal');
  const btnCancelWp = document.getElementById('btnCancelWp');
  const btnConfirmSaveWp = document.getElementById('btnConfirmSaveWp');
  const wpNameInput = document.getElementById('wpNameInput');
  const wpModalCoords = document.getElementById('wpModalCoords');
  const activeWpCard = document.getElementById('activeWpCard');
  const activeCardIcon = document.getElementById('activeCardIcon');
  const activeCardName = document.getElementById('activeCardName');
  const activeCardDist = document.getElementById('activeCardDist');
  const activeCardBearing = document.getElementById('activeCardBearing');
  const btnActiveStopNav = document.getElementById('btnActiveStopNav');
  const waypointsList = document.getElementById('waypointsList');
  const wpEmptyState = document.getElementById('wpEmptyState');

  // 4-Tab Bottom Navigation Dock
  const tabBtnCompass = document.getElementById('tabBtnCompass');
  const tabBtnCelestial = document.getElementById('tabBtnCelestial');
  const tabBtnWaypoints = document.getElementById('tabBtnWaypoints');
  const tabBtnTracker = document.getElementById('tabBtnTracker');
  const tabPanelCompass = document.getElementById('tabPanelCompass');
  const tabPanelCelestial = document.getElementById('tabPanelCelestial');
  const tabPanelWaypoints = document.getElementById('tabPanelWaypoints');
  const tabPanelTracker = document.getElementById('tabPanelTracker');

  // GPS Trekking & GPX Controls
  const btnToggleTrek = document.getElementById('btnToggleTrek');
  const btnBacktrack = document.getElementById('btnBacktrack');
  const btnExportGpx = document.getElementById('btnExportGpx');
  const gpxFileInput = document.getElementById('gpxFileInput');
  const trkRecBadge = document.getElementById('trkRecBadge');
  const trkRecText = document.getElementById('trkRecText');
  const trkPointCount = document.getElementById('trkPointCount');
  const trkDistanceVal = document.getElementById('trkDistanceVal');
  const trkDurationVal = document.getElementById('trkDurationVal');
  const trkPaceVal = document.getElementById('trkPaceVal');
  const trkElevVal = document.getElementById('trkElevVal');


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
      isAbsoluteOrientation = (info.source === 'absolute' || info.source === 'ios');
      
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

      // Update AR HUD if active
      if (arHeadingText) {
        arHeadingText.textContent = `${String(rounded).padStart(3, '0')}° ${getCardinal(finalHeading)}`;
      }

      // EMF Magnetic Flux processing
      if (typeof EmfEngine !== 'undefined') {
        const emf = EmfEngine.processReading(
          (info.gamma || 0) * 0.8,
          (info.beta || 0) * 0.8,
          45 + (sensorAccuracy || 0)
        );
        if (emfValue) emfValue.textContent = `${emf.magnitudeUT} µT`;
        if (emfPill) {
          if (emf.status === 'WARNING') {
            emfPill.style.color = '#ef4444';
            if (emfWarningBanner) emfWarningBanner.classList.remove('hidden');
            if (emfBannerMsg) emfBannerMsg.textContent = emf.message;
          } else if (emf.status === 'CAUTION') {
            emfPill.style.color = '#f59e0b';
          } else {
            emfPill.style.color = 'var(--text-main)';
          }
        }
      }
      
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

      // Waypoint Beacon Rotation & HUD Update
      if (typeof WaypointEngine !== 'undefined') {
        const activeWp = WaypointEngine.getActiveWaypoint();
        if (activeWp && currentGpsPos) {
          const brg = WaypointEngine.calculateBearing(currentGpsPos.lat, currentGpsPos.lng, activeWp.lat, activeWp.lng);
          const dist = WaypointEngine.calculateDistance(currentGpsPos.lat, currentGpsPos.lng, activeWp.lat, activeWp.lng);
          const rel = WaypointEngine.calculateRelativeAngle(finalHeading, brg);

          if (waypointBeaconRing) {
            waypointBeaconRing.style.display = 'block';
            waypointBeaconRing.style.transform = `rotate(${brg - finalHeading}deg)`;
          }
          if (waypointHud) {
            waypointHud.classList.remove('hidden');
            if (wpActiveIcon) wpActiveIcon.textContent = activeWp.icon || '📍';
            if (wpActiveName) wpActiveName.textContent = activeWp.name;
            if (wpActiveDist) wpActiveDist.textContent = WaypointEngine.formatDistance(dist);
            if (wpActiveTurn) {
              const absRel = Math.abs(Math.round(rel));
              wpActiveTurn.textContent = (absRel <= 2) ? '🎯 ON TRACK' : (rel > 0 ? `▶ ${absRel}°` : `◀ ${absRel}°`);
            }
          }
        } else {
          if (waypointBeaconRing) waypointBeaconRing.style.display = 'none';
          if (waypointHud) waypointHud.classList.add('hidden');
        }
      }

      // Synthetic Web Audio Pulse Alignment
      if (typeof AudioEngine !== 'undefined' && !AudioEngine.isMuted()) {
        if (targetHeading !== null) {
          const diff = (targetHeading - finalHeading + 540) % 360 - 180;
          AudioEngine.playBearingPulse(Math.abs(diff));
        } else if (typeof WaypointEngine !== 'undefined' && WaypointEngine.getActiveWaypoint() && currentGpsPos) {
          const activeWp = WaypointEngine.getActiveWaypoint();
          const brg = WaypointEngine.calculateBearing(currentGpsPos.lat, currentGpsPos.lng, activeWp.lat, activeWp.lng);
          const rel = WaypointEngine.calculateRelativeAngle(finalHeading, brg);
          AudioEngine.playBearingPulse(Math.abs(rel));
        } else {
          // Subtle chime when crossing True/Magnetic North
          const northDiff = Math.abs(((finalHeading + 180) % 360) - 180);
          if (northDiff <= 8) {
            AudioEngine.playBearingPulse(northDiff);
          }
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

  // --- Dual-Axis Inclinometer / Bubble Level ---
  function updateOrientation(p, r) {
    pitch = p;
    roll = r;

    const pitchDeg = Math.round(p);
    const rollDeg = Math.round(r);

    if (pitchValue) pitchValue.textContent = `${pitchDeg}°`;
    if (rollValue) rollValue.textContent = `${rollDeg}°`;

    if (arTiltText) {
      const pStr = (pitchDeg >= 0 ? '+' : '') + pitchDeg;
      const rStr = (rollDeg >= 0 ? '+' : '') + rollDeg;
      arTiltText.textContent = `P: ${pStr}° R: ${rStr}°`;
    }

    // Bar gauges (normalized from -45° to +45°)
    const pitchNorm = Math.min(Math.max((p + 45) / 90 * 100, 0), 100);
    const rollNorm = Math.min(Math.max((r + 45) / 90 * 100, 0), 100);
    if (pitchGauge) pitchGauge.style.width = `${pitchNorm}%`;
    if (rollGauge) rollGauge.style.width = `${rollNorm}%`;

    // Center Level Bubble physics
    const maxOffset = 38;
    const sensFactor = 2.4;
    const offsetX = Math.min(Math.max(r * sensFactor, -maxOffset), maxOffset);
    const offsetY = Math.min(Math.max(p * sensFactor, -maxOffset), maxOffset);

    if (levelBubble) {
      levelBubble.style.transform = `translate(${offsetX.toFixed(1)}px, ${offsetY.toFixed(1)}px)`;
    }

    const totalTilt = Math.sqrt(p * p + r * r);
    if (totalTilt <= 1.5) {
      if (levelHousing) levelHousing.classList.add('is-level');
      if (levelStatusCard) levelStatusCard.classList.add('level-locked');
      if (levelStatusText) levelStatusText.textContent = 'PERFECTLY LEVEL';

      if (hapticsEnabled && 'vibrate' in navigator && (Date.now() - lastVibrateTime > 1000)) {
        navigator.vibrate(25);
        lastVibrateTime = Date.now();
      }
    } else {
      if (levelHousing) levelHousing.classList.remove('is-level');
      if (levelStatusCard) levelStatusCard.classList.remove('level-locked');
      if (levelStatusText) {
        levelStatusText.textContent = totalTilt <= 5 ? 'NEARLY LEVEL' : 'TILTED';
      }
    }
  }

  function updateHeading(newHeading) {
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
     if (milsValue) milsValue.textContent = Math.round((finalHeading / 360) * 6400);
     if (backAzimuthValue) backAzimuthValue.textContent = `${Math.round((finalHeading + 180) % 360)}°`;

     if (targetHeading !== null && targetMarkerRing && targetDeviationBar) {
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
  }

  function initSensors() {
    let previouslyGranted = false;
    try { previouslyGranted = localStorage.getItem('kuberan-sensors-enabled') === 'true'; } catch(e) {}
    
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
      if (!isDragging || hasSensorData) return;
      const currentAngle = getAngle(e);
      const delta = currentAngle - startAngle;
      let newHeading = (startHeading - delta) % 360;
      if (newHeading < 0) newHeading += 360;
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
    window.addEventListener('touchend', onEnd);
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

    // Approximate Magnetic Declination
    calculateDeclination(lat, lng);

    currentGpsPos = { lat: lat, lng: lng, alt: alt };

    // Record breadcrumb if active trek is recording
    if (typeof TrackingEngine !== 'undefined' && TrackingEngine.isRecording()) {
      TrackingEngine.addBreadcrumb(lat, lng, alt, Date.now(), coords.speed);
      updateTrekUI();
    }

    updateCelestialView();
    updateWaypointHud();
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

  function calculateDeclination(lat, lng) {
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

  // --- Theme Switcher ---
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
    buildDialSvg();
    showToast(`Theme: ${newTheme.replace('theme-', '').toUpperCase()}`);
  });

  // Tactical Night Vision button shortcut
  if (btnToggleNightVision) {
    btnToggleNightVision.addEventListener('click', () => {
      const isNight = document.body.classList.contains('theme-night');
      THEMES.forEach(t => document.body.classList.remove(t));
      if (!isNight) {
        document.body.classList.add('theme-night');
        currentThemeIndex = THEMES.indexOf('theme-night');
        applyThemeMetaColor('theme-night');
        if (nightPill) nightPill.style.background = 'rgba(239, 68, 68, 0.4)';
        showToast('Tactical Night Vision Activated');
      } else {
        document.body.classList.add('theme-marine');
        currentThemeIndex = THEMES.indexOf('theme-marine');
        applyThemeMetaColor('theme-marine');
        if (nightPill) nightPill.style.background = '';
        showToast('Marine Mode Restored');
      }
      buildDialSvg();
    });
  }

  // Restore Theme
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

    if (calAccuracyText) calAccuracyText.textContent = accLabel;
    if (calSensorBadge) {
      calSensorBadge.textContent = (isAbsoluteOrientation || (sensorAccuracy !== null && sensorAccuracy >= 0))
        ? 'Magnetometer Active'
        : 'Sensors Active';
      calSensorBadge.className = `cal-badge ${badgeClass}`;
    }
    if (sensorAccuracyBadge) sensorAccuracyBadge.textContent = accLabel;
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

  if (btnCalibrate) btnCalibrate.addEventListener('click', () => { calibrationModal.classList.remove('hidden'); updateCalibrationUI(); });
  if (telemetryCalibrationItem) telemetryCalibrationItem.addEventListener('click', () => { calibrationModal.classList.remove('hidden'); updateCalibrationUI(); });
  if (btnCloseCalModal) btnCloseCalModal.addEventListener('click', () => calibrationModal.classList.add('hidden'));
  if (calibrationModal) calibrationModal.addEventListener('click', (e) => { if (e.target === calibrationModal) calibrationModal.classList.add('hidden'); });

  if (btnOffsetMinus5) btnOffsetMinus5.addEventListener('click', () => adjustCalibrationOffset(-5));
  if (btnOffsetMinus1) btnOffsetMinus1.addEventListener('click', () => adjustCalibrationOffset(-1));
  if (btnOffsetReset) btnOffsetReset.addEventListener('click', () => setCalibrationOffset(0));
  if (btnOffsetPlus1) btnOffsetPlus1.addEventListener('click', () => adjustCalibrationOffset(1));
  if (btnOffsetPlus5) btnOffsetPlus5.addEventListener('click', () => adjustCalibrationOffset(5));

  if (btnZeroToNorth) {
    btnZeroToNorth.addEventListener('click', () => {
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
          reg.update();
        })
        .catch((err) => console.log('ServiceWorker registration error:', err));
    });

    let refreshing = false;
    const hadController = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener('controllerchange', () => {
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
        qrcodeBox.innerHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
      }
    } else {
      qrcodeBox.innerHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    }
  }

  // --- Celestial Astronomy, Sundial & Stargazer Wiring ---
  function updateCelestialView() {
    if (typeof CelestialEngine === 'undefined') return;
    const now = new Date();
    const lat = currentGpsPos ? currentGpsPos.lat : 12.9716;
    const lng = currentGpsPos ? currentGpsPos.lng : 77.5946;

    // 1. Solar Position & Dial Marker
    const solarPos = CelestialEngine.getSolarPosition(lat, lng, now);
    if (sunMarker) {
      sunMarker.style.transform = `rotate(${solarPos.azimuth}deg)`;
    }
    if (sunAzimuthVal) sunAzimuthVal.textContent = `${solarPos.azimuth.toFixed(1)}°`;
    if (sunElevationVal) sunElevationVal.textContent = `${solarPos.elevation >= 0 ? '+' : ''}${solarPos.elevation.toFixed(1)}°`;
    if (solarDayState) {
      if (solarPos.isGoldenHour) {
        solarDayState.textContent = 'Golden Hour';
        solarDayState.style.borderColor = 'var(--accent-target)';
        solarDayState.style.color = 'var(--accent-target)';
      } else if (solarPos.isDaylight) {
        solarDayState.textContent = 'Daylight';
        solarDayState.style.borderColor = 'var(--accent-level)';
        solarDayState.style.color = 'var(--accent-level)';
      } else {
        solarDayState.textContent = 'Night';
        solarDayState.style.borderColor = 'var(--border-color)';
        solarDayState.style.color = 'var(--text-muted)';
      }
    }

    // 2. Sundial & Apparent Solar Time
    if (typeof SundialEngine !== 'undefined') {
      const solarTime = SundialEngine.calculateLocalApparentTime(now, lng);
      if (solarTimeVal) solarTimeVal.textContent = solarTime.formatted;
      if (eotVal) eotVal.textContent = `${solarTime.eotMinutes >= 0 ? '+' : ''}${solarTime.eotMinutes.toFixed(1)} m`;

      // Virtual Gnomon Shadow Vector on Dial
      const shadow = SundialEngine.calculateShadowVector(solarPos.elevation, solarPos.azimuth, currentHeading, 130);
      if (sundialShadow) {
        if (shadow.visible) {
          sundialShadow.style.display = 'block';
          sundialShadow.style.height = `${shadow.lengthPx}px`;
          sundialShadow.style.transform = `translate(-50%, -100%) rotate(${shadow.dialAngleDeg}deg)`;
          if (shadowLengthVal) shadowLengthVal.textContent = `${Math.round(shadow.lengthPx)} px`;
          if (sundialStatusBadge) sundialStatusBadge.textContent = 'Active Shadow';
        } else {
          sundialShadow.style.display = 'none';
          if (shadowLengthVal) shadowLengthVal.textContent = 'Night';
          if (sundialStatusBadge) sundialStatusBadge.textContent = 'Night / Horizon';
        }
      }
    }

    // 3. Stargazer Celestial Guides (Polaris & Southern Cross)
    if (typeof NightVisionEngine !== 'undefined') {
      const polaris = NightVisionEngine.calculatePolarisPosition(lat, lng, now);
      if (polarisMarker) {
        if (polaris.visible) {
          polarisMarker.style.display = 'block';
          polarisMarker.style.transform = `rotate(${polaris.azimuth}deg) translateY(-185px) rotate(${-polaris.azimuth}deg)`;
        } else {
          polarisMarker.style.display = 'none';
        }
      }

      const crux = NightVisionEngine.calculateSouthernCrossPosition(lat, lng, now);
      if (cruxMarker) {
        if (crux.visible) {
          cruxMarker.style.display = 'block';
          cruxMarker.style.transform = `rotate(${crux.azimuth}deg) translateY(-185px) rotate(${-crux.azimuth}deg)`;
        } else {
          cruxMarker.style.display = 'none';
        }
      }
    }

    // 4. Solar Times (Sunrise, Noon, Sunset, Golden Hour)
    const solarTimes = CelestialEngine.getSolarTimes(lat, lng, now);
    function formatTime(d) {
      if (!d) return '--:--';
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (solarNoonVal) solarNoonVal.textContent = formatTime(solarTimes.solarNoon);
    if (sunriseTimeVal) sunriseTimeVal.textContent = formatTime(solarTimes.sunrise);
    if (sunsetTimeVal) sunsetTimeVal.textContent = formatTime(solarTimes.sunset);
    if (dayLengthVal) {
      const h = Math.floor(solarTimes.dayLengthMinutes / 60);
      const m = solarTimes.dayLengthMinutes % 60;
      dayLengthVal.textContent = `${h}h ${m}m`;
    }
    if (goldenHourVal && solarTimes.goldenHourEvening) {
      goldenHourVal.textContent = formatTime(solarTimes.goldenHourEvening.start);
    }

    // 5. Lunar Position & Dial Marker
    const lunarPos = CelestialEngine.getLunarPosition(lat, lng, now);
    if (moonMarker) moonMarker.style.transform = `rotate(${lunarPos.azimuth}deg)`;
    if (moonFlag) moonFlag.textContent = lunarPos.phaseIcon;
    if (lunarPhaseIcon) lunarPhaseIcon.textContent = lunarPos.phaseIcon;
    if (lunarPhaseTitle) lunarPhaseTitle.textContent = lunarPos.phaseName;
    if (lunarIllumBadge) lunarIllumBadge.textContent = `${lunarPos.illuminationPercent}% Illum`;
    if (moonAzimuthVal) moonAzimuthVal.textContent = `${lunarPos.azimuth.toFixed(1)}°`;
    if (moonElevationVal) moonElevationVal.textContent = `${lunarPos.elevation >= 0 ? '+' : ''}${lunarPos.elevation.toFixed(1)}°`;
    if (moonAgeVal) moonAgeVal.textContent = `${lunarPos.ageDays} d`;
  }

  setInterval(updateCelestialView, 3000);

  // --- Offline Waypoint Manager Wiring ---
  function updateWaypointHud() {
    if (typeof WaypointEngine === 'undefined') return;
    const activeWp = WaypointEngine.getActiveWaypoint();
    if (!activeWp || !currentGpsPos) {
      if (waypointHud) waypointHud.classList.add('hidden');
      if (waypointBeaconRing) waypointBeaconRing.style.display = 'none';
      if (activeWpCard) activeWpCard.classList.add('hidden');
      return;
    }

    const dist = WaypointEngine.calculateDistance(currentGpsPos.lat, currentGpsPos.lng, activeWp.lat, activeWp.lng);
    const brg = WaypointEngine.calculateBearing(currentGpsPos.lat, currentGpsPos.lng, activeWp.lat, activeWp.lng);

    if (activeWpCard) {
      activeWpCard.classList.remove('hidden');
      if (activeCardIcon) activeCardIcon.textContent = activeWp.icon || '📍';
      if (activeCardName) activeCardName.textContent = activeWp.name;
      if (activeCardDist) activeCardDist.textContent = `${WaypointEngine.formatDistance(dist)} away`;
      if (activeCardBearing) activeCardBearing.textContent = `Bearing: ${Math.round(brg)}°`;
    }
  }

  function renderWaypointsList() {
    if (typeof WaypointEngine === 'undefined' || !waypointsList) return;
    const list = WaypointEngine.getWaypoints();
    const activeId = WaypointEngine.getActiveWaypointId();

    updateWaypointHud();

    if (list.length === 0) {
      waypointsList.innerHTML = '';
      if (wpEmptyState) wpEmptyState.classList.remove('hidden');
      return;
    }

    if (wpEmptyState) wpEmptyState.classList.add('hidden');
    let html = '';
    list.forEach(w => {
      const isActive = w.id === activeId;
      let distText = '';
      if (currentGpsPos) {
        const d = WaypointEngine.calculateDistance(currentGpsPos.lat, currentGpsPos.lng, w.lat, w.lng);
        distText = ` • ${WaypointEngine.formatDistance(d)}`;
      }
      html += `
        <div class="wp-list-item">
          <div class="wp-item-left">
            <span class="wp-item-icon">${w.icon || '📍'}</span>
            <div class="wp-item-info">
              <span class="wp-item-name">${w.name}</span>
              <span class="wp-item-meta">${new Date(w.timestamp).toLocaleDateString()}${distText}</span>
            </div>
          </div>
          <div class="wp-item-actions">
            <button class="btn-wp-nav" data-id="${w.id}">${isActive ? 'Active' : 'Navigate'}</button>
            <button class="btn-wp-del" data-id="${w.id}" title="Delete Waypoint">✕</button>
          </div>
        </div>
      `;
    });
    waypointsList.innerHTML = html;

    waypointsList.querySelectorAll('.btn-wp-nav').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        WaypointEngine.setActiveWaypoint(id);
        renderWaypointsList();
        showToast('Navigating to Waypoint');
      });
    });

    waypointsList.querySelectorAll('.btn-wp-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        WaypointEngine.deleteWaypoint(id);
        renderWaypointsList();
        showToast('Waypoint Deleted');
      });
    });
  }

  function openMarkModal() {
    if (!currentGpsPos) {
      showToast('Acquiring GPS coordinates...');
      return;
    }
    if (wpModalCoords) {
      wpModalCoords.textContent = `${currentGpsPos.lat.toFixed(5)}°, ${currentGpsPos.lng.toFixed(5)}° (${gpsAlt.textContent})`;
    }
    if (wpNameInput) {
      wpNameInput.value = '';
      wpNameInput.placeholder = 'e.g. Parked Car, Campsite';
    }
    if (waypointModal) {
      waypointModal.classList.remove('hidden');
    }
  }

  // --- GPS Breadcrumb Trekking & GPX Engine Wiring ---
  function updateTrekUI() {
    if (typeof TrackingEngine === 'undefined') return;
    const isRec = TrackingEngine.isRecording();
    const points = TrackingEngine.getTrackPoints();
    const distMeters = TrackingEngine.getTotalDistanceMeters();

    if (trkRecBadge) {
      trkRecBadge.className = isRec ? 'trk-rec-badge recording' : 'trk-rec-badge';
    }
    if (trkRecText) {
      trkRecText.textContent = isRec ? 'RECORDING' : 'IDLE';
    }
    if (btnToggleTrek) {
      btnToggleTrek.className = isRec ? 'btn-trek-primary btn-recording' : 'btn-trek-primary';
      btnToggleTrek.textContent = isRec ? '⏹ Stop Recording Trek' : '▶ Start Recording Trek';
    }
    if (trkPointCount) {
      trkPointCount.textContent = `${points.length} breadcrumb${points.length === 1 ? '' : 's'}`;
    }
    if (trkDistanceVal) {
      trkDistanceVal.textContent = distMeters >= 1000 ? `${(distMeters / 1000).toFixed(2)} km` : `${Math.round(distMeters)} m`;
    }
    if (trkElevVal && currentGpsPos) {
      trkElevVal.textContent = `${Math.round(currentGpsPos.alt || 0)} m`;
    }

    if (btnBacktrack) {
      btnBacktrack.disabled = points.length === 0 || !currentGpsPos;
    }
    if (btnExportGpx) {
      btnExportGpx.disabled = points.length === 0;
    }
  }

  function startTrekTimer() {
    if (trekTimerInterval) clearInterval(trekTimerInterval);
    const start = Date.now();
    trekTimerInterval = setInterval(() => {
      if (typeof TrackingEngine === 'undefined' || !TrackingEngine.isRecording()) {
        clearInterval(trekTimerInterval);
        return;
      }
      const elapsedSec = Math.floor((Date.now() - start) / 1000);
      const h = String(Math.floor(elapsedSec / 3600)).padStart(2, '0');
      const m = String(Math.floor((elapsedSec % 3600) / 60)).padStart(2, '0');
      const s = String(elapsedSec % 60).padStart(2, '0');
      if (trkDurationVal) trkDurationVal.textContent = `${h}:${m}:${s}`;

      const distKm = TrackingEngine.getTotalDistanceMeters() / 1000;
      const hours = elapsedSec / 3600;
      const speed = hours > 0 ? (distKm / hours).toFixed(1) : '0.0';
      if (trkPaceVal) trkPaceVal.textContent = `${speed} km/h`;
    }, 1000);
  }

  function setupTrackingHandlers() {
    if (btnToggleTrek) {
      btnToggleTrek.addEventListener('click', () => {
        if (typeof TrackingEngine === 'undefined') return;
        if (!TrackingEngine.isRecording()) {
          TrackingEngine.startRecording();
          startTrekTimer();
          updateTrekUI();
          showToast('Trek recording started!');
        } else {
          const summary = TrackingEngine.stopRecording();
          if (trekTimerInterval) clearInterval(trekTimerInterval);
          updateTrekUI();
          showToast(`Trek saved: ${(summary.totalDistanceMeters / 1000).toFixed(2)} km`);
        }
      });
    }

    // Backtrack Navigation
    if (btnBacktrack) {
      btnBacktrack.addEventListener('click', () => {
        if (typeof TrackingEngine === 'undefined' || !currentGpsPos) return;
        const backtrack = TrackingEngine.computeBacktrack(currentGpsPos.lat, currentGpsPos.lng);
        if (backtrack) {
          targetHeading = Math.round(backtrack.bearing);
          targetValue.textContent = `${targetHeading}°`;
          targetMarkerRing.style.display = 'block';
          targetDeviationBar.classList.remove('hidden');
          showToast(`↩ Backtracking to Start (${Math.round(backtrack.distance)}m)`);
        }
      });
    }

    // Export GPX File
    if (btnExportGpx) {
      btnExportGpx.addEventListener('click', () => {
        if (typeof TrackingEngine === 'undefined') return;
        const waypoints = (typeof WaypointEngine !== 'undefined') ? WaypointEngine.getWaypoints() : [];
        const gpxXml = TrackingEngine.exportGPX('Compass Trek', waypoints);
        const blob = new Blob([gpxXml], { type: 'application/gpx+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kuberan-trek-${Date.now()}.gpx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('GPX file downloaded!');
      });
    }

    // Import GPX File
    if (gpxFileInput) {
      gpxFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const parsed = TrackingEngine.parseGPX(evt.target.result);
            if (typeof WaypointEngine !== 'undefined' && parsed.waypoints.length > 0) {
              parsed.waypoints.forEach(wpt => {
                WaypointEngine.addWaypoint(wpt.name, wpt.lat, wpt.lon, wpt.ele, wpt.icon || '📍');
              });
              renderWaypointsList();
              showToast(`Imported ${parsed.waypoints.length} waypoints from GPX!`);
            } else {
              showToast('GPX parsed, but no waypoints found');
            }
          } catch (err) {
            console.error('GPX parse error:', err);
            showToast('Invalid GPX file format');
          }
        };
        reader.readAsText(file);
      });
    }
  }

  // --- AR Camera Sighting HUD Handlers ---
  function setupArCamera() {
    if (btnToggleAr && arCameraContainer) {
      btnToggleAr.addEventListener('click', async () => {
        if (typeof CameraHudEngine === 'undefined') return;
        showToast('Initializing camera feed...');
        const res = await CameraHudEngine.startCamera(arVideoFeed);
        if (res.success) {
          arCameraContainer.classList.remove('hidden');
          showToast('AR Camera Sighting Active');
        } else {
          showToast(res.error || 'Camera unavailable');
        }
      });
    }

    if (btnCloseAr && arCameraContainer) {
      btnCloseAr.addEventListener('click', () => {
        if (typeof CameraHudEngine !== 'undefined') {
          CameraHudEngine.stopCamera(arVideoFeed);
        }
        arCameraContainer.classList.add('hidden');
      });
    }

    if (btnArSnapshot && arVideoFeed) {
      btnArSnapshot.addEventListener('click', () => {
        if (typeof CameraHudEngine === 'undefined') return;
        const dataUrl = CameraHudEngine.captureSnapshot(
          arVideoFeed,
          currentHeading,
          getCardinal(currentHeading),
          pitch,
          roll,
          currentGpsPos
        );
        if (dataUrl) {
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `kuberan-sighting-${Date.now()}.jpg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          showToast('Sighting photo saved!');
        } else {
          showToast('Could not capture frame');
        }
      });
    }
  }

  // --- Emergency SOS Morse Strobe Handlers ---
  function setupSosStrobe() {
    if (btnToggleSos && sosOverlay) {
      btnToggleSos.addEventListener('click', () => {
        if (typeof NightVisionEngine === 'undefined') return;
        const videoTrack = (typeof CameraHudEngine !== 'undefined') ? CameraHudEngine.getActiveTrack() : null;
        sosOverlay.classList.remove('hidden');
        activeSosController = NightVisionEngine.startMorseStrobe(videoTrack, (isOn) => {
          sosOverlay.classList.toggle('flash-on', isOn);
        });
      });
    }

    if (btnStopSos && sosOverlay) {
      btnStopSos.addEventListener('click', () => {
        if (activeSosController) {
          activeSosController.stop();
          activeSosController = null;
        }
        sosOverlay.classList.add('hidden');
        sosOverlay.classList.remove('flash-on');
      });
    }

    if (btnDismissEmf && emfWarningBanner) {
      btnDismissEmf.addEventListener('click', () => {
        emfWarningBanner.classList.add('hidden');
      });
    }
  }

  // --- 4-Tab Bottom Navigation Dock Wiring ---
  function setupTabs() {
    const tabs = [
      { btn: tabBtnCompass, panel: tabPanelCompass },
      { btn: tabBtnCelestial, panel: tabPanelCelestial },
      { btn: tabBtnWaypoints, panel: tabPanelWaypoints },
      { btn: tabBtnTracker, panel: tabPanelTracker }
    ];

    tabs.forEach(t => {
      if (!t.btn || !t.panel) return;
      t.btn.addEventListener('click', () => {
        tabs.forEach(other => {
          if (other.btn) {
            other.btn.classList.remove('active');
            other.btn.setAttribute('aria-selected', 'false');
          }
          if (other.panel) {
            other.panel.classList.remove('active');
            other.panel.setAttribute('hidden', 'true');
          }
        });

        t.btn.classList.add('active');
        t.btn.setAttribute('aria-selected', 'true');
        t.panel.classList.add('active');
        t.panel.removeAttribute('hidden');

        if (t.panel === tabPanelCelestial) {
          updateCelestialView();
        } else if (t.panel === tabPanelWaypoints) {
          renderWaypointsList();
        } else if (t.panel === tabPanelTracker) {
          updateTrekUI();
        }
      });
    });
  }

  // --- Audio & Waypoint Modal Event Handlers ---
  function setupAudioAndWaypoints() {
    if (btnAudioToggle) {
      btnAudioToggle.addEventListener('click', () => {
        if (typeof AudioEngine !== 'undefined') {
          const muted = AudioEngine.toggleMute();
          if (audioPill) {
            audioPill.textContent = muted ? '🔇' : '🔊';
            audioPill.className = muted ? 'mode-pill mode-muted' : 'mode-pill mode-active';
          }
          showToast(muted ? 'Audio Chimes Muted' : 'Audio Chimes Activated');
        }
      });

      if (typeof AudioEngine !== 'undefined' && audioPill) {
        const muted = AudioEngine.isMuted();
        audioPill.textContent = muted ? '🔇' : '🔊';
        audioPill.className = muted ? 'mode-pill mode-muted' : 'mode-pill mode-active';
      }
    }

    if (bearingContainer) {
      bearingContainer.addEventListener('click', () => {
        if (typeof AudioEngine !== 'undefined') {
          AudioEngine.speakHeading(currentHeading, headingCardinal.textContent);
        }
      });
    }

    if (btnMarkSpotAction) btnMarkSpotAction.addEventListener('click', openMarkModal);
    if (btnOpenMarkModal) btnOpenMarkModal.addEventListener('click', openMarkModal);
    if (btnEmptyMark) btnEmptyMark.addEventListener('click', openMarkModal);

    if (btnCloseWpModal) btnCloseWpModal.addEventListener('click', () => waypointModal.classList.add('hidden'));
    if (btnCancelWp) btnCancelWp.addEventListener('click', () => waypointModal.classList.add('hidden'));

    document.querySelectorAll('.wp-icon-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.wp-icon-choice').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedWpIcon = btn.getAttribute('data-icon') || '📍';
      });
    });

    if (btnConfirmSaveWp) {
      btnConfirmSaveWp.addEventListener('click', () => {
        if (!currentGpsPos) {
          showToast('Cannot save without GPS coordinates');
          return;
        }
        const name = (wpNameInput && wpNameInput.value.trim()) || 'Marked Location';
        WaypointEngine.addWaypoint(name, currentGpsPos.lat, currentGpsPos.lng, currentGpsPos.alt, selectedWpIcon);
        waypointModal.classList.add('hidden');
        renderWaypointsList();
        showToast(`Saved "${name}"`);
      });
    }

    if (btnDismissActiveWp) {
      btnDismissActiveWp.addEventListener('click', () => {
        WaypointEngine.clearActiveWaypoint();
        renderWaypointsList();
        showToast('Stopped Navigation');
      });
    }

    if (btnActiveStopNav) {
      btnActiveStopNav.addEventListener('click', () => {
        WaypointEngine.clearActiveWaypoint();
        renderWaypointsList();
        showToast('Stopped Navigation');
      });
    }
  }

  // --- Initialize App ---
  function init() {
    buildDialSvg();
    initSensors();
    initGPS();
    updateCalibrationUI();
    setupTabs();
    setupAudioAndWaypoints();
    setupTrackingHandlers();
    setupArCamera();
    setupSosStrobe();
    updateCelestialView();
    renderWaypointsList();
    updateTrekUI();

    updateHeading(0);
    updateOrientation(0, 0);

    if (window.location.hostname.includes('github.io')) {
      const parts = window.location.pathname.split('/').filter(Boolean);
      const repoName = parts[0] || 'compass-app';
      const user = window.location.hostname.split('.')[0];
      githubRepoLink.href = `https://github.com/${user}/${repoName}`;
    }
  }

  init();
})();
