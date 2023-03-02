import {
  h3ToGeoBoundary,
  h3GetResolution,
  h3ToGeo,
  geoToH3,
  h3IsPentagon,
  h3Distance,
  edgeLength,
  H3Index
} from 'h3-js';
import {lerp} from '@math.gl/core';
import {
  AccessorFunction,
  CompositeLayer,
  createIterable,
  Layer,
  LayersList,
  UpdateParameters,
  WebMercatorViewport,
  DefaultProps
} from '@deck.gl/core';
import {ColumnLayer, PolygonLayer, PolygonLayerProps} from '@deck.gl/layers';

// There is a cost to updating the instanced geometries when using highPrecision: false
// This constant defines the distance between two hexagons that leads to "significant
// distortion." Smaller value makes the column layer more sensitive to viewport change.
const UPDATE_THRESHOLD_KM = 10;

// normalize longitudes w.r.t center (refLng), when not provided first vertex
export function normalizeLongitudes(vertices: number[][], refLng?: number): void {
  refLng = refLng === undefined ? vertices[0][0] : refLng;
  for (const pt of vertices) {
    const deltaLng = pt[0] - refLng;
    if (deltaLng > 180) {
      pt[0] -= 360;
    } else if (deltaLng < -180) {
      pt[0] += 360;
    }
  }
}

// scale polygon vertices w.r.t center (hexId)
export function scalePolygon(hexId: H3Index, vertices: number[][], factor: number): void {
  const [lat, lng] = h3ToGeo(hexId);
  const actualCount = vertices.length;

  // normalize with respect to center
  normalizeLongitudes(vertices, lng);

  // `h3ToGeoBoundary` returns same array object for first and last vertex (closed polygon),
  // if so skip scaling the last vertex
  const vertexCount = vertices[0] === vertices[actualCount - 1] ? actualCount - 1 : actualCount;
  for (let i = 0; i < vertexCount; i++) {
    vertices[i][0] = lerp(lng, vertices[i][0], factor);
    vertices[i][1] = lerp(lat, vertices[i][1], factor);
  }
}

function getHexagonCentroid(getHexagon, object, objectInfo) {
  const hexagonId = getHexagon(object, objectInfo);
  const [lat, lng] = h3ToGeo(hexagonId);
  return [lng, lat];
}

function h3ToPolygon(hexId: H3Index, coverage: number = 1): number[][] {
  const vertices = h3ToGeoBoundary(hexId, true);

  if (coverage !== 1) {
    // scale and normalize vertices w.r.t to center
    scalePolygon(hexId, vertices, coverage);
  } else {
    // normalize w.r.t to start vertex
    normalizeLongitudes(vertices);
  }

  return vertices;
}

function flattenPolygon(vertices: number[][]): Float64Array {
  const positions = new Float64Array(vertices.length * 2);
  let i = 0;
  for (const pt of vertices) {
    positions[i++] = pt[0];
    positions[i++] = pt[1];
  }
  return positions;
}

function mergeTriggers(getHexagon, coverage) {
  let trigger;
  if (getHexagon === undefined || getHexagon === null) {
    trigger = coverage;
  } else if (typeof getHexagon === 'object') {
    trigger = {...getHexagon, coverage};
  } else {
    trigger = {getHexagon, coverage};
  }
  return trigger;
}

const defaultProps: DefaultProps<H3HexagonLayerProps> = {
  ...PolygonLayer.defaultProps,
  highPrecision: 'auto',
  coverage: {type: 'number', min: 0, max: 1, value: 1},
  centerHexagon: null,
  getHexagon: {type: 'accessor', value: x => x.hexagon},
  extruded: true
};

/** All properties supported by H3HexagonLayer */
export type H3HexagonLayerProps<DataT = any> = _H3HexagonLayerProps<DataT> &
  PolygonLayerProps<DataT>;

/** Props added by the H3HexagonLayer */
type _H3HexagonLayerProps<DataT> = {
  /**
   * Whether or not draw hexagons with high precision.
   * @default 'auto'
   */
  highPrecision?: boolean | 'auto';
  /**
   * Coverage of hexagon in cell.
   * @default 1
   */
  coverage?: number;
  /**
   * Center hexagon that best represents the shape of the set. If not specified, the hexagon closest to the center of the viewport is used.
   */
  centerHexagon?: H3Index | null;
  /**
   * Called for each data object to retrieve the quadkey string identifier.
   *
   * By default, it reads `hexagon` property of data object.
   */
  getHexagon?: AccessorFunction<DataT, string>;
  /**
   * Whether to extrude polygons.
   * @default true
   */
  extruded?: boolean;
};

/**
 * Render hexagons from the [H3](https://h3geo.org/) geospatial indexing system.
 */
export default class H3HexagonLayer<
  DataT = any,
  ExtraPropsT extends {} = {}
