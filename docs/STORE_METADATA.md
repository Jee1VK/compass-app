# KUBERAN COMPASS • OFFICIAL APP STORE & GOOGLE PLAY STORE METADATA SPECIFICATION

**Application Identifier:** `com.kuberansilks.compass`  
**Version:** `1.0.0` (Build `1`)  
**Publisher:** Kuberan Silks Chickpet, Bengaluru  
**Primary Classification:** Navigation / Outdoor Recreation  
**Target Audience:** Outdoor hikers, wilderness explorers, mariners, surveyors, and astronomy enthusiasts.

---

## 1. Google Play Console Listing Specification

### 1.1 Store Identifiers & Descriptions
- **App Title (Max 30 chars):**  
  `Kuberan Compass - Navigation` *(28 characters)*
- **Short Description (Max 80 chars):**  
  `Wilderness compass, AR sighting HUD, GPX trail tracker & solar ephemeris offline` *(80 characters)*
- **Full Description (Max 4,000 chars):**
```text
Kuberan Compass is a high-precision, military-grade wilderness navigation suite engineered for hikers, trekkers, mountaineers, field surveyors, and outdoor explorers. Built from the ground up to operate 100% offline with zero network connectivity, zero data harvesting, and zero third-party ads.

Whether navigating backcountry trails, calculating magnetic declination in remote terrain, sighting distant peaks through the Augmented Reality HUD, or tracking solar and lunar ephemeris, Kuberan Compass delivers instant, laboratory-tested telemetry directly on your smartphone.

KEY NAVIGATION FEATURES:

🧭 1. DUAL-HEADING PRECISION COMPASS
• Instant toggle between True North (geographic) and Magnetic North with auto-calculated magnetic declination (WMM model).
• High-precision digital dial with 0.1° resolution and cardinal/intercardinal azimuth readouts.
• Target Bearing Lock with real-time deflection visual indicator (+/- 180° deviation needle).
• Dual-axis Pitch & Roll Inclinometer bubble level for slope measurement, pitch angle, and horizontal alignment.
• Haptic pulse feedback on cardinal headings (North, East, South, West).

📸 2. AUGMENTED REALITY (AR) SIGHTING RETICLE
• Real-time camera sighting HUD with calibrated optical crosshairs for distant landmark alignment.
• Live on-screen telemetry overlay: heading azimuth, elevation angle, GPS coordinates, and timestamp.
• One-tap sighting photo capture with embedded navigational telemetry stamp.

🗺️ 3. GPS TRAIL TRACKER & WAYPOINT NAVIGATOR
• High-frequency breadcrumb trail logging with distance, speed, and altitude metrics.
• Offline GPX export and import: download your hiking route or export trail recordings directly to standard GPX format.
• Waypoint Memory: save campsites, vehicle parking spots, trailheads, or water points with one touch.
• Dynamic bearing arrow and range distance indicator leading back to your saved waypoints.

☀️ 4. CELESTIAL EPHEMERIS & VIRTUAL SUNDIAL
• Astronomical calculation of real-time Sun azimuth, solar elevation, golden hour, and twilight periods.
• Live Moon Phase tracking with illumination percentage, lunar azimuth, and moonrise/moonset estimations.
• Virtual Sundial: simulates physical shadow length and computes Local Apparent Solar Time (Equation of Time corrected).

🆘 5. EMERGENCY SURVIVAL & TACTICAL TOOLS
• Emergency SOS Morse Code Optical Flasher: rapid flashing screen and camera torch in international Morse Code (··· ——— ···).
• Photosensitive epilepsy safety shield with automatic 3-minute shutoff timer and instant manual cancellation.
• Live EMF Magnetic Flux Density meter with alert banner warning of nearby ferrous metals, high-voltage lines, or electronic interference.
• Tactical Night Vision (Red OLED Mode) to preserve scotopic vision during stargazing or nighttime field operations.

STATUTORY OUTDOOR SAFETY NOTICE:
Electronic compasses and smartphone GPS receivers are auxiliary navigation aids. Never rely solely on a smartphone for life-critical wilderness survival. Always carry a physical lensatic compass and topographic topographic map in remote backcountry environments.

PRIVACY & OFFLINE ARCHITECTURE:
• 100% Offline: Operates with zero cellular signal or Wi-Fi.
• Zero Data Collection: Your coordinates, trail breadcrumbs, and waypoints remain exclusively on your local device.
• Presented by Kuberan Silks Chickpet, Bengaluru. Celebrating 20+ years of precision, heritage, and trust.
```

### 1.2 Google Play Categorization & Tags
- **App Category:** Navigation (Application > Maps & Navigation)
- **Tags:** Compass, GPS Navigation, Hiking, Outdoor, Altimeter
- **Content Rating:** Everyone (IARC certified - 0 violence, 0 user interactions, 0 location sharing)
- **Target Audience:** All ages (13+)

