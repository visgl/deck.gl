// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {testLayer, testLayerAsync, generateLayerTests, device} from '@deck.gl/test-utils/vitest';

import {project32} from '@deck.gl/core';
import {ScenegraphLayer, type ScenegraphLayerProps} from '@deck.gl/mesh-layers';
import source from '@deck.gl/mesh-layers/scenegraph-layer/scenegraph-layer.wgsl';
import {CubeGeometry, Model, GroupNode, ModelNode} from '@luma.gl/engine';
import {GLTFAnimator, type PBREnvironment} from '@luma.gl/engine/gltf';
import {createPrefilteredEnvironment} from '@luma.gl/engine/lighting';
import {DynamicTexture} from '@luma.gl/core/dynamic';
import {pbrScene} from '@luma.gl/shaders';
import {load} from '@loaders.gl/core';
import {GLTFLoader} from '@loaders.gl/scene/gltf';

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

test('ScenegraphLayer#WebGPU shader preserves instance picking and highlighting', () => {
  expect(source).toContain('@location(5) pickingColor: vec3<f32>');
  expect(source).toContain('outputs.pickingColor = geometry.pickingColor');
  expect(source).toContain('picking.isActive > 0.5');
  expect(source).toContain('picking_isColorValid(inputs.pickingColor)');
  expect(source).toContain('var extensionColor = vec4<f32>(inputs.pickingColor, 1.0)');
  expect(source).toContain('DECKGL_FILTER_COLOR(&extensionColor, fragmentGeometry)');
  expect(source).toContain('return vec4<f32>(inputs.pickingColor, 1.0)');
  expect(source).toContain('picking.isHighlightActive > 0.5');
});

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
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
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

function createEnvironment() {
  const source = device.createTexture({
    width: 8,
    height: 4,
    format: 'rgba8unorm',
    data: new Uint8Array(8 * 4 * 4).fill(255)
  });
  const environment = createPrefilteredEnvironment(device, {
    source,
    sourceEncoding: 'srgb',
    format: 'rgba8unorm',
    size: 16,
    irradianceSize: 4,
    brdfLUTSize: 8,
    sampleCount: 4
  });
  source.destroy();
  return environment;
}

function getEnvironmentState(layer: ScenegraphLayer) {
  const model = layer.state.models[0];
  const {pbr_diffuseEnvSampler, pbr_specularEnvSampler, pbr_brdfLUT} =
    model.shaderInputs.getBindingValues();
  const {environmentIntensity, environmentRotation, environmentMipCount} =
    model.shaderInputs.getUniformValues().pbrScene!;
  return {
    define: model['props'].defines?.USE_SCENE_ENVIRONMENT,
    bindings: {pbr_diffuseEnvSampler, pbr_specularEnvSampler, pbr_brdfLUT},
    uniforms: {environmentIntensity, environmentRotation, environmentMipCount}
  };
}

