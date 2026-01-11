// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  Layer,
  project32,
  picking,
  UNIT,
  LayerProps,
  LayerDataSource,
  UpdateParameters,
  Unit,
  AccessorFunction,
  Position,
  Accessor,
  Color,
  Material,
  DefaultProps
} from '@deck.gl/core';
import {gouraudMaterial, phongMaterial} from '@luma.gl/shadertools';
import {Model} from '@luma.gl/engine';
import ColumnGeometry from './column-geometry';

import {columnUniforms, ColumnProps} from './column-layer-uniforms';
import vs from './column-layer-vertex.glsl';
import fs from './column-layer-fragment.glsl';

const DEFAULT_COLOR: [number, number, number, number] = [0, 0, 0, 255];

/**
 * Bevel configuration for per-instance getBevel accessor.
 * - 'flat': No bevel (flat top)
 * - 'dome': Dome with height = radius
 * - 'cone': Cone with height = radius
 * - number: Custom dome height in world units
 * - {segs, height, bulge?}: Full control
 *   - segs: number of bevel segments (0-1=flat, 2=cone, 3+=dome)
 *   - height: bevel height in world units (must be > 0, unbounded)
 *   - bulge: curve factor (-1 to 1+), 0=standard dome, negative=concave, positive=convex bulge
 *
 * Note: height must be positive. Values <= 0 result in flat cap.
 */
export type BevelProp =
  | 'flat'
  | 'dome'
  | 'cone'
  | number
  | {segs: number; height: number; bulge?: number};

/** Extract height from BevelProp: positive=custom height, -1=use radius */
function bevelPropToHeight(bevel: BevelProp): number {
  if (bevel === 'flat') return 0;
  if (bevel === 'dome') return -1; // use radius
  if (bevel === 'cone') return -1; // use radius
  if (typeof bevel === 'number') return bevel;
  if (typeof bevel === 'object' && bevel !== null) {
    const {segs, height} = bevel;
    if (segs <= 1 || height <= 0) return 0;
    return height;
  }
  return 0;
}

/** Extract segs from BevelProp: 0=flat, 2=cone, 3+=dome with that many segments */
function bevelPropToSegs(bevel: BevelProp): number {
  if (bevel === 'flat') return 0;
  if (bevel === 'dome') return -1; // use geometry's segments
  if (bevel === 'cone') return 2;
  if (typeof bevel === 'number') return -1; // use geometry's segments
  if (typeof bevel === 'object' && bevel !== null) {
    const {segs, height} = bevel;
    if (height <= 0) return 0;
    return segs;
  }
  return 0;
}

/** Extract bulge from BevelProp: 0=standard curve, negative=concave, positive=convex */
function bevelPropToBulge(bevel: BevelProp): number {
  if (typeof bevel === 'object' && bevel !== null) {
    return bevel.bulge ?? 0;
  }
  return 0; // default: standard dome curve
}

const defaultProps: DefaultProps<ColumnLayerProps> = {
  diskResolution: {type: 'number', min: 4, value: 20},
  bevelSegments: null,
  vertices: null,
  radius: {type: 'number', min: 0, value: 1000},
  angle: {type: 'number', value: 0},
  offset: {type: 'array', value: [0, 0]},
  coverage: {type: 'number', min: 0, max: 1, value: 1},
  elevationScale: {type: 'number', min: 0, value: 1},
  radiusUnits: 'meters',
  lineWidthUnits: 'meters',
  lineWidthScale: 1,
  lineWidthMinPixels: 0,
  lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,

  extruded: true,
  wireframe: false,
  filled: true,
  stroked: false,
  flatShading: false,

  getPosition: {type: 'accessor', value: (x: any) => x.position},
  getFillColor: {type: 'accessor', value: DEFAULT_COLOR},
  getLineColor: {type: 'accessor', value: DEFAULT_COLOR},
  getLineWidth: {type: 'accessor', value: 1},
  getElevation: {type: 'accessor', value: 1000},
  getBevel: {type: 'accessor', value: 'flat'},
  material: true,
  getColor: {deprecatedFor: ['getFillColor', 'getLineColor']}
};

