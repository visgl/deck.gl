// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {PickingInfo} from '@deck.gl/core';
import type {Model} from '@luma.gl/engine';
import type {ShaderModule} from '@luma.gl/shadertools';

/** Deck draw parameters that preserve the Arrow renderers' alpha blending defaults. */
export const DECK_ARROW_ALPHA_BLEND_PARAMETERS = {
  depthWriteEnabled: false,
  blend: true,
  blendColorOperation: 'add',
  blendAlphaOperation: 'add',
  blendColorSrcFactor: 'src-alpha',
  blendColorDstFactor: 'one-minus-src-alpha',
  blendAlphaSrcFactor: 'one',
  blendAlphaDstFactor: 'one-minus-src-alpha'
} as const;

/** WGSL helpers that mirror deck.gl's GLSL color, opacity, highlighting, and picking hooks. */
export const DECK_ARROW_WGSL_COLOR_UTILS = /* wgsl */ `
fn deck_encodePickingColor(objectIndex: u32) -> vec3<f32> {
  let colorIndex = objectIndex + 1u;
  return vec3<f32>(
    f32(colorIndex % 256u),
    f32((colorIndex / 256u) % 256u),
    f32((colorIndex / 65536u) % 256u)
  );
}

fn deck_filterColor(color: vec4<f32>, pickingColor: vec3<f32>) -> vec4<f32> {
  let normalizedPickingColor = picking_normalizeColor(pickingColor);
  if (picking.isActive > 0.5) {
    return vec4<f32>(normalizedPickingColor, 1.0);
  }

  var filteredColor = vec4<f32>(color.rgb, color.a * layer.opacity);
  let normalizedHighlightColor = picking_normalizeColor(picking.highlightedObjectColor);
  let isHighlighted = picking.isHighlightActive > 0.5 &&
    distance(normalizedPickingColor, normalizedHighlightColor) < 0.00001;
  if (isHighlighted) {
    let highlightAlpha = picking.highlightColor.a;
    let blendedAlpha = highlightAlpha + filteredColor.a * (1.0 - highlightAlpha);
    if (blendedAlpha > 0.0) {
      let highlightRatio = highlightAlpha / blendedAlpha;
      filteredColor = vec4<f32>(
        mix(filteredColor.rgb, picking.highlightColor.rgb, highlightRatio),
        blendedAlpha
      );
    }
  }
  return filteredColor;
}
`;

/** Minimal cartesian Deck viewport projection used until deck's WGSL shader hooks are complete. */
export const deckArrowViewport = {
  name: 'deckArrowViewport',
  source: /* wgsl */ `
struct DeckArrowViewportUniforms {
  center: vec2<f32>,
  worldToClipScale: vec2<f32>,
  pixelToClipScale: vec2<f32>,
  worldToPixelScale: vec2<f32>,
  viewportSize: vec2<f32>,
  contentCutoffPixels: vec2<f32>,
  contentAlign: vec2<u32>,
  flipY: u32,
  _padding: u32,
};

@group(0) @binding(auto) var<uniform> deckArrowViewport: DeckArrowViewportUniforms;

fn deck_projectPosition(position: vec3<f32>) -> vec4<f32> {
  return vec4<f32>(
    (position.xy - deckArrowViewport.center) * deckArrowViewport.worldToClipScale,
    position.z,
    1.0
  );
}

fn deck_getContentAlignmentOffset(
  anchor: f32,
  extent: f32,
  clipStart: f32,
  clipEnd: f32,
  mode: u32
) -> f32 {
  if (clipEnd < clipStart) { return 0.0; }
  if (mode == 1u) { return max(-(anchor + clipStart), 0.0); }
  if (mode == 2u) {
    let visibleStart = max(0.0, anchor + clipStart);
    let visibleEnd = min(extent, anchor + clipEnd);
    return select(0.0, (visibleStart + visibleEnd) * 0.5 - anchor, visibleStart < visibleEnd);
  }
  if (mode == 3u) { return min(extent - (anchor + clipEnd), 0.0); }
  return 0.0;
}

fn deck_getTextAnchorScreen(anchorClip: vec4<f32>) -> vec2<f32> {
  let normalized = anchorClip.xy / anchorClip.w;
  return vec2<f32>(normalized.x + 1.0, 1.0 - normalized.y) * 0.5 *
    deckArrowViewport.viewportSize;
}

fn deck_getTextClipRectPixels(clipRect: vec4<f32>) -> vec4<f32> {
  var origin = clipRect.xy * deckArrowViewport.worldToPixelScale;
  let size = clipRect.zw * deckArrowViewport.worldToPixelScale;
  if (deckArrowViewport.flipY != 0u) { origin.y = -origin.y - size.y; }
  return vec4<f32>(origin, size);
}

fn deck_getTextContentOffset(anchorClip: vec4<f32>, clipRect: vec4<f32>) -> vec2<f32> {
  let anchor = deck_getTextAnchorScreen(anchorClip);
  let rect = deck_getTextClipRectPixels(clipRect);
  return vec2<f32>(
    deck_getContentAlignmentOffset(
      anchor.x,
      deckArrowViewport.viewportSize.x,
      rect.x,
      rect.x + rect.z,
      deckArrowViewport.contentAlign.x
    ),
    -deck_getContentAlignmentOffset(
      anchor.y,
      deckArrowViewport.viewportSize.y,
      -rect.y - rect.w,
      -rect.y,
      deckArrowViewport.contentAlign.y
    )
  );
}

fn deck_isTextContentVisible(
  pixelOffset: vec2<f32>,
  anchorClip: vec4<f32>,
  clipRect: vec4<f32>
) -> bool {
  let anchor = deck_getTextAnchorScreen(anchorClip);
  let rect = deck_getTextClipRectPixels(clipRect);
  if (rect.z >= 0.0) {
    if (pixelOffset.x < rect.x || pixelOffset.x > rect.x + rect.z) { return false; }
    let visibleStart = max(anchor.x + rect.x, 0.0);
    let visibleEnd = min(anchor.x + rect.x + rect.z, deckArrowViewport.viewportSize.x);
    if (visibleEnd - visibleStart < deckArrowViewport.contentCutoffPixels.x) { return false; }
  }
  if (rect.w >= 0.0) {
    if (pixelOffset.y < rect.y || pixelOffset.y > rect.y + rect.w) { return false; }
    let visibleStart = max(anchor.y - rect.y - rect.w, 0.0);
    let visibleEnd = min(anchor.y - rect.y, deckArrowViewport.viewportSize.y);
    if (visibleEnd - visibleStart < deckArrowViewport.contentCutoffPixels.y) { return false; }
  }
  return true;
}
`,
  uniformTypes: {
    center: 'vec2<f32>',
    worldToClipScale: 'vec2<f32>',
    pixelToClipScale: 'vec2<f32>',
    worldToPixelScale: 'vec2<f32>',
    viewportSize: 'vec2<f32>',
    contentCutoffPixels: 'vec2<f32>',
    contentAlign: 'vec2<u32>',
    flipY: 'u32',
    _padding: 'u32'
  },
  defaultUniforms: {
    center: [0, 0],
    worldToClipScale: [1, -1],
    pixelToClipScale: [1, 1],
    worldToPixelScale: [1, 1],
    viewportSize: [1, 1],
    contentCutoffPixels: [0, 0],
    contentAlign: [0, 0],
    flipY: 1,
    _padding: 0
  }
} as const satisfies ShaderModule;

