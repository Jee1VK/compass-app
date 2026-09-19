# 🧭 KUBERAN Compass App - High-Precision Mobile Compass & Inclinometer

A sleek, downloadable **Compass & Inclinometer Progressive Web App (PWA)** built for iOS (Safari) and Android (Chrome / Samsung Internet), with 100% offline support and zero ads or bloat.

📱 **Live Web App & Mobile Install:** [https://jee1vk.github.io/compass-app/](https://jee1vk.github.io/compass-app/)

---

## 📲 How to Download & Install on Your Phone

You can download and install this directly to your phone's home screen as a standalone full-screen native-like app:

### 🍏 iPhone / iPad (iOS Safari)
1. Open [https://jee1vk.github.io/compass-app/](https://jee1vk.github.io/compass-app/) in **Safari**.
2. Tap the **Share** button (the square icon with an arrow pointing up).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **"Add"** in the top-right corner.
5. The **Compass** app icon will now appear on your home screen! Tap it to launch full-screen.
6. *Note*: On first open, tap **"Enable"** on the banner to activate your device's motion sensors.

### 🤖 Android (Chrome / Edge / Samsung Internet)
1. Open [https://jee1vk.github.io/compass-app/](https://jee1vk.github.io/compass-app/) in **Chrome**.
2. Tap the **"Install App"** button on screen, OR tap the **three dots menu (⋮)** in the top right.
3. Tap **"Install app"** (or **"Add to Home screen"**).
4. Launch **Compass** directly from your app drawer or home screen!

---

## ✨ Features

- 🧭 **High-Precision Compass**:
  - Real-time magnetic heading and true north heading.
  - Cardinal & Intercardinal readouts (`N`, `NNW`, `NE`, `E`, etc.).
  - Military NATO Mils scale (0–6400 mils) and back-azimuth calculation.
  - Angular smoothing algorithm for jitter-free 60fps rotation.
- ⚖️ **Dual-Axis Bubble Level & Inclinometer**:
  - Center crosshairs bubble level for leveling tables, RVs, tripods, and surfaces.
  - Real-time **Pitch** (front-to-back tilt) and **Roll** (left-to-right tilt) digital readouts.
  - Turns glowing neon green with subtle haptic vibration when perfectly level ($\le 1.5^\circ$).
- 🎯 **Target Bearing Lock**:
  - Tap the crosshairs icon to lock your target heading.
  - Real-time deviation alerts: `◀ 12° LEFT`, `12° RIGHT ▶`, or `🎯 ON TARGET`.
- 📍 **GPS Location Telemetry**:
  - Coordinates in both **Decimal Degrees** and navigation **DMS** (Degrees, Minutes, Seconds).
  - Real-time **Altitude** (meters above sea level) and GPS accuracy radius.
  - Calculated magnetic declination offset.
  - One-tap **"Copy Coords"** button.
- 🎨 **4 Visual Themes**:
  1. **Tactical OLED**: Stealth high-contrast neon cyan & military amber on pitch black.
  2. **Minimalist Glass**: Crisp Apple-style monochrome typography and dark frosted glass.
  3. **Marine Brass**: Vintage nautical brass dial and deep ocean navy styling.
  4. **Night Vision Red**: Red monochrome theme preserving night-adapted vision for astronomy and tactical field use.
- 📳 **Haptic Feedback**:
  - Gentle haptic pulses when crossing 0°/North, cardinal axes, or when surface is level.
- ⚡ **100% Offline Capability**:
  - Built with a Service Worker caching all assets. Works in the wilderness with no cellular reception or internet.

---

## 🛠️ Local Development & Testing

To test locally:
```bash
# Start any static server, e.g.:
npx serve .
# or Python:
python -m http.server 8080
```
Then visit `http://localhost:8080` in your browser.

---

## 📄 License
MIT License. Created by [Jee1VK](https://github.com/Jee1VK).
