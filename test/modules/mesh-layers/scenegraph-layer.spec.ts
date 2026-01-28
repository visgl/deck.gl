// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';

import {project32} from '@deck.gl/core';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
import {CubeGeometry, Model, GroupNode, ModelNode} from '@luma.gl/engine';
import {GLTFAnimator} from '@luma.gl/gltf';

import * as FIXTURES from 'deck.gl-test/data';

const fs = `\
#version 300 es
in vec4 vColor;
out vec4 fragColor;

void main(void) {
  fragColor = vColor;
}
`;

const vs = `\
#version 300 es
uniform float sizeScale;

in vec3 positions;

in vec3 instancePositions;
in vec3 instancePositions64Low;
in vec4 instanceColors;
in vec3 instanceTranslation;

out vec4 vColor;

void main(void) {
  vColor = instanceColors / 255.0;

  vec3 pos = (positions + instanceTranslation) * sizeScale;
  pos = project_size(pos);

  vec4 position_commonspace;
  gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, pos, position_commonspace);
}
`;

class MockGLTFAnimator extends GLTFAnimator {
  constructor() {
    super({
      animations: [
        {channels: [], samplers: []},
        {channels: [], samplers: []},
        {channels: [], samplers: [], name: 'name'}
      ]
    });
  }
}

test('ScenegraphLayer#tests', () => {
  const testCases = generateLayerTests({
    Layer: ScenegraphLayer,
    sampleProps: {
      data: FIXTURES.points,
      getPosition: d => (d as any).COORDINATES,
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
      getScene: (_scenegraph, {device}) => {
        return new GroupNode([
          new ModelNode({
            model: new Model(device!, {
              geometry: new CubeGeometry(),
              vs,
              fs,
              modules: [project32],
              disableWarnings: true
            })
          })
        ]);
      },
      getAnimator: () => new MockGLTFAnimator()
    },
    assert: (cond, msg) => expect(cond).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer}) => {
      if (layer.props.scenegraph) {
        expect(layer.state.scenegraph, 'State scenegraph').toBeTruthy();
        expect(layer.state.animator, 'State animator').toBeTruthy();
        expect(
          layer.state.animator.getAnimations()[0].speed === 10,
          'Animator speed wildcard'
        ).toBeTruthy();
        expect(
          layer.state.animator.getAnimations()[1].speed === 20,
          'Animator speed by index'
        ).toBeTruthy();
        expect(
          layer.state.animator.getAnimations()[2].speed === 30,
          'Animator speed by name'
        ).toBeTruthy();
      }
    },
    runDefaultAsserts: false
  });

  testLayer({Layer: ScenegraphLayer, testCases, onError: err => expect(err).toBeFalsy()});
});
