// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ArrowAccessor} from '@deck.gl/core';
import {project} from '@deck.gl/core';

import {
  Accessor,
  GetPickingInfoParams,
  project32,
  LayersList,
  type LayerContext,
  PickingInfo,
  Position,
  Viewport,
  _deepEqual,
  UpdateParameters,
  DefaultProps,
  type LayerExtension
} from '@deck.gl/core';
import {LineLayer, PathLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {WebGLAggregator, CPUAggregator, AggregationOperation} from '../common/aggregator/index';
import AggregationLayer, {type AggregationLayerProps} from '../common/aggregation-layer';
import {generateContours, Contour, ContourLine, ContourPolygon} from './contour-utils';
import {getAggregatorValueReader} from './value-reader';
import {toByteColor} from '../common/utils/color-utils';
import {getBinIdRange} from '../common/utils/bounds-utils';
import {createAggregationViewport} from '../common/utils/projection-utils';
import {WebGPUAggregator} from '../common/aggregator/webgpu-aggregator/webgpu-aggregator';
import {GPUIsolines} from './gpu-isolines';
import {Matrix4} from '@math.gl/core';
import {BinOptions, binOptionsUniforms} from './bin-options-uniforms';

/** Extensions whose hooks filter source points during aggregation. */
const INPUT_FILTER_EXTENSIONS = ['DataFilterExtension', 'ClipExtension', 'BrushingExtension'];

/** Extensions applied to the rendered paths and polygons instead of source points. */
const OUTPUT_EXTENSIONS = ['PathStyleExtension', 'FillStyleExtension', 'MaskExtension'];

/** Whether a contour extension filters source points. */
function isInputFilter(extension: LayerExtension): boolean {
  return INPUT_FILTER_EXTENSIONS.includes(
    (extension.constructor as typeof LayerExtension).extensionName
  );
}

const DEFAULT_COLOR = [255, 255, 255, 255] as const;
const DEFAULT_STROKE_WIDTH = 1;

const defaultProps: DefaultProps<ContourLayerProps> = {
  // grid aggregation
  cellSize: {type: 'number', min: 1, value: 1000},
  gridOrigin: {type: 'array', compare: true, value: [0, 0]},
  getPosition: {type: 'accessor', arrow: 'row', value: (x: any) => x.position},
  getWeight: {type: 'accessor', arrow: 'row', value: 1},
  gpuAggregation: true,
  gpuGeometry: false,
  aggregation: 'SUM',

  // contour lines
  contours: {
    type: 'object',
    value: [{threshold: 1}],
    optional: true,
    compare: 3
  },

  zOffset: 0.005
};

/** All properties supported by GridLayer. */
export type ContourLayerProps<DataT = unknown> = _ContourLayerProps<DataT> &
  AggregationLayerProps<DataT>;

/** Properties added by GridLayer. */
type _ContourLayerProps<DataT> = {
  /**
   * Size of each cell in meters.
   * Geospatial views approximate ground meters at the center of the data bounds.
   * @default 1000
   */
  cellSize?: number;

  /**
   * The grid origin
   * @default [0, 0]
   */
  gridOrigin?: Readonly<[number, number]>;

  /**
   * When set to true, aggregation is performed on GPU, provided other conditions are met.
   * @default false
   */
  gpuAggregation?: boolean;

  /** Generate and render numeric-threshold isolines on WebGPU. @experimental */
  gpuGeometry?: boolean;

  /**
   * Defines the type of aggregation operation, valid values are 'SUM', 'MEAN', 'MIN' and 'MAX'.
   * @default 'SUM'
   */
  aggregation?: AggregationOperation;

  /**
   * Definition of contours to be drawn.
   * @default [{threshold: 1}]
   */
  contours?: Contour[];

  /**
   * A very small z offset that is added for each vertex of a contour (Isoline or Isoband).
   * @default 0.005
   */
  zOffset?: number;

  /**
   * Method called to retrieve the position of each object.
   * @default object => object.position
   */
  getPosition?: ArrowAccessor<DataT, Position>;

  /**
   * The weight of each object.
   * @default 1
   */
  getWeight?: ArrowAccessor<DataT, number>;
};

export type ContourLayerPickingInfo = PickingInfo<{
  contour: Contour;
}>;

/** Aggregate data into a grid-based heatmap. The color and height of a cell are determined based on the objects it contains. */
export default class GridLayer<DataT = any, ExtraPropsT extends {} = {}> extends AggregationLayer<
  DataT,
  ExtraPropsT & Required<_ContourLayerProps<DataT>>
> {
  static layerName = 'ContourLayer';
  static defaultProps = defaultProps;

  state!: AggregationLayer<DataT>['state'] &
    BinOptions & {
      /** Owned geometry for each numeric threshold. */
      gpuIsolines?: GPUIsolines[];
      /** The output columns need to be regenerated before drawing. */
      isolinesDirty?: boolean;
      // Aggregator result
      aggregatedValueReader?: (x: number, y: number) => number;
      contourData?: {
        lines: ContourLine[];
        polygons: ContourPolygon[];
      };

      binIdRange: [number, number][];
      /** Completed contours and their transform retained while replacement metadata is pending. */
      contourFrame?: {
        data: {lines: ContourLine[]; polygons: ContourPolygon[]};
        origin: number[];
        size: number[];
        scale: number[];
      };
      aggregatorViewport: Viewport;
    } & AggregationLayer<any>['state'];

  /** Select an aggregation backend compatible with current inputs and extensions. */
  getAggregatorType(): string {
    if (this.props.gpuAggregation && this.context.device.type === 'webgpu') {
      // Unknown extensions can still rely on the existing CPU aggregation path.
      if (
        this.props.extensions.some(
          extension =>
            !isInputFilter(extension) &&
            (this.props.positions ||
              !OUTPUT_EXTENSIONS.includes(
                (extension.constructor as typeof LayerExtension).extensionName
              ))
        )
      )
        return 'cpu';
      if (
        (!this.props.positions &&
          !WebGPUAggregator.supportsData(this.props.data, ['getPosition', 'getWeight'])) ||
        (!this.props.positions &&
          this.props.data ===
            (this.internalState?.getOldProps() as Partial<this['props']> | undefined)?.data &&
          !WebGPUAggregator.supportsAttributes(
            this.getAttributeManager()!.attributes,
            ['counts'],
            this.context.device.limits.maxStorageBufferBindingSize
          ))
      )
        return 'cpu';
      if (
        this.props.positions &&
        !WebGPUAggregator.supportsColumns(
          [this.props.positions, ...(this.props.weights || [])],
          this.context.device.limits.maxStorageBufferBindingSize
        )
      ) {
        throw new Error('Aggregation GPU input exceeds the storage buffer binding limit');
      }
      if (this.props.positions && this.state.preproject) {
        throw new Error('Contour GPU columns must use the custom view coordinate system');
      }
      this._updateBinOptions();
      const count = this.state.binIdRange.reduce((total, [start, end]) => total * (end - start), 1);
      const limits = this.context.device.limits;
      if (
        !Number.isSafeInteger(count) ||
        count * 8 > Math.min(limits.maxBufferSize, limits.maxStorageBufferBindingSize)
      ) {
        if (this.props.positions)
          throw new Error('Contour aggregation exceeds device buffer limits');
        return 'cpu';
      }
      return 'webgpu';
    }
    return this.props.gpuAggregation && WebGLAggregator.isSupported(this.context.device)
      ? 'gpu'
      : 'cpu';
  }

  /** Keep rendering extensions out of the native input filter pass. */
  protected override getAggregationShaders() {
    const {extensions} = this.props;
    return super.getAggregationShaders(
      this.context.device.type === 'webgpu' && !this.props.aggregator
        ? extensions.filter(isInputFilter)
        : extensions
    );
  }

  /** Construct the selected CPU, WebGL or WebGPU bin reducer. */
  createAggregator(type: string): WebGLAggregator | CPUAggregator | WebGPUAggregator {
    if (type === 'webgpu')
      return new WebGPUAggregator(this.context.device, {
        ...this.getComputeAggregatorOptions(),
        channelNames: ['counts'],
        binOptions: binOptionsUniforms,
        binning: `fn getBin(position: vec3f, low: vec3f) -> BinAssignment {
        let positionCommon = project_position_vec3_f64(position, low);
        return BinAssignment(vec2i(floor(positionCommon.xy / binOptions.cellSizeCommon)), true);
      }`
      });
    if (type === 'cpu') {
      return new CPUAggregator({
        dimensions: 2,
        getBin: {
          sources: ['positions'],
          getValue: ({positions}: {positions: number[]}, index: number, opts: BinOptions) => {
            const viewport = this.state.aggregatorViewport;
            const p = this.projectPositionFromAttribute(positions, viewport);
            const {cellSizeCommon, cellOriginCommon} = opts;
            return [
              Math.floor((p[0] - cellOriginCommon[0]) / cellSizeCommon[0]),
              Math.floor((p[1] - cellOriginCommon[1]) / cellSizeCommon[1])
            ];
          }
        },
        getValue: [{sources: ['counts'], getValue: ({counts}) => counts}]
      });
    }
    return new WebGLAggregator(this.context.device, {
      dimensions: 2,
      channelCount: 1,
      bufferLayout: this.getAttributeManager()!.getBufferLayouts({isInstanced: false}),
      ...super.getShaders({
        modules: [project32, binOptionsUniforms],
        vs: /* glsl */ `
  in vec3 positions;
  in vec3 positions64Low;
  in float counts;

  void getBin(out ivec2 binId) {
    vec3 positionCommon = project_position(positions, positions64Low);
    vec2 gridCoords = floor(positionCommon.xy / binOptions.cellSizeCommon);
    binId = ivec2(gridCoords);
  }
  void getValue(out float value) {
    value = counts;
  }
  `
      })
    });
  }

  /** Initialize contour data and the aggregation input attributes. */
  initializeState() {
    super.initializeState();

    const attributeManager = this.getAttributeManager()!;
    attributeManager.add({
      positions: {
        size: 3,
        accessor: 'getPosition',
        type: 'float64',
        fp64: this.use64bitPositions(),
        ...this.usePositionTransforms()
      },
      counts: {size: 1, accessor: 'getWeight'}
    });
  }

  /** Update binning, contour settings and asynchronous aggregation requirements. */
  updateState(params: UpdateParameters<this>) {
    const aggregatorChanged = super.updateState(params);

    const {props, oldProps, changeFlags} = params;
    const {aggregator} = this.state;
    if (
      aggregatorChanged ||
      changeFlags.dataChanged ||
      props.positions !== oldProps.positions ||
      props.weights !== oldProps.weights ||
      props.dataBounds !== oldProps.dataBounds ||
      props.modelMatrix !== oldProps.modelMatrix ||
      props.coordinateOrigin !== oldProps.coordinateOrigin ||
      changeFlags.projectionChanged ||
      props.cellSize !== oldProps.cellSize ||
      !_deepEqual(props.gridOrigin, oldProps.gridOrigin, 1) ||
      props.aggregation !== oldProps.aggregation
    ) {
      this._updateBinOptions();
      const {cellSizeCommon, cellOriginCommon, binIdRange} = this.state;

      aggregator.setProps({
        binIdRange,
        pointCount: this.getNumInstances(),
        operations: [props.aggregation],
        onUpdate: this._onAggregationUpdate.bind(this),
        binOptions: {
          cellSizeCommon,
          cellOriginCommon
        }
      });
    }

    if (!_deepEqual(oldProps.contours, props.contours, 2)) {
      // Recalculate contours
      this.setState({contourData: null});
    }

    return aggregatorChanged;
  }

  /** Compute world-space grid bounds and binning uniforms. */
  private _updateBinOptions() {
    const bounds = this.getBounds();
    if (this.props.positions && !this.props.dataBounds) {
      throw new Error('GPU aggregation positions require dataBounds for world-space binning');
    }
    const cellSizeCommon: [number, number] = [1, 1];
    let cellOriginCommon: [number, number] = [0, 0];
    let binIdRange: [number, number][] = [
      [0, 1],
      [0, 1]
    ];
    let viewport = this.context.viewport;

    if (bounds && Number.isFinite(bounds[0][0])) {
      let centroid = [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2];
      const {cellSize, gridOrigin} = this.props;
      const {unitsPerMeter} = viewport.getDistanceScales(centroid);
      cellSizeCommon[0] = unitsPerMeter[0] * cellSize;
      cellSizeCommon[1] = unitsPerMeter[1] * cellSize;

      // Offset common space to center at the origin of the grid cell where the data center is in
      // This improves precision without affecting the cell positions
      const centroidCommon = viewport.projectFlat(centroid);
      cellOriginCommon = [
        Math.floor((centroidCommon[0] - gridOrigin[0]) / cellSizeCommon[0]) * cellSizeCommon[0] +
          gridOrigin[0],
        Math.floor((centroidCommon[1] - gridOrigin[1]) / cellSizeCommon[1]) * cellSizeCommon[1] +
          gridOrigin[1]
      ];
      centroid = project.isCustomProjection(viewport)
        ? cellOriginCommon
        : viewport.unprojectFlat(cellOriginCommon);

      const ViewportType = viewport.constructor as any;
      // We construct a viewport for the GPU aggregator's project module
      // This viewport is determined by data
      // removes arbitrary precision variance that depends on initial view state
      viewport =
        viewport.isGeospatial && !project.isCustomProjection(viewport)
          ? new ViewportType({longitude: centroid[0], latitude: centroid[1], zoom: 12})
          : project.isCustomProjection(viewport)
            ? createAggregationViewport(viewport, centroid)
            : new Viewport({position: [centroid[0], centroid[1], 0], zoom: 12});

      // Round to the nearest 32-bit float to match CPU and GPU results
      cellOriginCommon = [Math.fround(viewport.center[0]), Math.fround(viewport.center[1])];

      binIdRange = getBinIdRange({
        dataBounds: bounds,
        getBinId: (p: number[]) => {
          const positionCommon = viewport.projectFlat(p);
          return [
            Math.floor((positionCommon[0] - cellOriginCommon[0]) / cellSizeCommon[0]),
            Math.floor((positionCommon[1] - cellOriginCommon[1]) / cellSizeCommon[1])
          ];
        }
      });
    }

    Object.assign(this.state, {
      cellSizeCommon,
      cellOriginCommon,
      binIdRange,
      aggregatorViewport: viewport
    });
  }

  override draw(opts) {
    // Replaces render time viewport with our own
    if (opts.shaderModuleProps.project) {
      opts.shaderModuleProps.project.viewport = this.state.aggregatorViewport;
    }
    super.draw(opts);
    const {aggregator, gpuIsolines, isolinesDirty, binIdRange} = this.state;
    if (!gpuIsolines?.length || !isolinesDirty || !aggregator.isLoaded) return;
    const values = (aggregator as WebGPUAggregator).getResult(0);
    if (!values) return;
    const [[minX, maxX], [minY, maxY]] = binIdRange;
    for (const [index, geometry] of gpuIsolines.entries()) {
      const {
        threshold,
        zIndex = index,
        strokeWidth = DEFAULT_STROKE_WIDTH
      } = this.props.contours[index];
      geometry.run(
        values,
        [minX, minY, maxX - minX, maxY - minY],
        threshold as number,
        zIndex,
        strokeWidth
      );
    }
    this.state.isolinesDirty = false;
  }

  /** Release the GPU geometry and the aggregator. */
  override finalizeState(context: LayerContext): void {
    this._releaseGPUIsolines();
    super.finalizeState(context);
  }

  /** Dispose of the current GPU output frame. */
  private _releaseGPUIsolines(): void {
    for (const geometry of this.state.gpuIsolines || []) geometry.destroy();
    this.state.gpuIsolines = undefined;
  }

  /** GPU geometry uses fixed slots for two disconnected segments per marching cell. */
  private _getGPUIsolineCellCount(): number {
    const {gpuGeometry, pickable, contours, extensions, _subLayerProps} = this.props;
    const {aggregatorType, binIdRange, aggregator} = this.state;
    if (
      !gpuGeometry ||
      pickable ||
      aggregatorType !== 'webgpu' ||
      !aggregator.binCount ||
      !contours.length ||
      contours.some(contour => !Number.isFinite(contour.threshold)) ||
      extensions.some(extension => !isInputFilter(extension)) ||
      _subLayerProps?.lines
    )
      return 0;
    const cellCount =
      (binIdRange[0][1] - binIdRange[0][0] + 1) * (binIdRange[1][1] - binIdRange[1][0] + 1);
    return GPUIsolines.supports(this.context.device, cellCount) ? cellCount : 0;
  }

  /** Bind GPU-generated line columns to ordinary instanced layers. */
  private _renderGPUIsolines(cellCount: number): LayersList {
    const {contours, zOffset} = this.props;
    const {cellOriginCommon, cellSizeCommon} = this.state;
    if (
      this.state.gpuIsolines?.length !== contours.length ||
      this.state.gpuIsolines[0].cellCount !== cellCount
    ) {
      this._releaseGPUIsolines();
      this.state.gpuIsolines = contours.map(() => new GPUIsolines(this.context.device, cellCount));
    }
    this.state.isolinesDirty = true;
    const scale = project.isCustomProjection(this.context.viewport)
      ? this.context.viewport.distanceScales.unitsPerWorldUnit.map(value => 1 / value)
      : [1, 1, 1];
    const modelMatrix = new Matrix4()
      .scale(scale)
      .translate([cellOriginCommon[0], cellOriginCommon[1], 0])
      .scale([cellSizeCommon[0], cellSizeCommon[1], zOffset]);

    const normalized = this.usesNormalizedColors();
    return this.state.gpuIsolines.map(({sourcePositions, targetPositions, widths}, index) => {
      const {color} = contours[index];
      return new LineLayer(this.getSubLayerProps({id: `isolines-${index}`}), {
        sourcePositions,
        targetPositions,
        widths,
        getColor: color ? (normalized ? toByteColor(color) : color) : DEFAULT_COLOR,
        widthUnits: 'pixels',
        coordinateSystem: 'cartesian',
        coordinateOrigin: [0, 0, 0],
        modelMatrix,
        extensions: []
      });
    });
  }

  /** Invalidate contours when a new aggregate snapshot is available. */
  private _onAggregationUpdate() {
    const {aggregator, binIdRange, gpuIsolines} = this.state;
    if (gpuIsolines) {
      this.state.isolinesDirty = true;
      return;
    }
    this.setState({
      aggregatedValueReader: getAggregatorValueReader({aggregator, binIdRange, channel: 0}),
      contourData: null
    });
  }

  /** Generate completed contours or retain the previous frame while metadata is pending. */
  private _getContours(): {
    lines: ContourLine[];
    polygons: ContourPolygon[];
  } | null {
    if (this.state.aggregator.isLoaded === false) return this.state.contourFrame?.data || null;
    const {aggregatedValueReader} = this.state;
    if (
      !aggregatedValueReader ||
      this.state.binIdRange.some(
        ([start, end]) => !Number.isFinite(start) || !Number.isFinite(end) || end <= start
      )
    ) {
      this.state.contourFrame = undefined;
      return null;
    }

    if (!this.state.contourData) {
      const {binIdRange} = this.state;
      const {contours} = this.props;
      const contourData = generateContours({
        contours,
        getValue: aggregatedValueReader,
        xRange: binIdRange[0],
        yRange: binIdRange[1]
      });

      this.state.contourData = contourData;
      this.state.contourFrame = {
        data: contourData,
        origin: [...this.state.cellOriginCommon],
        size: [...this.state.cellSizeCommon],
        scale: project.isCustomProjection(this.context.viewport)
          ? this.context.viewport.distanceScales.unitsPerWorldUnit.map(value => 1 / value)
          : [1, 1, 1]
      };
    }
    return this.state.contourData;
  }

  /** Recheck current attributes and switch to CPU aggregation when compute cannot consume them. */
  protected override updateAttributes(changedAttributes) {
    // AttributeManager has populated current positions at this point. Backend selection
    // during updateState can only see the previous position bounds.
    if (
      (changedAttributes.positions || changedAttributes.counts) &&
      this.state.aggregatorType === 'webgpu' &&
      (this.getAggregatorType() === 'cpu' ||
        !WebGPUAggregator.supportsAttributes(
          this.getAttributeManager()!.attributes,
          ['counts'],
          this.context.device.limits.maxStorageBufferBindingSize
        ))
    ) {
      this.state.aggregator.destroy();
      const aggregator = this.createAggregator('cpu');
      this.setState({aggregator, aggregatorType: 'cpu'});
      aggregator.setProps({
        attributes: this.getAttributeManager()!.attributes,
        pointCount: this.getNumInstances(),
        operations: [this.props.aggregation],
        binIdRange: this.state.binIdRange,
        binOptions: {
          cellSizeCommon: this.state.cellSizeCommon,
          cellOriginCommon: this.state.cellOriginCommon
        },
        onUpdate: this._onAggregationUpdate.bind(this)
      });
    }
    super.updateAttributes(changedAttributes);
  }

  /** Invalidate binning or weights when aggregation input attributes change. */
  onAttributeChange(id: string) {
    const {aggregator} = this.state;
    switch (id) {
      case 'positions':
        aggregator.setNeedsUpdate();

        this._updateBinOptions();
        const {cellSizeCommon, cellOriginCommon, binIdRange} = this.state;
        aggregator.setProps({
          binIdRange,
          binOptions: {
            cellSizeCommon,
            cellOriginCommon
          }
        });
        break;

      case 'counts':
        aggregator.setNeedsUpdate(0);
        break;

      default:
      // This should not happen
    }
  }

  /** Render isolines and isobands using the transform of their completed contour frame. */
  renderLayers(): LayersList | null {
    const cellCount = this._getGPUIsolineCellCount();
    this.state.aggregator.setProps({readback: !cellCount});
    if (cellCount) return this._renderGPUIsolines(cellCount);
    this._releaseGPUIsolines();
    const contourData = this._getContours();
    if (!contourData) {
      return null;
    }
    const {lines, polygons} = contourData;
    const {zOffset} = this.props;
    const normalized = this.usesNormalizedColors();
    /** Convert user-supplied contour styles at the sublayer boundary. */
    const getContourColor = ({contour}: ContourLine | ContourPolygon) =>
      contour.color ? (normalized ? toByteColor(contour.color) : contour.color) : DEFAULT_COLOR;
    const frame = this.state.contourFrame!;
    const cellOriginCommon = frame.origin;
    const cellSizeCommon = frame.size;

    const LinesSubLayerClass = this.getSubLayerClass('lines', PathLayer);
    const BandsSubLayerClass = this.getSubLayerClass('bands', SolidPolygonLayer);
    const modelMatrix = new Matrix4().scale(frame.scale);
    modelMatrix
      .translate([cellOriginCommon[0], cellOriginCommon[1], 0])
      .scale([cellSizeCommon[0], cellSizeCommon[1], zOffset]);

    // Contour lines layer
    const lineLayer =
      lines &&
      lines.length > 0 &&
      new LinesSubLayerClass(
        this.getSubLayerProps({
          id: 'lines',
          updateTriggers: {getColor: [this.props.contours, normalized]}
        }),
        {
          data: lines,
          coordinateSystem: 'cartesian',
          coordinateOrigin: [0, 0, 0],
          modelMatrix,
          getPath: d => d.vertices,
          getColor: getContourColor,
          getWidth: d => d.contour.strokeWidth ?? DEFAULT_STROKE_WIDTH,
          widthUnits: 'pixels',
          extensions: this.getContourExtensions('lines')
        }
      );

    // Contour bands layer
    const bandsLayer =
      polygons &&
      polygons.length > 0 &&
      new BandsSubLayerClass(
        this.getSubLayerProps({
          id: 'bands',
          updateTriggers: {getFillColor: [this.props.contours, normalized]}
        }),
        {
          data: polygons,
          coordinateSystem: 'cartesian',
          coordinateOrigin: [0, 0, 0],
          modelMatrix,
          getPolygon: d => d.vertices,
          getFillColor: getContourColor,
          extensions: this.getContourExtensions('bands')
        }
      );

    return [lineLayer, bandsLayer];
  }

  /** Forward explicit overrides and omit input filters already run by the GPU aggregator. */
  private getContourExtensions(id: 'lines' | 'bands'): LayerExtension[] {
    const {extensions, _subLayerProps} = this.props;
    const {aggregatorType} = this.state;
    if (_subLayerProps?.[id]?.extensions) return _subLayerProps[id].extensions;
    if (aggregatorType === 'webgpu')
      return extensions.filter(extension => !isInputFilter(extension));
    // The WebGL sorter runs DataFilter but does not run the vertex position hook.
    if (aggregatorType === 'gpu') {
      return extensions.filter(
        extension =>
          (extension.constructor as typeof LayerExtension).extensionName !== 'DataFilterExtension'
      );
    }
    return extensions;
  }

  /** Attach the contour definition associated with the picked line or band. */
  getPickingInfo(params: GetPickingInfoParams): ContourLayerPickingInfo {
    const info: ContourLayerPickingInfo = params.info;
    const {object} = info;
    if (object) {
      info.object = {
        contour: (object as ContourLine | ContourPolygon).contour
      };
    }

    return info;
  }
}
