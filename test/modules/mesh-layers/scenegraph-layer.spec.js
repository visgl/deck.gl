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

import test from 'tape-catch';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';

import {project32} from '@deck.gl/core';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
import {CubeGeometry} from '@luma.gl/core';
import {GroupNode, ModelNode} from '@luma.gl/experimental';

import * as FIXTURES from 'deck.gl-test/data';

const fs = `\
varying vec4 vColor;

void main(void) {
  gl_FragColor = vColor;
}
`;

const vs = `\
uniform float sizeScale;

attribute vec3 positions;

attribute vec3 instancePositions;
attribute vec3 instancePositions64Low;
attribute vec4 instanceColors;
attribute vec3 instanceTranslation;

varying vec4 vColor;

void main(void) {
  vColor = instanceColors / 255.0;

  vec3 pos = (positions + instanceTranslation) * sizeScale;
  pos = project_size(pos);

  vec4 position_commonspace;
  gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, pos, position_commonspace);
}
`;

class MockGLTFAnimator {
  constructor() {
    this.animation0 = {};
    this.animation1 = {};
    this.animation2 = {name: 'name'};
  }

  getAnimations() {
    return [this.animation0, this.animation1, this.animation2];
  }

  animate() {}
}

test('ScenegraphLayer#tests', t => {
  const testCases = generateLayerTests({
    Layer: ScenegraphLayer,
    sampleProps: {
      data: FIXTURES.points,
      getPosition: d => d.COORDINATES,
      getTranslation: d => [0, 0, 2],
      pickable: false,
      sizeScale: 50,
      scenegraph: true,
      _animations: {
        '*': {
          playing: true,
          speed: 10
        },
        1: {
          playing: true,
          speed: 20
        },
        name: {
          playing: true,
          speed: 30
        }
      },
      getScene: (_scenegraph, {gl}) => {
        return new GroupNode([
          new ModelNode(gl, {
            geometry: new CubeGeometry(),
            vs,
            fs,
            modules: [project32],
            isInstanced: true
          })
        ]);
      },
      getAnimator: () => new MockGLTFAnimator()
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({layer}) => {
      if (layer.props.scenegraph) {
        t.ok(layer.state.scenegraph, 'State scenegraph');
        t.ok(layer.state.animator, 'State animator');
        t.ok(layer.state.animator.animation0.speed === 10, 'Animator speed wildcard');
        t.ok(layer.state.animator.animation1.speed === 20, 'Animator speed by index');
        t.ok(layer.state.animator.animation2.speed === 30, 'Animator speed by name');
      }
    },
    runDefaultAsserts: false
  });

  testLayer({Layer: ScenegraphLayer, testCases, onError: t.notOk});

  t.end();
});
