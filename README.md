# 🧭 KUBERAN Compass App - High-Precision Mobile Compass, Celestial Ephemeris & Waypoint Navigator

A sleek, downloadable **Wilderness & Celestial Navigation Progressive Web App (PWA)** built for iOS (Safari) and Android (Chrome / Samsung Internet), with 100% offline support, zero ads, zero tracking, and instant load time. Official edition presented by [Kuberan Silks](https://kuberansilks.com/).

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

## ✨ Features (v4.0.0)

- 🧭 **High-Precision Compass**:
  - Real-time magnetic heading and true north heading with automatic declination calculation.
  - **Zero-Deflection 3D Tilt Compensation**: True Euler projection keeps the compass rock-solid across all natural reading angles ($0^\circ-78^\circ$) without roll-induced drift.
  - Automatic landscape & portrait screen orientation compensation.
  - Cardinal & Intercardinal typography (`N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`).
  - Military NATO Mils scale (0–6400 mils) and back-azimuth calculation.
  - Authentic 8-point vintage nautical compass rose vector dial.
  - Continuous angle unwrapper preventing full $360^\circ$ reverse needle spinning.
- ☀️ **Solar Ephemeris & Golden Hour Studio**:
  - Live **☀️ Golden Sun marker** on the compass dial showing exact real-time sun azimuth.
  - Instant local calculation of **Sunrise**, **Solar Noon**, **Sunset**, and **Day Length**.
  - **Golden Hour** and **Blue Hour** countdown timer for photography and outdoor expeditions.
  - Real-time Solar Elevation angle (above/below horizon).
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
  - One-tap sound mute/unmute control in the header.
- 🎯 **Sensor Calibration & Alignment Studio**:
  - Dedicated **"Calibrate"** tool and live telemetry accuracy badge.
  - Symmetrical **Lemniscate Figure-8 Motion Guide** with real-time animated travelling device to reset magnetometer and eliminate hard/soft iron interference.
  - **Manual Calibration Offset**: Nudge offset (`[-5°]`, `[-1°]`, `[+1°]`, `[+5°]`) or **"Set Current Heading as True Reference"**.
- ⚖️ **Dual-Axis Bubble Level & Inclinometer**:
  - Center crosshairs bubble level for leveling tables, RVs, tripods, and surfaces.
  - Real-time **Pitch** (front-to-back tilt) and **Roll** (left-to-right tilt) digital readouts.
  - Turns glowing neon green with subtle haptic vibration when perfectly level ($\le 1.5^\circ$).
- 🎨 **4 Visual Themes**:
  1. **Marine Brass (Default)**: Vintage nautical brass dial and deep ocean navy styling with authentic 8-point compass rose.
  2. **Tactical OLED**: Stealth high-contrast neon cyan & military amber on pitch black.
  3. **Minimalist Glass**: Crisp monochrome typography and dark frosted glass.
  4. **Night Vision Red**: Red monochrome theme preserving night-adapted vision for astronomy and tactical field use.
- ⚡ **100% Offline Capability**:
  - Zero external runtime network dependencies, zero telemetry, zero ads. Built with Service Worker Cache API. Operates seamlessly in deep wilderness with no cellular reception or internet.
