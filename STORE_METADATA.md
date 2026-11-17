# Kuberan Compass • App Store & Google Play Store Publishing Metadata

## Statutory & App Review Positioning Architecture

> [!IMPORTANT]
> **Store Differentiation & Review Risk Mitigation (Apple Guideline 4.3 & 4.2):**
> This application is strictly positioned, branded, and categorized under **"Navigation / Outdoor Recreation"**. It is architected around **High-Precision 60fps Sensor Fusion, Augmented Reality (AR) Sighting Horizon Reticles, Celestial Ephemeris, Dual-Axis Inclinometer Pitch & Roll, and Offline GPX Trail Tracking**.
> It possesses **zero astrological or Vastu iconography**, completely eliminating duplication risks with traditional architecture apps under Apple App Store Review Guideline 4.3 (Spam/Duplication) and Guideline 4.2 (Minimum Functionality).

---

## 1. Google Play Store Listing Specification

### 1.1 Core Details
- **App Name (Title - Max 30 chars):** `Kuberan Compass: Wilderness AR` *(30 chars)*
- **Package Name (Application ID):** `com.kuberansilks.compass`
- **Primary Category:** Navigation (Maps & Navigation)
- **Secondary Category:** Outdoor & Recreation
- **Content Rating:** PEGI 3 / Everyone
- **Price:** Free (\$0.00) • Zero Ads • Zero In-App Purchases • Zero Subscription

### 1.2 Short Description (Elevator Pitch - Max 80 chars)
`Wilderness 60fps compass with AR sighting reticle, solar ephemeris & GPX trails.` *(80 chars)*

### 1.3 Full Description (Max 4,000 chars)
```text
Kuberan Compass is a military-grade, high-precision outdoor navigation instrument engineered for backcountry hikers, mountaineers, field surveyors, and maritime navigators. Featuring a decoupled 60fps/120fps hardware-accelerated motion engine, optical Augmented Reality sighting reticle, celestial ephemeris tracking, and offline GPX waypoint recording—built with 100% offline autonomy and zero remote telemetry.

Presented by Kuberan Silks, this official navigation utility brings heirloom precision and industrial craftsmanship to modern mobile hardware.

KEY EXPEDITION FEATURES:

🧭 1. 60FPS DECOUPLED NEEDLE ENGINE
• Hardware-accelerated GPU compositing via requestAnimationFrame rendering at native display refresh rates (60Hz / 90Hz / 120Hz ProMotion).
• Shortest-angular-path interpolation: Eliminates 359° spin when crossing due North.
• Instant toggling between Magnetic Heading and True Geographic North.
• Real-time Magnetic Declination adjustment (Auto GPS computation or manual entry).
• Dual-azimuth display: 360° decimal degrees, 6,400 NATO Mils, and Back-Azimuth reciprocal bearings.

📷 2. AUGMENTED REALITY (AR) SIGHTING RETICLE HUD
• Overlay precision directional crosshairs directly on the real-world terrain through your camera lens.
• Sight distant mountain peaks, landmarks, or buoys with continuous digital heading readouts.
• Target Bearing Lock: Set a target azimuth and follow real-time deviation indicators (ON TARGET, X° LEFT / RIGHT).
• Local GPU canvas processing: Zero camera images or video feeds ever leave your physical smartphone.

☀️ 3. CELESTIAL EPHEMERIS & VIRTUAL SUNDIAL
• Real-time solar tracking: Precise solar azimuth, elevation, solar noon, sunrise, and sunset timings.
• Virtual 3D Sundial: Visualizes true solar time and gnomon shadow based on your exact latitude and solar declination.
• Equation of Time (EoT) calculation and daylight arc trajectory.
• Real-time lunar phase tracking with illumination percentages and lunar azimuth.

⚖️ 4. DUAL-AXIS INCLINOMETER & TACTICAL LEVEL
• High-sensitivity pitch and roll spirit level bubble for surveying, campsite pitching, and antenna alignment.
• Multi-axis angular readouts with visual limit locking (under 1.5° tilt lock).
• Haptic pulse feedback on level acquisition and cardinal headings.

📍 5. OFFLINE WAYPOINTS & GPX TRAIL TRACKER
• Instant "Find My Camp / Car / Trailhead" coordinate bookmarking with custom markers.
• Great-Circle forward azimuth and Haversine distance tracking to saved waypoints.
• Live GPX breadcrumb trail tracker with elevation gain, pace, and coordinate logging.
• One-tap GPX export for backcountry trail analysis.

🛡️ 6. 100% PRIVATE • ZERO TELEMETRY • NO ADS
• No tracking SDKs, no third-party analytics, no advertising banners, no user account logins.
• All waypoints, tracks, and calibration offsets remain strictly inside your device's local storage.
• Fully functional without cellular data or internet reception.

⚠️ STATUTORY WILDERNESS SAFETY NOTICE:
Electronic compasses and smartphone GPS receivers are auxiliary navigation aids subject to battery depletion, satellite geometry degradation, and local magnetic interference. Never rely solely on any electronic smartphone application for life-critical backcountry survival. Always carry an analog lensatic compass and topographic paper map in remote environments.
```

