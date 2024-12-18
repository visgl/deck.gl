// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  log,
  Accessor,
  Color,
  GetPickingInfoParams,
  CompositeLayerProps,
  createIterable,
  Layer,
  Material,
  project32,
  LayersList,
  PickingInfo,
  Position,
  Viewport,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';
import {WebGLAggregator, CPUAggregator, AggregationOperation} from '../common/aggregator/index';
import AggregationLayer from '../common/aggregation-layer';
import {AggregateAccessor} from '../common/types';
import {defaultColorRange} from '../common/utils/color-utils';
import {AttributeWithScale} from '../common/utils/scale-utils';
import {getBinIdRange} from '../common/utils/bounds-utils';

import HexagonCellLayer from './hexagon-cell-layer';
import {pointToHexbin, HexbinVertices, getHexbinCentroid, pointToHexbinGLSL} from './hexbin';
import {BinOptions, binOptionsUniforms} from './bin-options-uniforms';

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

const defaultProps: DefaultProps<HexagonLayerProps> = {
  gpuAggregation: true,

  // color
  colorDomain: null,
  colorRange: defaultColorRange,
  getColorValue: {type: 'accessor', value: null}, // default value is calculated from `getColorWeight` and `colorAggregation`
  getColorWeight: {type: 'accessor', value: 1},
  colorAggregation: 'SUM',
  lowerPercentile: {type: 'number', min: 0, max: 100, value: 0},
  upperPercentile: {type: 'number', min: 0, max: 100, value: 100},
  colorScaleType: 'quantize',
  onSetColorDomain: noop,

  // elevation
  elevationDomain: null,
  elevationRange: [0, 1000],
  getElevationValue: {type: 'accessor', value: null}, // default value is calculated from `getElevationWeight` and `elevationAggregation`
  getElevationWeight: {type: 'accessor', value: 1},
  elevationAggregation: 'SUM',
  elevationScale: {type: 'number', min: 0, value: 1},
  elevationLowerPercentile: {type: 'number', min: 0, max: 100, value: 0},
  elevationUpperPercentile: {type: 'number', min: 0, max: 100, value: 100},
  elevationScaleType: 'linear',
  onSetElevationDomain: noop,

  // hexbin
  radius: {type: 'number', min: 1, value: 1000},
  coverage: {type: 'number', min: 0, max: 1, value: 1},
  getPosition: {type: 'accessor', value: (x: any) => x.position},
  hexagonAggregator: {type: 'function', optional: true, value: null},
  extruded: false,

  // Optional material for 'lighting' shader module
  material: true
};

/** All properties supported by HexagonLayer. */
export type HexagonLayerProps<DataT = unknown> = _HexagonLayerProps<DataT> & CompositeLayerProps;

