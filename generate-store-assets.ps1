Add-Type -AssemblyName System.Drawing

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$storeAssetsDir = Join-Path $rootDir "store-assets"
$assetsStoreDir = Join-Path $rootDir "assets\store"

if (-not (Test-Path $storeAssetsDir)) {
    New-Item -ItemType Directory -Path $storeAssetsDir -Force | Out-Null
}
if (-not (Test-Path $assetsStoreDir)) {
    New-Item -ItemType Directory -Path $assetsStoreDir -Force | Out-Null
}

$icon512Path = Join-Path $rootDir "icon-512.png"
if (-not (Test-Path $icon512Path)) {
    Write-Error "Source icon-512.png not found at $icon512Path"
    exit 1
}

Write-Host "=========================================================="
Write-Host " KUBERAN COMPASS - APP STORE & PLAY STORE ASSETS GENERATOR"
Write-Host "=========================================================="

# -----------------------------------------------------------------
# 1. Google Play Icon (512x512 32-bit PNG)
# -----------------------------------------------------------------
$playIconPath = Join-Path $storeAssetsDir "icon-play-512x512.png"
Copy-Item -Path $icon512Path -Destination $playIconPath -Force
Copy-Item -Path $icon512Path -Destination (Join-Path $assetsStoreDir "icon-play-512x512.png") -Force
Write-Host "[OK] Google Play Store Icon (512x512 32-bit PNG): $playIconPath"

# -----------------------------------------------------------------
# 2. Apple App Store Icon (1024x1024 24-bit Opaque RGB - NO ALPHA)
# -----------------------------------------------------------------
$iosIconPath = Join-Path $storeAssetsDir "icon-ios-1024x1024.png"
$srcImg = [System.Drawing.Image]::FromFile($icon512Path)

$iosBmp = New-Object System.Drawing.Bitmap(1024, 1024, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g = [System.Drawing.Graphics]::FromImage($iosBmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

# Solid dark navy background (#08111e) - strictly opaque RGB
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(8, 17, 30))
$g.FillRectangle($bgBrush, 0, 0, 1024, 1024)

# Concentric celestial gold rings (#C5A059)
$goldPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(50, 197, 160, 89), 2)
$g.DrawEllipse($goldPen, 32, 32, 960, 960)
$g.DrawEllipse($goldPen, 64, 64, 896, 896)
$g.DrawEllipse($goldPen, 112, 112, 800, 800)

# Compass emblem centered
$destRect = New-Object System.Drawing.Rectangle(82, 82, 860, 860)
$g.DrawImage($srcImg, $destRect)

$g.Dispose()
$iosBmp.Save($iosIconPath, [System.Drawing.Imaging.ImageFormat]::Png)
$iosBmp.Save((Join-Path $assetsStoreDir "icon-ios-1024x1024.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$iosBmp.Dispose()
Write-Host "[OK] Apple App Store Icon (1024x1024 24-bit Opaque RGB, NO ALPHA): $iosIconPath"

# -----------------------------------------------------------------
# 3. Google Play Feature Graphic (1024x500 24-bit RGB)
# -----------------------------------------------------------------
$featureGraphicPath = Join-Path $storeAssetsDir "feature-graphic-1024x500.png"
$featBmp = New-Object System.Drawing.Bitmap(1024, 500, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$gFeat = [System.Drawing.Graphics]::FromImage($featBmp)
$gFeat.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gFeat.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gFeat.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)),
    (New-Object System.Drawing.Point(1024, 500)),
    [System.Drawing.Color]::FromArgb(8, 17, 30),
    [System.Drawing.Color]::FromArgb(19, 33, 60)
)
$gFeat.FillRectangle($gradBrush, 0, 0, 1024, 500)

# Coordinate grid lines
$gridPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(25, 197, 160, 89), 1)
for ($x = 50; $x -lt 1024; $x += 60) { $gFeat.DrawLine($gridPen, $x, 0, $x, 500) }
for ($y = 50; $y -lt 500; $y += 60) { $gFeat.DrawLine($gridPen, 0, $y, 1024, $y) }

# Compass emblem on right
$compassDest = New-Object System.Drawing.Rectangle(560, 30, 440, 440)
$gFeat.DrawImage($srcImg, $compassDest)

$fontFamily = [System.Drawing.FontFamily]::GenericSansSerif
$titleFont = New-Object System.Drawing.Font($fontFamily, 34, [System.Drawing.FontStyle]::Bold)
$subFont = New-Object System.Drawing.Font($fontFamily, 15, [System.Drawing.FontStyle]::Bold)
$badgeFont = New-Object System.Drawing.Font($fontFamily, 11, [System.Drawing.FontStyle]::Regular)
$brandFont = New-Object System.Drawing.Font($fontFamily, 12, [System.Drawing.FontStyle]::Italic)

$goldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(197, 160, 89))
$ivoryBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 250, 247))
$dimBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 195, 215))
$badgeBgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(107, 29, 47))

$gFeat.DrawString("KUBERAN COMPASS", $titleFont, $goldBrush, 45, 95)
$gFeat.DrawString("WILDERNESS & CELESTIAL NAVIGATION", $subFont, $ivoryBrush, 48, 155)

$gFeat.FillRectangle($badgeBgBrush, 48, 205, 175, 32)
$gFeat.DrawString("AR SIGHTING HUD", $badgeFont, $ivoryBrush, 62, 212)

$gFeat.FillRectangle($badgeBgBrush, 235, 205, 185, 32)
$gFeat.DrawString("GPX TRAIL TRACKER", $badgeFont, $ivoryBrush, 247, 212)

$gFeat.FillRectangle($badgeBgBrush, 48, 248, 175, 32)
$gFeat.DrawString("SOLAR EPHEMERIS", $badgeFont, $ivoryBrush, 60, 255)

$gFeat.FillRectangle($badgeBgBrush, 235, 248, 185, 32)
$gFeat.DrawString("100% OFFLINE READY", $badgeFont, $ivoryBrush, 247, 255)

$gFeat.DrawString("Auxiliary Lensatic Reticle | Inclinometer | Waypoint Memory", $badgeFont, $dimBrush, 48, 320)
$gFeat.DrawString("Official Edition | Kuberan Silks Chickpet, Bengaluru", $brandFont, $goldBrush, 48, 415)

