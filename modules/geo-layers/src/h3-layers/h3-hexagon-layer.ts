// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  getResolution,
  cellToLatLng,
  latLngToCell,
  isPentagon,
  gridDistance,
  getHexagonEdgeLengthAvg,
  H3Index
} from 'h3-js';
import {
  ArrowAccessor,
  CompositeLayer,
  createIterable,
  Layer,
  LayersList,
  UpdateParameters,
  WebMercatorViewport,
  DefaultProps
} from '@deck.gl/core';
import {ColumnLayer, PolygonLayer} from '@deck.gl/layers';
import GeoCellLayer, {type GeoCellLayerProps} from '../geo-cell-layer/GeoCellLayer';
import {flattenPolygon, getHexagonCentroid, h3ToPolygon} from './h3-utils';

import {hasCellColumns, getCellValue, renderCellColumns} from '../geo-cell-layer/cell-columns';

// There is a cost to updating the instanced geometries when using highPrecision: false
// This constant defines the distance between two hexagons that leads to "significant
// distortion." Smaller value makes the column layer more sensitive to viewport change.
const UPDATE_THRESHOLD_KM = 10;

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
  ...GeoCellLayer.defaultProps,
  highPrecision: 'auto',
  coverage: {type: 'number', min: 0, max: 1, value: 1},
  centerHexagon: null,
  getHexagon: {
    type: 'accessor',
    arrow: true,
    constantTypes: ['string'],
    value: (x: any) => x.hexagon
  },
  extruded: true
};

/** All properties supported by H3HexagonLayer */
export type H3HexagonLayerProps<DataT = unknown> = _H3HexagonLayerProps<DataT> &
  GeoCellLayerProps<DataT>;

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
   * Also accepts an Arrow vector of identifiers or identifier lists in source-feature order.
   */
  getHexagon?: ArrowAccessor<DataT, string>;
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

  shouldUpdateState({props, changeFlags}: UpdateParameters<this>): boolean {
    if (hasCellColumns(props, 'getHexagon')) return changeFlags.propsOrDataChanged;
    return this._shouldUseHighPrecision()
      ? changeFlags.propsOrDataChanged
      : changeFlags.somethingChanged;
  }

  updateState({props, oldProps, changeFlags}: UpdateParameters<this>): void {
    if (hasCellColumns(props, 'getHexagon')) return;
    if (
      props.highPrecision !== true &&
      (hasCellColumns(oldProps, 'getHexagon') ||
        changeFlags.dataChanged ||
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
      const hexId = getCellValue(this.props.getHexagon, object, objectInfo);
      // Take the resolution of the first hex
      const hexResolution = getResolution(hexId);
      if (resolution < 0) {
        resolution = hexResolution;
        if (!this.props.highPrecision) break;
      } else if (resolution !== hexResolution) {
        hasMultipleRes = true;
        break;
      }
      if (isPentagon(hexId)) {
        hasPentagon = true;
        break;
      }
    }

    return {
      resolution,
      edgeLengthKM: resolution >= 0 ? getHexagonEdgeLengthAvg(resolution, 'km') : 0,
      hasMultipleRes,
      hasPentagon
    };
  }

  private _shouldUseHighPrecision(): boolean {
    if (this.props.highPrecision === 'auto') {
      const {resolution, hasPentagon, hasMultipleRes} = this.state;
      return (
        this.getSubdivisionStep() > 0 ||
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
      this.props.centerHexagon || latLngToCell(viewport.latitude, viewport.longitude, resolution);
    if (centerHex === hex) {
      return;
    }
    if (centerHex) {
      try {
        const distance = gridDistance(centerHex, hex);
        if (distance * edgeLengthKM < UPDATE_THRESHOLD_KM) {
          return;
        }
      } catch {
        // gridDistance throws if the distance could not be computed
        // due to the two indexes very far apart or on opposite sides of a pentagon.
      }
    }

    const {unitsPerMeter} = viewport.distanceScales;

    let vertices = h3ToPolygon(hex);
    const [centerLat, centerLng] = cellToLatLng(hex);

    const center = [centerLng, centerLat];
    const [centerX, centerY] = viewport.projectPosition(center);
    vertices = vertices.map(p => {
      const worldPosition = viewport.projectPosition(p);
      return [
        (worldPosition[0] - centerX) / unitsPerMeter[0],
        (worldPosition[1] - centerY) / unitsPerMeter[1]
      ];
    });

    this.setState({centerHex: hex, vertices});
  }

  /** Routes cell columns through source-preserving geometry and style accessors. */
  /** Routes cell columns through source-preserving geometry and style accessors. */
  renderLayers(): Layer | null | LayersList {
    if (hasCellColumns(this.props, 'getHexagon'))
      return renderCellColumns(this, 'getHexagon', false, {
        row: this.getSubLayerRow.bind(this),
        accessor: this.getSubLayerAccessor.bind(this),
        props: this.getSubLayerProps.bind(this)
      });
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
      dataComparator: this.props.dataComparator,
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
          const hexagonId = getCellValue(getHexagon, object, objectInfo);
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
