// mapbox-gl limits

export default {
  minZoom: 0,
  maxZoom: 20, // Note: Actual limit is 40 but depends on tile source
  minPitch: 0,
  maxPitch: 60,
  maxLatitude: 85.05113, // latitude which corresponds to a projected square
  minLatitude: -85.05113
};
