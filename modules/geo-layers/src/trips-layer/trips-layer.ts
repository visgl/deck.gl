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

import type {NumericArray} from '@math.gl/core';
import {AccessorFunction, DefaultProps} from '@deck.gl/core';
import {PathLayer, PathLayerProps} from '@deck.gl/layers';

const defaultProps: DefaultProps<TripsLayerProps> = {
  fadeTrail: true,
  trailLength: {type: 'number', value: 120, min: 0},
  currentTime: {type: 'number', value: 0, min: 0},
  getTimestamps: {type: 'accessor', value: d => d.timestamps}
};

/** All properties supported by TripsLayer. */
export type TripsLayerProps<DataT = any> = _TripsLayerProps<DataT> & PathLayerProps<DataT>;

/** Properties added by TripsLayer. */
type _TripsLayerProps<DataT = any> = {
  /**
   * Whether or not the path fades out.
   * @default true
   */
  fadeTrail?: boolean;
  /**
   * Trail length.
   * @default 120
   */
  trailLength?: number;
  /**
   * The current time of the frame.
   * @default 0
   */
  currentTime?: number;
  /**
   * Timestamp accessor.
   */
  getTimestamps?: AccessorFunction<DataT, NumericArray>;
};

/** Render animated paths that represent vehicle trips. */
export default class TripsLayer<DataT = any, ExtraProps extends {} = {}> extends PathLayer<
  DataT,
  Required<_TripsLayerProps> & ExtraProps
> {
  static layerName = 'TripsLayer';
  static defaultProps = defaultProps;

  getShaders() {
    const shaders = super.getShaders();
    shaders.inject = {
      'vs:#decl': `\
uniform float trailLength;
attribute float instanceTimestamps;
attribute float instanceNextTimestamps;
varying float vTime;
`,
      // Timestamp of the vertex
      'vs:#main-end': `\
vTime = instanceTimestamps + (instanceNextTimestamps - instanceTimestamps) * vPathPosition.y / vPathLength;
`,
      'fs:#decl': `\
uniform bool fadeTrail;
uniform float trailLength;
uniform float currentTime;
varying float vTime;
`,
      // Drop the segments outside of the time window
      'fs:#main-start': `\
if(vTime > currentTime || (fadeTrail && (vTime < currentTime - trailLength))) {
  discard;
}
`,
      // Fade the color (currentTime - 100%, end of trail - 0%)
      'fs:DECKGL_FILTER_COLOR': `\
if(fadeTrail) {
  color.a *= 1.0 - (currentTime - vTime) / trailLength;
}
`
    };
    return shaders;
  }

  initializeState() {
    super.initializeState();

    const attributeManager = this.getAttributeManager();
    attributeManager!.addInstanced({
      timestamps: {
        size: 1,
        accessor: 'getTimestamps',
        shaderAttributes: {
          instanceTimestamps: {
            vertexOffset: 0
          },
          instanceNextTimestamps: {
            vertexOffset: 1
          }
        }
      }
    });
  }

  draw(params) {
    const {fadeTrail, trailLength, currentTime} = this.props;

    params.uniforms = {
      ...params.uniforms,
      fadeTrail,
      trailLength,
      currentTime
    };

    super.draw(params);
  }
}
