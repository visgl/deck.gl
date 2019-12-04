let mapboxgl;

// From https://github.com/mapbox/mapbox-gl-js/issues/4593#issuecomment-546290823
// eslint-disable-next-line no-undef
if (process.browser) {
  mapboxgl = require('mapbox-gl');
}

export default mapboxgl;