$gFeat.Dispose()
$featBmp.Save($featureGraphicPath, [System.Drawing.Imaging.ImageFormat]::Png)
$featBmp.Save((Join-Path $assetsStoreDir "feature-graphic-1024x500.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$featBmp.Dispose()
Write-Host "[OK] Google Play Feature Graphic (1024x500 24-bit RGB): $featureGraphicPath"

# -----------------------------------------------------------------
# 4. Helper Function: Generate Store Screenshot
# -----------------------------------------------------------------
function Generate-StoreScreenshot {
    param(
        [int]$Width,
        [int]$Height,
        [string]$Headline,
        [string]$Subline,
        [string]$BadgeText,
        [string]$Feature1,
        [string]$Feature2,
        [string]$Feature3,
        [string]$OutputPath
    )

    $bmp = New-Object System.Drawing.Bitmap($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Background gradient
    $bgGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(0, 0)),
        (New-Object System.Drawing.Point(0, $Height)),
        [System.Drawing.Color]::FromArgb(8, 17, 30),
        [System.Drawing.Color]::FromArgb(15, 23, 42)
    )
    $g.FillRectangle($bgGrad, 0, 0, $Width, $Height)

    # Scale factors based on 1080px base
    $scale = $Width / 1080.0

    # Decorative background arcs
    $ringPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(35, 197, 160, 89), [Math]::Max(1.0, 2.0 * $scale))
    $g.DrawEllipse($ringPen, [int](-200 * $scale), [int](200 * $scale), [int]($Width * 1.4), [int]($Width * 1.4))

    # Top Pill Badge
    $bFont = New-Object System.Drawing.Font($fontFamily, [int](14 * $scale), [System.Drawing.FontStyle]::Bold)
    $bBgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(107, 29, 47))
    $bRect = New-Object System.Drawing.Rectangle([int](70 * $scale), [int](80 * $scale), [int](320 * $scale), [int](44 * $scale))
    $g.FillRectangle($bBgBrush, $bRect)
    $g.DrawString($BadgeText, $bFont, $ivoryBrush, [float](90 * $scale), [float](90 * $scale))

    # Headlines
    $hFont = New-Object System.Drawing.Font($fontFamily, [int](36 * $scale), [System.Drawing.FontStyle]::Bold)
    $sFont = New-Object System.Drawing.Font($fontFamily, [int](18 * $scale), [System.Drawing.FontStyle]::Regular)
    $g.DrawString($Headline, $hFont, $goldBrush, [float](70 * $scale), [float](145 * $scale))
    $g.DrawString($Subline, $sFont, $ivoryBrush, [float](70 * $scale), [float](225 * $scale))

    # Phone Frame / Mockup Body in Center
    $frameWidth = [int]($Width * 0.84)
    $frameHeight = [int]($Height * 0.58)
    $frameX = [int](($Width - $frameWidth) / 2)
    $frameY = [int](310 * $scale)

    $frameBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(11, 20, 36))
    $frameBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(197, 160, 89), [Math]::Max(2.0, 3.0 * $scale))
    $g.FillRectangle($frameBrush, $frameX, $frameY, $frameWidth, $frameHeight)
    $g.DrawRectangle($frameBorder, $frameX, $frameY, $frameWidth, $frameHeight)

    # Dial graphic inside frame
    $dialSize = [int]($frameWidth * 0.76)
    $dialX = [int]($frameX + ($frameWidth - $dialSize) / 2)
    $dialY = [int]($frameY + ($frameHeight - $dialSize) / 2.3)
    $g.DrawImage($srcImg, $dialX, $dialY, $dialSize, $dialSize)

    # Crosshair reticle
    $reticlePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(160, 56, 189, 248), [Math]::Max(1.0, 1.5 * $scale))
    $cx = $dialX + $dialSize / 2
    $cy = $dialY + $dialSize / 2
    $g.DrawLine($reticlePen, [float]($cx - 40 * $scale), [float]$cy, [float]($cx + 40 * $scale), [float]$cy)
    $g.DrawLine($reticlePen, [float]$cx, [float]($cy - 40 * $scale), [float]$cx, [float]($cy + 40 * $scale))

    # Telemetry HUD Card at bottom of frame
    $hudCardBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 8, 17, 30))
    $hudRect = New-Object System.Drawing.Rectangle([int]($frameX + 20 * $scale), [int]($frameY + $frameHeight - 110 * $scale), [int]($frameWidth - 40 * $scale), [int](85 * $scale))
    $g.FillRectangle($hudCardBrush, $hudRect)
    $g.DrawRectangle($ringPen, $hudRect)

    $telFont = New-Object System.Drawing.Font($fontFamily, [int](15 * $scale), [System.Drawing.FontStyle]::Bold)
    $telSubFont = New-Object System.Drawing.Font($fontFamily, [int](12 * $scale), [System.Drawing.FontStyle]::Regular)
    $cyanBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(56, 189, 248))
    $g.DrawString("HEADING: 042° NE", $telFont, $goldBrush, [float]($frameX + 35 * $scale), [float]($frameY + $frameHeight - 95 * $scale))
    $g.DrawString("MIL: 0747 | BACK-AZIMUTH: 222°", $telSubFont, $ivoryBrush, [float]($frameX + 35 * $scale), [float]($frameY + $frameHeight - 65 * $scale))
    $g.DrawString("DECL: +0.8° TRUE", $telFont, $cyanBrush, [float]($frameX + $frameWidth - 190 * $scale), [float]($frameY + $frameHeight - 95 * $scale))

    # Bottom Feature Bullet Pills
    $pillY = [int]($frameY + $frameHeight + 45 * $scale)
    $pillH = [int](55 * $scale)
    $pillFont = New-Object System.Drawing.Font($fontFamily, [int](14 * $scale), [System.Drawing.FontStyle]::Bold)
    $checkBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(34, 197, 94))
    $pillBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(18, 30, 52))

    $features = @($Feature1, $Feature2, $Feature3)
    foreach ($feat in $features) {
        $pRect = New-Object System.Drawing.Rectangle([int](70 * $scale), $pillY, [int]($Width - 140 * $scale), $pillH)
        $g.FillRectangle($pillBg, $pRect)
        $g.DrawRectangle($ringPen, $pRect)
        $g.DrawString("✓", $pillFont, $checkBrush, [float](90 * $scale), [float]($pillY + 12 * $scale))
        $g.DrawString($feat, $pillFont, $ivoryBrush, [float](125 * $scale), [float]($pillY + 12 * $scale))
        $pillY += [int](70 * $scale)
    }

    $g.Dispose()
    $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "[OK] Generated Store Screenshot ($Width x $Height): $OutputPath"
}

# -----------------------------------------------------------------
# 5. Generate 4 Google Play Screenshots (1080 x 1920)
# -----------------------------------------------------------------
Write-Host "`nGenerating Google Play Screenshots (1080x1920)..."

Generate-StoreScreenshot -Width 1080 -Height 1920 `
    -BadgeText "PRECISION NAVIGATION" `
    -Headline "60FPS DAMPED COMPASS" `
    -Subline "Shortest-path interpolation with hardware acceleration." `
    -Feature1 "Hardware-Accelerated Decoupled RAF Animation" `
    -Feature2 "True North vs Magnetic North Live Switcher" `
    -Feature3 "Dual-Axis Pitch & Roll Inclinometer Bubble Level" `
    -OutputPath (Join-Path $storeAssetsDir "screenshot-1-compass-navigation-1080x1920.png")

Generate-StoreScreenshot -Width 1080 -Height 1920 `
    -BadgeText "AUGMENTED REALITY" `
    -Headline "OPTICAL SIGHTING RETICLE" `
    -Subline "Sight distant wilderness landmarks with live heading HUD." `
    -Feature1 "Real-Time Camera Reticle & Horizon Alignment" `
    -Feature2 "Target Bearing Lock & Live Deviation Bar" `
    -Feature3 "Local GPU Processing with Zero Video Uploads" `
    -OutputPath (Join-Path $storeAssetsDir "screenshot-2-ar-sighting-hud-1080x1920.png")

