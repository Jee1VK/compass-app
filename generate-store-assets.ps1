Add-Type -AssemblyName System.Drawing

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$storeDir = Join-Path $rootDir "assets\store"
if (-not (Test-Path $storeDir)) {
    New-Item -ItemType Directory -Path $storeDir -Force | Out-Null
}

$icon512Path = Join-Path $rootDir "icon-512.png"

# 1. Google Play Icon (512x512 32-bit PNG)
$playIconPath = Join-Path $storeDir "icon-play-512x512.png"
Copy-Item -Path $icon512Path -Destination $playIconPath -Force
Write-Host "[OK] Generated Google Play Store Icon (512x512): $playIconPath"

# 2. Apple App Store Icon (1024x1024 24-bit Opaque RGB - NO ALPHA)
$iosIconPath = Join-Path $storeDir "icon-ios-1024x1024.png"
$srcImg = [System.Drawing.Image]::FromFile($icon512Path)

$iosBmp = New-Object System.Drawing.Bitmap(1024, 1024, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g = [System.Drawing.Graphics]::FromImage($iosBmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

# Fill solid opaque dark navy background (#08111e)
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(8, 17, 30))
$g.FillRectangle($bgBrush, 0, 0, 1024, 1024)

# Draw decorative celestial navigation concentric rings in gold (#C5A059)
$goldPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40, 197, 160, 89), 2)
$g.DrawEllipse($goldPen, 32, 32, 960, 960)
$g.DrawEllipse($goldPen, 64, 64, 896, 896)
$g.DrawEllipse($goldPen, 112, 112, 800, 800)

# Draw compass emblem centered (860x860)
$destRect = New-Object System.Drawing.Rectangle(82, 82, 860, 860)
$g.DrawImage($srcImg, $destRect)

$g.Dispose()
$iosBmp.Save($iosIconPath, [System.Drawing.Imaging.ImageFormat]::Png)
$iosBmp.Dispose()
Write-Host "[OK] Generated Apple App Store Icon (1024x1024 24-bit Opaque RGB): $iosIconPath"

# 3. Google Play Feature Graphic (1024x500 24-bit RGB)
$featureGraphicPath = Join-Path $storeDir "feature-graphic-1024x500.png"
$featBmp = New-Object System.Drawing.Bitmap(1024, 500, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$gFeat = [System.Drawing.Graphics]::FromImage($featBmp)
$gFeat.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gFeat.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gFeat.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# Gradient background from #08111e to #13213c
$gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)),
    (New-Object System.Drawing.Point(1024, 500)),
    [System.Drawing.Color]::FromArgb(8, 17, 30),
    [System.Drawing.Color]::FromArgb(19, 33, 60)
)
$gFeat.FillRectangle($gradBrush, 0, 0, 1024, 500)

# Decorative coordinate grid lines
$gridPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(25, 197, 160, 89), 1)
for ($x = 50; $x -lt 1024; $x += 60) {
    $gFeat.DrawLine($gridPen, $x, 0, $x, 500)
}
for ($y = 50; $y -lt 500; $y += 60) {
    $gFeat.DrawLine($gridPen, 0, $y, 1024, $y)
}

# Draw compass dial graphic on the right
$compassDest = New-Object System.Drawing.Rectangle(560, 30, 440, 440)
$gFeat.DrawImage($srcImg, $compassDest)

# Draw Typography on the left
$fontFamily = [System.Drawing.FontFamily]::GenericSansSerif
$titleFont = New-Object System.Drawing.Font($fontFamily, 34, [System.Drawing.FontStyle]::Bold)
$subFont = New-Object System.Drawing.Font($fontFamily, 15, [System.Drawing.FontStyle]::Bold)
$badgeFont = New-Object System.Drawing.Font($fontFamily, 11, [System.Drawing.FontStyle]::Regular)
$brandFont = New-Object System.Drawing.Font($fontFamily, 12, [System.Drawing.FontStyle]::Italic)

$goldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(197, 160, 89))
$ivoryBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 250, 247))
$dimBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 195, 215))
$badgeBgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(107, 29, 47))

# Title
$gFeat.DrawString("KUBERAN COMPASS", $titleFont, $goldBrush, 45, 95)
# Subtitle
$gFeat.DrawString("WILDERNESS & CELESTIAL NAVIGATION", $subFont, $ivoryBrush, 48, 155)

# Badges
$gFeat.FillRectangle($badgeBgBrush, 48, 205, 175, 32)
$gFeat.DrawString("AR SIGHTING HUD", $badgeFont, $ivoryBrush, 62, 212)

$gFeat.FillRectangle($badgeBgBrush, 235, 205, 185, 32)
$gFeat.DrawString("GPX TRAIL TRACKER", $badgeFont, $ivoryBrush, 247, 212)

$gFeat.FillRectangle($badgeBgBrush, 48, 248, 175, 32)
$gFeat.DrawString("SOLAR EPHEMERIS", $badgeFont, $ivoryBrush, 60, 255)

$gFeat.FillRectangle($badgeBgBrush, 235, 248, 185, 32)
$gFeat.DrawString("100% OFFLINE READY", $badgeFont, $ivoryBrush, 247, 255)

# Value Proposition line
$gFeat.DrawString("Auxiliary Lensatic Reticle | Inclinometer | Waypoint Memory", $badgeFont, $dimBrush, 48, 320)

# Brand Heritage
$gFeat.DrawString("Official Edition | Kuberan Silks Chickpet, Bengaluru", $brandFont, $goldBrush, 48, 415)

$srcImg.Dispose()
$gFeat.Dispose()
$featBmp.Save($featureGraphicPath, [System.Drawing.Imaging.ImageFormat]::Png)
$featBmp.Dispose()
Write-Host "[OK] Generated Google Play Feature Graphic (1024x500): $featureGraphicPath"