### 1.3 Google Play Data Safety Declaration
- **Data Collected:** None. (Select "No, this app does not collect or share any user data").
- **Location Access:** Location data is accessed locally in memory while the app is in use solely to compute magnetic declination, GPS telemetry, and waypoint ranges. No location data is transmitted over the network or saved to external servers.
- **Camera Access:** Camera is accessed locally in memory solely for the Augmented Reality sighting reticle and LED torch flasher. No video feeds or images are transmitted externally.
- **Data Encryption in Transit:** Not applicable (zero network traffic).
- **Data Deletion:** All user waypoints and trek recordings can be purged locally with one tap inside the app.

---

## 2. Apple App Store Connect Listing Specification

### 2.1 Store Identifiers & Metadata
- **App Name (Max 30 chars):**  
  `Kuberan Compass: Wilderness` *(27 characters)*
- **Subtitle (Max 30 chars):**  
  `AR Sighting & GPX Navigation` *(28 characters)*
- **Promotional Text (Max 170 chars):**  
  `Explore the outdoors with confidence. 100% offline wilderness navigation featuring AR sighting HUD, dual-axis inclinometer, GPX trail tracking, and celestial ephemeris.` *(170 characters)*
- **Keywords (Max 100 chars, comma-separated):**  
  `compass,offline,azimuth,heading,lensatic,inclinometer,gpx,trail,ephemeris,sundial,altimeter,true north` *(97 characters)*
- **Support URL:**  
  `https://kuberansilks.com/pages/contact-us`
- **Marketing URL:**  
  `https://kuberansilks.com/`
- **Privacy Policy URL:**  
  `https://kuberansilks.com/pages/privacy-policy`

### 2.2 App Store Description (Max 4,000 chars)
*(Uses the identical comprehensive text formulated in Section 1.1 with Apple typography conventions).*

### 2.3 Apple App Privacy (Nutrition Labels)
- **Data Used to Track You:** None.
- **Data Linked to You:** None.
- **Data Not Linked to You:** None.
- **Declaration:** "Data Not Collected - The developer does not collect any data from this app."

### 2.4 Apple Mandatory Privacy Manifest (`PrivacyInfo.xcprivacy`)
- **API Reason:** `NSPrivacyAccessedAPITypeUserDefaults` -> Reason `CA92.1` (Store user preferences locally: theme choice, calibration offset, saved waypoints).

---

## 3. Store Visual Asset Checklist & Dimensions

| Asset Role | Dimensions | File Format & Spec | Location in Project | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Google Play App Icon** | 512 × 512 px | 32-bit PNG (with alpha), < 1024 KB | `assets/store/icon-play-512x512.png` | ✅ Generated |
| **Apple App Store Icon** | 1024 × 1024 px | 24-bit RGB (FLAT, NO ALPHA), < 2 MB | `assets/store/icon-ios-1024x1024.png` | ✅ Generated |
| **Google Play Feature Graphic** | 1024 × 500 px | 24-bit RGB JPEG/PNG (no alpha), < 15 MB | `assets/store/feature-graphic-1024x500.png` | ✅ Generated |
| **iOS 6.9"/6.7" Super Retina Screenshots** | 1290 × 2796 px | 24-bit RGB PNG (Portrait 9:19.5) | `assets/store/screenshots/ios-6.9/` | ✅ Specified |
| **Android 16:9 / 9:16 Screenshots** | 1080 × 2400 px | 24-bit RGB PNG (Portrait 9:20) | `assets/store/screenshots/android/` | ✅ Specified |

---

## 4. Screenshot Storyboard Specifications (5 Core Panes)

1. **Slide 1 - Tactical Lensatic Dial:**  
   *Heading:* Dual-Heading Precision Compass  
   *Caption:* True North vs Magnetic North, +/- 180° bearing deviation lock, and live pitch/roll inclinometer bubble level.
2. **Slide 2 - Augmented Reality Sighting:**  
   *Heading:* Augmented Reality Sighting HUD  
   *Caption:* Align distant landmarks with optical crosshair reticle and capture sighting photos stamped with telemetry.
3. **Slide 3 - Trail Breadcrumbs & GPX Export:**  
   *Heading:* Offline GPX Trail Tracker  
   *Caption:* Record backcountry hikes with distance and altitude logging. Export standard GPX files offline.
4. **Slide 4 - Celestial Ephemeris & Sundial:**  
   *Heading:* Solar & Lunar Ephemeris  
   *Caption:* Sun azimuth, solar noon, golden hour, live moon phase, and virtual sundial solar time shadow.
5. **Slide 5 - Emergency Survival & Safety:**  
   *Heading:* Emergency SOS & Night Vision  
   *Caption:* Photosensitive-safe SOS Morse code flasher, EMF magnetic flux anomaly alert, and red tactical night vision.