Generate-StoreScreenshot -Width 1080 -Height 1920 `
    -BadgeText "ASTRONOMY & EPHEMERIS" `
    -Headline "SOLAR & LUNAR TRACKING" `
    -Subline "Astronomical ephemeris and virtual sundial shadow." `
    -Feature1 "Real-Time Sun & Moon Azimuth / Elevation" `
    -Feature2 "Sunrise, Solar Noon, Sunset & Daylight Arch" `
    -Feature3 "Virtual Sundial Gnomon with Equation of Time" `
    -OutputPath (Join-Path $storeAssetsDir "screenshot-3-celestial-ephemeris-1080x1920.png")

Generate-StoreScreenshot -Width 1080 -Height 1920 `
    -BadgeText "OUTDOOR EXPEDITION" `
    -Headline "OFFLINE WAYPOINTS & GPX" `
    -Subline "Great-Circle navigation and breadcrumb trail tracker." `
    -Feature1 "Instant 'Find My Camp / Car / Trail' Waypoints" `
    -Feature2 "GPX Trail Breadcrumb Logging & Export" `
    -Feature3 "100% Offline Functionality - Zero Telemetry" `
    -OutputPath (Join-Path $storeAssetsDir "screenshot-4-waypoint-gpx-tracker-1080x1920.png")

# -----------------------------------------------------------------
# 6. Generate 4 Apple App Store Screenshots (1290 x 2796 - iPhone 16 Pro Max)
# -----------------------------------------------------------------
Write-Host "`nGenerating Apple App Store Screenshots (1290x2796)..."

Generate-StoreScreenshot -Width 1290 -Height 2796 `
    -BadgeText "PRECISION NAVIGATION" `
    -Headline "60FPS COMPASS DIAL" `
    -Subline "Shortest-path interpolation with hardware acceleration." `
    -Feature1 "Hardware-Accelerated Decoupled RAF Animation" `
    -Feature2 "True North vs Magnetic North Live Switcher" `
    -Feature3 "Dual-Axis Pitch & Roll Inclinometer Bubble Level" `
    -OutputPath (Join-Path $storeAssetsDir "screenshot-1-compass-navigation-1290x2796.png")

Generate-StoreScreenshot -Width 1290 -Height 2796 `
    -BadgeText "AUGMENTED REALITY" `
    -Headline "OPTICAL SIGHTING HUD" `
    -Subline "Sight distant wilderness landmarks with live heading HUD." `
    -Feature1 "Real-Time Camera Reticle & Horizon Alignment" `
    -Feature2 "Target Bearing Lock & Live Deviation Bar" `
    -Feature3 "Local GPU Processing with Zero Video Uploads" `
    -OutputPath (Join-Path $storeAssetsDir "screenshot-2-ar-sighting-hud-1290x2796.png")

Generate-StoreScreenshot -Width 1290 -Height 2796 `
    -BadgeText "ASTRONOMY & EPHEMERIS" `
    -Headline "SOLAR & LUNAR TRACKING" `
    -Subline "Astronomical ephemeris and virtual sundial shadow." `
    -Feature1 "Real-Time Sun & Moon Azimuth / Elevation" `
    -Feature2 "Sunrise, Solar Noon, Sunset & Daylight Arch" `
    -Feature3 "Virtual Sundial Gnomon with Equation of Time" `
    -OutputPath (Join-Path $storeAssetsDir "screenshot-3-celestial-ephemeris-1290x2796.png")

Generate-StoreScreenshot -Width 1290 -Height 2796 `
    -BadgeText "OUTDOOR EXPEDITION" `
    -Headline "OFFLINE WAYPOINTS & GPX" `
    -Subline "Great-Circle navigation and breadcrumb trail tracker." `
    -Feature1 "Instant 'Find My Camp / Car / Trail' Waypoints" `
    -Feature2 "GPX Trail Breadcrumb Logging & Export" `
    -Feature3 "100% Offline Functionality - Zero Telemetry" `
    -OutputPath (Join-Path $storeAssetsDir "screenshot-4-waypoint-gpx-tracker-1290x2796.png")

$srcImg.Dispose()
Write-Host "`n=========================================================="
Write-Host " ALL STORE ASSETS GENERATED IN: $storeAssetsDir"
Write-Host "=========================================================="
