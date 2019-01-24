import * as h3 from '@uber/h3-transitional';
import {hexToFeature} from '@uber/geojson2hex';
import ExtrudedChoroplethLayer from './extruded-choropleth-layer';

const SUPERFINE_ORANGE = [202, 50, 39];

/**
 * A subclass of HexagonLayer that uses H3 hexagonIds in data objects
 * rather than centroid lat/longs. The shape of each hexagon is determined
 * based on a single "center" hexagon, which can be selected by passing in
 * a center lat/lon pair. If not provided, the map center will be used.
 *
 * Also sets the `hexagonId` field in the onHover/onClick callback's info
 * objects. Since this is calculated using math, hexagonId will be present
 * even when no corresponding hexagon is in the data set. You can check
 * index !== -1 to see if picking matches an actual object.
 *
 * @class
 * @param {number} props.getHexagonId= - accessor, gets hexagonId from the
 *    data objects. Defaults to `object.hexagonId`
 * @param {number} [props.centerHexLat] Latitude of the center hexagon
 * @param {number} [props.centerHexLon] Longitude of the center hexagon
 */
export default class H3RingLayer extends ExtrudedChoroplethLayer {
  constructor({
    hexagonId,
    radius = 0,
    strokeColor = SUPERFINE_ORANGE,
    strokeWidth = 5,
    ...props
  } = {}) {
    let features = [];

    if (hexagonId) {
      // TODO: Implement faster kRingToGeofence algo in h3-transitional
      const hexagons = h3.kRing(hexagonId, radius);
      features = [hexToFeature(hexagons)];
    }

    // ExtrudedChoroplethLayer expects coords to be wrapped in a GeoJSON object
    const data = {
      type: 'FeatureCollection',
      features
    };

    super({
      // For debugging only, already used
      hexagonId,
      radius,

      data,
      strokeColor,
      strokeWidth,
      ...props
    });
  }
}

H3RingLayer.layerName = 'H3RingLayer';
