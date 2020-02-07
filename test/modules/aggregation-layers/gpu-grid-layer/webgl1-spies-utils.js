// Copyright (c) 2015 - 2019 Uber Technologies, Inc.
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

import {isWebGL2, fp64 as fp64ShaderModule} from '@luma.gl/core';
import {project32, gouraudLighting, picking} from '@deck.gl/core';
import {_GPUGridAggregator as GPUGridAggregator} from '@deck.gl/aggregation-layers';
import GPUGridCellLayer from '@deck.gl/aggregation-layers/gpu-grid-layer/gpu-grid-cell-layer';
import {makeSpy} from '@probe.gl/test-utils';

const VS = 'void main() {gl_Position = vec4(0);}';
const FS = 'void main() {gl_FragColor = vec4(0);}';

// Spiy methods to avoid usage of WebGL2 API when running under Node.
export function setupSpysForWebGL1(gl) {
  let getShadersSpy = null;
  let setupUniformBufferSpy = null;
  let bindUniformBuffersSpy = null;
  let unbindUniformBuffersSpy = null;
  let isSupportedSpy = null;
  if (!isWebGL2(gl)) {
    isSupportedSpy = makeSpy(GPUGridAggregator, 'isSupported');
    getShadersSpy = makeSpy(GPUGridCellLayer.prototype, 'getShaders');
    setupUniformBufferSpy = makeSpy(GPUGridCellLayer.prototype, '_setupUniformBuffer');
    bindUniformBuffersSpy = makeSpy(GPUGridCellLayer.prototype, 'bindUniformBuffers');
    unbindUniformBuffersSpy = makeSpy(GPUGridCellLayer.prototype, 'unbindUniformBuffers');
    getShadersSpy.returns({
      vs: VS,
      fs: FS,
      modules: [project32, gouraudLighting, picking, fp64ShaderModule]
    });
    isSupportedSpy.returns(true);
    setupUniformBufferSpy.returns(null);
    bindUniformBuffersSpy.returns(null);
    unbindUniformBuffersSpy.returns(null);
  }
  return {
    getShadersSpy,
    setupUniformBufferSpy,
    bindUniformBuffersSpy,
    unbindUniformBuffersSpy,
    isSupportedSpy
  };
}

export function restoreSpies(spies) {
  for (const name in spies) {
    if (spies[name]) {
      spies[name].restore();
    }
  }
}
