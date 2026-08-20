// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Layer, project32, color, picking, UNIT} from '@deck.gl/core';
import {Geometry} from '@luma.gl/engine';
import {Model} from '@luma.gl/engine';
import PathTesselator from './path-tesselator';

import {pathUniforms, PathProps} from './path-layer-uniforms';
import source from './path-layer.wgsl';
import vs from './path-layer-vertex.glsl';
import fs from './path-layer-fragment.glsl';

import type {
  LayerProps,
  LayerDataSource,
  Color,
  Accessor,
  AccessorFunction,
  Unit,
  UpdateParameters,
  GetPickingInfoParams,
  PickingInfo,
  DefaultProps
} from '@deck.gl/core';
import type {PathGeometry} from './path';

type _PathLayerProps<DataT> = {
  data: LayerDataSource<DataT>;
  /** The units of the line width, one of `'meters'`, `'common'`, and `'pixels'`
   * @default 'meters'
   */
  widthUnits?: Unit;
  /**
   * Path width multiplier.
   * @default 1
   */
  widthScale?: number;
  /**
   * The minimum path width in pixels. This prop can be used to prevent the path from getting too thin when zoomed out.
   * @default 0
   */
  widthMinPixels?: number;
  /**
   * The maximum path width in pixels. This prop can be used to prevent the path from getting too thick when zoomed in.
   * @default Number.MAX_SAFE_INTEGER
   */
  widthMaxPixels?: number;
  /**
   * Type of joint. If `true`, draw round joints. Otherwise draw miter joints.
   * @default false
   */
  jointRounded?: boolean;
  /**
   * Type of caps. If `true`, draw round caps. Otherwise draw square caps.
   * @default false
   */
  capRounded?: boolean;
  /**
   * The maximum extent of a joint in ratio to the stroke width. Only works if `jointRounded` is `false`.
   * @default 4
   */
  miterLimit?: number;
  /**
   * When enabled, computes edge coverage in the shader. When disabled, relies on render-target
   * multisampling. Shader-computed coverage can cause artifacts where a path overlaps itself. Only
   * the edges along the width of the path are smoothed - flat caps at the two ends are not.
   * @default false
   * @see https://luma.gl/docs/api-guide/gpu/gpu-antialiasing
   */
  antialiasing?: boolean;
  /**
   * If `true`, extrude the path in screen space (width always faces the camera).
   * If `false`, the width always faces up (z).
   * @default false
   */
  billboard?: boolean;
  /**
   * (Experimental) If `'loop'` or `'open'`, will skip normalizing the coordinates returned by `getPath` and instead assume all paths are to be loops or open paths.
   * When normalization is disabled, paths must be specified in the format of flat array. Open paths must contain at least 2 vertices and closed paths must contain at least 3 vertices.
   * @default null
   */
  _pathType?: null | 'loop' | 'open';
  /**
   * Path geometry accessor.
   */
  getPath?: AccessorFunction<DataT, PathGeometry>;
  /**
   * Path color accessor.
   * @default [0, 0, 0, 255]
   */
  getColor?: Accessor<DataT, Color | Color[]>;
  /**
   * Path width accessor.
   * @default 1
   */
  getWidth?: Accessor<DataT, number | number[]>;
  /**
   * @deprecated Use `jointRounded` and `capRounded` instead
   */
  rounded?: boolean;
};

export type PathLayerProps<DataT = unknown> = _PathLayerProps<DataT> & LayerProps;

const DEFAULT_COLOR = [0, 0, 0, 255] as const;

const defaultProps: DefaultProps<PathLayerProps> = {
  widthUnits: 'meters',
  widthScale: {type: 'number', min: 0, value: 1},
  widthMinPixels: {type: 'number', min: 0, value: 0},
  widthMaxPixels: {type: 'number', min: 0, value: Number.MAX_SAFE_INTEGER},
  jointRounded: false,
  capRounded: false,
  miterLimit: {type: 'number', min: 0, value: 4},
  antialiasing: false,
  billboard: false,
  _pathType: null,

  getPath: {type: 'accessor', value: (object: any) => object.path},
  getColor: {type: 'accessor', value: DEFAULT_COLOR},
  getWidth: {type: 'accessor', value: 1},

  // deprecated props
  rounded: {deprecatedFor: ['jointRounded', 'capRounded']}
};

const ATTRIBUTE_TRANSITION = {
  enter: (value, chunk) => {
    return chunk.length ? chunk.subarray(chunk.length - value.length) : value;
  }
};

/** Render lists of coordinate points as extruded polylines with mitering. */
export default class PathLayer<DataT = any, ExtraPropsT extends {} = {}> extends Layer<
  ExtraPropsT & Required<_PathLayerProps<DataT>>
