/*! KUBERAN Compass - Synthetic Web Audio & Speech Engine v1.0
 *  100% Offline Synthetic Oscillators and SpeechSynthesis.
 *  Zero audio asset downloads.
 */
(function (root) {
  'use strict';

  var STORAGE_KEY_MUTED = 'kuberan-audio-muted';
  var audioCtx = null;
  var isMuted = true; // Default muted to respect quiet environments
  var lastPulseTime = 0;
  var lastLockTime = 0;

  // Restore saved mute preference
  try {
    var savedMute = root.localStorage ? root.localStorage.getItem(STORAGE_KEY_MUTED) : null;
    if (savedMute !== null) {
      isMuted = savedMute === 'true';
    }
  } catch (e) {}

  function getAudioContext() {
    if (!audioCtx && typeof root.AudioContext !== 'undefined') {
      audioCtx = new root.AudioContext();
    } else if (!audioCtx && typeof root.webkitAudioContext !== 'undefined') {
      audioCtx = new root.webkitAudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, durationMs, type, gainVal) {
    if (isMuted) return;
    try {
      var ctx = getAudioContext();
      if (!ctx) return;

      var osc = ctx.createOscillator();
      var gain = ctx.createGain();

      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      var now = ctx.currentTime;
      var dur = (durationMs || 80) / 1000.0;
      var maxGain = gainVal || 0.12;

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(maxGain, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + dur + 0.02);
    } catch (e) {
      // AudioContext policy or device audio disabled
    }
  }

  function playBearingPulse(absDiff) {
    if (isMuted) return;
    var now = Date.now();

    // Perfectly on target: within 1.5° -> Harmonic lock chime
    if (absDiff <= 1.5) {
      if (now - lastLockTime > 800) {
        playTone(880, 160, 'sine', 0.15); // A5
        setTimeout(function() {
          playTone(1320, 180, 'sine', 0.12); // E6
        }, 50);
        lastLockTime = now;
        lastPulseTime = now;
      }
      return;
    }

    // Near target: within 8° -> Proportional cadence pulses
    if (absDiff <= 8.0) {
      // Closer = faster cadence (250ms at 2° to 750ms at 8°)
      var interval = 250 + (absDiff / 8.0) * 500;
      if (now - lastPulseTime > interval) {
        var freq = 660 + (8.0 - absDiff) * 30; // 660Hz to 840Hz
        playTone(freq, 45, 'triangle', 0.08);
        lastPulseTime = now;
      }
    }
  }

  function toggleMute() {
    setMuted(!isMuted);
    return isMuted;
  }

  function setMuted(muted) {
    isMuted = Boolean(muted);
    try {
      if (root.localStorage) {
        root.localStorage.setItem(STORAGE_KEY_MUTED, isMuted.toString());
      }
    } catch (e) {}

    // Unlock context on unmute gesture
    if (!isMuted) {
      getAudioContext();
      playTone(587.33, 100, 'sine', 0.1); // D5 confirmation chirp
    }
  }

  function speakHeading(headingDeg, cardinal) {
    if (typeof root.speechSynthesis === 'undefined') return;
    try {
      root.speechSynthesis.cancel(); // Stop any pending speech
      var text = 'Heading ' + Math.round(headingDeg) + ' degrees, ' + (cardinal || '');
      var utterance = new root.SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = isMuted ? 0.3 : 1.0; // Still audible on tap even if chime is muted
      root.speechSynthesis.speak(utterance);
    } catch (e) {}
  }

  /* -------------------------------------------------------------------------
   * Export API
   * ------------------------------------------------------------------------- */
  var api = {
    playTone: playTone,
    playBearingPulse: playBearingPulse,
    toggleMute: toggleMute,
    setMuted: setMuted,
    isMuted: function() { return isMuted; },
    speakHeading: speakHeading,
    initContext: getAudioContext
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.AudioEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
