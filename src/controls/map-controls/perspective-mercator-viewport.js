// View and Projection Matrix calculations for mapbox-js style map view properties
import {WebMercatorViewport} from 'deck.gl';

/* eslint-disable camelcase */
import vec2_add from 'gl-vec2/add';
import vec2_negate from 'gl-vec2/negate';

export default class PerspectiveMercatorViewport extends WebMercatorViewport {
  /**
   * Get the map center that place a given [lng, lat] coordinate at screen
   * point [x, y]
   *
   * @param {Array} lngLat - [lng,lat] coordinates
   *   Specifies a point on the sphere.
   * @param {Array} pos - [x,y] coordinates
   *   Specifies a point on the screen.
   * @return {Array} [lng,lat] new map center.
   */
  getLocationAtPoint({lngLat, pos}) {
    const fromLocation = this.projectFlat(this.unproject(pos));
    const toLocation = this.projectFlat(lngLat);

    const center = this.projectFlat([this.longitude, this.latitude]);

    const translate = vec2_add([], toLocation, vec2_negate([], fromLocation));
    const newCenter = vec2_add([], center, translate);
    return this.unprojectFlat(newCenter);
  }

  /**
   * Returns a new viewport that fit around the given rectangle.
   * Only supports non-perspective mode.
   * @param {Array} bounds - [[lon, lat], [lon, lat]]
   * @param {Number} [options.padding] - The amount of padding in pixels to add to the given bounds.
   * @param {Array} [options.offset] - The center of the given bounds relative to the map's center,
   *    [x, y] measured in pixels.
   * @returns {WebMercatorViewport}
   */
  fitBounds(bounds, options = {}) {
    const {width, height} = this;
    const {longitude, latitude, zoom} = fitBounds(Object.assign({width, height, bounds}, options));
    return new PerspectiveMercatorViewport({width, height, longitude, latitude, zoom});
  }
}

/**
 * Returns map settings {latitude, longitude, zoom}
 * that will contain the provided corners within the provided width.
 * Only supports non-perspective mode.
 * @param {Number} width - viewport width
 * @param {Number} height - viewport height
 * @param {Array} bounds - [[lon, lat], [lon, lat]]
 * @param {Number} [padding] - The amount of padding in pixels to add to the given bounds.
 * @param {Array} [offset] - The center of the given bounds relative to the map's center,
 *    [x, y] measured in pixels.
 * @returns {Object} - latitude, longitude and zoom
 */
export function fitBounds({
  width,
  height,
  bounds,
  // options
  padding = 0,
  offset = [0, 0]
}) {
  const [[west, south], [east, north]] = bounds;

  const viewport = new WebMercatorViewport({
    width,
    height,
    longitude: 0,
    latitude: 0,
    zoom: 0
  });

  const nw = viewport.project([west, north]);
  const se = viewport.project([east, south]);
  const size = [
    Math.abs(se[0] - nw[0]),
    Math.abs(se[1] - nw[1])
  ];
  const center = [
    (se[0] + nw[0]) / 2,
    (se[1] + nw[1]) / 2
  ];

  const scaleX = (width - padding * 2 - Math.abs(offset[0]) * 2) / size[0];
  const scaleY = (height - padding * 2 - Math.abs(offset[1]) * 2) / size[1];

  const centerLngLat = viewport.unproject(center);
  const zoom = viewport.zoom + Math.log2(Math.abs(Math.min(scaleX, scaleY)));

  return {
    longitude: centerLngLat[0],
    latitude: centerLngLat[1],
    zoom
  };
}