> extends CompositeLayer<ExtraPropsT & Required<H3HexagonLayerProps<DataT>>> {
  static defaultProps = defaultProps;
  static layerName = 'H3HexagonLayer';

  // See `main/bundle.ts`
  static _checkH3Lib = () => {};

  initializeState() {
    H3HexagonLayer._checkH3Lib();
    this.state = {
      edgeLengthKM: 0,
      resolution: -1
    };
  }

  state!: {
    centerHex?: H3Index;
    edgeLengthKM: number;
    hasMultipleRes?: boolean;
    hasPentagon?: boolean;
    resolution: number;
    vertices?: number[][];
  };

  shouldUpdateState({changeFlags}: UpdateParameters<this>): boolean {
    return this._shouldUseHighPrecision()
      ? changeFlags.propsOrDataChanged
      : changeFlags.somethingChanged;
  }

  updateState({props, changeFlags}: UpdateParameters<this>): void {
    if (
      props.highPrecision !== true &&
      (changeFlags.dataChanged ||
        (changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.getHexagon))
    ) {
      const dataProps = this._calculateH3DataProps();
      this.setState(dataProps);
    }

    this._updateVertices(this.context.viewport as WebMercatorViewport);
  }

  private _calculateH3DataProps() {
    let resolution = -1;
    let hasPentagon = false;
    let hasMultipleRes = false;

    const {iterable, objectInfo} = createIterable(this.props.data);
    for (const object of iterable) {
      objectInfo.index++;
      const hexId = this.props.getHexagon(object, objectInfo);
      // Take the resolution of the first hex
      const hexResolution = h3GetResolution(hexId);
      if (resolution < 0) {
        resolution = hexResolution;
        if (!this.props.highPrecision) break;
      } else if (resolution !== hexResolution) {
        hasMultipleRes = true;
        break;
      }
      if (h3IsPentagon(hexId)) {
        hasPentagon = true;
        break;
      }
    }

    return {
      resolution,
      edgeLengthKM: resolution >= 0 ? edgeLength(resolution, 'km') : 0,
      hasMultipleRes,
      hasPentagon
    };
  }

  private _shouldUseHighPrecision(): boolean {
    if (this.props.highPrecision === 'auto') {
      const {resolution, hasPentagon, hasMultipleRes} = this.state;
      const {viewport} = this.context;
      return (
        Boolean(viewport?.resolution) ||
        hasMultipleRes ||
        hasPentagon ||
        (resolution >= 0 && resolution <= 5)
      );
    }

    return this.props.highPrecision;
  }

  private _updateVertices(viewport: WebMercatorViewport): void {
    if (this._shouldUseHighPrecision()) {
      return;
    }
    const {resolution, edgeLengthKM, centerHex} = this.state;
    if (resolution < 0) {
      return;
    }
    const hex =
      this.props.centerHexagon || geoToH3(viewport.latitude, viewport.longitude, resolution);
    if (centerHex === hex) {
      return;
    }
    if (centerHex) {
      const distance = h3Distance(centerHex, hex);
      // h3Distance returns a negative number if the distance could not be computed
      // due to the two indexes very far apart or on opposite sides of a pentagon.
      if (distance >= 0 && distance * edgeLengthKM < UPDATE_THRESHOLD_KM) {
        return;
      }
    }

    const {unitsPerMeter} = viewport.distanceScales;

    let vertices = h3ToPolygon(hex);
    const [centerLat, centerLng] = h3ToGeo(hex);

    const [centerX, centerY] = viewport.projectFlat([centerLng, centerLat]);
    vertices = vertices.map(p => {
      const worldPosition = viewport.projectFlat(p);
      return [
        (worldPosition[0] - centerX) / unitsPerMeter[0],
        (worldPosition[1] - centerY) / unitsPerMeter[1]
      ];
    });

    this.setState({centerHex: hex, vertices});
  }

  renderLayers(): Layer | null | LayersList {
    return this._shouldUseHighPrecision() ? this._renderPolygonLayer() : this._renderColumnLayer();
  }

  private _getForwardProps() {
    const {
      elevationScale,
      material,
      coverage,
      extruded,
      wireframe,
      stroked,
      filled,
      lineWidthUnits,
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels,
      getFillColor,
      getElevation,
      getLineColor,
      getLineWidth,
      transitions,
      updateTriggers
    } = this.props;

    return {
      elevationScale,
      extruded,
      coverage,
      wireframe,
      stroked,
      filled,
      lineWidthUnits,
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels,
      material,
      getElevation,
      getFillColor,
      getLineColor,
      getLineWidth,
      transitions,
      updateTriggers: {
        getFillColor: updateTriggers.getFillColor,
        getElevation: updateTriggers.getElevation,
        getLineColor: updateTriggers.getLineColor,
        getLineWidth: updateTriggers.getLineWidth
      } as {
        getFillColor: any;
        getElevation: any;
        getLineColor: any;
        getLineWidth: any;
        getPolygon?: any;
        getPosition?: any;
      }
    };
  }

  private _renderPolygonLayer(): PolygonLayer {
    const {data, getHexagon, updateTriggers, coverage} = this.props;

    const SubLayerClass = this.getSubLayerClass('hexagon-cell-hifi', PolygonLayer);
    const forwardProps = this._getForwardProps();
    forwardProps.updateTriggers.getPolygon = mergeTriggers(updateTriggers.getHexagon, coverage);

    return new SubLayerClass(
      forwardProps,
      this.getSubLayerProps({
        id: 'hexagon-cell-hifi',
        updateTriggers: forwardProps.updateTriggers
      }),
      {
        data,
        _normalize: false,
        _windingOrder: 'CCW',
        positionFormat: 'XY',
        getPolygon: (object, objectInfo) => {
          const hexagonId = getHexagon(object, objectInfo);
          return flattenPolygon(h3ToPolygon(hexagonId, coverage));
        }
      }
    );
  }

  private _renderColumnLayer(): ColumnLayer {
    const {data, getHexagon, updateTriggers} = this.props;

    const SubLayerClass = this.getSubLayerClass('hexagon-cell', ColumnLayer);
    const forwardProps = this._getForwardProps();
    forwardProps.updateTriggers.getPosition = updateTriggers.getHexagon;

    return new SubLayerClass(
      forwardProps,
      this.getSubLayerProps({
        id: 'hexagon-cell',
        flatShading: true,
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