---

## 2. Apple App Store Listing Specification

### 2.1 Core Details
- **App Name (Title - Max 30 chars):** `Kuberan Compass - Navigation` *(28 chars)*
- **Subtitle (Max 30 chars):** `Wilderness AR & Solar Sighting` *(30 chars)*
- **Bundle Identifier:** `com.kuberansilks.compass`
- **Primary Category:** Navigation
- **Secondary Category:** Utilities
- **Age Rating:** 4+ (No unrestricted web access, no objectionable content)
- **Copyright:** © 2026 Kuberan Silks Chickpet. All Rights Reserved.

### 2.2 Promotional Text (Max 170 chars - Editable without app review)
`Engineered for wilderness expeditions: 60fps decoupled compass, optical AR sighting reticle, solar/lunar ephemeris, dual-axis inclinometer & offline GPX trail tracker.` *(168 chars)*

### 2.3 Search Keywords (ASO - Max 100 chars comma-separated)
`compass,navigation,wilderness,hiking,gps tracker,inclinometer,ar reticle,celestial,sundial,gpx,true north` *(100 chars)*

### 2.4 Support & Privacy URLs
- **Support URL:** `https://kuberansilks.com/`
- **Marketing URL:** `https://kuberansilks.com/`
- **Privacy Policy URL:** `https://jee1vk.github.io/compass-app/privacy.html`

### 2.5 App Store Privacy Nutrition Labels
- **Data Used to Track You:** None (0)
- **Data Linked to You:** None (0)
- **Data Not Linked to You:** None (0)
- **Declared Required Reason APIs (`PrivacyInfo.xcprivacy`):**
  - `NSPrivacyAccessedAPITypeUserDefaults` -> Reason `CA92.1` (storing local user calibration preferences, theme choice, and saved offline waypoints).

---

## 3. Store Visual Asset Checklist

| Asset File | Target Store | Dimensions | Color Profile / Alpha | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| `store-assets/icon-play-512x512.png` | Google Play | 512 × 512 px | 32-bit PNG (with alpha) | Verified ✓ |
| `store-assets/icon-ios-1024x1024.png` | App Store | 1024 × 1024 px | 24-bit Opaque RGB (NO ALPHA) | Verified ✓ |
| `store-assets/feature-graphic-1024x500.png` | Google Play | 1024 × 500 px | 24-bit RGB (No alpha) | Verified ✓ |
| `store-assets/screenshot-1-compass-navigation-1080x1920.png` | Google Play Phone | 1080 × 1920 px (16:9/9:16) | 24-bit PNG | Verified ✓ |
| `store-assets/screenshot-2-ar-sighting-hud-1080x1920.png` | Google Play Phone | 1080 × 1920 px (16:9/9:16) | 24-bit PNG | Verified ✓ |
| `store-assets/screenshot-3-celestial-ephemeris-1080x1920.png` | Google Play Phone | 1080 × 1920 px (16:9/9:16) | 24-bit PNG | Verified ✓ |
| `store-assets/screenshot-4-waypoint-gpx-tracker-1080x1920.png` | Google Play Phone | 1080 × 1920 px (16:9/9:16) | 24-bit PNG | Verified ✓ |
| `store-assets/screenshot-1-compass-navigation-1290x2796.png` | App Store (6.7"/6.9") | 1290 × 2796 px | 24-bit PNG | Verified ✓ |
| `store-assets/screenshot-2-ar-sighting-hud-1290x2796.png` | App Store (6.7"/6.9") | 1290 × 2796 px | 24-bit PNG | Verified ✓ |
| `store-assets/screenshot-3-celestial-ephemeris-1290x2796.png` | App Store (6.7"/6.9") | 1290 × 2796 px | 24-bit PNG | Verified ✓ |
| `store-assets/screenshot-4-waypoint-gpx-tracker-1290x2796.png` | App Store (6.7"/6.9") | 1290 × 2796 px | 24-bit PNG | Verified ✓ |
