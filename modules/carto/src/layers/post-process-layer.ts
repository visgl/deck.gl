import {Framebuffer, TextureProps} from '@luma.gl/core';
import {
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
// type DrawableLayer = Layer & {
//   initializeState(context: LayerContext): void;
// };
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
export function RTTModifier(BaseLayer) {
  return class RTTLayer extends BaseLayer {
    static layerName = `RTT-{BaseLayer.layerName}`;

    draw(this: RTTLayer, opts: any) {
      const {moduleParameters} = opts;
      const {picking} = moduleParameters;
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
      this.internalState.postProcess = new PostProcessEffect(effect, {
        radiusPixels: 10,
        rangeScale: 1
      });
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
      this.internalState.renderBuffers = [0, 1].map(i => {
        const texture = this.context.device.createTexture(TEXTURE_PROPS);

        // TODO is this needed?
        // @ts-ignore
        const depthStencilAttachment = this.context.device.createTexture({
          format: 'depth16unorm',
          mipmaps: false,

          // TODO fix getWebGLTextureParameters() in luma to avoid passing deprecated parameters
          dataFormat: 6402, // gl.DEPTH_COMPONENT
          type: 5125 // gl.UNSIGNED_INT
        });
        return this.context.device.createFramebuffer({
          id: `layer-fbo-${i}`,
          colorAttachments: [texture],
          depthStencilAttachment
        });
      });
    }

    _resizeBuffers(this: PostProcessLayer, opts: any) {
      // TODO we could likely render to a smaller buffer for better perf
      const {moduleParameters} = opts;
      const {viewport} = this.context;
      const width = moduleParameters.devicePixelRatio * viewport.width;
      const height = moduleParameters.devicePixelRatio * viewport.height;
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
  };
}
