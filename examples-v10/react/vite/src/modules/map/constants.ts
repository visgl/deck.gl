// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * Initial map view state
 */
export const INITIAL_VIEW_STATE = {
  latitude: 39.8283,
  longitude: -98.5795,
  zoom: 4
};

/**
 * WebGL parameters for deck.gl rendering
 */
export const PARAMETERS = {
  blend: true,
  blendAlphaDstFactor: 'one-minus-src-alpha' as const,
  blendAlphaOperation: 'add' as const,
  blendAlphaSrcFactor: 'one' as const,
  blendColorDstFactor: 'one-minus-src-alpha' as const,
  blendColorOperation: 'add' as const,
  blendColorSrcFactor: 'src-alpha' as const,
  depthBias: 0,
  depthCompare: 'always' as const,
  depthTest: false,
  depthWriteEnabled: true
};
