// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {picking} from '@deck.gl/core';
import {
  getShaderModuleSource,
  getShaderModuleUniformLayoutValidationResult
} from '@luma.gl/shaders';

test('picking#wgsl uniform layout matches luma module contract', () => {
  const validationResult = getShaderModuleUniformLayoutValidationResult(picking, 'wgsl');

  expect(validationResult, 'WGSL picking module exposes a uniform block').toBeTruthy();
  expect(validationResult?.matches, 'WGSL block matches declared uniformTypes').toBe(true);
  expect(validationResult?.expectedUniformNames, 'Uniform field order stays stable').toEqual([
    'isActive',
    'isAttribute',
    'isHighlightActive',
    'useByteColors',
    'highlightedObjectColor',
    'highlightColor',
    'disabledPickingIndexCount',
    'disabledPickingIndices0',
    'disabledPickingIndices1',
    'disabledPickingIndices2'
  ]);
});

test('picking#wgsl source validates and includes the byte-color uniform', () => {
  const source = getShaderModuleSource(picking, 'wgsl');

  expect(source, 'WGSL picking module source is generated').toContain('useByteColors');
});

test('picking#normalizes highlights without changing picking IDs', () => {
  const uniforms = picking.getUniforms({
    highlightColor: [255, 128, 0, 0],
    highlightedObjectColor: [1, 128, 255],
    useByteColors: true
  });
  expect(uniforms.highlightColor).toEqual([1, 128 / 255, 0, 0]);
  expect(uniforms.highlightedObjectColor).toEqual([1, 128, 255]);
  expect(uniforms.useByteColors).toBe(true);
  expect(picking.getUniforms({highlightColor: [255, 128, 0]}).highlightColor).toEqual([
    1,
    128 / 255,
    0,
    1
  ]);
  expect(
    picking.getUniforms({highlightColor: [1, 0.5, 0, 0], useByteColors: false}).highlightColor
  ).toEqual([1, 0.5, 0, 0]);
  expect(picking.getUniforms({isActive: true}).highlightColor).toBeUndefined();
});
