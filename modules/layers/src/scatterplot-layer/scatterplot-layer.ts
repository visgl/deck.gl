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

import vs from './scatterplot-layer-vertex.glsl';
import fs from './scatterplot-layer-fragment.glsl';

import type {LayerProps, LayerContext, Accessor, Unit, Position, Color} from '@deck.gl/core';

const DEFAULT_COLOR = [0, 0, 0, 255];

export type ScatterplotLayerProps<DataT> = LayerProps<DataT> & {
  radiusUnits: Unit;
  radiusScale: number;
  radiusMinPixels: number;
  radiusMaxPixels: number;

  lineWidthUnits: Unit;
  lineWidthScale: number;
  lineWidthMinPixels: number;
  lineWidthMaxPixels: number;

  stroked: boolean;
  filled: boolean;
  billboard: boolean;
  antialiasing: boolean;

  getPosition: Accessor<DataT, Position>;
  getRadius: Accessor<DataT, number>;
  getFillColor: Accessor<DataT, Color>;
  getLineColor: Accessor<DataT, Color>;
  getLineWidth: Accessor<DataT, number>;
};

const defaultProps = {
  radiusUnits: 'meters',
  radiusScale: {type: 'number', min: 0, value: 1},
  radiusMinPixels: {type: 'number', min: 0, value: 0}, //  min point radius in pixels
  radiusMaxPixels: {type: 'number', min: 0, value: Number.MAX_SAFE_INTEGER}, // max point radius in pixels

  lineWidthUnits: 'meters',
  lineWidthScale: {type: 'number', min: 0, value: 1},
  lineWidthMinPixels: {type: 'number', min: 0, value: 0},
  lineWidthMaxPixels: {type: 'number', min: 0, value: Number.MAX_SAFE_INTEGER},

  stroked: false,
  filled: true,
  billboard: false,
  antialiasing: true,

  getPosition: {type: 'accessor', value: x => x.position},
  getRadius: {type: 'accessor', value: 1},
  getFillColor: {type: 'accessor', value: DEFAULT_COLOR},
  getLineColor: {type: 'accessor', value: DEFAULT_COLOR},
  getLineWidth: {type: 'accessor', value: 1},

  // deprecated
  strokeWidth: {deprecatedFor: 'getLineWidth'},
  outline: {deprecatedFor: 'stroked'},
  getColor: {deprecatedFor: ['getFillColor', 'getLineColor']}
};

export default class ScatterplotLayer<
  DataT = any,
  PropsT extends ScatterplotLayerProps<DataT> = ScatterplotLayerProps<DataT>
> extends Layer<PropsT> {
  static defaultProps: any = defaultProps;
  static layerName: string = 'ScatterplotLayer';

  getShaders() {
    return super.getShaders({vs, fs, modules: [project32, picking]});
  }

  initializeState() {
    // @ts-ignore (TS2531) attributeManager is always defined for primitive layer
    this.getAttributeManager().addInstanced({
      instancePositions: {
        size: 3,
        type: GL.DOUBLE,
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: 'getPosition'
      },
      instanceRadius: {
        size: 1,
        transition: true,
        accessor: 'getRadius',
        defaultValue: 1
      },
      instanceFillColors: {
        // @ts-ignore (TS2322) colorFormat.length can only be 3 or 4
        size: this.props.colorFormat.length,
        transition: true,
        normalized: true,
        type: GL.UNSIGNED_BYTE,
        accessor: 'getFillColor',
        defaultValue: [0, 0, 0, 255]
      },
      instanceLineColors: {
        // @ts-ignore (TS2322) colorFormat.length can only be 3 or 4
        size: this.props.colorFormat.length,
        transition: true,
        normalized: true,
        type: GL.UNSIGNED_BYTE,
        accessor: 'getLineColor',
        defaultValue: [0, 0, 0, 255]
      },
      instanceLineWidths: {
        size: 1,
        transition: true,
        accessor: 'getLineWidth',
        defaultValue: 1
      }
    });
  }

  updateState(params) {
    super.updateState(params);

    if (params.changeFlags.extensionsChanged) {
      const {gl} = this.context as LayerContext;
      // @ts-ignore (TS2531) state is always defined
      this.state.model?.delete();
      // @ts-ignore (TS2531) state is always defined
      this.state.model = this._getModel(gl);
      // @ts-ignore (TS2531) attributeManager is always defined for primitive layer
      this.getAttributeManager().invalidateAll();
    }
  }

  draw({uniforms}) {
    const {
      radiusUnits,
      radiusScale,
      radiusMinPixels,
      radiusMaxPixels,
      stroked,
      filled,
      billboard,
      antialiasing,
      lineWidthUnits,
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels
    } = this.props;

    // @ts-ignore (TS2531) state is always defined
    this.state.model
      .setUniforms(uniforms)
      .setUniforms({
        stroked: stroked ? 1 : 0,
        filled,
        billboard,
        antialiasing,
        radiusUnits: UNIT[radiusUnits],
        radiusScale,
        radiusMinPixels,
        radiusMaxPixels,
        lineWidthUnits: UNIT[lineWidthUnits],
        lineWidthScale,
        lineWidthMinPixels,
        lineWidthMaxPixels
      })
      .draw();
  }

  _getModel(gl) {
    // a square that minimally cover the unit circle
    const positions = [-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0];

    return new Model(gl, {
      ...this.getShaders(),
      id: this.props.id,
      geometry: new Geometry({
        drawMode: GL.TRIANGLE_FAN,
        vertexCount: 4,
        attributes: {
          positions: {size: 3, value: new Float32Array(positions)}
        }
      }),
      isInstanced: true
    });
  }
}
