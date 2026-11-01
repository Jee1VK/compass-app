# Compass App v5.0.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the Kuberan Compass App to v5.0.0 by integrating 5 major capabilities: AR Camera Sighting HUD, GPS Breadcrumb & GPX Tracker with Backtrack, Tactical Night Vision & Celestial Stargazer with SOS Morse Flasher, Magnetic Anomaly / EMF Distortion Meter, and Sundial & Solar Shadow Simulator.

**Architecture:** Pure vanilla modular ES6 architecture adhering to zero external dependencies, 100% offline PWA caching, and strict responsive design. Five new lightweight engines (`tracking-engine.js`, `sundial-engine.js`, `nightvision-engine.js`, `camera-hud-engine.js`, `emf-engine.js`) decouple mathematical logic from DOM rendering, tested via Node.js test harnesses before UI integration.

**Tech Stack:** HTML5, CSS3 (CSS Variables, monospaced HUD typography, canvas filters), Vanilla JavaScript (ES6+), WebRTC `getUserMedia`, Web Animations / RequestAnimationFrame, Canvas 2D API, Web Sensor / DeviceOrientation APIs, PWA Cache Storage API.

**Spec:** Features selected by user:
- **Feature 2: AR Camera Sighting HUD** (See-through rear camera, reticle crosshairs, clinometer marks, freeze/snapshot bearing)
- **Feature 3: GPS Breadcrumb Tracker & GPX/KML** (Offline track recording, live pace/distance, Backtrack return heading, GPX 1.1 import/export)
- **Feature 4: Tactical Night Vision & Stargazer Guide** (Monochromatic red $650\text{ nm}$ mode, Polaris/Crux celestial guides, Torch/Screen SOS Morse flasher)
- **Feature 5: Magnetic Anomaly & EMF Metal Detection Meter** (Microtesla $\mu\text{T}$ / field variance gauge, metal/interference warning banner)
- **Feature 6: Sundial & Solar Shadow Simulator** (Equation of Time, Local Apparent Solar Time, interactive 3D virtual gnomon shadow projection)

---

## Global Constraints
- **Zero External Dependencies:** No npm packages, external CDNs, or remote API calls. All calculations must run 100% offline.
- **Project Location:** `\\KUBERAN-NAS\Kuberan\Jeevan\Gemini Projects\compass-app`.
- **Kuberan Silks Brand Identity:** Deep maroon (`#6b1426`), royal gold (`#c59b27` / `#e5b842`), jet obsidian (`#0d0c13`), and tactical red (`#ff2a2a` for night vision mode).
- **Kuberan Logo Rule:** Any logo links must link to `https://kuberansilks.com/` (`target="_blank" rel="noopener noreferrer"`).
- **Cross-Platform Resiliency:** Gracefully handle browsers without camera permissions, without torch API, or without Magnetometer API.

---

## Review Focus
1. **Camera Permission Denied or Not Present:** On laptops or when user denies camera, HUD must display a clean fallback banner without throwing uncaught promise rejections or freezing the compass dial.
2. **GPX Import Malformed XML:** When a user uploads an invalid or non-GPX XML file, parser must fail gracefully with a friendly toast notification without breaking existing waypoints.
3. **Torch API Availability:** `track.applyConstraints({ advanced: [{ torch: true }] })` is supported primarily on Android Chrome; on iOS Safari or desktop, fallback seamlessly to high-contrast white/red screen strobe.
4. **Sundial Near Polar Regions / Night:** When sun elevation $< 0^\circ$ (night), sundial shadow should smoothly fade out with a night indicator rather than displaying inverted negative shadows.
5. **GPS Recording Battery & Memory:** Breadcrumbs must throttle coordinate recording (minimum 3 meters movement or 5 seconds) to prevent memory bloating over long multi-hour hikes.

---

## Task Decomposition