/** Updates one model with the matrix and pixel scale of the active Deck viewport. */
export function setDeckArrowViewport(
  model: Model,
  viewport: {
    width: number;
    height: number;
    target?: readonly number[];
    zoom?: number;
    zoomX?: number;
    zoomY?: number;
    flipY?: boolean;
  },
  textOptions: {
    contentCutoffPixels?: readonly [number, number];
    contentAlignHorizontal?: 'none' | 'start' | 'center' | 'end';
    contentAlignVertical?: 'none' | 'start' | 'center' | 'end';
  } = {}
): void {
  const zoomX = viewport.zoomX ?? viewport.zoom ?? 0;
  const zoomY = viewport.zoomY ?? viewport.zoom ?? 0;
  const target = viewport.target ?? [0, 0];
  model.shaderInputs.setProps({
    deckArrowViewport: {
      center: [target[0] ?? 0, target[1] ?? 0],
      worldToClipScale: [
        (2 * 2 ** zoomX) / Math.max(viewport.width, 1),
        ((viewport.flipY === false ? 2 : -2) * 2 ** zoomY) / Math.max(viewport.height, 1)
      ],
      pixelToClipScale: [2 / Math.max(viewport.width, 1), 2 / Math.max(viewport.height, 1)],
      worldToPixelScale: [2 ** zoomX, 2 ** zoomY],
      viewportSize: [viewport.width, viewport.height],
      contentCutoffPixels: textOptions.contentCutoffPixels ?? [0, 0],
      contentAlign: [
        getDeckArrowContentAlign(textOptions.contentAlignHorizontal),
        getDeckArrowContentAlign(textOptions.contentAlignVertical)
      ],
      flipY: viewport.flipY === false ? 0 : 1,
      _padding: 0
    }
  });
}

function getDeckArrowContentAlign(value: 'none' | 'start' | 'center' | 'end' | undefined): number {
  switch (value) {
    case 'start':
      return 1;
    case 'center':
      return 2;
    case 'end':
      return 3;
    default:
      return 0;
  }
}

/** Arrow row identity attached to deck.gl picking results. */
export type ArrowLayerPickingInfo = PickingInfo & {
  arrow?: {
    /** Source row across all loaded record batches. */
    rowIndex: number;
    /** Source record-batch index. */
    batchIndex: number;
    /** Row index inside the source record batch. */
    batchRowIndex: number;
  };
};

/** Returns a stable aspect ratio for luma renderers that need one. */
export function getViewportAspect(viewport: {width: number; height: number}): number {
  return viewport.width / Math.max(viewport.height, 1);
}

/** Requests a Deck redraw after an asynchronous WebGPU pipeline links, or reports its diagnostics. */
export function watchDeckArrowModelPipeline(
  model: Model,
  onReady: () => void,
  onError: (error: Error) => void
): void {
  if (model.device.type !== 'webgpu') {
    onReady();
    return;
  }
  const pipeline = model.pipeline;
  const shaders =
    pipeline.fs && pipeline.fs !== pipeline.vs ? [pipeline.vs, pipeline.fs] : [pipeline.vs];
  void Promise.all(shaders.map(shader => shader.asyncCompilationStatus)).then(async () => {
    for (let attempt = 0; attempt < 100 && pipeline.linkStatus === 'pending'; attempt++) {
      await new Promise<void>(resolve => setTimeout(resolve, 10));
    }
    if (pipeline.isErrored || pipeline.linkStatus !== 'success') {
      const diagnostics = await Promise.all(shaders.map(shader => shader.getCompilationInfo()));
      onError(
        new Error(`${model.id} WebGPU pipeline failed: ${JSON.stringify(diagnostics.flat())}`)
      );
      return;
    }
    onReady();
  });
}
