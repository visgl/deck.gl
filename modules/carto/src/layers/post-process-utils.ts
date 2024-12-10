// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Framebuffer, TextureProps} from '@luma.gl/core';
import type {ShaderPass} from '@luma.gl/shadertools';
import {
  _ConstructorOf,
  CompositeLayer,
  Layer,
  LayerContext,
  LayerProps,
  LayersList,
  PostProcessEffect,
  PostRenderOptions
} from '@deck.gl/core';

const TEXTURE_PROPS: TextureProps = {
  format: 'rgba8unorm',
  mipmaps: false,
  sampler: {
    minFilter: 'linear',
    magFilter: 'linear',
    addressModeU: 'clamp-to-edge',
    addressModeV: 'clamp-to-edge'
  }
};

interface IPostProcessLayer {
  applyPostProcess: () => void;
  enableRTT: Layer['draw'];
  disableRTT: () => void;
  props: LayerProps;
}

type Constructor<T> = (new (...args: any[]) => T) & {layerName: string};
type DrawableCompositeLayer = CompositeLayer & {
  renderLayers(): Layer<{}> | null | LayersList;
};

function getPostProcessLayer(layer: any): IPostProcessLayer {
  while (layer.parent && !layer.applyPostProcess) {
    layer = layer.parent;
  }
  return layer as unknown as IPostProcessLayer;
}

/**
 * Dummy Layer that draws nothing, just calls back to root Layer
 */
class DrawCallbackLayer extends Layer {
  static layerName = 'DrawCallbackLayer';

  initializeState(this: DrawCallbackLayer): void {
    this.id = `draw-callback-${getPostProcessLayer(this).props.id}`;
  }

  _drawLayer(this: DrawCallbackLayer) {
    getPostProcessLayer(this).applyPostProcess();
  }
}

/**
 * Modifier that marks a layer for Render-to-Target rendering.
 * Resulting layer must be used as a sublayer of a layer created
 * with `PostProcessModifier`
 */
export function RTTModifier<T extends _ConstructorOf<Layer>>(BaseLayer: T): T {
  // @ts-expect-error initializeState is abstract
  return class RTTLayer extends BaseLayer {
    // @ts-expect-error typescript doesn't see static property
    static layerName = `RTT-${BaseLayer.layerName}`;

    draw(this: RTTLayer, opts: any) {
      const {shaderModuleProps} = opts;
      const {picking} = shaderModuleProps;
      const postProcessLayer = getPostProcessLayer(this);

      if (!picking.isActive) {
        postProcessLayer.enableRTT(opts);
      }

      // Draw actual layer
      super.draw(opts);

      if (!picking.isActive) {
        postProcessLayer.disableRTT();
      }
    }
  };
}

/**
 * Modifier that returns the a modified Layer, which applies a
 * postprocess effect to all subLayers created using `RTTModifier`
 */
export function PostProcessModifier<T extends Constructor<DrawableCompositeLayer>>(
  BaseLayer: T,
  effect: any
): T {
  return class PostProcessLayer extends BaseLayer {
    static layerName = `PostProcess${BaseLayer.layerName}`;

    internalState: any;

    initializeState(this: PostProcessLayer, context: LayerContext): void {
      super.initializeState(context);

      this._createTextures();
      this.internalState.postProcess = new PostProcessEffect(effect, this.props);
      this.internalState.postProcess.setup(context);
    }

    updateState(this: PostProcessLayer, params: any): void {
      super.updateState(params);
      this.internalState.postProcess.setProps(this.props);
    }

    renderLayers(): PostProcessLayer | null | LayersList {
      let subLayers = super.renderLayers();
      if (!subLayers) {
        return null;
      }
      subLayers = Array.isArray(subLayers) ? subLayers : [subLayers];
      return [...subLayers, new DrawCallbackLayer()];
    }

    _createTextures(this: PostProcessLayer) {
      const {device} = this.context;
      this.internalState.renderBuffers = [0, 1].map(i => {
        return device.createFramebuffer({
          id: `layer-fbo-${i}`,
          colorAttachments: [device.createTexture(TEXTURE_PROPS)],
          depthStencilAttachment: 'depth16unorm'
        });
      });
    }

    _resizeBuffers(this: PostProcessLayer, opts: any) {
      // TODO we could likely render to a smaller buffer for better perf
      const {shaderModuleProps} = opts;
      const {viewport} = this.context;
      const {devicePixelRatio} = shaderModuleProps.project;
      const width = devicePixelRatio * viewport.width;
      const height = devicePixelRatio * viewport.height;
      this.internalState.renderBuffers.forEach((fbo: Framebuffer) => fbo.resize({width, height}));
    }

    enableRTT(this: PostProcessLayer, opts: any) {
      this._resizeBuffers(opts);
      this.internalState.originalRenderPass = this.context.renderPass;

      const [framebuffer] = this.internalState.renderBuffers;

      // Create new render pass for RTT
      this.internalState.internalRenderPass = this.context.device.beginRenderPass({
        framebuffer,
        parameters: {viewport: [0, 0, framebuffer.width, framebuffer.height]},
        // Only clear on first render
        clearColor: this.internalState.renderInProgress ? false : [0, 0, 0, 0]
      });
      this.internalState.renderInProgress = true;
      this.context.renderPass = this.internalState.internalRenderPass;
    }

    disableRTT(this: PostProcessLayer) {
      // End render pass, and reinstate original
      this.internalState.internalRenderPass.end();
      this.context.renderPass = this.internalState.originalRenderPass;
    }

    applyPostProcess(this: PostProcessLayer) {
      if (!this.internalState.renderInProgress) {
        return;
      }

      // Apply post process effect
      const [inputBuffer, swapBuffer] = this.internalState.renderBuffers;
      const {framebuffer: target} = this.context.renderPass.props;
      this.internalState.postProcess.postRender({
        inputBuffer,
        swapBuffer,
        target
      } as PostRenderOptions);

      this.internalState.renderInProgress = false;
    }

    _finalize(): void {
      this.internalState.renderBuffers.forEach((fbo: Framebuffer) => {
        fbo.destroy();
      });
      this.internalState.renderBuffers = null;
      this.internalState.postProcess.cleanup();
    }
  };
}

const fs = /* glsl */ `\
vec4 copy_filterColor_ext(vec4 color, vec2 texSize, vec2 texCoord) {
  return color;
}
`;

/**
 * Copy
 * Simple module that just copies input color to output
 */
export const copy = {
  name: 'copy',
  fs,
  getUniforms: () => ({}),
  passes: [{filter: true}]
} as const satisfies ShaderPass<{}>;
