// Copyright (c) 2015 Uber Technologies, Inc.
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

import ArcLayer from '../../core/arc-layer/arc-layer';
import {fp64ify} from '../../../lib/utils/fp64';
import {readFileSync} from 'fs';
import {join} from 'path';

export default class ArcLayer64 extends ArcLayer {

  initializeState() {
    super.initializeState();

    const {attributeManager} = this.state;

    attributeManager.addInstanced({
      instanceSourcePositions64: {
        size: 4,
        update: this.calculateInstanceSourcePositions64
      },
      instanceTargetPositions64: {
        size: 4,
        update: this.calculateInstanceTargetPositions64
      }
      // Reuse from base class
      // instanceSourceColors: {
      //   size: 4,
      //   type: GL.UNSIGNED_BYTE,
      //   update: this.calculateInstanceSourceColors
      // },
      // instanceTargetColors: {
      //   size: 4,
      //   type: GL.UNSIGNED_BYTE,
      //   update: this.calculateInstanceTargetColors
      // }
    });
  }

  getShaders() {
    return {
      vs: readFileSync(join(__dirname, './arc-layer-64-vertex.glsl'), 'utf8'),
      fs: super.getShaders().fs,
      fp64: true,
      project64: true
    };
  }

  calculateInstanceSourcePositions64(attribute) {
    const {data, getSourcePosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const object of data) {
      const sourcePosition = getSourcePosition(object);
      [value[i + 0], value[i + 1]] = fp64ify(sourcePosition[0]);
      [value[i + 2], value[i + 3]] = fp64ify(sourcePosition[1]);
      i += size;
    }
  }

  calculateInstanceTargetPositions64(attribute) {
    const {data, getTargetPosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const object of data) {
      const targetPosition = getTargetPosition(object);
      [value[i + 0], value[i + 1]] = fp64ify(targetPosition[0]);
      [value[i + 2], value[i + 3]] = fp64ify(targetPosition[1]);
      i += size;
    }
  }

}

ArcLayer64.layerName = 'ArcLayer64';
