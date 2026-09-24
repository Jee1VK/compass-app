const fs = require('fs');

let app = fs.readFileSync('app.js', 'utf8');
const regex = /\/\/ --- Tilt-Compensated Compass Heading \(W3C \/ Rotation Matrix\) ---\s*[\s\S]*?(?=\/\/ --- Desktop \/ Fallback Drag Simulation ---)/m;

const replacement = `// --- Compass Engine Integration ---
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
      compassCard.style.transform = \`rotate(\${-unwrappedHeading}deg)\`;
      
      headingDegrees.textContent = rounded;
      headingCardinal.textContent = getCardinal(finalHeading);
      milsValue.textContent = Math.round((finalHeading / 360) * 6400);
      backAzimuthValue.textContent = \`\${Math.round((finalHeading + 180) % 360)}°\`;
      
      // Target Deviation logic
      if (targetHeading !== null) {
        targetMarkerRing.style.transform = \`rotate(\${targetHeading - finalHeading}deg)\`;
        let diff = (targetHeading - finalHeading + 540) % 360 - 180;
        const absDiff = Math.abs(Math.round(diff));

        if (absDiff <= 2) {
          devArrow.textContent = '🎯';
          devText.textContent = 'ON TARGET';
          targetDeviationBar.style.borderColor = 'var(--accent-level)';
          targetDeviationBar.style.background = 'rgba(34, 197, 94, 0.15)';
        } else if (diff > 0) {
          devArrow.textContent = '▶';
          devText.textContent = \`\${absDiff}° RIGHT\`;
          targetDeviationBar.style.borderColor = 'var(--accent-target)';
          targetDeviationBar.style.background = 'rgba(245, 158, 11, 0.15)';
        } else {
          devArrow.textContent = '◀';
          devText.textContent = \`\${absDiff}° LEFT\`;
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
     compassCard.style.transform = \`rotate(\${-unwrappedHeading}deg)\`;
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

`;

app = app.replace(regex, replacement);
fs.writeFileSync('app.js', app);
