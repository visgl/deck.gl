// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import {Layer, project32, picking, UNIT} from '@deck.gl/core';
import GL from '@luma.gl/constants';
import {Model, Geometry} from '@luma.gl/core';
import PathTesselator from './path-tesselator';

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

export type PathLayerProps<DataT = any> = _PathLayerProps<DataT> & LayerProps;

const DEFAULT_COLOR: [number, number, number, number] = [0, 0, 0, 255];

const defaultProps: DefaultProps<PathLayerProps> = {
  widthUnits: 'meters',
  widthScale: {type: 'number', min: 0, value: 1},
  widthMinPixels: {type: 'number', min: 0, value: 0},
  widthMaxPixels: {type: 'number', min: 0, value: Number.MAX_SAFE_INTEGER},
  jointRounded: false,
  capRounded: false,
  miterLimit: {type: 'number', min: 0, value: 4},
  billboard: false,
  _pathType: null,

  getPath: {type: 'accessor', value: object => object.path},
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
    return super.getShaders({vs, fs, modules: [project32, picking]}); // 'project' module added by default.
  }

  get wrapLongitude(): boolean {
    return false;
  }

  initializeState() {
    const noAlloc = true;
    const attributeManager = this.getAttributeManager();
    /* eslint-disable max-len */
    attributeManager!.addInstanced({
      positions: {
        size: 3,
        // Start filling buffer from 1 vertex in
        vertexOffset: 1,
        type: GL.DOUBLE,
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
      },
      instanceTypes: {
        size: 1,
        type: GL.UNSIGNED_BYTE,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this.calculateSegmentTypes,
        noAlloc
      },
      instanceStrokeWidths: {
        size: 1,
        accessor: 'getWidth',
        transition: ATTRIBUTE_TRANSITION,
        defaultValue: 1
      },
      instanceColors: {
        size: this.props.colorFormat.length,
        type: GL.UNSIGNED_BYTE,
        normalized: true,
        accessor: 'getColor',
        transition: ATTRIBUTE_TRANSITION,
        defaultValue: DEFAULT_COLOR
      },
      instancePickingColors: {
        size: 3,
        type: GL.UNSIGNED_BYTE,
        accessor: (object, {index, target: value}) =>
          this.encodePickingColor(object && object.__source ? object.__source.index : index, value)
      }
    });
    /* eslint-enable max-len */

    this.setState({
      pathTesselator: new PathTesselator({
        fp64: this.use64bitPositions()
      })
    });
  }

  updateState(params: UpdateParameters<this>) {
    super.updateState(params);
    const {props, changeFlags} = params;

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

    if (changeFlags.extensionsChanged) {
      const {gl} = this.context;
      this.state.model?.delete();
      this.state.model = this._getModel(gl);
      attributeManager!.invalidateAll();
    }
  }

  getPickingInfo(params: GetPickingInfoParams): PickingInfo {
    const info = super.getPickingInfo(params);
    const {index} = info;
    const {data} = this.props;

    // Check if data comes from a composite layer, wrapped with getSubLayerRow
    if (data[0] && data[0].__source) {
      // index decoded from picking color refers to the source index
      info.object = (data as any[]).find(d => d.__source.index === index);
    }
    return info;
  }

  /** Override base Layer method */
  disablePickingIndex(objectIndex: number) {
    const {data} = this.props;

    // Check if data comes from a composite layer, wrapped with getSubLayerRow
    if (data[0] && data[0].__source) {
      // index decoded from picking color refers to the source index
      for (let i = 0; i < (data as any[]).length; i++) {
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

    this.state.model
      .setUniforms(uniforms)
      .setUniforms({
        jointType: Number(jointRounded),
        capType: Number(capRounded),
        billboard,
        widthUnits: UNIT[widthUnits],
        widthScale,
        miterLimit,
        widthMinPixels,
        widthMaxPixels
      })
      .draw();
  }

  protected _getModel(gl: WebGLRenderingContext): Model {
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

    // prettier-ignore
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
    // prettier-ignore
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

    return new Model(gl, {
      ...this.getShaders(),
      id: this.props.id,
      geometry: new Geometry({
        drawMode: GL.TRIANGLES,
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
}
