// camera-hud-engine.js
// AR Camera Sighting Feed, Precision Reticle Overlay & Field Snapshot Engine
// Part of Kuberan Compass App v5.0.0

(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CameraHudEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  let activeStream = null;
  let activeTrack = null;

  /**
   * Starts the rear environment camera stream into the provided video element.
   * @param {HTMLVideoElement} videoElement
   * @returns {Promise<Object>} { success, track, hasTorch, error }
   */
  async function startCamera(videoElement) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { success: false, error: 'Camera API not supported in this browser' };
    }

    try {
      stopCamera(videoElement);

      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      activeStream = await navigator.mediaDevices.getUserMedia(constraints);
      const videoTracks = activeStream.getVideoTracks();
      activeTrack = videoTracks.length > 0 ? videoTracks[0] : null;

      let hasTorch = false;
      if (activeTrack && typeof activeTrack.getCapabilities === 'function') {
        const caps = activeTrack.getCapabilities();
        hasTorch = !!caps.torch;
      }

      if (videoElement) {
        videoElement.srcObject = activeStream;
        videoElement.setAttribute('playsinline', 'true');
        videoElement.muted = true;
        try {
          await videoElement.play();
        } catch (playErr) {
          console.warn('Video play deferred or blocked:', playErr);
        }
      }

      return {
        success: true,
        stream: activeStream,
        track: activeTrack,
        hasTorch
      };
    } catch (err) {
      console.error('Camera access error:', err);
      return {
        success: false,
        error: err.name === 'NotAllowedError' ? 'Camera permission was denied' : err.message
      };
    }
  }

  /**
   * Stops active camera stream and releases hardware.
   * @param {HTMLVideoElement} videoElement
   */
  function stopCamera(videoElement) {
    if (activeStream) {
      try {
        activeStream.getTracks().forEach(track => track.stop());
      } catch (e) {}
      activeStream = null;
      activeTrack = null;
    }
    if (videoElement) {
      videoElement.srcObject = null;
    }
  }

  function getActiveTrack() {
    return activeTrack;
  }

  function isCameraActive() {
    return !!activeStream && activeStream.active;
  }

  /**
   * Captures a high-resolution sighting snapshot with burned-in HUD telemetry.
   * @param {HTMLVideoElement} videoElement
   * @param {number} headingDeg
   * @param {string} cardinal
   * @param {number} pitchDeg
   * @param {number} rollDeg
   * @param {Object} coords - { lat, lon, ele }
   * @returns {string|null} Data URL of the snapshot (JPEG)
   */
  function captureSnapshot(videoElement, headingDeg = 0, cardinal = 'N', pitchDeg = 0, rollDeg = 0, coords = null) {
    if (!videoElement || !videoElement.videoWidth) {
      return null;
    }

    const w = videoElement.videoWidth;
    const h = videoElement.videoHeight;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    // 1. Draw raw camera frame
    ctx.drawImage(videoElement, 0, 0, w, h);

    // 2. Draw tactical reticle crosshair in center
    const cx = w / 2;
    const cy = h / 2;
    const reticleRadius = Math.min(w, h) * 0.18;

    ctx.save();
    ctx.strokeStyle = 'rgba(229, 184, 66, 0.85)'; // Kuberan Gold
    ctx.lineWidth = Math.max(2, Math.round(w / 640));

    // Outer reticle circle
    ctx.beginPath();
    ctx.arc(cx, cy, reticleRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // Inner crosshairs with center gap
    const gap = reticleRadius * 0.25;
    const arm = reticleRadius * 1.35;

    // Left arm
    ctx.beginPath();
    ctx.moveTo(cx - arm, cy);
    ctx.lineTo(cx - gap, cy);
    // Right arm
    ctx.moveTo(cx + gap, cy);
    ctx.lineTo(cx + arm, cy);
    // Top arm
    ctx.moveTo(cx, cy - arm);
    ctx.lineTo(cx, cy - gap);
    // Bottom arm
    ctx.moveTo(cx, cy + gap);
    ctx.lineTo(cx, cy + arm);
    ctx.stroke();

    // Mil-ticks
    for (let d = -2; d <= 2; d++) {
      if (d === 0) continue;
      const tickSpacing = reticleRadius * 0.35;
      // horizontal tick
      ctx.beginPath();
      ctx.moveTo(cx + d * tickSpacing, cy - 6);
      ctx.lineTo(cx + d * tickSpacing, cy + 6);
      ctx.stroke();
      // vertical tick
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy + d * tickSpacing);
      ctx.lineTo(cx + 6, cy + d * tickSpacing);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Telemetry Overlay Banners
    const bannerHeight = Math.max(48, Math.round(h * 0.08));
    ctx.fillStyle = 'rgba(13, 12, 19, 0.78)'; // obsidian translucent
    ctx.fillRect(0, 0, w, bannerHeight);
    ctx.fillRect(0, h - bannerHeight, w, bannerHeight);

    // Accent line
    ctx.fillStyle = '#c59b27';
    ctx.fillRect(0, bannerHeight - 2, w, 2);
    ctx.fillRect(0, h - bannerHeight, w, 2);

    // Text styling
    const fontSize = Math.max(16, Math.round(w / 40));
    ctx.font = `bold ${fontSize}px "SF Pro Display", "Roboto Mono", monospace`;
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';

    // Top text: Bearing, Pitch, Roll
    const headingPad = String(Math.round(headingDeg)).padStart(3, '0');
    const pitchStr = (pitchDeg >= 0 ? '+' : '') + Math.round(pitchDeg);
    const rollStr = (rollDeg >= 0 ? '+' : '') + Math.round(rollDeg);
    const topText = `BEARING: ${headingPad}° ${cardinal}   |   PITCH: ${pitchStr}°   |   ROLL: ${rollStr}°`;
    ctx.fillText(topText, 24, bannerHeight / 2);

    // Bottom text: Lat / Lon / Altitude / Kuberan
    let bottomText = `SIGHTING RECORD  •  ${new Date().toLocaleString()}`;
    if (coords && coords.lat) {
      const latDir = coords.lat >= 0 ? 'N' : 'S';
      const lonDir = coords.lon >= 0 ? 'E' : 'W';
      bottomText = `POS: ${Math.abs(coords.lat).toFixed(4)}°${latDir}, ${Math.abs(coords.lon).toFixed(4)}°${lonDir}   ALT: ${Math.round(coords.ele || 0)}m   |   KUBERAN SILKS`;
    }
    ctx.fillText(bottomText, 24, h - bannerHeight / 2);

    return canvas.toDataURL('image/jpeg', 0.92);
  }

  return {
    startCamera,
    stopCamera,
    getActiveTrack,
    isCameraActive,
    captureSnapshot
  };
});
