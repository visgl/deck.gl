import * as h3 from 'h3-js';
import {CompositeLayer} from '@deck.gl/core';
import EnhancedHexagonLayer from '../enhanced-hexagon-layer/enhanced-hexagon-layer';

/**
 * Add hexagonId to a hover or click payload
 * @param  {Object} info Event payload
 * @param {Number} version H3 version to use
 * @param {Number} resolution H3 resolution to use
 * @return {Object} Payload, updated in place
 */
function appendHexagonId(info, version, resolution) {
  const [lng, lat] = info.lngLat;
  info.hexagonId = h3.geoToH3(lat, lng, {version, resolution});
  return info;
}

/* @param {number} props.getHexagonId= - accessor, gets hexagonId from the
 *    data objects. Defaults to `object.hexagonId`
 * @param {number} [props.centerHexLat] Latitude of the center hexagon
 * @param {number} [props.centerHexLon] Longitude of the center hexagon
 */
const defaultProps = {
  getHexagonId: x => x.hexagonId,
  h3Version: h3.V0,
  // TODO: We should be able to get this from the input data once the
  // h3GetResolution function is exposed in @uber/h3-transitional
  h3Resolution: h3.DEFAULT_RESOLUTION
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
export default class H3HexagonLayer extends CompositeLayer {
  initializeState() {
    const {
      getHexagonId,
      centerHexLat,
      centerHexLon,
      // TODO: We should be able to get version/resolution from the input data once the
      // h3GetResolution function is exposed in @uber/h3-transitional
      h3Resolution,
      h3Version,
      data,
      onHover,
      onClick
    } = this.props;

    // Calculate hex vertices for the hex at the center of the map
    let {latitude: lat, longitude: lon} = this.props;
    // Allow explicit center to override
    if (centerHexLat && centerHexLon) {
      lat = centerHexLat;
      lon = centerHexLon;
    }

    const resolution = h3Resolution;
    let version = h3Version;
    // If hexagons are available, duck-type version
    if (data) {
      const datum = data.first ? data.first() : data[0];
      if (datum) {
        version = h3.h3Version(getHexagonId(datum));
      }
    }
    // Get h3 geometry
    const centerHex = h3.geoToH3(lat, lon, {version, resolution});
    const hexagonVertices = h3.h3ToGeoBoundary(centerHex);
    const hexagonCenter = h3.h3ToGeo(centerHex);

    function getCentroid(hexagon) {
      return h3.h3ToGeo(getHexagonId(hexagon));
    }

    function onHoverHandler(info) {
      onHover(appendHexagonId(info, h3Version, resolution));
    }

    function onClickHandler(info) {
      onClick(appendHexagonId(info, h3Version, resolution));
    }

    this.state = {
      hexagonVertices,
      hexagonCenter,
      getCentroid,
      h3Version,
      data,
      onHover: onHover && onHoverHandler,
      onClick: onClick && onClickHandler
    };
  }

  renderSublayers() {
    const {
      hexagonVertices,
      hexagonCenter,
      getCentroid,
      h3Version,
      data,
      onHover,
      onClick
    } = this.props;

    return new EnhancedHexagonLayer({
      hexagonVertices,
      hexagonCenter,
      getCentroid,
      h3Version,
      data,
      onHover,
      onClick
    });
  }
}

H3HexagonLayer.defaultProps = defaultProps;
H3HexagonLayer.layerName = 'H3HexagonLayer';
