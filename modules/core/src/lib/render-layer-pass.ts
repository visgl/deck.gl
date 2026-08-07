// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';
import type {LayersPassRenderOptions, RenderStats} from '../passes/layers-pass';
import type {PickingColorDecoder} from '../passes/pick-layers-pass';
import type Viewport from '../viewports/viewport';

type PickingPassResult = {
  decodePickingColor: PickingColorDecoder | null;
  stats: RenderStats[];
};

type LayerPassResult = RenderStats[] | PickingPassResult;

type RenderableLayerPass = {
  device: Device;
  _lastRenderIndex: number;
  render(options: LayersPassRenderOptions): LayerPassResult;
  beginRenderSequence?: (options: LayersPassRenderOptions) => void;
  endRenderSequence?: () => void;
};

type ViewportPass = {
  viewport: Viewport;
  subViewport: Viewport;
};

/** Schedule repeated WebGPU view draws as independent layer passes and submissions. */
export function renderLayerPass<LayerPassType extends RenderableLayerPass>(
  layerPass: LayerPassType,
  options: Parameters<LayerPassType['render']>[0]
): ReturnType<LayerPassType['render']> {
  if (layerPass.device.type !== 'webgpu') {
    return layerPass.render(options) as ReturnType<LayerPassType['render']>;
  }

  const viewportPasses: ViewportPass[] = [];
  for (const viewport of options.viewports) {
    for (const subViewport of viewport.subViewports || [viewport]) {
      viewportPasses.push({viewport, subViewport});
    }
  }

  if (viewportPasses.length <= 1) {
    return layerPass.render(options) as ReturnType<LayerPassType['render']>;
  }

  layerPass.beginRenderSequence?.(options);

  const renderStats: RenderStats[] = [];
  let lastRenderResult: LayerPassResult | undefined;
  let previousViewport: Viewport | undefined;
  let viewportStartIndex = -1;

  try {
    for (const {viewport, subViewport} of viewportPasses) {
      const isFirstPass = lastRenderResult === undefined;
      const isFirstViewportPass = previousViewport !== viewport;

      if (isFirstViewportPass) {
        viewportStartIndex =
          isFirstPass && options.clearStack !== false ? -1 : layerPass._lastRenderIndex;
      } else {
        layerPass._lastRenderIndex = viewportStartIndex;
      }

      const passOptions = {
        ...options,
        viewports: [viewport],
        subViewport,
        onViewportActive: isFirstViewportPass ? options.onViewportActive : undefined,
        clearCanvas: isFirstPass ? options.clearCanvas : false,
        clearColor: isFirstPass ? options.clearColor : undefined,
        clearStack: isFirstPass ? options.clearStack : false
      };

      lastRenderResult = layerPass.render(passOptions);
      renderStats.push(
        ...(Array.isArray(lastRenderResult) ? lastRenderResult : lastRenderResult.stats)
      );
      previousViewport = viewport;
    }
  } finally {
    layerPass.endRenderSequence?.();
  }

  const result = Array.isArray(lastRenderResult)
    ? renderStats
    : {...lastRenderResult!, stats: renderStats};

  return result as ReturnType<LayerPassType['render']>;
}
