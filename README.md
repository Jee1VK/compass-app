# 🧭 KUBERAN Compass App - High-Precision Mobile Compass, AR Sighting HUD, Celestial Ephemeris, GPX Trek Tracker & Waypoint Navigator

A sleek, downloadable **Wilderness, Celestial & Sighting Navigation Progressive Web App (PWA)** built for iOS (Safari) and Android (Chrome / Samsung Internet), with 100% offline support, zero ads, zero tracking, and instant load time. Official edition presented by [Kuberan Silks](https://kuberansilks.com/).

📱 **Live Web App & Mobile Install:** [https://jee1vk.github.io/compass-app/](https://jee1vk.github.io/compass-app/)  
🏪 **Official Store:** [https://kuberansilks.com/](https://kuberansilks.com/)

---

## 📲 How to Download & Install on Your Phone

You can install this directly to your phone's home screen as a standalone full-screen native-like app:

### 🍏 iPhone / iPad (iOS Safari)
1. Open [https://jee1vk.github.io/compass-app/](https://jee1vk.github.io/compass-app/) in **Safari**.
2. Tap the **Share** button (the square icon with an arrow pointing up).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **"Add"** in the top-right corner.
5. The **KUBERAN Compass App** icon will now appear on your home screen! Tap it to launch full-screen.
6. *Note*: On first launch, tap **"Enable"** on the banner to activate your device's motion sensors. Once enabled, the permission remains permanently active.

### 🤖 Android (Chrome / Edge / Samsung Internet)
1. Open [https://jee1vk.github.io/compass-app/](https://jee1vk.github.io/compass-app/) in **Chrome**.
2. Tap the **"Install App"** button on screen, OR tap the **three dots menu (⋮)** in the top right.
3. Tap **"Install app"** (or **"Add to Home screen"**).
4. Launch **KUBERAN Compass App** directly from your app drawer or home screen!

---

## ✨ Features (v5.0.0)

- 📷 **AR Camera Sighting HUD**:
  - Activates live environmental camera feed behind a precision HUD reticle with mil-dot spacing and horizon pitch ladder.
  - Real-time digital sighting telemetry (Azimuth, Pitch, Roll, GPS Coordinates, Altitude).
  - **Snap Sighting Photo**: Burn current heading, elevation, timestamp, and coordinates directly onto a saved survey snapshot.
- 🗺️ **GPS Breadcrumb Trek Tracker & Universal GPX 1.1**:
  - Offline trip recording with real-time distance, elapsed time, average pace, and elevation gain.
  - **Backtrack ("Return to Start")**: Calculates instant direct reverse azimuth and distance back to your trek origin if lost on a trail.
  - **Export GPX**: Download standard `.gpx` files to visualize tracks and waypoints in Google Earth, Gaia GPS, or Garmin.
  - **Import GPX**: Upload `.gpx` trail files and load waypoints directly into your offline navigation database.
- 🕒 **Virtual Sundial & Local Apparent Solar Time**:
  - Interactive virtual gnomon shadow projected directly onto the compass dial matching real-time solar elevation and azimuth.
  - Authentic calculation of the **Equation of Time (EoT)** and **True Solar Time** based on your exact longitude.
- 🔴 **Tactical Night Vision & Stargazer Guide**:
  - Monochromatic aviation red mode ($650\text{ nm}$ palette) preserving human rhodopsin dark-adapted night vision.
  - Celestial navigation guides on the dial tracking **Polaris (North Star)** in the Northern Hemisphere and the **Southern Cross (Crux)** in Southern/tropical skies.
- 🆘 **Emergency SOS Morse Code Flasher**:
  - Broadcasts international Morse code `· · · — — — · · ·` via device camera torch and high-contrast full-screen strobe with emergency stop controls.
- 🧲 **EMF Magnetic Flux Density & Metal Distortion Alert**:
  - Live microtesla ($\mu\text{T}$) magnetic field readout with automated baseline tracking.
  - Real-time distortion detection warning if nearby steel beams, rebar, or electronics compromise compass accuracy.
- 🧭 **High-Precision Compass**:
  - Real-time magnetic heading and true north heading with automatic declination calculation.
  - **Zero-Deflection 3D Tilt Compensation**: True Euler projection keeps the compass rock-solid across all natural reading angles ($0^\circ-78^\circ$) without roll-induced drift.
  - Automatic landscape & portrait screen orientation compensation.
  - Military NATO Mils scale (0–6400 mils) and back-azimuth calculation.
  - Authentic 8-point vintage nautical compass rose vector dial.
- ☀️ **Solar Ephemeris & Golden Hour Studio**:
  - Live **☀️ Golden Sun marker** on the compass dial showing exact real-time sun azimuth.
  - Instant local calculation of **Sunrise**, **Solar Noon**, **Sunset**, and **Day Length**.
  - **Golden Hour** and **Blue Hour** countdown timer for outdoor expeditions and photography.
- 🌙 **Lunar Tracking & Moon Phase Studio**:
  - Live **🌙 Moon crescent marker** on the compass dial tracking moon azimuth.
  - Real-time Moon Phase determination (New Moon, Crescent, Quarter, Gibbous, Full Moon).
  - Lunar illumination percentage (0% to 100%) and lunar age in days.
- 📍 **Offline Waypoint Navigator ("Find My Spot / Car / Camp")**:
  - Save custom GPS waypoints (e.g. Parked Car 🚗, Campsite ⛺, Landmark 📍) completely offline in `localStorage`.
  - **Great-Circle Navigation**: Live neon beacon arrow on the compass dial pointing directly toward your saved destination.
  - Floating Waypoint HUD with live distance countdown (`340 m`, `2.4 km`) and turn-by-turn deviation angle.
- 🔊 **Synthetic Web Audio & Spoken Heading**:
  - **Acoustic Bearing Alignment**: Soft, harmonic audio pulses that speed up as you align with North, target bearing, or saved waypoints. Locks with a crystal dual-tone chime when within $\pm 1.5^\circ$.
  - **Spoken Heading Mode**: Tap the main degree readout to hear the current heading and cardinal direction announced via speech synthesis.
- ⚖️ **Dual-Axis Bubble Level & Inclinometer**:
  - Center crosshairs bubble level for leveling tables, RVs, tripods, and surfaces.
  - Real-time **Pitch** and **Roll** digital readouts with glowing green lock indicator when level ($\le 1.5^\circ$).
- 🎨 **4 Visual Themes**:
  1. **Marine Brass (Default)**: Vintage nautical brass dial and deep ocean navy styling.
  2. **Tactical OLED**: Stealth high-contrast neon cyan & military amber on pitch black.
  3. **Minimalist Glass**: Crisp monochrome typography and dark frosted glass.
  4. **Night Vision Red**: Monochromatic deep red theme.
- ⚡ **100% Offline Capability**:
  - Zero external runtime network dependencies, zero telemetry, zero ads. Built with Service Worker Cache API. Operates seamlessly in deep wilderness with no cellular reception or internet.
