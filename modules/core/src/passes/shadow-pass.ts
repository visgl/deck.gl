import type {Device, Framebuffer, Texture} from '@luma.gl/core';
import type Layer from '../lib/layer';
import type Viewport from '../viewports/viewport';
import LayersPass from './layers-pass';

export default class ShadowPass extends LayersPass {
  shadowMap: Texture;
  depthBuffer: Texture;
  fbo: Framebuffer;

  constructor(
    device: Device,
    props?: {
      id;
    }
  ) {
    super(device, props);

    // The shadowMap texture
    this.shadowMap = device.createTexture({
      width: 1,
      height: 1,
      sampler: {
        minFilter: 'linear',
        magFilter: 'linear',
        addressModeU: 'clamp-to-edge',
        addressModeV: 'clamp-to-edge'
      }
    });

    // @ts-ignore
    this.depthBuffer = device.createTexture({
      format: 'depth16unorm',
      width: 1,
      height: 1,
      mipmaps: false,

      // TODO fix getWebGLTextureParameters() in luma to avoid passing deprecated parameters
      dataFormat: 6402, // gl.DEPTH_COMPONENT
      type: 5125 // gl.UNSIGNED_INT
    });

    this.fbo = device.createFramebuffer({
      id: 'shadowmap',
      width: 1,
      height: 1,
      colorAttachments: [this.shadowMap],
      // Depth attachment has to be specified for depth test to work
      depthStencilAttachment: this.depthBuffer
    });
  }

  render(params) {
    const target = this.fbo;

    // @ts-expect-error TODO - assuming WebGL context
    const pixelRatio = this.device.canvasContext.cssToDeviceRatio();

    const viewport = params.viewports[0];
    const width = viewport.width * pixelRatio;
    const height = viewport.height * pixelRatio;
    const clearColor = [1, 1, 1, 1];
    if (width !== target.width || height !== target.height) {
      target.resize({width, height});
    }

    super.render({...params, clearColor, target, pass: 'shadow'});
  }

  protected getLayerParameters(layer: Layer<{}>, layerIndex: number, viewport: Viewport) {
    return {...layer.props.parameters, blend: false, depthRange: [0, 1], depthTest: true};
  }

  shouldDrawLayer(layer) {
    return layer.props.shadowEnabled !== false;
  }

  getModuleParameters() {
    return {
      drawToShadowMap: true
    };
  }

  delete() {
    if (this.fbo) {
      this.fbo.destroy();
      this.fbo = null!;
    }

    if (this.shadowMap) {
      this.shadowMap.destroy();
      this.shadowMap = null!;
    }

    if (this.depthBuffer) {
      this.depthBuffer.destroy();
      this.depthBuffer = null!;
    }
  }
}
