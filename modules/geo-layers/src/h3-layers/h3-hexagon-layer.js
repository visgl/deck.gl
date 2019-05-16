import {
  h3ToGeoBoundary,
  h3GetResolution,
  h3ToGeo,
  geoToH3,
  h3IsPentagon,
  h3Distance,
  edgeLength,
  UNITS
} from 'h3-js';
import {CompositeLayer, createIterable} from '@deck.gl/core';
import {ColumnLayer, PolygonLayer} from '@deck.gl/layers';

// There is a cost to updating the instanced geometries when using highPrecision: false
// This constant defines the distance between two hexagons that leads to "significant
// distortion." Smaller value makes the column layer more sensitive to viewport change.
const UPDATE_THRESHOLD = 10000; // 10km

function getHexagonCentroid(getHexagon, object, objectInfo) {
  const hexagonId = getHexagon(object, objectInfo);
  const [lat, lng] = h3ToGeo(hexagonId);
  return [lng, lat];
}

const defaultProps = Object.assign({}, PolygonLayer.defaultProps, {
  highPrecision: false,
  coverage: {type: 'number', min: 0, max: 1, value: 1},
  getHexagon: {type: 'accessor', value: x => x.hexagon},
  extruded: true,
  getColor: null
});

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
  shouldUpdateState({changeFlags}) {
    return this._shouldUseHighPrecision()
      ? changeFlags.propsOrDataChanged
      : changeFlags.somethingChanged;
  }

  updateState({props, oldProps, changeFlags}) {
    if (
      changeFlags.dataChanged ||
      (changeFlags.updateTriggers && changeFlags.updateTriggers.getHexagon)
    ) {
      let resolution = -1;
      let hasPentagon = false;
      const {iterable, objectInfo} = createIterable(props.data);
      for (const object of iterable) {
        objectInfo.index++;
        const hexId = props.getHexagon(object, objectInfo);
        // Take the resolution of the first hex
        resolution = resolution < 0 ? h3GetResolution(hexId) : resolution;
        if (h3IsPentagon(hexId)) {
          hasPentagon = true;
          break;
        }
      }
      this.setState({
        resolution,
        meanEdgeLength: resolution >= 0 ? edgeLength(resolution, UNITS.m) : 0,
        hasPentagon,
        vertices: null
      });
    }

    this._updateVertices(this.context.viewport);
  }

  _shouldUseHighPrecision() {
    const {resolution, hasPentagon} = this.state;
    return this.props.highPrecision || hasPentagon || (resolution >= 0 && resolution <= 5);
  }

  _updateVertices(viewport) {
    if (this._shouldUseHighPrecision()) {
      return;
    }
    const {resolution, meanEdgeLength, centerHex} = this.state;
    if (resolution < 0) {
      return;
    }
    const hex = geoToH3(viewport.latitude, viewport.longitude, resolution);
    if (
      centerHex === hex ||
      (centerHex && h3Distance(centerHex, hex) * meanEdgeLength < UPDATE_THRESHOLD)
    ) {
      return;
    }

    const {pixelsPerMeter} = viewport.distanceScales;

    let vertices = h3ToGeoBoundary(hex, true);
    const [centerLat, centerLng] = h3ToGeo(hex);

    const [centerX, centerY] = viewport.projectFlat([centerLng, centerLat]);
    vertices = vertices.map(p => {
      const worldPosition = viewport.projectFlat(p);
      worldPosition[0] = (worldPosition[0] - centerX) / pixelsPerMeter[0];
      worldPosition[1] = (worldPosition[1] - centerY) / pixelsPerMeter[1];
      return worldPosition;
    });

    this.setState({centerHex: hex, vertices});
  }

  renderLayers() {
    return this._shouldUseHighPrecision() ? this._renderPolygonLayer() : this._renderColumnLayer();
  }

  _getForwardProps() {
    const {
      elevationScale,
      fp64,
      material,
      extruded,
      wireframe,
      stroked,
      filled,
      lineWidthUnits,
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels,
      // TODO - Deprecate getColor Prop in v8.0
      getColor,
      getFillColor,
      getElevation,
      getLineColor,
      getLineWidth,
      updateTriggers
    } = this.props;

    return {
      elevationScale,
      fp64,
      extruded,
      wireframe,
      stroked,
      filled,
      lineWidthUnits,
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels,
      material,
      getElevation,
      getFillColor: getColor || getFillColor,
      getLineColor,
      getLineWidth,
      updateTriggers: {
        getFillColor: updateTriggers.getColor || updateTriggers.getFillColor,
        getElevation: updateTriggers.getElevation,
        getLineColor: updateTriggers.getLineColor,
        getLineWidth: updateTriggers.getLineWidth
      }
    };
  }

  _renderPolygonLayer() {
    const {data, getHexagon, updateTriggers} = this.props;

    const SubLayerClass = this.getSubLayerClass('hexagon-cell-hifi', PolygonLayer);
    const forwardProps = this._getForwardProps();
    forwardProps.updateTriggers.getPolygon = updateTriggers.getHexagon;

    return new SubLayerClass(
      forwardProps,
      this.getSubLayerProps({
        id: 'hexagon-cell-hifi',
        updateTriggers: forwardProps.updateTriggers
      }),
      {
        data,
        getPolygon: (object, objectInfo) => {
          const hexagonId = getHexagon(object, objectInfo);
          return h3ToGeoBoundary(hexagonId, true);
        }
      }
    );
  }

  _renderColumnLayer() {
    const {data, getHexagon, updateTriggers} = this.props;

    const SubLayerClass = this.getSubLayerClass('hexagon-cell', ColumnLayer);
    const forwardProps = this._getForwardProps();
    forwardProps.updateTriggers.getPosition = updateTriggers.getHexagon;

    return new SubLayerClass(
      forwardProps,
      this.getSubLayerProps({
        id: 'hexagon-cell',
        updateTriggers: forwardProps.updateTriggers
      }),
      {
        data,
        diskResolution: 6, // generate an extruded hexagon as the base geometry
        radius: 1,
        vertices: this.state.vertices,
        getPosition: getHexagonCentroid.bind(null, getHexagon)
      }
    );
  }
}

H3HexagonLayer.defaultProps = defaultProps;
H3HexagonLayer.layerName = 'H3HexagonLayer';
