let __ssr_safe__mapboxgl;

// From https://github.com/mapbox/mapbox-gl-js/issues/4593#issuecomment-546290823
// eslint-disable-next-line no-undef
if (process.browser) {
  __ssr_safe__mapboxgl = require('mapbox-gl');
}

module.exports = __ssr_safe__mapboxgl;
