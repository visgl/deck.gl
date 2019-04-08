// Copyright (c) 2015-2017 Uber Technologies, Inc.
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

import {ScatterplotLayer} from '@deck.gl/layers';
import brushingShaderModule from './brushing-shader-module';

const defaultProps = {
  enableBrushing: true,
  // show point only if target is in brush
  brushTarget: false,
  // brush radius in meters
  brushRadius: 100000,
  mousePosition: null,
  getTargetPosition: d => d.target,
  radiusMinPixels: 0
};

export default class ScatterplotBrushingLayer extends ScatterplotLayer {
  getShaders() {
    const shaders = super.getShaders();

    shaders.modules.push(brushingShaderModule);

    shaders.inject = {
      'vs:#decl': `
attribute vec3 instanceTargetPositions;

uniform bool brushTarget;
`,
      'vs:#main-end': `
  brushing_setVisible(brushTarget?
    brushing_isPointInRange(instanceTargetPositions.xy) :
    brushing_isPointInRange(instancePositions.xy)
  );
`,
      'fs:#main-end': `
  gl_FragColor = brushing_filterBrushingColor(gl_FragColor);
`
    };

    return shaders;
  }

  // add instanceSourcePositions as attribute
  // instanceSourcePositions is used to calculate whether
  // point source is in range when brushTarget is truthy
  initializeState() {
    super.initializeState();

    this.state.attributeManager.addInstanced({
      instanceTargetPositions: {
        size: 3,
        accessor: 'getTargetPosition'
      }
    });
  }

  draw(opts) {
    // add uniforms
    const uniforms = Object.assign({}, opts.uniforms, {
      brushTarget: this.props.brushTarget
    });
    const newOpts = Object.assign({}, opts, {uniforms});
    super.draw(newOpts);
  }
}

ScatterplotBrushingLayer.layerName = 'ScatterplotBrushingLayer';
ScatterplotBrushingLayer.defaultProps = defaultProps;