/** All properties supported by ColumnLayer. */
export type ColumnLayerProps<DataT = unknown> = _ColumnLayerProps<DataT> & LayerProps;

/** Properties added by ColumnLayer. */
type _ColumnLayerProps<DataT> = {
  data: LayerDataSource<DataT>;
  /**
   * The number of sides to render the disk as.
   * @default 20
   */
  diskResolution?: number;

  /**
   * Number of segments for the bevel cap. Higher = smoother dome.
   * 0 = flat cap, 2 = cone, 3+ = smooth dome.
   * @default diskResolution / 4
   */
  bevelSegments?: number | null;

  /**
   * Disk size in units specified by `radiusUnits`.
   * @default 1000
   */
  radius?: number;

  /**
   * Disk rotation, counter-clockwise in degrees.
   * @default 0
   */
  angle?: number;

  /**
   * Replace the default geometry (regular polygon that fits inside the unit circle) with a custom one.
   * @default null
   */
  vertices?: Position[] | null;

  /**
   * Disk offset from the position, relative to the radius.
   * @default [0,0]
   */
  offset?: [number, number];

  /**
   * Radius multiplier, between 0 - 1
   * @default 1
   */
  coverage?: number;

  /**
   * Column elevation multiplier.
   * @default 1
   */
  elevationScale?: number;

  /**
   * Whether to draw a filled column (solid fill).
   * @default true
   */
  filled?: boolean;

  /**
   * Whether to draw an outline around the disks.
   * @default false
   */
  stroked?: boolean;

  /**
   * Whether to extrude the columns. If set to `false`, all columns will be rendered as flat polygons.
   * @default true
   */
  extruded?: boolean;

  /**
   * Whether to generate a line wireframe of the column.
   * @default false
   */
  wireframe?: boolean;

  /**
   * If `true`, the vertical surfaces of the columns use [flat shading](https://en.wikipedia.org/wiki/Shading#Flat_vs._smooth_shading).
   * @default false
   */
  flatShading?: boolean;

  /**
   * The units of the radius.
   * @default 'meters'
   */
  radiusUnits?: Unit;

  /**
   * The units of the line width.
   * @default 'meters'
   */
  lineWidthUnits?: Unit;

  /**
   * The line width multiplier that multiplied to all outlines.
   * @default 1
   */
  lineWidthScale?: number;

  /**
   * The minimum outline width in pixels.
   * @default 0
   */
  lineWidthMinPixels?: number;

  /**
   * The maximum outline width in pixels.
   * @default Number.MAX_SAFE_INTEGER
   */
  lineWidthMaxPixels?: number;

  /**
   * Material settings for lighting effect. Applies if `extruded: true`.
   *
   * @default true
   * @see https://deck.gl/docs/developer-guide/using-lighting
   */
  material?: Material;

  /**
   * Method called to retrieve the position of each column.
   * @default object => object.position
   */
  getPosition?: AccessorFunction<DataT, Position>;

  /**
   * @deprecated Use getFilledColor and getLineColor instead
   */
  getColor?: Accessor<DataT, Color>;

  /**
   * Fill collor value or accessor.
   * @default [0, 0, 0, 255]
   */
  getFillColor?: Accessor<DataT, Color>;

  /**
   * Line color value or accessor.
   *
   * @default [0, 0, 0, 255]
   */
  getLineColor?: Accessor<DataT, Color>;

  /**
   * The elevation of each cell in meters.
   * @default 1000
   */
  getElevation?: Accessor<DataT, number>;

  /**
   * The width of the outline of the column, in units specified by `lineWidthUnits`.
   *
   * @default 1
   */
  getLineWidth?: Accessor<DataT, number>;

  /**
   * The bevel configuration for each column.
   * - 'flat': No bevel (flat top) - default
   * - 'dome': Rounded dome with smooth normals (height = radius)
   * - 'cone': Pointed cone (height = radius)
   * - {segs, height, bulge?}: Full control over bevel shape
   *
   * @default 'flat'
   */
  getBevel?: Accessor<DataT, BevelProp>;
};