### Task 1: GPS Breadcrumb Tracker & GPX Engine (`tracking-engine.js`)
**Files:**
- Create: `\\KUBERAN-NAS\Kuberan\Jeevan\Gemini Projects\compass-app\tracking-engine.js`
- Create: `\\KUBERAN-NAS\Kuberan\Jeevan\Gemini Projects\compass-app\test-tracking.js`

**Interfaces:**
- Produces:
  - `startRecording(): void`
  - `addBreadcrumb(lat, lon, ele, timestamp, speed): { added: boolean, point: Object, totalDistance: number, totalDuration: number }`
  - `stopRecording(): Object (tripSummary)`
  - `computeBacktrack(currentLat, currentLon): { bearing: number, distance: number, targetPoint: Object }`
  - `exportGPX(trackPoints, waypoints, trackName): string (valid GPX 1.1 XML)`
  - `parseGPX(gpxXmlString): { waypoints: Array, trackPoints: Array, trackName: string }`

- [ ] **Step 1: Write test suite in `test-tracking.js`**
- [ ] **Step 2: Run test to verify it fails (`node test-tracking.js`)**
- [ ] **Step 3: Implement `tracking-engine.js`** (Haversine segment summation, GPX 1.1 builder with ISO timestamps, reverse azimuth calculation, and robust regex/DOMParser for XML)
- [ ] **Step 4: Run test to verify it passes (`node test-tracking.js`)**
- [ ] **Step 5: Git commit**

---

### Task 2: Sundial & Solar Shadow Engine (`sundial-engine.js`)
**Files:**
- Create: `\\KUBERAN-NAS\Kuberan\Jeevan\Gemini Projects\compass-app\sundial-engine.js`
- Create: `\\KUBERAN-NAS\Kuberan\Jeevan\Gemini Projects\compass-app\test-sundial.js`

**Interfaces:**
- Produces:
  - `calculateEquationOfTime(date): number (minutes)`
  - `calculateLocalApparentTime(date, longitude): { hours: number, minutes: number, seconds: number, formatted: string, eotMinutes: number }`
  - `calculateShadowVector(solarElevationDeg, solarAzimuthDeg, compassHeadingDeg, dialRadiusPx): { visible: boolean, lengthPx: number, dialAngleDeg: number, tipX: number, tipY: number }`

- [ ] **Step 1: Write test suite in `test-sundial.js`**
- [ ] **Step 2: Run test to verify it fails (`node test-sundial.js`)**
- [ ] **Step 3: Implement `sundial-engine.js`** (Spencer/NOAA Equation of Time approximation, solar time conversion, and dial relative shadow angle)
- [ ] **Step 4: Run test to verify it passes (`node test-sundial.js`)**
- [ ] **Step 5: Git commit**

---

### Task 3: Tactical Night Vision, Stargazer Guide & SOS Flasher (`nightvision-engine.js`)
**Files:**
- Create: `\\KUBERAN-NAS\Kuberan\Jeevan\Gemini Projects\compass-app\nightvision-engine.js`
- Create: `\\KUBERAN-NAS\Kuberan\Jeevan\Gemini Projects\compass-app\test-nightvision.js`

**Interfaces:**
- Produces:
  - `calculatePolarisPosition(lat, lon, date): { azimuth: number, elevation: number, visible: boolean }`
  - `calculateSouthernCrossPosition(lat, lon, date): { azimuth: number, elevation: number, visible: boolean }`
  - `getMorseTimingPattern(text = "SOS"): Array<number> (millisecond intervals of on/off)`
  - `startMorseStrobe(videoTrack, onScreenCallback): { stop: Function }`

- [ ] **Step 1: Write test suite in `test-nightvision.js`**
- [ ] **Step 2: Run test to verify it fails (`node test-nightvision.js`)**
- [ ] **Step 3: Implement `nightvision-engine.js`**
- [ ] **Step 4: Run test to verify it passes (`node test-nightvision.js`)**
- [ ] **Step 5: Git commit**

---

