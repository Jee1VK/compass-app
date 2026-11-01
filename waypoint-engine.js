/*! KUBERAN Compass - Waypoint Navigation Engine v1.0
 *  100% Offline Great-Circle Forward Azimuth, Haversine Distance, and LocalStorage persistence.
 *  Zero external dependencies.
 */
(function (root) {
  'use strict';

  var D2R = Math.PI / 180;
  var R2D = 180 / Math.PI;
  var EARTH_RADIUS_METERS = 6371000; // WGS84 mean earth radius
  var STORAGE_KEY = 'kuberan-waypoints-v1';
  var ACTIVE_ID_KEY = 'kuberan-active-waypoint-id';

  function norm360(deg) {
    return ((deg % 360) + 360) % 360;
  }

  /* -------------------------------------------------------------------------
   * Great-Circle Forward Azimuth & Haversine Distance Math
   * ------------------------------------------------------------------------- */
  function calculateBearing(lat1, lng1, lat2, lng2) {
    var phi1 = lat1 * D2R;
    var phi2 = lat2 * D2R;
    var deltaLambda = (lng2 - lng1) * D2R;

    var y = Math.sin(deltaLambda) * Math.cos(phi2);
    var x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

    var bearing = Math.atan2(y, x) * R2D;
    return norm360(bearing);
  }

  function calculateDistance(lat1, lng1, lat2, lng2) {
    var phi1 = lat1 * D2R;
    var phi2 = lat2 * D2R;
    var deltaPhi = (lat2 - lat1) * D2R;
    var deltaLambda = (lng2 - lng1) * D2R;

    var a = Math.sin(deltaPhi / 2.0) * Math.sin(deltaPhi / 2.0) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2.0) * Math.sin(deltaLambda / 2.0);

    var c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
    return EARTH_RADIUS_METERS * c; // meters
  }

  function formatDistance(distanceMeters) {
    if (distanceMeters == null || isNaN(distanceMeters)) return '-- m';
    if (distanceMeters < 1000) {
      return Math.round(distanceMeters) + ' m';
    }
    var km = distanceMeters / 1000.0;
    return (km < 10 ? km.toFixed(2) : km.toFixed(1)) + ' km';
  }

  function calculateRelativeAngle(currentHeading, targetBearing) {
    // Returns angle -180..180 relative to current heading
    // negative = turn left, positive = turn right
    return ((targetBearing - currentHeading + 540) % 360) - 180;
  }

  /* -------------------------------------------------------------------------
   * Persistent Waypoint Storage Layer
   * ------------------------------------------------------------------------- */
  var memoryStorage = {};

  function getStorage() {
    try {
      if (root.localStorage) return root.localStorage;
    } catch(e) {}
    return {
      getItem: function(k) { return memoryStorage[k] || null; },
      setItem: function(k, v) { memoryStorage[k] = v.toString(); },
      removeItem: function(k) { delete memoryStorage[k]; }
    };
  }

  function getWaypoints() {
    var storage = getStorage();
    try {
      var raw = storage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveWaypointsList(list) {
    var storage = getStorage();
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      return false;
    }
  }

  function addWaypoint(name, lat, lng, alt, icon) {
    var waypoints = getWaypoints();
    var item = {
      id: 'wp_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: (name || 'Marked Location').trim(),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      alt: (alt != null && !isNaN(alt)) ? Math.round(alt) : null,
      icon: icon || '📍',
      timestamp: Date.now()
    };
    waypoints.unshift(item); // Most recent first
    saveWaypointsList(waypoints);
    setActiveWaypoint(item.id);
    return item;
  }

  function deleteWaypoint(id) {
    var waypoints = getWaypoints().filter(function (w) { return w.id !== id; });
    saveWaypointsList(waypoints);
    if (getActiveWaypointId() === id) {
      clearActiveWaypoint();
    }
    return waypoints;
  }

  function getActiveWaypointId() {
    var storage = getStorage();
    return storage.getItem(ACTIVE_ID_KEY) || null;
  }

  function setActiveWaypoint(id) {
    var storage = getStorage();
    storage.setItem(ACTIVE_ID_KEY, id);
  }

  function clearActiveWaypoint() {
    var storage = getStorage();
    storage.removeItem(ACTIVE_ID_KEY);
  }

  function getActiveWaypoint() {
    var id = getActiveWaypointId();
    if (!id) return null;
    var waypoints = getWaypoints();
    for (var i = 0; i < waypoints.length; i++) {
      if (waypoints[i].id === id) return waypoints[i];
    }
    return null;
  }

  /* -------------------------------------------------------------------------
   * Export API
   * ------------------------------------------------------------------------- */
  var api = {
    calculateBearing: calculateBearing,
    calculateDistance: calculateDistance,
    formatDistance: formatDistance,
    calculateRelativeAngle: calculateRelativeAngle,
    getWaypoints: getWaypoints,
    addWaypoint: addWaypoint,
    deleteWaypoint: deleteWaypoint,
    getActiveWaypoint: getActiveWaypoint,
    getActiveWaypointId: getActiveWaypointId,
    setActiveWaypoint: setActiveWaypoint,
    clearActiveWaypoint: clearActiveWaypoint
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.WaypointEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
