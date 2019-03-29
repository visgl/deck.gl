import {h3ToGeoBoundary, h3GetResolution, h3ToGeo, geoToH3, h3IsPentagon} from 'h3-js';
import {CompositeLayer, createIterable} from '@deck.gl/core';
import {PhongMaterial} from '@luma.gl/core';
import {ColumnLayer, SolidPolygonLayer} from '@deck.gl/layers';

function getHexagonCentroid(getHexagon, object, objectInfo) {
  const hexagonId = getHexagon(object, objectInfo);
  const [lat, lng] = h3ToGeo(hexagonId);
  return [lng, lat];
}

const defaultProps = {
  highPrecision: false,
  coverage: {type: 'number', min: 0, max: 1, value: 1},
  elevationScale: {type: 'number', min: 0, value: 1},
  extruded: true,
  fp64: false,

  getHexagon: {type: 'accessor', value: x => x.hexagon},
  getColor: {type: 'accessor', value: [255, 0, 255, 255]},
  getElevation: {type: 'accessor', value: 1000},

  material: new PhongMaterial()
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
        hasPentagon = hasPentagon || h3IsPentagon(hexId);
      }
      this.setState({
        resolution,
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
    const {resolution, centerHex} = this.state;
    if (resolution < 0) {
      return;
    }
    const hex = geoToH3(viewport.latitude, viewport.longitude, resolution);
    if (centerHex === hex) {
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

  _renderPolygonLayer() {
    const {
      data,
      getHexagon,
      updateTriggers,

      elevationScale,
      extruded,
      fp64,

      getColor,
      getElevation,
      material
    } = this.props;

    const SubLayerClass = this.getSubLayerClass('hexagon-cell-hifi', SolidPolygonLayer);

    return new SubLayerClass(
      {
        filled: true,
        elevationScale,
        extruded,
        fp64,
        getFillColor: getColor,
        getElevation,
        material
      },
      this.getSubLayerProps({
        id: 'hexagon-cell-hifi',
        updateTriggers: {
          getFillColor: updateTriggers.getFillColor,
          getElevation: updateTriggers.getElevation
        }
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
    const {
      data,
      getHexagon,
      updateTriggers,

      coverage,
      elevationScale,
      extruded,
      fp64,

      getColor,
      getElevation,
      material
    } = this.props;

    const SubLayerClass = this.getSubLayerClass('hexagon-cell', ColumnLayer);

    return new SubLayerClass(
      {
        coverage,
        elevationScale,
        extruded,
        fp64,
        getColor,
        getElevation,
        material
      },
      this.getSubLayerProps({
        id: 'hexagon-cell',
        updateTriggers
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
