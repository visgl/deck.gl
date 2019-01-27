import {h3SetToFeature} from 'geojson2h3';
import {CompositeLayer} from '@deck.gl/core';
import ExtrudedChoroplethLayer from '../extruded-choropleth-layer/extruded-choropleth-layer';

const SUPERFINE_ORANGE = [202, 50, 39];

/* @class
 * @param {number} props.getHexagonId= - accessor, gets hexagonId from the
 *    data objects. Defaults to `object.hexagonId`
 * @param {number} [props.centerHexLat] Latitude of the center hexagon
 * @param {number} [props.centerHexLon] Longitude of the center hexagon
 */
const defaultProps = {
  hexagons: [],
  getHexagonId: null,
  strokeColor: SUPERFINE_ORANGE,
  strokeWidth: 5,
  // fillColor: [128, 128, 128],
  // getColor: undefined,
  // elevation: 0,
  hexToFeature: h3SetToFeature // injection mechanism for alternate H3 librart
};

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
 */
export default class H3OutlineLayer extends CompositeLayer {
  initializeState() {
    const {getHexagonId, hexToFeature} = this.props;

    let {hexagons} = this.props;
    if (getHexagonId) {
      hexagons = hexagons.map(getHexagonId);
    }

    // ExtrudedChoroplethLayer expects coords to in GeoJSON format
    const geoJsonOutline = {
      type: 'FeatureCollection',
      features: [hexToFeature(hexagons)]
    };

    this.state = {
      geoJsonOutline
    };
  }

  renderSubLayers() {
    const {geoJsonOutline} = this.state;
    const {strokeColor, strokeWidth} = this.props;

    return new ExtrudedChoroplethLayer({
      data: geoJsonOutline,
      strokeColor,
      strokeWidth
    });
  }
}

H3OutlineLayer.defaultProps = defaultProps;
H3OutlineLayer.layerName = 'H3OutlineLayer';
