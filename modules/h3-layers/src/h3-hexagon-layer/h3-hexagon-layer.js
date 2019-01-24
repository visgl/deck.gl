import * as h3 from '@uber/h3-transitional';
import EnhancedHexagonLayer from './enhanced-hexagon-layer';

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
export default class H3HexagonLayer extends EnhancedHexagonLayer {
  constructor({
    getHexagonId = x => x.hexagonId,
    centerHexLat,
    centerHexLon,
    h3Version = h3.V0,
    // TODO: We should be able to get this from the input data once the
    // h3GetResolution function is exposed in @uber/h3-transitional
    h3Resolution: resolution = h3.DEFAULT_RESOLUTION,
    data,
    onHover,
    onClick,
    ...props
  } = {}) {
    // Calculate hex vertices for the hex at the center of the map
    let {latitude: lat, longitude: lon} = props;
    // Allow explicit center to override
    if (centerHexLat && centerHexLon) {
      lat = centerHexLat;
      lon = centerHexLon;
    }
    // If hexagons are available, duck-type version
    if (data) {
      const datum = data.first ? data.first() : data[0];
      if (datum) {
        h3Version = h3.h3Version(getHexagonId(datum));
      }
    }
    // Get h3 geometry
    const centerHex = h3.geoToH3(lat, lon, {version: h3Version, resolution});
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

    super({
      hexagonVertices,
      hexagonCenter,
      getCentroid,
      h3Version,
      data,
      onHover: onHover && onHoverHandler,
      onClick: onClick && onClickHandler,
      ...props
    });
  }
}

H3HexagonLayer.layerName = 'H3HexagonLayer';
