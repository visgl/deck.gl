// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {Model} from '@luma.gl/engine';
import {GPUCulledTraceLayer} from '../../../../examples/deck/gpu-culled-trace/gpu-culled-trace-layer';
import {GPUCulledArrowTextLayer} from '../../../../examples/deck/gpu-culled-trace/gpu-culled-arrow-text-layer';

for (const text of [false, true]) {
  test(`${text ? 'text' : 'trace'} indirect draw waits for pipeline readiness`, () => {
    const drawCommands = {draw: vi.fn()};
    const renderPass = {};
    const draw = vi.spyOn(Model.prototype, 'draw').mockReturnValue(false);
    const model = Object.create(Model.prototype);
    model.setAttributes = vi.fn();
    model.setInstanceCount = vi.fn();
    const layer = text
      ? {culledDraw: {selectedGlyphRecords: {}, drawCommands}}
      : {state: {model, renderUniforms: {write: vi.fn()}}, props: {drawCommands}};
    const render = () =>
      text
        ? (GPUCulledArrowTextLayer.prototype as any).drawTextRenderer.call(
            layer,
            {model, resolvedModel: 'storage-row-indexed'},
            renderPass
          )
        : GPUCulledTraceLayer.prototype.draw.call(layer as any, {renderPass} as any);
    try {
      render();
      expect(drawCommands.draw).not.toHaveBeenCalled();
      draw.mockReturnValue(true);
      render();
      expect(drawCommands.draw).toHaveBeenCalledExactlyOnceWith(renderPass, 0);
    } finally {
      draw.mockRestore();
    }
  });
}
