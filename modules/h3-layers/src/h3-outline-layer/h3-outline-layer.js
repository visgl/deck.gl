import {hexToFeature} from '@uber/geojson2hex';
import ExtrudedChoroplethLayer from './extruded-choropleth-layer';

const SUPERFINE_ORANGE = [202, 50, 39];

/**
 * @classdesc
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
export default class H3OutlineLayer extends ExtrudedChoroplethLayer {
  constructor({
    hexagons = [],
    getHexagonId = null,
    strokeColor = SUPERFINE_ORANGE,
    strokeWidth = 5,
    // fillColor: [128, 128, 128],
    // getColor: undefined,
    // elevation: 0,
    ...props
  } = {}) {
    if (getHexagonId) {
      hexagons = hexagons.map(getHexagonId);
    }

    const features = [hexToFeature(hexagons)];

    // ExtrudedChoroplethLayer expects coords to be wrapped in a GeoJSON object
    const data = {
      type: 'FeatureCollection',
      features
    };

    super({
      data,
      hexagons,
      getHexagonId,
      strokeColor,
      strokeWidth,
      ...props
    });
  }
}

H3OutlineLayer.displayName = 'H3OutlineLayer';
H3OutlineLayer.layerName = 'H3OutlineLayer';