/** Properties added by HexagonLayer. */
type _HexagonLayerProps<DataT> = {
  /**
   * Radius of hexagon bin in meters. The hexagons are pointy-topped (rather than flat-topped).
   * @default 1000
   */
  radius?: number;

  /**
   * Custom accessor to retrieve a hexagonal bin index from each data object.
   * Not supported by GPU aggregation.
   * @default null
   */
  hexagonAggregator?: ((position: number[], radius: number) => [number, number]) | null;

  /**
   * Color scale domain, default is set to the extent of aggregated weights in each cell.
   * @default [min(colorWeight), max(colorWeight)]
   */
  colorDomain?: [number, number] | null;

  /**
   * Default: [colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6) `6-class YlOrRd`
   */
  colorRange?: Color[];

  /**
   * Cell size multiplier, clamped between 0 - 1.
   * @default 1
   */
  coverage?: number;

  /**
   * Elevation scale input domain, default is set to between 0 and the max of aggregated weights in each cell.
   * @default [0, max(elevationWeight)]
   */
  elevationDomain?: [number, number] | null;

  /**
   * Elevation scale output range.
   * @default [0, 1000]
   */
  elevationRange?: [number, number];

  /**
   * Cell elevation multiplier.
   * @default 1
   */
  elevationScale?: number;

  /**
   * Whether to enable cell elevation. If set to false, all cell will be flat.
   * @default true
   */
  extruded?: boolean;

  /**
   * Filter cells and re-calculate color by `upperPercentile`.
   * Cells with value larger than the upperPercentile will be hidden.
   * @default 100
   */
  upperPercentile?: number;

  /**
   * Filter cells and re-calculate color by `lowerPercentile`.
   * Cells with value smaller than the lowerPercentile will be hidden.
   * @default 0
   */
  lowerPercentile?: number;

  /**
   * Filter cells and re-calculate elevation by `elevationUpperPercentile`.
   * Cells with elevation value larger than the `elevationUpperPercentile` will be hidden.
   * @default 100
   */
  elevationUpperPercentile?: number;

  /**
   * Filter cells and re-calculate elevation by `elevationLowerPercentile`.
   * Cells with elevation value larger than the `elevationLowerPercentile` will be hidden.
   * @default 0
   */
  elevationLowerPercentile?: number;

  /**
   * Scaling function used to determine the color of the grid cell, default value is 'quantize'.
   * Supported Values are 'quantize', 'linear', 'quantile' and 'ordinal'.
   * @default 'quantize'
   */
  colorScaleType?: 'quantize' | 'linear' | 'quantile' | 'ordinal';

  /**
   * Scaling function used to determine the elevation of the grid cell, only supports 'linear'.
   * Supported Values are 'linear' and 'quantile'.
   * @default 'linear'
   */
  elevationScaleType?: 'linear';

  /**
   * Material settings for lighting effect. Applies if `extruded: true`.
   *
   * @default true
   * @see https://deck.gl/docs/developer-guide/using-lighting
   */
  material?: Material;

  /**
   * Defines the operation used to aggregate all data object weights to calculate a cell's color value.
   * Valid values are 'SUM', 'MEAN', 'MIN', 'MAX', 'COUNT'.
   *
   * @default 'SUM'
   */
  colorAggregation?: AggregationOperation;

  /**
   * Defines the operation used to aggregate all data object weights to calculate a cell's elevation value.
   * Valid values are 'SUM', 'MEAN', 'MIN', 'MAX', 'COUNT'.
   *
   * @default 'SUM'
   */
  elevationAggregation?: AggregationOperation;

  /**
   * Method called to retrieve the position of each object.
   * @default object => object.position
   */
  getPosition?: Accessor<DataT, Position>;

  /**
   * The weight of a data object used to calculate the color value for a cell.
   * @default 1
   */
  getColorWeight?: Accessor<DataT, number>;

  /**
   * After data objects are aggregated into cells, this accessor is called on each cell to get the value that its color is based on.
   * Not supported by GPU aggregation.
   * @default null
   */
  getColorValue?: AggregateAccessor<DataT> | null;

  /**
   * The weight of a data object used to calculate the elevation value for a cell.
   * @default 1
   */
  getElevationWeight?: Accessor<DataT, number>;

  /**
   * After data objects are aggregated into cells, this accessor is called on each cell to get the value that its elevation is based on.
   * Not supported by GPU aggregation.
   * @default null
   */
  getElevationValue?: AggregateAccessor<DataT> | null;

  /**
   * This callback will be called when bin color domain has been calculated.
   * @default () => {}
   */
  onSetColorDomain?: (minMax: [number, number]) => void;

  /**
   * This callback will be called when bin elevation domain has been calculated.
   * @default () => {}
   */
  onSetElevationDomain?: (minMax: [number, number]) => void;

  /**
   * When set to true, aggregation is performed on GPU, provided other conditions are met.
   * @default true
   */
  gpuAggregation?: boolean;
};

export type HexagonLayerPickingInfo<DataT> = PickingInfo<{
  /** Column index of the picked cell */
  col: number;
  /** Row index of the picked cell */
  row: number;
  /** Aggregated color value, as determined by `getColorWeight` and `colorAggregation` */
  colorValue: number;
  /** Aggregated elevation value, as determined by `getElevationWeight` and `elevationAggregation` */
  elevationValue: number;
  /** Number of data points in the picked cell */
  count: number;
  /** Centroid of the hexagon */
  position: [number, number];
  /** Indices of the data objects in the picked cell. Only available if using CPU aggregation. */
  pointIndices?: number[];
  /** The data objects in the picked cell. Only available if using CPU aggregation and layer data is an array. */
  points?: DataT[];
}>;

