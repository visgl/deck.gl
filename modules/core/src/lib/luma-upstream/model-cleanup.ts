// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {luma, type BufferLayout} from '@luma.gl/core';
import {GPUVectorModel} from '@luma.gl/engine';

/** Restore owned vertex-array cleanup missing from luma.gl alpha.6. */
export function installModelCleanupCompatibility(): void {
  if (luma.VERSION !== '10.0.0-alpha.6') return;

  // Remove after adopting https://github.com/visgl/luma.gl/pull/3593.
  // Patch the common base so
  // models created by applications and layer extensions receive the same cleanup.
  const prototype = GPUVectorModel.prototype as unknown as {
    destroy(this: GPUVectorModel): void;
    applyBufferLayout(this: GPUVectorModel, layout: BufferLayout[]): void;
  };
  const destroy = prototype.destroy;
  prototype.destroy = function () {
    try {
      destroy.call(this);
    } finally {
      if (!this.vertexArray.destroyed) this.vertexArray.destroy();
    }
  };
  const applyBufferLayout = prototype.applyBufferLayout;
  prototype.applyBufferLayout = function (layout) {
    const vertexArray = this.vertexArray;
    try {
      applyBufferLayout.call(this, layout);
    } finally {
      if (this.vertexArray !== vertexArray && !vertexArray.destroyed) vertexArray.destroy();
    }
  };
}
