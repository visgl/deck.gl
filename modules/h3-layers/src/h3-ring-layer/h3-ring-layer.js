import {h3SetToFeature} from 'geojson2h3';
import * as h3 from 'h3-js';

import {CompositeLayer} from '@deck.gl/core';
import ExtrudedChoroplethLayer from '../extruded-choropleth-layer/extruded-choropleth-layer';

const SUPERFINE_ORANGE = [202, 50, 39];

/* @param {number} props.getHexagonId= - accessor, gets hexagonId from the
 *    data objects. Defaults to `object.hexagonId`
 * @param {number} [props.centerHexLat] Latitude of the center hexagon
 * @param {number} [props.centerHexLon] Longitude of the center hexagon
 */
const defaultProps = {
  radius: 0,
  strokeColor: SUPERFINE_ORANGE,
  strokeWidth: 5,
  hexToFeature: h3SetToFeature
};

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
 */
export default class H3RingLayer extends CompositeLayer {
  initializeState() {
    const {hexagonId, radius, hexToFeature} = this.props;

    // Calculate a GeoJSON polygon "feature" from the hex ids
    let features = [];

    if (hexagonId) {
      // TODO: Implement faster kRingToGeofence algo in h3-transitional
      const hexagons = h3.kRing(hexagonId, radius);
      features = [hexToFeature(hexagons)];
    }

    // ExtrudedChoroplethLayer expects coords to be wrapped in a GeoJSON object
    this.state = {
      geoJsonRing: {
        type: 'FeatureCollection',
        features
      }
    };
  }

  renderSubLayers() {
    const {strokeColor, strokeWidth} = this.props;
    const {geoJsonRing} = this.state;

    return new ExtrudedChoroplethLayer({
      // For debugging only, already used
      data: geoJsonRing,
      strokeColor,
      strokeWidth
    });
  }
}

H3RingLayer.defaultProps = defaultProps;
H3RingLayer.layerName = 'H3RingLayer';
