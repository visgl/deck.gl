// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Model} from '@luma.gl/engine';

/** Marks models using deck's typed-column attribute binding path. */
export default class GPUVectorModel extends Model {
  /** Binds columns without replacing the layer's explicit draw counts. */
  override setGPUAttributes(...args: Parameters<Model['setGPUAttributes']>): void {
    const {vertexCount, instanceCount} = this;
    super.setGPUAttributes(...args);
    this.setVertexCount(vertexCount);
    this.setInstanceCount(instanceCount);
  }
}