### Task 4: AR Camera Sighting HUD & EMF Engine (`camera-hud-engine.js` & `emf-engine.js`)
**Files:**
- Create: `\\KUBERAN-NAS\Kuberan\Jeevan\Gemini Projects\compass-app\camera-hud-engine.js`
- Create: `\\KUBERAN-NAS\Kuberan\Jeevan\Gemini Projects\compass-app\emf-engine.js`

**Interfaces:**
- `camera-hud-engine.js`:
  - `startCamera(videoElement): Promise<{ success: boolean, track: MediaStreamTrack, error: string }>`
  - `stopCamera(): void`
  - `captureSnapshot(videoElement, heading, pitch, roll, coordinates): string (dataURL)`
- `emf-engine.js`:
  - `processReading(magX, magY, magZ): { magnitudeUT: number, anomalyScore: number, alertLevel: string }`
  - `isInterferenceDetected(anomalyScore): boolean`

- [ ] **Step 1: Implement `camera-hud-engine.js` with stream acquisition, torch detection, and canvas stamp overlay**
- [ ] **Step 2: Implement `emf-engine.js` with Earth's typical magnetic field baseline ($25\text{--}65\ \mu\text{T}$) and rate-of-change anomaly thresholding**
- [ ] **Step 3: Git commit**

---

### Task 5: UI Integration in `index.html` & `style.css`
**Files:**
- Modify: `\\KUBERAN-NAS\Kuberan\Jeevan\Gemini Projects\compass-app\index.html`
- Modify: `\\KUBERAN-NAS\Kuberan\Jeevan\Gemini Projects\compass-app\style.css`

**Features Added to UI:**
1. **AR Camera Backdrop & Reticle:** Dedicated `<video id="ar-camera-feed">` and `<svg id="ar-reticle">` with mil-dots and horizon pitch ladder.
2. **Top Tactical Controls Bar:** Quick action buttons for 📷 AR Camera, 🔴 Night Vision (Red Mode), 🆘 SOS Flasher, and 🧲 EMF Anomaly Meter.
3. **Gnomon Shadow & Celestial Markers:** Sundial shadow line on the main compass dial, plus Polaris / Crux star icons.
4. **Trip Tracking Panel / Tab:** Dedicated Trip Recording HUD with Start/Pause/Stop, Backtrack guide button, and GPX Export/Import file upload.
5. **Night Vision Theme:** `[data-theme="tactical-red"]` CSS variables mapping all UI elements to monochromatic aviation/astronomy deep red ($650\text{ nm}$).

- [ ] **Step 1: Update `index.html` with camera container, reticle, tactical bar, EMF badge, and tracking controls**
- [ ] **Step 2: Update `style.css` with responsive styling for AR HUD, red mode filter variables, and gnomon shadow**
- [ ] **Step 3: Verify clean CSS syntax without regressions**

---

### Task 6: Master Wiring in `app.js` & Service Worker Update
**Files:**
- Modify: `\\KUBERAN-NAS\Kuberan\Jeevan\Gemini Projects\compass-app\app.js`
- Modify: `\\KUBERAN-NAS\Kuberan\Jeevan\Gemini Projects\compass-app\sw.js`
- Modify: `\\KUBERAN-NAS\Kuberan\Jeevan\Gemini Projects\compass-app\README.md`

- [ ] **Step 1: Wire camera toggle, reticle pitch/roll updates, and snapshot capture**
- [ ] **Step 2: Wire GPS tracking ticks to `tracking-engine.js`, record breadcrumbs, and connect GPX export/import**
- [ ] **Step 3: Wire sundial shadow and Local Apparent Solar Time to 1s ephemeris interval**
- [ ] **Step 4: Wire Night Vision red toggle and SOS Morse flasher with torch/screen fallback**
- [ ] **Step 5: Wire EMF anomaly monitor to sensor ticks**
- [ ] **Step 6: Update `sw.js` cache version to `kuberan-compass-v5.0.0` and cache new engine scripts**
- [ ] **Step 7: Update `README.md` documentation**
- [ ] **Step 8: Run end-to-end unit tests and verify clean git status**
- [ ] **Step 9: Git commit and push to `origin/main`**
