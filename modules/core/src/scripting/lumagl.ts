// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * Re-exported luma.gl API in the pre-built bundle
 */
import {luma} from '@luma.gl/core';
/* eslint-disable @typescript-eslint/unbound-method */
export const {
  stats,
  registerDevices,
  getSupportedAdapters,
  getBestAvailableAdapter,
  setDefaultDeviceProps,
  attachDevice,
  createDevice,
  enforceWebGL2
} = luma;
export {Device, Buffer, Texture, Framebuffer} from '@luma.gl/core';
export {
  Model,
  BufferTransform,
  TextureTransform,

  // Geometry
  Geometry,
  CubeGeometry,
  SphereGeometry,

  // Scenegraph
  ScenegraphNode,
  GroupNode,
  ModelNode
} from '@luma.gl/engine';