test('ScenegraphLayer#prefiltered environment', async () => {
  const gltf = await load('/test/data/BoxAnimated.glb', GLTFLoader);
  const environment = createEnvironment();
  const {textures} = environment;
  const bindings = {
    pbr_diffuseEnvSampler: textures.diffuseTexture,
    pbr_specularEnvSampler: textures.specularTexture,
    pbr_brdfLUT: textures.brdfLUTTexture
  };
  const environmentMipCount = textures.specularTexture.mipLevels;
  expect(environmentMipCount).toBeGreaterThan(1);

  // These props must compile without a cast.
  const props: ScenegraphLayerProps = {
    id: 'scenegraph-prefiltered-environment',
    data: [{position: [0, 0]}],
    scenegraph: gltf,
    _lighting: 'pbr',
    _imageBasedLightingEnvironment: {...textures, intensity: 2, rotation: 0.5}
  };
  const functionProps: ScenegraphLayerProps = {
    ...props,
    scenegraph: {...gltf},
    _imageBasedLightingEnvironment: () => textures
  };

  let models: unknown[] = [];
  let checks = 0;
  await testLayerAsync({
    Layer: ScenegraphLayer,
    onError: err => expect(err).toBeFalsy(),
    testCases: [
      {
        title: 'environment with intensity and rotation',
        props,
        onAfterUpdate: ({layer}) => {
          if (!layer.isLoaded) return;
          checks++;
          models = layer.state.models;
          expect(getEnvironmentState(layer)).toEqual({
            define: 1,
            bindings,
            uniforms: {environmentIntensity: 2, environmentRotation: 0.5, environmentMipCount}
          });
        }
      },
      {
        title: 'new intensity and rotation, same scenegraph',
        updateProps: {_imageBasedLightingEnvironment: {...textures, intensity: 0.25, rotation: 1}},
        onAfterUpdate: ({layer}) => {
          checks++;
          expect(layer.state.models, 'the layer keeps its models').toBe(models);
          expect(getEnvironmentState(layer).uniforms).toEqual({
            environmentIntensity: 0.25,
            environmentRotation: 1,
            environmentMipCount
          });
        }
      },
      {
        title: 'function that returns the textures',
        props: functionProps,
        onAfterUpdate: ({layer}) => {
          if (!layer.isLoaded) return;
          checks++;
          expect(getEnvironmentState(layer)).toEqual({
            define: 1,
            bindings,
            uniforms: {environmentIntensity: 1, environmentRotation: 0, environmentMipCount}
          });
        }
      }
    ]
  });

  expect(checks, 'each test case made its checks').toBeGreaterThanOrEqual(3);
  expect(textures.diffuseTexture.destroyed, 'the caller owns the textures').toBe(false);
  expect(textures.specularTexture.destroyed, 'the caller owns the textures').toBe(false);
  expect(textures.brdfLUTTexture.destroyed, 'the caller owns the textures').toBe(false);
  environment.destroy();
});

test('ScenegraphLayer#PBREnvironment', async () => {
  const gltf = await load('/test/data/BoxAnimated.glb', GLTFLoader);
  const face = {
    width: 2,
    height: 2,
    format: 'rgba8unorm' as const,
    data: new Uint8Array(16).fill(255)
  };
  const cube = {'+X': face, '-X': face, '+Y': face, '-Y': face, '+Z': face, '-Z': face};
  const environment: PBREnvironment = {
    brdfLutTexture: new DynamicTexture(device, {data: face}),
    diffuseEnvSampler: new DynamicTexture(device, {dimension: 'cube', data: cube}),
    specularEnvSampler: new DynamicTexture(device, {dimension: 'cube', data: cube})
  };
  await Promise.all(Object.values(environment).map(texture => texture.ready));

  const props: ScenegraphLayerProps = {
    id: 'scenegraph-pbr-environment',
    data: [{position: [0, 0]}],
    scenegraph: gltf,
    _lighting: 'pbr',
    _imageBasedLightingEnvironment: environment
  };

  let checks = 0;
  await testLayerAsync({
    Layer: ScenegraphLayer,
    onError: err => expect(err).toBeFalsy(),
    testCases: [
      {
        props,
        onAfterUpdate: ({layer}) => {
          if (!layer.isLoaded) return;
          checks++;
          expect(getEnvironmentState(layer)).toEqual({
            define: undefined,
            bindings: {
              pbr_diffuseEnvSampler: environment.diffuseEnvSampler.texture,
              pbr_specularEnvSampler: environment.specularEnvSampler.texture,
              pbr_brdfLUT: environment.brdfLutTexture.texture
            },
            uniforms: pick(pbrScene.defaultUniforms)
          });
        }
      }
    ]
  });

  expect(checks, 'the test case made its checks').toBeGreaterThanOrEqual(1);
  Object.values(environment).forEach(texture => texture.destroy());
});

function pick({environmentIntensity, environmentRotation, environmentMipCount}) {
  return {environmentIntensity, environmentRotation, environmentMipCount};
}
