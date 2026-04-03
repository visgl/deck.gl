// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {picking} from '@deck.gl/core';
import {
  getShaderModuleSource,
  getShaderModuleUniformLayoutValidationResult
} from '@luma.gl/shadertools';

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
    'highlightColor'
  ]);
});

test('picking#wgsl source validates and includes the byte-color uniform', () => {
  const source = getShaderModuleSource(picking, 'wgsl');

  expect(source, 'WGSL picking module source is generated').toContain('useByteColors');
});
