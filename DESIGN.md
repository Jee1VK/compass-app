# DESIGN.md - Kuberan Compass PWA Design System Specification
<!-- Specification Standard: Google Stitch (Google Labs open-source DESIGN.md standard) -->
<!-- Author: Kuberan Silks Heritage Engineering -->
<!-- Version: 5.1.0 -->
<!-- Status: Active & Enforced -->

---

## 1. Design Philosophy & Brand Identity

**KUBERAN Compass App (Official Edition)** blends aerospace-grade field instrumentation with the royal heritage of **Kuberan Silks, Chickpet, Bengaluru**. Designed for zero-glare outdoor legibility, astronomical precision, and 100% offline reliability, every surface and control adheres to Google Stitch and WCAG 2.2 AA/AAA accessibility standards.

### Core Principles
1. **Kuberan Heritage & Instrumentation Precision:** Combines Kuberan Silks signature tokens (Imperial Kumkum Maroon `#6B1D2F`, Antique Temple Gold `#C5A059`, Warm Pearl Ivory `#FAFAF7`, Charcoal Slate `#1C1917`) with 4 specialized outdoor instrument themes (Marine Brass, Tactical OLED, Minimalist Glass, and Red Night Vision).
2. **Zero-Glare Tactical Ergonomics:** High-contrast dials, tabular monospace readouts, and tactile glassmorphism optimized for direct sunlight and pitch-black stargazing.
3. **One-Thumb Field Operation:** Every interactive control, header icon, dock tab, and modal trigger enforces a minimum `44 × 44 px` touch target with `8px` separation.
4. **Uncompromising Accessibility & Motion Safety:** Full WCAG 2.2 AA/AAA contrast compliance, visible `:focus-visible` keyboard focus rings, and `@media (prefers-reduced-motion: reduce)` support.

---

## 2. Design Tokens (Color Hierarchy)

### Kuberan Silks Master Brand Tokens & Instrument Palette
```css
:root {
  /* Kuberan Silks Heritage Brand Tokens (Google Stitch Standard) */
  --color-brand-primary:      #6B1D2F; /* Imperial Kumkum Maroon */
  --color-brand-accent:       #C5A059; /* Antique Temple Gold */
  --color-brand-secondary:    #1B4D3E; /* Auspicious Temple Green */
  --color-canvas-base:        #FAFAF7; /* Warm Pearl Ivory */
  --color-text-primary:       #1C1917; /* Charcoal Slate */

  /* Tactical & Marine Instrument Tokens */
  --bg-primary:               #07090e;
  --bg-secondary:             #0e131d;
  --bg-glass:                 rgba(18, 24, 37, 0.75);
  --text-main:                #f1f5f9;
  --text-muted:               #8492a6;
  --accent-cyan:              #38bdf8;
  --accent-north:             #ef4444;
  --accent-level:             #22c55e;
  --accent-target:            #f59e0b;
}
```

### Multi-Theme Architecture
| Theme Class | Primary Surface | Accent Token | Use Case |
| :--- | :--- | :--- | :--- |
| `body.theme-marine` | `#08111e` | `#e5b842` (Temple Brass Gold) | Default heritage & marine navigation |
| `body` (Tactical) | `#07090e` | `#38bdf8` (HUD Cyan) | High-contrast daylight telemetry |
| `body.theme-minimal` | `#09090b` | `#ffffff` (Monochrome) | Low-distraction urban wayfinding |
| `body.theme-night` | `#050000` | `#ef4444` (620nm Deep Red) | Preserves human rhodopsin night vision |

---

## 3. Typography & Readout Hierarchy

```css
--font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
--font-mono: "SF Mono", "Roboto Mono", "JetBrains Mono", Menlo, Consolas, monospace;
```

* **Primary Bearing Readout:** `3.2rem` (`font-weight: 800`, `font-variant-numeric: tabular-nums`) for zero-jitter degree updates at 60Hz.
* **Cardinal Direction Badge:** `1.25rem` (`font-weight: 800`, `letter-spacing: 0.08em`).
* **Telemetry Metrics & Coordinates:** `0.85rem` monospace for GPS DMS, Mils, Azimuth, and Solar Time.

---

## 4. Component Specifications & Touch Contracts

1. **Top Brand Header & Action Bar (`.app-header`, `.tactical-action-bar`):**
   * Official Kuberan Silks logo wrapped in a clickable link (`https://kuberansilks.com/`, `target="_blank" rel="noopener noreferrer"`).
   * Header icon buttons (`.icon-btn`): `44 × 44 px` minimum touch target, `12px` border radius.
   * Tactical quick-action bar (`.tactical-tool-btn`): 4 equal-flex vector SVG controls (`min-height: 44px`) for AR HUD, Night Vision, SOS Strobe, and Audio Chimes.
2. **4-Tab Bottom Navigation Dock (`.navigation-dock`, `.dock-tab`):**
   * Crisp inline SVG icons (`18 × 18 px`) paired with semantic labels (`Compass`, `Celestial`, `Waypoints`, `Trek & GPX`).
   * Enforces `min-height: 44px` and ARIA `role="tablist"` / `role="tab"` / `aria-selected` contracts.
3. **Modals & Overlays (`.modal-window`, `.btn-modal-close`):**
   * Circular `44 × 44 px` close triggers, keyboard focus traps, and high-contrast QR & calibration cards.

---

## 5. Accessibility, Security & Asset Protection Mandates

1. **Touch Targets:** Minimum `44 × 44 px` across all interactive buttons, tabs, offset adjusters, and modal close controls.
2. **Keyboard Focus:** Global `:focus-visible` ring (`2px solid var(--accent-cyan)`, `outline-offset: 2px`).
3. **Motion Safety:** `@media (prefers-reduced-motion: reduce)` disables infinite animations and transitions for vestibular safety.
4. **Asset & Brand Protection:** CSS `-webkit-user-drag: none; -webkit-touch-callout: none; user-select: none;` combined with burned-in Kuberan Silks watermarks on AR snapshots and GPX exports.
