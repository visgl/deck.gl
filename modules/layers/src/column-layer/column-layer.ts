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

import {
  Layer,
  project32,
  gouraudLighting,
  phongLighting,
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
import GL from '@luma.gl/constants';
import {Model, isWebGL2, hasFeature, FEATURES} from '@luma.gl/core';
import ColumnGeometry from './column-geometry';

import vs from './column-layer-vertex.glsl';
import fs from './column-layer-fragment.glsl';

const DEFAULT_COLOR: [number, number, number, number] = [0, 0, 0, 255];

const defaultProps: DefaultProps<ColumnLayerProps> = {
  diskResolution: {type: 'number', min: 4, value: 20},
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

  getPosition: {type: 'accessor', value: x => x.position},
  getFillColor: {type: 'accessor', value: DEFAULT_COLOR},
  getLineColor: {type: 'accessor', value: DEFAULT_COLOR},
  getLineWidth: {type: 'accessor', value: 1},
  getElevation: {type: 'accessor', value: 1000},
  material: true,
  getColor: {deprecatedFor: ['getFillColor', 'getLineColor']}
};

/** All properties supported by ColumnLayer. */
export type ColumnLayerProps<DataT = any> = _ColumnLayerProps<DataT> & LayerProps;

/** Properties added by ColumnLayer. */
type _ColumnLayerProps<DataT> = {
  data: LayerDataSource<DataT>;
  /**
   * The number of sides to render the disk as.
   * @default 20
   */
  diskResolution?: number;

  /**
   * isk size in units specified by `radiusUnits`.
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
  vertices: Position[] | null;

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
};

/** Render extruded cylinders (tessellated regular polygons) at given coordinates. */
export default class ColumnLayer<DataT = any, ExtraPropsT extends {} = {}> extends Layer<
  ExtraPropsT & Required<_ColumnLayerProps<DataT>>
> {
  static layerName = 'ColumnLayer';
  static defaultProps = defaultProps;

  getShaders() {
    const {gl} = this.context;
    const transpileToGLSL100 = !isWebGL2(gl);
    const defines: Record<string, any> = {};

    const useDerivatives = this.props.flatShading && hasFeature(gl, FEATURES.GLSL_DERIVATIVES);
    if (useDerivatives) {
      defines.FLAT_SHADING = 1;
    }
    return super.getShaders({
      vs,
      fs,
      defines,
      transpileToGLSL100,
      modules: [project32, useDerivatives ? phongLighting : gouraudLighting, picking]
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
        type: GL.DOUBLE,
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
        type: GL.UNSIGNED_BYTE,
        normalized: true,
        transition: true,
        accessor: 'getFillColor',
        defaultValue: DEFAULT_COLOR
      },
      instanceLineColors: {
        size: this.props.colorFormat.length,
        type: GL.UNSIGNED_BYTE,
        normalized: true,
        transition: true,
        accessor: 'getLineColor',
        defaultValue: DEFAULT_COLOR
      },
      instanceStrokeWidths: {
        size: 1,
        accessor: 'getLineWidth',
        transition: true
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
      const {gl} = this.context;
      this.state.model?.delete();
      this.state.model = this._getModel(gl);
      this.getAttributeManager()!.invalidateAll();
    }

    if (
      regenerateModels ||
      props.diskResolution !== oldProps.diskResolution ||
      props.vertices !== oldProps.vertices ||
      (props.extruded || props.stroked) !== (oldProps.extruded || oldProps.stroked)
    ) {
      this._updateGeometry(props);
    }
  }

  getGeometry(diskResolution: number, vertices: number[] | undefined, hasThinkness: boolean) {
    const geometry = new ColumnGeometry({
      radius: 1,
      height: hasThinkness ? 2 : 0,
      vertices,
      nradial: diskResolution
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

  protected _getModel(gl: WebGLRenderingContext): Model {
    return new Model(gl, {
      ...this.getShaders(),
      id: this.props.id,
      isInstanced: true
    });
  }

  protected _updateGeometry({diskResolution, vertices, extruded, stroked}) {
    const geometry: any = this.getGeometry(diskResolution, vertices, extruded || stroked);

    this.setState({
      fillVertexCount: geometry.attributes.POSITION.value.length / 3,
      wireframeVertexCount: geometry.indices.value.length
    });

    this.state.model.setProps({geometry});
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
    const {model, fillVertexCount, wireframeVertexCount, edgeDistance} = this.state;

    model.setUniforms(uniforms).setUniforms({
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
      widthMaxPixels: lineWidthMaxPixels
    });

    // When drawing 3d: draw wireframe first so it doesn't get occluded by depth test
    if (extruded && wireframe) {
      model.setProps({isIndexed: true});
      model
        .setVertexCount(wireframeVertexCount)
        .setDrawMode(GL.LINES)
        .setUniforms({isStroke: true})
        .draw();
    }
    if (filled) {
      model.setProps({isIndexed: false});
      model
        .setVertexCount(fillVertexCount)
        .setDrawMode(GL.TRIANGLE_STRIP)
        .setUniforms({isStroke: false})
        .draw();
    }
    // When drawing 2d: draw fill before stroke so that the outline is always on top
    if (!extruded && stroked) {
      model.setProps({isIndexed: false});
      // The width of the stroke is achieved by flattening the side of the cylinder.
      // Skip the last 1/3 of the vertices which is the top.
      model
        .setVertexCount((fillVertexCount * 2) / 3)
        .setDrawMode(GL.TRIANGLE_STRIP)
        .setUniforms({isStroke: true})
        .draw();
    }
  }
}
