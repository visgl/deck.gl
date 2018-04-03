/**
 * Stand-in mapbox import for the bundled version
 * Inserted by webpack at `require('mapbox-gl')`
 * Only acquire window.mapboxgl at runtime so that the bundle is insensitive
 * to <script> tag orders
 *   - mapboxgl.supported()
 *   - mapboxgl.version
 *   - mapboxgl.Map()
 *   - mapboxgl.accessToken
 */
let mapboxProxy = null;

/* global window */
if (typeof window !== undefined) {
  const getMapboxgl = () => {
    if (!window.mapboxgl) {
      throw new Error('Mapbox not supported');
    }
    return window.mapboxgl;
  };

  mapboxProxy = {
    get supported() {
      return getMapboxgl().supported;
    },
    get version() {
      return getMapboxgl().version;
    },
    get Map() {
      return getMapboxgl().Map;
    },
    set accessToken(token) {
      getMapboxgl().accessToken = token;
    }
  };
}

module.exports = mapboxProxy;
