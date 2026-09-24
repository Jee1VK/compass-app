# 🧭 KUBERAN Compass App - High-Precision Mobile Compass & Inclinometer

A sleek, downloadable **Compass & Inclinometer Progressive Web App (PWA)** built for iOS (Safari) and Android (Chrome / Samsung Internet), with 100% offline support, zero ads, and no telemetry bloat. Official edition presented by [Kuberan Silks](https://kuberansilks.com/).

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

## ✨ Features (v3.9.5)

- 🧭 **High-Precision Compass**:
  - Real-time magnetic heading and true north heading with automatic declination calculation.
  - **W3C Rotation-Matrix 3D Tilt Compensation**: Projects device orientation onto the horizontal plane using Euler angles ($\alpha, \beta, \gamma$), ensuring rock-solid heading accuracy even when held at natural viewing angles ($30^\circ-60^\circ$).
  - Automatic landscape & portrait screen orientation compensation.
  - Cardinal & Intercardinal typography (`N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`).
  - Degree numbers `90` below `E`, `180` below `S`, and `270` below `W` for effortless navigation.
  - Military NATO Mils scale (0–6400 mils) and back-azimuth calculation.
  - Authentic 8-point vintage nautical compass rose vector dial.
  - Low-pass angular filter eliminating magnetometer jitter.
- 🎯 **Sensor Calibration & Alignment Studio**:
  - Dedicated **"Calibrate"** tool and live telemetry accuracy badge.
  - Symmetrical **Lemniscate Figure-8 Motion Guide** with real-time animated travelling device to reset magnetometer and eliminate hard/soft iron interference.
  - Live hardware calibration confidence metrics (`High`, `Good`, `Interference / Needs Cal`).
  - **Manual Calibration Offset**: Nudge offset (`[-5°]`, `[-1°]`, `[+1°]`, `[+5°]`) or **"Set Current Heading as True Reference"** to compensate for magnetic phone cases or external magnetic bias.
  - Persistent offset configuration saved in `localStorage`.
- ⚖️ **Dual-Axis Bubble Level & Inclinometer**:
  - Center crosshairs bubble level for leveling tables, RVs, tripods, and surfaces.
  - Real-time **Pitch** (front-to-back tilt) and **Roll** (left-to-right tilt) digital readouts.
  - Turns glowing neon green with subtle haptic vibration when perfectly level ($\le 1.5^\circ$).
- 🎯 **Target Bearing Lock**:
  - Tap the crosshairs icon to lock your target heading.
  - Accessible screen reader announcements and status indicators.
  - Real-time deviation alerts: `◀ 12° LEFT`, `12° RIGHT ▶`, or `🎯 ON TARGET`.
- 📍 **GPS Location Telemetry**:
  - Interactive tap-to-refresh on telemetry panel.
  - Coordinates in both **Decimal Degrees** and navigation **DMS** (Degrees, Minutes, Seconds).
  - Real-time **Altitude** (meters above sea level) and GPS accuracy radius.
  - Calculated magnetic declination offset (with clean zero formatting).
  - One-tap **"Copy Coords"** button with fallback clipboard support.
- 🎨 **4 Visual Themes**:
  1. **Marine Brass (Default)**: Vintage nautical brass dial and deep ocean navy styling with authentic 8-point compass rose.
  2. **Tactical OLED**: Stealth high-contrast neon cyan & military amber on pitch black.
  3. **Minimalist Glass**: Crisp monochrome typography and dark frosted glass.
  4. **Night Vision Red**: Red monochrome theme preserving night-adapted vision for astronomy and tactical field use.
  - Dynamic browser theme-color synchronization matching active palette.
- 📳 **Haptic Feedback**:
  - Permanently enabled gentle haptic pulses when crossing 0°/North, cardinal axes, or when surface is level.
- 📱 **Adaptive UI & Viewport Resiliency**:
  - Floating hover sensor activation card.
  - Sized and padded for complete visibility on screens down to 320px with zero horizontal scroll.
  - Dynamic viewport height (`100dvh`) handling dynamic mobile toolbars.
- ⚡ **100% Offline Capability**:
  - Service Worker caching all static assets and icons. Operates seamlessly in the wilderness with no cellular reception or internet.

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
MIT License. Created for Kuberan Silks by [Jee1VK](https://github.com/Jee1VK).
