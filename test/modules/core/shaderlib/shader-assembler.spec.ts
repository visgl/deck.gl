// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {getShaderAssembler} from '@deck.gl/core';
import {GPUVectorModel, Model} from '@luma.gl/engine';

test('getShaderAssembler#is the default assembler of luma.gl models', () => {
  const glslShaderAssembler = getShaderAssembler('glsl');

  expect(Model.defaultProps.shaderAssembler, 'Model uses the GLSL assembler').toBe(
    glslShaderAssembler
  );
  expect(
    GPUVectorModel.defaultProps.shaderAssembler,
    'GPUVectorModel uses the GLSL assembler'
  ).toBe(glslShaderAssembler);
  expect(getShaderAssembler('wgsl'), 'WGSL has its own assembler').not.toBe(glslShaderAssembler);
  expect(getShaderAssembler('glsl'), 'assembler is shared').toBe(glslShaderAssembler);
});
