// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {Viewport} from '@deck.gl/core';
import {assert} from '@luma.gl/core';
import {
  ShaderPassEffect,
  type ShaderPassEffectProps,
  type ShaderPassEffectRenderOptions
} from './shader-pass-effect';
import type {SceneBufferEffect, SceneBufferFrame} from './scene-buffer-effect';
import {getSceneBufferCamera, type SceneBufferCamera} from './scene-buffer-camera';

export type SceneShaderPassContext = {
  frame: SceneBufferFrame;
  viewport: Viewport;
  camera: SceneBufferCamera;
};
export type SceneShaderPassEffectProps = Omit<ShaderPassEffectProps, 'getRenderOptions'> & {
  capture: SceneBufferEffect;
  coordinateOrigin?: readonly number[];
  getSceneOptions?: (
    context: SceneShaderPassContext
  ) => Omit<ShaderPassEffectRenderOptions, 'sourceTexture'>;
};

/** Single-view bridge from the shared HDR capture to existing luma shader-pass graphs.
 * Captures remain borrowed; history is invalidated together for cuts, resize and view replacement.
 */
export class SceneShaderPassEffect extends ShaderPassEffect {
  constructor(props: SceneShaderPassEffectProps) {
    super({
      ...props,
      colorFormat: props.colorFormat ?? 'rgba16float',
      getRenderOptions: options => {
        // The fullscreen presenter currently supports one view. A multi-view host needs one scoped presenter per view.
        assert(options.viewports.length === 1);
        const viewport = options.viewports[0];
        const frame = props.capture.getFrame(viewport.id);
        if (!frame) return null;
        const camera = getSceneBufferCamera(viewport, props.coordinateOrigin);
        const inputs = props.getSceneOptions?.({frame, viewport, camera});
        return {
          ...inputs,
          sourceTexture: frame.buffer.colorTexture,
          bindings: {
            depthTexture: frame.buffer.depthTexture,
            normalTexture: frame.buffer.normalRoughnessTexture,
            ...(props.capture.props.motionVectors
              ? {velocityTexture: frame.buffer.velocityTexture}
              : {}),
            ...inputs?.bindings
          },
          resetHistory: !frame.historyValid || inputs?.resetHistory
        };
      }
    });
  }
}
