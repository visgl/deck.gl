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

import {LayerExtension, _mergeShaders as mergeShaders} from '@deck.gl/core';
import {dashShaders, offsetShaders} from './shaders.glsl';
import {dist} from 'gl-matrix/vec3';

import type {Layer, LayerContext, Accessor, UpdateParameters} from '@deck.gl/core';

const defaultProps = {
  getDashArray: {type: 'accessor', value: [0, 0]},
  getOffset: {type: 'accessor', value: 0},
  dashJustified: false,
  dashGapPickable: false
};

export type PathStyleExtensionProps<DataT = any> = {
  /**
   * Accessor for the dash array to draw each path with: `[dashSize, gapSize]` relative to the width of the path.
   * Requires the `dash` option to be on.
   */
  getDashArray?: Accessor<DataT, [number, number]>;
  /**
   * Accessor for the offset to draw each path with, relative to the width of the path.
   * Negative offset is to the left hand side, and positive offset is to the right hand side.
   * @default 0
   */
  getOffset?: Accessor<DataT, number>;
  /**
   * If `true`, adjust gaps for the dashes to align at both ends.
   * @default false
   */
  dashJustified?: boolean;
  /**
   * If `true`, gaps between solid strokes are pickable. If `false`, only the solid strokes are pickable.
   * @default false
   */
  dashGapPickable?: boolean;
};

type PathStyleExtensionOptions = {
  /**
   * Add capability to render dashed lines.
   * @default false
   */
  dash: boolean;
  /**
   * Add capability to offset lines.
   * @default false
   */
  offset: boolean;
  /**
   * Improve dash rendering quality in certain circumstances. Note that this option introduces additional performance overhead.
   * @default false
   */
  highPrecisionDash: boolean;
};

/** Adds selected features to the `PathLayer` and composite layers that render the `PathLayer`. */
export default class PathStyleExtension extends LayerExtension<PathStyleExtensionOptions> {
  static defaultProps = defaultProps;
  static extensionName = 'PathStyleExtension';

  constructor({
    dash = false,
    offset = false,
    highPrecisionDash = false
  }: Partial<PathStyleExtensionOptions> = {}) {
    super({dash: dash || highPrecisionDash, offset, highPrecisionDash});
  }

  isEnabled(layer: Layer<PathStyleExtensionProps>): boolean {
    return 'pathTesselator' in layer.state;
  }

  getShaders(this: Layer<PathStyleExtensionProps>, extension: this): any {
    if (!extension.isEnabled(this)) {
      return null;
    }

    // Merge shader injection
    let result = {};
    if (extension.opts.dash) {
      result = mergeShaders(result, dashShaders);
    }
    if (extension.opts.offset) {
      result = mergeShaders(result, offsetShaders);
    }

    return result;
  }

  initializeState(this: Layer<PathStyleExtensionProps>, context: LayerContext, extension: this) {
    const attributeManager = this.getAttributeManager();
    if (!attributeManager || !extension.isEnabled(this)) {
      // This extension only works with the PathLayer
      return;
    }

    if (extension.opts.dash) {
      attributeManager.addInstanced({
        instanceDashArrays: {size: 2, accessor: 'getDashArray'}
      });
    }
    if (extension.opts.highPrecisionDash) {
      attributeManager.addInstanced({
        instanceDashOffsets: {
          size: 1,
          accessor: 'getPath',
          transform: extension.getDashOffsets.bind(this)
        }
      });
    }
    if (extension.opts.offset) {
      attributeManager.addInstanced({
        instanceOffsets: {size: 1, accessor: 'getOffset'}
      });
    }
  }

  updateState(
    this: Layer<PathStyleExtensionProps>,
    params: UpdateParameters<Layer<PathStyleExtensionProps>>,
    extension: this
  ) {
    if (!extension.isEnabled(this)) {
      return;
    }

    const uniforms: any = {};

    if (extension.opts.dash) {
      uniforms.dashAlignMode = this.props.dashJustified ? 1 : 0;
      uniforms.dashGapPickable = Boolean(this.props.dashGapPickable);
    }

    this.state.model.setUniforms(uniforms);
  }

  getDashOffsets(this: Layer<PathStyleExtensionProps>, path: number[] | number[][]): number[] {
    const result = [0];
    const positionSize = this.props.positionFormat === 'XY' ? 2 : 3;
    const isNested = Array.isArray(path[0]);
    const geometrySize = isNested ? path.length : path.length / positionSize;

    let p;
    let prevP;
    for (let i = 0; i < geometrySize - 1; i++) {
      p = isNested ? path[i] : path.slice(i * positionSize, i * positionSize + positionSize);
      p = this.projectPosition(p);

      if (i > 0) {
        result[i] = result[i - 1] + dist(prevP, p);
      }

      prevP = p;
    }
    return result;
  }
}
