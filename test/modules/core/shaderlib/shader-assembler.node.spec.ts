// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {getShaderAssembler, Layer} from '@deck.gl/core';
import {LineLayer} from '@deck.gl/layers';
import {ShaderAssembler, type PlatformInfo} from '@luma.gl/shadertools';
import {expect, test} from 'vitest';

const WEBGL_PLATFORM_INFO: PlatformInfo = {
  type: 'webgl',
  gpu: 'test-gpu',
  shaderLanguage: 'glsl',
  shaderLanguageVersion: 300,
  features: new Set()
};

const VERTEX_SHADER = /* glsl */ `\
#version 300 es
in vec4 positions;
void main(void) {
  gl_Position = positions;
}
`;

const FRAGMENT_SHADER = /* glsl */ `\
#version 300 es
precision highp float;
out vec4 fragmentColor;
void main(void) {
  fragmentColor = vec4(1.0);
}
`;

function assembleGLSLShaderPair(shaderAssembler: ShaderAssembler) {
  return shaderAssembler.assembleGLSLShaderPair({
    platformInfo: WEBGL_PLATFORM_INFO,
    vs: VERTEX_SHADER,
    fs: FRAGMENT_SHADER
  });
}

test('getShaderAssembler preserves WebGL hooks when a WebGPU assembler is created', () => {
  const webglShaderAssembler = getShaderAssembler('glsl');
  const initialShaders = assembleGLSLShaderPair(webglShaderAssembler);

  expect(initialShaders.vs).toContain('DECKGL_FILTER_GL_POSITION');
  expect(initialShaders.fs).toContain('DECKGL_FILTER_COLOR');
  expect(initialShaders.modules.map(shaderModule => shaderModule.name)).toContain('geometry');

  const webgpuShaderAssembler = getShaderAssembler('wgsl');
  const secondWebglShaderAssembler = getShaderAssembler('glsl');
  const retainedShaders = assembleGLSLShaderPair(webglShaderAssembler);

  expect(webgpuShaderAssembler).not.toBe(webglShaderAssembler);
  expect(secondWebglShaderAssembler).not.toBe(webglShaderAssembler);
  expect(secondWebglShaderAssembler).not.toBe(webgpuShaderAssembler);
  expect(assembleGLSLShaderPair(secondWebglShaderAssembler).vs).toBe(initialShaders.vs);
  expect(retainedShaders.vs).toBe(initialShaders.vs);
  expect(retainedShaders.fs).toBe(initialShaders.fs);
});

test('getShaderAssembler does not mutate the shared luma.gl shader assembler', () => {
  const defaultShaderAssembler = ShaderAssembler.getDefaultShaderAssembler();
  const initialShaders = assembleGLSLShaderPair(defaultShaderAssembler);
  const webglShaderAssembler = getShaderAssembler('glsl');
  const webgpuShaderAssembler = getShaderAssembler('wgsl');
  const retainedShaders = assembleGLSLShaderPair(defaultShaderAssembler);

  expect(webglShaderAssembler).not.toBe(defaultShaderAssembler);
  expect(webgpuShaderAssembler).not.toBe(defaultShaderAssembler);
  expect(retainedShaders.vs).toBe(initialShaders.vs);
  expect(retainedShaders.fs).toBe(initialShaders.fs);
  expect(retainedShaders.modules).toEqual(initialShaders.modules);
});

test('Layer#getShaders passes its context shader assembler to luma.gl models', () => {
  const shaderAssembler = getShaderAssembler('glsl');
  const overrideShaderAssembler = getShaderAssembler('wgsl');
  const layer = new LineLayer({id: 'shader-assembler-test', data: []});

  Object.assign(layer, {context: {defaultShaderModules: [], shaderAssembler}});

  expect(layer.getShaders().shaderAssembler).toBe(shaderAssembler);
  expect(
    Layer.prototype.getShaders.call(layer, {shaderAssembler: overrideShaderAssembler})
      .shaderAssembler
  ).toBe(overrideShaderAssembler);
});