> {
  static defaultProps = defaultProps;
  static layerName = 'PathLayer';

  state!: {
    model?: Model;
    pathTesselator: PathTesselator;
  };

  getShaders() {
    const {antialiasing} = this.props;
    return super.getShaders({
      vs,
      fs,
      source,
      defines: antialiasing ? {ANTIALIASING: 1} : {},
      modules: [project32, color, picking, pathUniforms]
    }); // 'project' module added by default.
  }

  get wrapLongitude(): boolean {
    return false;
  }

  getBounds(): [number[], number[]] | null {
    if (this.context.device.type === 'webgpu') {
      return null;
    }
    return this.getAttributeManager()?.getBounds(['vertexPositions']);
  }

  initializeState() {
    const noAlloc = true;
    const isWebGPU = this.context.device.type === 'webgpu';
    const attributeManager = this.getAttributeManager();
    /* eslint-disable max-len */
    attributeManager!.addInstanced({
      ...(isWebGPU
        ? {
            // WebGPU cannot express WebGL's vertexOffset window in one vertex buffer layout.
            // Pack each segment's [left, start, end, right] high and low position parts instead.
            instancePositions: {
              size: 24,
              type: 'float32',
              transition: false,
              accessor: 'getPath',
              // eslint-disable-next-line @typescript-eslint/unbound-method
              update: this.calculateWebGPUPositions,
              shaderAttributes: {
                instanceLeftPositions: {size: 3, elementOffset: 0},
                instanceStartPositions: {size: 3, elementOffset: 3},
                instanceEndPositions: {size: 3, elementOffset: 6},
                instanceRightPositions: {size: 3, elementOffset: 9},
                instanceLeftPositions64Low: {size: 3, elementOffset: 12},
                instanceStartPositions64Low: {size: 3, elementOffset: 15},
                instanceEndPositions64Low: {size: 3, elementOffset: 18},
                instanceRightPositions64Low: {size: 3, elementOffset: 21}
              },
              noAlloc
            }
          }
        : {
            vertexPositions: {
              size: 3,
              // Start filling buffer from 1 vertex in
              vertexOffset: 1,
              type: 'float64',
              fp64: this.use64bitPositions(),
              transition: ATTRIBUTE_TRANSITION,
              accessor: 'getPath',
              // eslint-disable-next-line @typescript-eslint/unbound-method
              update: this.calculatePositions,
              noAlloc,
              shaderAttributes: {
                instanceLeftPositions: {
                  vertexOffset: 0
                },
                instanceStartPositions: {
                  vertexOffset: 1
                },
                instanceEndPositions: {
                  vertexOffset: 2
                },
                instanceRightPositions: {
                  vertexOffset: 3
                }
              }
            }
          }),
      instanceTypes: {
        size: 1,
        type: isWebGPU ? 'float32' : 'uint8',
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this.calculateSegmentTypes,
        noAlloc
      },
      instanceStrokeWidths: {
        size: 1,
        accessor: 'getWidth',
        transition: isWebGPU ? false : ATTRIBUTE_TRANSITION,
        defaultValue: 1,
        bufferGroup: 'path-instance-data'
      },
      instanceColors: {
        size: this.props.colorFormat.length,
        type: 'unorm8',
        accessor: 'getColor',
        transition: isWebGPU ? false : ATTRIBUTE_TRANSITION,
        defaultValue: DEFAULT_COLOR,
        bufferGroup: 'path-instance-data'
      },
      /** Source path row for each generated segment/joint instance. */
      rowIndexes: {
        size: 1,
        type: 'uint32',
        accessor: (object, {index}) => (object && object.__source ? object.__source.index : index),
        // AttributeManager only materializes buffer groups on WebGPU, so WebGL keeps its layout.
        bufferGroup: 'path-instance-data'
      }
    });
    /* eslint-enable max-len */

    this.setState({
      pathTesselator: new PathTesselator({
        fp64: this.use64bitPositions(),
        isWebGPU
      })
    });
  }

  updateState(params: UpdateParameters<this>) {
    super.updateState(params);
    const {props, oldProps, changeFlags} = params;

    const attributeManager = this.getAttributeManager();

    const geometryChanged =
      changeFlags.dataChanged ||
      (changeFlags.updateTriggersChanged &&
        (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getPath));

    if (geometryChanged) {
      const {pathTesselator} = this.state;
      const buffers = (props.data as any).attributes || {};

      pathTesselator.updateGeometry({
        data: props.data,
        geometryBuffer: buffers.getPath,
        buffers,
        normalize: !props._pathType,
        loop: props._pathType === 'loop',
        getGeometry: props.getPath,
        positionFormat: props.positionFormat,
        wrapLongitude: props.wrapLongitude,
        // TODO - move the flag out of the viewport
        resolution: this.context.viewport.resolution,
        dataChanged: changeFlags.dataChanged
      });
      this.setState({
        numInstances: pathTesselator.instanceCount,
        startIndices: pathTesselator.vertexStarts
      });
      if (!changeFlags.dataChanged) {
        // Base `layer.updateState` only invalidates all attributes on data change
        // Cover the rest of the scenarios here
        attributeManager!.invalidateAll();
      }
    }

    if (changeFlags.extensionsChanged || props.antialiasing !== oldProps.antialiasing) {
      this.state.model?.destroy();
      this.state.model = this._getModel();
      attributeManager!.invalidateAll();
    }
  }

  getPickingInfo(params: GetPickingInfoParams): PickingInfo {
    const info = super.getPickingInfo(params);
    const {index} = info;
    const data = this.props.data as any[];

    // Check if data comes from a composite layer, wrapped with getSubLayerRow
    if (data[0] && data[0].__source) {
      // index decoded from picking color refers to the source index
      info.object = data.find(d => d.__source.index === index);
    }
    return info;
  }

  /** Override base Layer method */
  disablePickingIndex(objectIndex: number) {
    const data = this.props.data as any[];

    // Check if data comes from a composite layer, wrapped with getSubLayerRow
    if (data[0] && data[0].__source) {
      // index decoded from picking color refers to the source index
      for (let i = 0; i < data.length; i++) {
        if (data[i].__source.index === objectIndex) {
          this._disablePickingIndex(i);
        }
      }
    } else {
      super.disablePickingIndex(objectIndex);
    }
  }

  draw({uniforms}) {
    const {
      jointRounded,
      capRounded,
      billboard,
      miterLimit,
      widthUnits,
      widthScale,
      widthMinPixels,
      widthMaxPixels
    } = this.props;

    const model = this.state.model!;
    const pathProps: PathProps = {
      jointType: Number(jointRounded),
      capType: Number(capRounded),
      billboard,
      widthUnits: UNIT[widthUnits],
      widthScale,
      miterLimit,
      widthMinPixels,
      widthMaxPixels
    };
    model.shaderInputs.setProps({path: pathProps});
    model.draw(this.context.renderPass);
  }

  protected _getModel(): Model {
    /*
     *       _
     *        "-_ 1                   3                       5
     *     _     "o---------------------o-------------------_-o
     *       -   / ""--..__              '.             _.-' /
     *   _     "@- - - - - ""--..__- - - - x - - - -_.@'    /
     *    "-_  /                   ""--..__ '.  _,-` :     /
     *       "o----------------------------""-o'    :     /
     *      0,2                            4 / '.  :     /
     *                                      /   '.:     /
     *                                     /     :'.   /
     *                                    /     :  ', /
     *                                   /     :     o
     */

    // biome-ignore format: preserve layout
    const SEGMENT_INDICES = [
      // start corner
      0, 1, 2,
      // body
      1, 4, 2,
      1, 3, 4,
      // end corner
      3, 5, 4
    ];

    // [0] position on segment - 0: start, 1: end
    // [1] side of path - -1: left, 0: center (joint), 1: right
    // biome-ignore format: preserve layout
    const SEGMENT_POSITIONS = [
      // bevel start corner
      0, 0,
      // start inner corner
      0, -1,
      // start outer corner
      0, 1,
      // end inner corner
      1, -1,
      // end outer corner
      1, 1,
      // bevel end corner
      1, 0
    ];

    return new Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
      geometry: new Geometry({
        topology: 'triangle-list',
        attributes: {
          indices: new Uint16Array(SEGMENT_INDICES),
          positions: {value: new Float32Array(SEGMENT_POSITIONS), size: 2}
        }
      }),
      isInstanced: true
    });
  }

  protected calculatePositions(attribute) {
    const {pathTesselator} = this.state;

    attribute.startIndices = pathTesselator.vertexStarts;
    attribute.value = pathTesselator.get('positions');
  }

  protected calculateSegmentTypes(attribute) {
    const {pathTesselator} = this.state;

    attribute.startIndices = pathTesselator.vertexStarts;
    attribute.value = pathTesselator.get('segmentTypes');
  }

  protected calculateWebGPUPositions(attribute) {
    const {pathTesselator} = this.state;
    const value = pathTesselator.get('positions');

    if (!value) {
      attribute.value = null;
      return;
    }

    const numInstances = pathTesselator.instanceCount;
    const result = new Float32Array(numInstances * 24);
    // WebGL reads a padded neighbor window using `vertexOffset: 1`; this materializes
    // the same [-1, 0, 1, 2] access pattern explicitly for the WebGPU layout.
    const neighborOffsets = [-1, 0, 1, 2];

    for (let i = 0; i < numInstances; i++) {
      const targetIndex = i * 24;
      for (let vertexOffset = 0; vertexOffset < 4; vertexOffset++) {
        const sourceVertex = i + neighborOffsets[vertexOffset];
        const targetOffset = targetIndex + vertexOffset * 3;
        for (let j = 0; j < 3; j++) {
          const position =
            sourceVertex >= 0 && sourceVertex < numInstances ? value[sourceVertex * 3 + j] : 0;
          const highPart = Math.fround(position);
          result[targetOffset + j] = highPart;
          result[targetOffset + j + 12] = position - highPart;
        }
      }
    }

    attribute.startIndices = pathTesselator.vertexStarts;
    attribute.value = result;
  }
}