/** Aggregate data into a grid-based heatmap. The color and height of a cell are determined based on the objects it contains. */
export default class HexagonLayer<
  DataT = any,
  ExtraPropsT extends {} = {}
> extends AggregationLayer<DataT, ExtraPropsT & Required<_HexagonLayerProps<DataT>>> {
  static layerName = 'HexagonLayer';
  static defaultProps = defaultProps;

  state!: AggregationLayer<DataT>['state'] &
    BinOptions & {
      // Needed if getColorValue, getElevationValue are used
      dataAsArray?: DataT[];

      colors?: AttributeWithScale;
      elevations?: AttributeWithScale;

      binIdRange: [number, number][];
      aggregatorViewport: Viewport;
    };

  getAggregatorType(): string {
    const {gpuAggregation, hexagonAggregator, getColorValue, getElevationValue} = this.props;
    if (gpuAggregation && (hexagonAggregator || getColorValue || getElevationValue)) {
      // If these features are desired by the app, the user should explicitly use CPU aggregation
      log.warn('Features not supported by GPU aggregation, falling back to CPU')();
      return 'cpu';
    }

    if (
      // GPU aggregation is requested
      gpuAggregation &&
      // GPU aggregation is supported by the device
      WebGLAggregator.isSupported(this.context.device)
    ) {
      return 'gpu';
    }
    return 'cpu';
  }

  createAggregator(type: string): WebGLAggregator | CPUAggregator {
    if (type === 'cpu') {
      const {hexagonAggregator, radius} = this.props;
      return new CPUAggregator({
        dimensions: 2,
        getBin: {
          sources: ['positions'],
          getValue: ({positions}: {positions: number[]}, index: number, opts: BinOptions) => {
            if (hexagonAggregator) {
              return hexagonAggregator(positions, radius);
            }
            const viewport = this.state.aggregatorViewport;
            // project to common space
            const p = viewport.projectPosition(positions);
            const {radiusCommon, hexOriginCommon} = opts;
            return pointToHexbin(
              [p[0] - hexOriginCommon[0], p[1] - hexOriginCommon[1]],
              radiusCommon
            );
          }
        },
        getValue: [
          {sources: ['colorWeights'], getValue: ({colorWeights}) => colorWeights},
          {sources: ['elevationWeights'], getValue: ({elevationWeights}) => elevationWeights}
        ]
      });
    }
    return new WebGLAggregator(this.context.device, {
      dimensions: 2,
      channelCount: 2,
      bufferLayout: this.getAttributeManager()!.getBufferLayouts({isInstanced: false}),
      ...super.getShaders({
        modules: [project32, binOptionsUniforms],
        vs: /* glsl */ `
  in vec3 positions;
  in vec3 positions64Low;
  in float colorWeights;
  in float elevationWeights;
  
  ${pointToHexbinGLSL}

  void getBin(out ivec2 binId) {
    vec3 positionCommon = project_position(positions, positions64Low);
    binId = pointToHexbin(positionCommon.xy, binOptions.radiusCommon);
  }
  void getValue(out vec2 value) {
    value = vec2(colorWeights, elevationWeights);
  }
  `
      })
    });
  }

  initializeState() {
    super.initializeState();

    const attributeManager = this.getAttributeManager()!;
    attributeManager.add({
      positions: {
        size: 3,
        accessor: 'getPosition',
        type: 'float64',
        fp64: this.use64bitPositions()
      },
      colorWeights: {size: 1, accessor: 'getColorWeight'},
      elevationWeights: {size: 1, accessor: 'getElevationWeight'}
    });
  }

  updateState(params: UpdateParameters<this>) {
    const aggregatorChanged = super.updateState(params);

    const {props, oldProps, changeFlags} = params;
    const {aggregator} = this.state;
    if (
      (changeFlags.dataChanged || !this.state.dataAsArray) &&
      (props.getColorValue || props.getElevationValue)
    ) {
      // Convert data to array
      this.state.dataAsArray = Array.from(createIterable(props.data).iterable);
    }
    if (
      aggregatorChanged ||
      changeFlags.dataChanged ||
      props.radius !== oldProps.radius ||
      props.getColorValue !== oldProps.getColorValue ||
      props.getElevationValue !== oldProps.getElevationValue ||
      props.colorAggregation !== oldProps.colorAggregation ||
      props.elevationAggregation !== oldProps.elevationAggregation
    ) {
      this._updateBinOptions();
      const {radiusCommon, hexOriginCommon, binIdRange, dataAsArray} = this.state;

      aggregator.setProps({
        // @ts-expect-error only used by GPUAggregator
        binIdRange,
        pointCount: this.getNumInstances(),
        operations: [props.colorAggregation, props.elevationAggregation],
        binOptions: {
          radiusCommon,
          hexOriginCommon
        },
        onUpdate: this._onAggregationUpdate.bind(this)
      });

      if (dataAsArray) {
        const {getColorValue, getElevationValue} = this.props;
        aggregator.setProps({
          // @ts-expect-error only used by CPUAggregator
          customOperations: [
            getColorValue &&
              ((indices: number[]) =>
                getColorValue(
                  indices.map(i => dataAsArray[i]),
                  {indices, data: props.data}
                )),
            getElevationValue &&
              ((indices: number[]) =>
                getElevationValue(
                  indices.map(i => dataAsArray[i]),
                  {indices, data: props.data}
                ))
          ]
        });
      }
    }
    if (changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.getColorValue) {
      aggregator.setNeedsUpdate(0);
    }
    if (changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.getElevationValue) {
      aggregator.setNeedsUpdate(1);
    }

    return aggregatorChanged;
  }

  private _updateBinOptions() {
    const bounds = this.getBounds();
    let radiusCommon = 1;
    let hexOriginCommon: [number, number] = [0, 0];
    let binIdRange: [number, number][] = [
      [0, 1],
      [0, 1]
    ];
    let viewport = this.context.viewport;

    if (bounds && Number.isFinite(bounds[0][0])) {
      let centroid = [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2];
      const {radius} = this.props;
      const {unitsPerMeter} = viewport.getDistanceScales(centroid);
      radiusCommon = unitsPerMeter[0] * radius;

      // Use the centroid of the hex at the center of the data
      // This offsets the common space without changing the bins
      const centerHex = pointToHexbin(viewport.projectFlat(centroid), radiusCommon);
      centroid = viewport.unprojectFlat(getHexbinCentroid(centerHex, radiusCommon));

      const ViewportType = viewport.constructor as any;
      // We construct a viewport for the GPU aggregator's project module
      // This viewport is determined by data
      // removes arbitrary precision variance that depends on initial view state
      viewport = viewport.isGeospatial
        ? new ViewportType({longitude: centroid[0], latitude: centroid[1], zoom: 12})
        : new Viewport({position: [centroid[0], centroid[1], 0], zoom: 12});

      hexOriginCommon = [Math.fround(viewport.center[0]), Math.fround(viewport.center[1])];

      binIdRange = getBinIdRange({
        dataBounds: bounds,
        getBinId: (p: number[]) => {
          const positionCommon = viewport.projectFlat(p);
          positionCommon[0] -= hexOriginCommon[0];
          positionCommon[1] -= hexOriginCommon[1];
          return pointToHexbin(positionCommon, radiusCommon);
        },
        padding: 1
      });
    }

    this.setState({radiusCommon, hexOriginCommon, binIdRange, aggregatorViewport: viewport});
  }

  override draw(opts) {
    // Replaces render time viewport with our own
    if (opts.shaderModuleProps.project) {
      opts.shaderModuleProps.project.viewport = this.state.aggregatorViewport;
    }
    super.draw(opts);
  }

  private _onAggregationUpdate({channel}: {channel: number}) {
    const props = this.getCurrentLayer()!.props;
    const {aggregator} = this.state;
    if (channel === 0) {
      const result = aggregator.getResult(0)!;
      this.setState({
        colors: new AttributeWithScale(result, aggregator.binCount)
      });
      props.onSetColorDomain(aggregator.getResultDomain(0));
    } else if (channel === 1) {
      const result = aggregator.getResult(1)!;
      this.setState({
        elevations: new AttributeWithScale(result, aggregator.binCount)
      });
      props.onSetElevationDomain(aggregator.getResultDomain(1));
    }
  }

  onAttributeChange(id: string) {
    const {aggregator} = this.state;
    switch (id) {
      case 'positions':
        aggregator.setNeedsUpdate();

        this._updateBinOptions();
        const {radiusCommon, hexOriginCommon, binIdRange} = this.state;
        aggregator.setProps({
          // @ts-expect-error only used by GPUAggregator
          binIdRange,
          binOptions: {
            radiusCommon,
            hexOriginCommon
          }
        });
        break;

      case 'colorWeights':
        aggregator.setNeedsUpdate(0);
        break;

      case 'elevationWeights':
        aggregator.setNeedsUpdate(1);
        break;

      default:
      // This should not happen
    }
  }

  renderLayers(): LayersList | Layer | null {
    const {aggregator, radiusCommon, hexOriginCommon} = this.state;
    const {
      elevationScale,
      colorRange,
      elevationRange,
      extruded,
      coverage,
      material,
      transitions,
      colorScaleType,
      lowerPercentile,
      upperPercentile,
      colorDomain,
      elevationScaleType,
      elevationLowerPercentile,
      elevationUpperPercentile,
      elevationDomain
    } = this.props;
    const CellLayerClass = this.getSubLayerClass('cells', HexagonCellLayer);
    const binAttribute = aggregator.getBins();

    const colors = this.state.colors?.update({
      scaleType: colorScaleType,
      lowerPercentile,
      upperPercentile
    });
    const elevations = this.state.elevations?.update({
      scaleType: elevationScaleType,
      lowerPercentile: elevationLowerPercentile,
      upperPercentile: elevationUpperPercentile
    });

    if (!colors || !elevations) {
      return null;
    }

    return new CellLayerClass(
      this.getSubLayerProps({
        id: 'cells'
      }),
      {
        data: {
          length: aggregator.binCount,
          attributes: {
            getBin: binAttribute,
            getColorValue: colors.attribute,
            getElevationValue: elevations.attribute
          }
        },
        // Data has changed shallowly, but we likely don't need to update the attributes
        dataComparator: (data, oldData) => data.length === oldData.length,
        updateTriggers: {
          getBin: [binAttribute],
          getColorValue: [colors.attribute],
          getElevationValue: [elevations.attribute]
        },
        diskResolution: 6,
        vertices: HexbinVertices,
        radius: radiusCommon,
        hexOriginCommon,
        elevationScale,
        colorRange,
        colorScaleType,
        elevationRange,
        extruded,
        coverage,
        material,
        colorDomain: colors.domain || colorDomain || aggregator.getResultDomain(0),
        elevationDomain: elevations.domain || elevationDomain || aggregator.getResultDomain(1),
        colorCutoff: colors.cutoff,
        elevationCutoff: elevations.cutoff,
        transitions: transitions && {
          getFillColor: transitions.getColorValue || transitions.getColorWeight,
          getElevation: transitions.getElevationValue || transitions.getElevationWeight
        },
        // Extensions are already handled by the GPUAggregator, do not pass it down
        extensions: []
      }
    );
  }

  getPickingInfo(params: GetPickingInfoParams): HexagonLayerPickingInfo<DataT> {
    const info: HexagonLayerPickingInfo<DataT> = params.info;
    const {index} = info;
    if (index >= 0) {
      const bin = this.state.aggregator.getBin(index);
      let object: HexagonLayerPickingInfo<DataT>['object'];
      if (bin) {
        const centroidCommon = getHexbinCentroid(
          bin.id as [number, number],
          this.state.radiusCommon
        );
        const centroid = this.context.viewport.unprojectFlat(centroidCommon);

        object = {
          col: bin.id[0],
          row: bin.id[1],
          position: centroid,
          colorValue: bin.value[0],
          elevationValue: bin.value[1],
          count: bin.count
        };
        if (bin.pointIndices) {
          object.pointIndices = bin.pointIndices;
          object.points = Array.isArray(this.props.data)
            ? bin.pointIndices.map(i => (this.props.data as DataT[])[i])
            : [];
        }
      }
      info.object = object;
    }

    return info;
  }
}