/** Render extruded cylinders (tessellated regular polygons) at given coordinates. */
export default class ColumnLayer<DataT = any, ExtraPropsT extends {} = {}> extends Layer<
  ExtraPropsT & Required<_ColumnLayerProps<DataT>>
> {
  static layerName = 'ColumnLayer';
  static defaultProps = defaultProps;

  state!: {
    fillModel?: Model;
    wireframeModel?: Model;
    models?: Model[];
    fillVertexCount: number;
    edgeDistance: number;
  };

  getShaders() {
    const defines: Record<string, any> = {};

    const {flatShading} = this.props;
    if (flatShading) {
      defines.FLAT_SHADING = 1;
    }
    return super.getShaders({
      vs,
      fs,
      defines,
      modules: [project32, flatShading ? phongMaterial : gouraudMaterial, picking, columnUniforms]
    });
  }

  /**
   * DeckGL calls initializeState when GL context is available
   * Essentially a deferred constructor
   */
  initializeState() {
    const attributeManager = this.getAttributeManager()!;
    /* eslint-disable max-len */
    attributeManager.addInstanced({
      instancePositions: {
        size: 3,
        type: 'float64',
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: 'getPosition'
      },
      instanceElevations: {
        size: 1,
        transition: true,
        accessor: 'getElevation'
      },
      instanceFillColors: {
        size: this.props.colorFormat.length,
        type: 'unorm8',
        transition: true,
        accessor: 'getFillColor',
        defaultValue: DEFAULT_COLOR
      },
      instanceLineColors: {
        size: this.props.colorFormat.length,
        type: 'unorm8',
        transition: true,
        accessor: 'getLineColor'
      },
      instanceStrokeWidths: {
        size: 1,
        accessor: 'getLineWidth',
        transition: true
      },
      instanceBevelHeights: {
        size: 1,
        transition: true,
        accessor: 'getBevel',
        transform: bevelPropToHeight
      },
      instanceBevelSegs: {
        size: 1,
        transition: true,
        accessor: 'getBevel',
        transform: bevelPropToSegs
      },
      instanceBevelBulge: {
        size: 1,
        transition: true,
        accessor: 'getBevel',
        transform: bevelPropToBulge
      }
    });
    /* eslint-enable max-len */
  }

  updateState(params: UpdateParameters<this>): void {
    super.updateState(params);

    const {props, oldProps, changeFlags} = params;
    const regenerateModels =
      changeFlags.extensionsChanged || props.flatShading !== oldProps.flatShading;

    if (regenerateModels) {
      this.state.models?.forEach(model => model.destroy());
      this.setState(this._getModels());
      this.getAttributeManager()!.invalidateAll();
    }

    const instanceCount = this.getNumInstances();
    this.state.fillModel!.setInstanceCount(instanceCount);
    this.state.wireframeModel!.setInstanceCount(instanceCount);

    if (
      regenerateModels ||
      props.diskResolution !== oldProps.diskResolution ||
      props.bevelSegments !== oldProps.bevelSegments ||
      props.vertices !== oldProps.vertices ||
      (props.extruded || props.stroked) !== (oldProps.extruded || oldProps.stroked)
    ) {
      this._updateGeometry(props);
    }
  }

  getGeometry(diskResolution: number, vertices: number[] | undefined, hasThickness: boolean) {
    // Always generate geometry with bevel (dome shape)
    // Per-instance getBevel controls whether each instance shows it
    const bevelSegments = this.props.bevelSegments ?? Math.max(3, Math.floor(diskResolution / 4));
    const geometry = new ColumnGeometry({
      radius: 1,
      height: hasThickness ? 2 : 0,
      vertices,
      nradial: diskResolution,
      bevelSegments,
      bevelHeight: 1, // Full dome by default
      smoothNormals: true
    });

    let meanVertexDistance = 0;
    if (vertices) {
      for (let i = 0; i < diskResolution; i++) {
        const p = vertices[i];
        const d = Math.sqrt(p[0] * p[0] + p[1] * p[1]);
        meanVertexDistance += d / diskResolution;
      }
    } else {
      meanVertexDistance = 1;
    }
    this.setState({
      edgeDistance: Math.cos(Math.PI / diskResolution) * meanVertexDistance
    });

    return geometry;
  }

  protected _getModels() {
    const shaders = this.getShaders();
    const bufferLayout = this.getAttributeManager()!.getBufferLayouts();

    const fillModel = new Model(this.context.device, {
      ...shaders,
      id: `${this.props.id}-fill`,
      bufferLayout,
      isInstanced: true
    });
    const wireframeModel = new Model(this.context.device, {
      ...shaders,
      id: `${this.props.id}-wireframe`,
      bufferLayout,
      isInstanced: true
    });

    return {
      fillModel,
      wireframeModel,
      models: [wireframeModel, fillModel]
    };
  }

  protected _updateGeometry({diskResolution, vertices, extruded, stroked}) {
    const geometry = this.getGeometry(diskResolution, vertices, extruded || stroked);

    this.setState({
      fillVertexCount: geometry.attributes.POSITION.value.length / 3
    });

    const fillModel = this.state.fillModel!;
    const wireframeModel = this.state.wireframeModel!;
    fillModel.setGeometry(geometry);
    fillModel.setTopology('triangle-strip');
    // Disable indices
    fillModel.setIndexBuffer(null);

    wireframeModel.setGeometry(geometry);
    wireframeModel.setTopology('line-list');
  }

  draw({uniforms}) {
    const {
      lineWidthUnits,
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels,
      radiusUnits,
      elevationScale,
      extruded,
      filled,
      stroked,
      wireframe,
      offset,
      coverage,
      radius,
      angle
    } = this.props;
    const fillModel = this.state.fillModel!;
    const wireframeModel = this.state.wireframeModel!;
    const {fillVertexCount, edgeDistance} = this.state;

    // Bevel is always enabled (geometry always has dome shape)
    // Per-instance getBevel controls height via instanceBevelHeights attribute
    const bevelEnabled = true;
    // bevelSize is the world-space height of the bevel (1 * radius * coverage for full dome)
    const bevelSize = radius * coverage;
    // bevelTopZ is 0 for full dome (bevelHeight = 1)
    const bevelTopZ = 0;

    const columnProps: Omit<ColumnProps, 'isStroke'> = {
      radius,
      angle: (angle / 180) * Math.PI,
      offset,
      extruded,
      stroked,
      coverage,
      elevationScale,
      edgeDistance,
      radiusUnits: UNIT[radiusUnits],
      widthUnits: UNIT[lineWidthUnits],
      widthScale: lineWidthScale,
      widthMinPixels: lineWidthMinPixels,
      widthMaxPixels: lineWidthMaxPixels,
      bevelEnabled,
      bevelSize,
      bevelTopZ
    };

    // When drawing 3d: draw wireframe first so it doesn't get occluded by depth test
    if (extruded && wireframe) {
      wireframeModel.shaderInputs.setProps({
        column: {
          ...columnProps,
          isStroke: true
        }
      });
      wireframeModel.draw(this.context.renderPass);
    }

    if (filled) {
      // model.setProps({isIndexed: false});
      fillModel.setVertexCount(fillVertexCount);
      fillModel.shaderInputs.setProps({
        column: {
          ...columnProps,
          isStroke: false
        }
      });
      fillModel.draw(this.context.renderPass);
    }
    // When drawing 2d: draw fill before stroke so that the outline is always on top
    if (!extruded && stroked) {
      // model.setProps({isIndexed: false});
      // The width of the stroke is achieved by flattening the side of the cylinder.
      // Skip the last 1/3 of the vertices which is the top.
      fillModel.setVertexCount((fillVertexCount * 2) / 3);
      fillModel.shaderInputs.setProps({
        column: {
          ...columnProps,
          isStroke: true
        }
      });
      fillModel.draw(this.context.renderPass);
    }
  }
}
