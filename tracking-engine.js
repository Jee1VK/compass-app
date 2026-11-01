// tracking-engine.js
// GPS Breadcrumb Trail Recorder, Trip Telemetry, Backtrack Navigator & GPX 1.1 Engine
// Part of Kuberan Compass App v5.0.0

(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TrackingEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  const STORAGE_KEY = 'kuberan-active-track';
  const MIN_DELTA_METERS = 2.5; // ignore GPS jitter under 2.5m

  let isRecordingState = false;
  let trackPoints = [];
  let totalDistanceMeters = 0;
  let startTime = null;

  // Helper: Haversine distance in meters
  function haversineMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = Math.PI / 180;
    const dLat = (lat2 - lat1) * toRad;
    const dLon = (lon2 - lon1) * toRad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Helper: Forward azimuth / initial bearing in degrees (0 - 359.9)
  function forwardBearing(lat1, lon1, lat2, lon2) {
    const toRad = Math.PI / 180;
    const toDeg = 180 / Math.PI;
    const phi1 = lat1 * toRad;
    const phi2 = lat2 * toRad;
    const dLambda = (lon2 - lon1) * toRad;
    const y = Math.sin(dLambda) * Math.cos(phi2);
    const x = Math.cos(phi1) * Math.sin(phi2) -
              Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);
    const theta = Math.atan2(y, x);
    return (theta * toDeg + 360) % 360;
  }

  function reset() {
    isRecordingState = false;
    trackPoints = [];
    totalDistanceMeters = 0;
    startTime = null;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {}
  }

  function startRecording() {
    isRecordingState = true;
    trackPoints = [];
    totalDistanceMeters = 0;
    startTime = Date.now();
    saveToStorage();
  }

  function stopRecording() {
    const wasRec = isRecordingState;
    isRecordingState = false;
    const endTime = Date.now();
    const durationMs = startTime ? (endTime - startTime) : 0;
    const hours = durationMs / 3600000;
    const km = totalDistanceMeters / 1000;
    const avgSpeedKmh = hours > 0 ? (km / hours) : 0;

    const summary = {
      pointCount: trackPoints.length,
      totalDistanceMeters,
      durationMs,
      startTime,
      endTime,
      avgSpeedKmh
    };

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {}

    return summary;
  }

  function isRecording() {
    return isRecordingState;
  }

  function addBreadcrumb(lat, lon, ele = 0, time = Date.now(), speed = 0) {
    if (!isRecordingState) {
      return { added: false, reason: 'not_recording' };
    }

    if (trackPoints.length > 0) {
      const last = trackPoints[trackPoints.length - 1];
      const delta = haversineMeters(last.lat, last.lon, lat, lon);
      if (delta < MIN_DELTA_METERS) {
        return { added: false, reason: 'jitter_filtered', delta };
      }
      totalDistanceMeters += delta;
    }

    const point = {
      lat: Number(lat),
      lon: Number(lon),
      ele: Number(ele || 0),
      time: typeof time === 'number' ? time : Date.now(),
      speed: Number(speed || 0)
    };

    trackPoints.push(point);
    saveToStorage();

    return {
      added: true,
      point,
      totalDistance: totalDistanceMeters,
      totalDuration: startTime ? (Date.now() - startTime) : 0
    };
  }

  function getTrackPoints() {
    return [...trackPoints];
  }

  function getTotalDistanceMeters() {
    return totalDistanceMeters;
  }

  function computeBacktrack(currentLat, currentLon) {
    if (trackPoints.length === 0) return null;
    // Origin is the starting point
    const origin = trackPoints[0];
    const bearing = forwardBearing(currentLat, currentLon, origin.lat, origin.lon);
    const distance = haversineMeters(currentLat, currentLon, origin.lat, origin.lon);

    return {
      bearing,
      distance,
      targetPoint: origin
    };
  }

  function saveToStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          isRecordingState,
          startTime,
          totalDistanceMeters,
          trackPoints
        }));
      }
    } catch (e) {}
  }

  function restoreFromStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          isRecordingState = !!data.isRecordingState;
          startTime = data.startTime || Date.now();
          totalDistanceMeters = data.totalDistanceMeters || 0;
          trackPoints = Array.isArray(data.trackPoints) ? data.trackPoints : [];
          return true;
        }
      }
    } catch (e) {}
    return false;
  }

  // Generate standard GPX 1.1 XML string
  function exportGPX(trackName = 'Compass Track', waypoints = []) {
    const creator = 'Kuberan Compass PWA v5.0.0 (https://kuberansilks.com/)';
    const isoTime = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<gpx version="1.1" creator="${creator}" xmlns="http://www.topografix.com/GPX/1/1">\n`;
    xml += `  <metadata>\n`;
    xml += `    <name>${escapeXml(trackName)}</name>\n`;
    xml += `    <time>${isoTime}</time>\n`;
    xml += `  </metadata>\n`;

    // Add waypoints
    if (Array.isArray(waypoints)) {
      for (const wpt of waypoints) {
        xml += `  <wpt lat="${wpt.lat}" lon="${wpt.lon}">\n`;
        if (wpt.ele !== undefined) xml += `    <ele>${wpt.ele}</ele>\n`;
        xml += `    <name>${escapeXml(wpt.name || 'Waypoint')}</name>\n`;
        if (wpt.icon) xml += `    <sym>${escapeXml(wpt.icon)}</sym>\n`;
        xml += `  </wpt>\n`;
      }
    }

    // Add track
    xml += `  <trk>\n`;
    xml += `    <name>${escapeXml(trackName)}</name>\n`;
    xml += `    <trkseg>\n`;
    for (const pt of trackPoints) {
      xml += `      <trkpt lat="${pt.lat}" lon="${pt.lon}">\n`;
      if (pt.ele !== undefined) xml += `        <ele>${pt.ele}</ele>\n`;
      if (pt.time) {
        const ptIso = new Date(pt.time).toISOString();
        xml += `        <time>${ptIso}</time>\n`;
      }
      xml += `      </trkpt>\n`;
    }
    xml += `    </trkseg>\n`;
    xml += `  </trk>\n`;
    xml += `</gpx>`;

    return xml;
  }

  // Parse GPX 1.1 XML (works in Node.js and Browser)
  function parseGPX(gpxXmlString) {
    const result = {
      trackName: 'Imported Track',
      waypoints: [],
      trackPoints: []
    };

    if (!gpxXmlString || typeof gpxXmlString !== 'string') return result;

    // Extract Track Name
    const nameMatch = gpxXmlString.match(/<trk>[^]*?<name>(.*?)<\/name>/i) ||
                      gpxXmlString.match(/<metadata>[^]*?<name>(.*?)<\/name>/i);
    if (nameMatch && nameMatch[1]) {
      result.trackName = unescapeXml(nameMatch[1].trim());
    }

    // Extract Waypoints <wpt lat="..." lon="...">...<name>...</name>
    const wptRegex = /<wpt\s+[^>]*lat=["']([^"']+)["'][^>]*lon=["']([^"']+)["'][^>]*>([\s\S]*?)<\/wpt>/gi;
    let match;
    while ((match = wptRegex.exec(gpxXmlString)) !== null) {
      const lat = parseFloat(match[1]);
      const lon = parseFloat(match[2]);
      const body = match[3];
      const nameM = body.match(/<name>(.*?)<\/name>/i);
      const eleM = body.match(/<ele>(.*?)<\/ele>/i);
      const symM = body.match(/<sym>(.*?)<\/sym>/i);

      result.waypoints.push({
        id: 'wpt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        lat,
        lon,
        name: nameM ? unescapeXml(nameM[1].trim()) : 'Imported Waypoint',
        ele: eleM ? parseFloat(eleM[1]) : 0,
        icon: symM ? unescapeXml(symM[1].trim()) : '📍',
        createdAt: Date.now()
      });
    }

    // Extract Trackpoints <trkpt lat="..." lon="...">...<ele>...</ele><time>...</time>
    const trkptRegex = /<trkpt\s+[^>]*lat=["']([^"']+)["'][^>]*lon=["']([^"']+)["'][^>]*>([\s\S]*?)<\/trkpt>/gi;
    while ((match = trkptRegex.exec(gpxXmlString)) !== null) {
      const lat = parseFloat(match[1]);
      const lon = parseFloat(match[2]);
      const body = match[3];
      const eleM = body.match(/<ele>(.*?)<\/ele>/i);
      const timeM = body.match(/<time>(.*?)<\/time>/i);

      result.trackPoints.push({
        lat,
        lon,
        ele: eleM ? parseFloat(eleM[1]) : 0,
        time: timeM ? new Date(timeM[1].trim()).getTime() : Date.now()
      });
    }

    return result;
  }

  function escapeXml(unsafe) {
    return String(unsafe).replace(/[<>&'"]/g, c => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
    });
  }

  function unescapeXml(str) {
    return str
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&apos;/g, '\'')
      .replace(/&quot;/g, '"');
  }

  return {
    reset,
    startRecording,
    stopRecording,
    isRecording,
    addBreadcrumb,
    getTrackPoints,
    getTotalDistanceMeters,
    computeBacktrack,
    exportGPX,
    parseGPX,
    restoreFromStorage
  };
});
