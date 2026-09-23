// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Buffer} from '@luma.gl/core';
import type {Device, Texture} from '@luma.gl/core';
import {PROJECTION_MODE} from './constants';
import type Viewport from '../viewports/viewport';
import type CustomProjectionViewport from '../viewports/custom-projection-viewport';
import log from '../utils/log';

/** Owns projection scale buffers/textures and releases them on finalization. */
export default class ProjectionScaleResources {
  private device: Device;
  private resources = new Map<string, {signature: string; resource: Buffer | Texture}>();

  constructor(device: Device) {
    this.device = device;
  }

  get(viewport: Viewport): Buffer | Texture | undefined {
    if (viewport.projectionMode !== PROJECTION_MODE.EXTERNAL) {
      return undefined;
    }
    const customViewport = viewport as CustomProjectionViewport;
    const previous = this.resources.get(viewport.id);
    if (previous?.signature === customViewport.sizeScaleSignature) return previous.resource;
    const startTime = performance.now();
    const data = customViewport.getSizeScaleData();
    const generatedTime = performance.now();
    const resource = this.create(data, 64);
    const createdTime = performance.now();
    log.log(
      0,
      `Size scale sampler [${viewport.id}] 64×64: ` +
        `generation ${(generatedTime - startTime).toFixed(2)} ms, ` +
        `${this.device.type === 'webgpu' ? 'buffer' : 'texture'} creation/upload submission ${(createdTime - generatedTime).toFixed(2)} ms, ` +
        `total ${(createdTime - startTime).toFixed(2)} ms`
    )();
    previous?.resource.destroy();
    this.resources.set(viewport.id, {signature: customViewport.sizeScaleSignature, resource});
    return resource;
  }

  destroy(): void {
    for (const {resource} of this.resources.values()) resource.destroy();
    this.resources.clear();
  }

  private create(data: Float32Array, size: number): Buffer | Texture {
    if (this.device.type === 'webgpu') {
      return this.device.createBuffer({
        id: 'project-size-scale',
        data,
        usage: Buffer.STORAGE | Buffer.COPY_DST
      });
    }
    return this.device.createTexture({
      id: 'project-size-scale',
      width: size,
      height: size,
      // WebGL retains the float-bit texture encoding.
      // The shader decodes these bits and applies the nearest texel's local slopes.
      format: 'rgba32uint',
      data: new Uint32Array(data.buffer, data.byteOffset, data.length),
      sampler: {
        minFilter: 'nearest',
        magFilter: 'nearest',
        addressModeU: 'clamp-to-edge',
        addressModeV: 'clamp-to-edge'
      }
    });
  }
}
