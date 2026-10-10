// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {ArrowTextLayer, type ArrowTextLayerProps} from '@deck.gl-community/arrow-layers';
import type {ArrowTextRenderer} from '@luma.gl/arrow';
import {Buffer, type RenderPass} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';
import {DrawCommandBuffer} from '@luma.gl/gpgpu/gpu-core';
import type {TextStorageModel} from '@luma.gl/text/experimental';

export type GPUCulledTextDraw = {
  selectedGlyphRecords: Buffer;
  drawCommands: DrawCommandBuffer;
};

export type GPUCulledTextSource = {
  glyphRecords: Buffer;
  glyphCount: number;
  recordWordLength: number;
};

export type GPUCulledTextPreparation = {
  source: GPUCulledTextSource | null;
  status: string;
};

/** Example-local Arrow text layer that replaces the normal glyph draw with GPU-selected records. */
export class GPUCulledArrowTextLayer extends ArrowTextLayer {
  static override layerName = 'GPUCulledArrowTextLayer';
  private culledDraw: GPUCulledTextDraw | null = null;

  setCulledDraw(culledDraw: GPUCulledTextDraw | null): void {
    this.culledDraw = culledDraw;
  }

  getSelectionPreparation(): GPUCulledTextPreparation {
    const renderer = this.getRendererOrNull();
    if (!renderer) return {source: null, status: 'Preparing Arrow text renderer'};
    if (renderer.resolvedModel !== 'storage-row-indexed') {
      return {
        source: null,
        status: `GPU row-indexed text unavailable (resolved ${renderer.resolvedModel})`
      };
    }
    const model = renderer.model as TextStorageModel;
    const renderBatch = model.storageState.renderBatches[0];
    if (!renderBatch) return {source: null, status: 'Expanding Arrow glyph records on the GPU'};
    if (model.storageState.renderBatches.length !== 1) {
      return {source: null, status: 'Multiple text batches are not supported by this example'};
    }
    return {
      source: {
        glyphRecords: renderBatch.compactGlyphVertexData,
        glyphCount: renderBatch.glyphCount,
        recordWordLength: 3
      },
      status: 'Ready'
    };
  }

  protected override drawTextRenderer(renderer: ArrowTextRenderer, renderPass: RenderPass): void {
    if (!this.culledDraw || renderer.resolvedModel !== 'storage-row-indexed') return;
    const model = renderer.model;
    model.setAttributes({compactGlyphVertexData: this.culledDraw.selectedGlyphRecords});
    model.setInstanceCount(0);
    Model.prototype.draw.call(model, renderPass);
    this.culledDraw.drawCommands.draw(renderPass, 0);
  }
}

export type GPUCulledArrowTextLayerProps = ArrowTextLayerProps;
