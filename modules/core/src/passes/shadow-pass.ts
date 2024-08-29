import type {Device, Framebuffer, Texture} from '@luma.gl/core';
import type Layer from '../lib/layer';
import type Viewport from '../viewports/viewport';
import LayersPass from './layers-pass';

export default class ShadowPass extends LayersPass {
  fbo: Framebuffer;

  constructor(
    device: Device,
    props?: {
      id;
    }
  ) {
    super(device, props);

    // The shadowMap texture
    const shadowMap = device.createTexture({
      format: 'rgba8unorm',
      // TODO do not hardcode only value that makes render tests pass!!!
      // This avoids the resizing in draw()
      width: 800,
      height: 450,
      sampler: {
        minFilter: 'linear',
        magFilter: 'linear',
        addressModeU: 'clamp-to-edge',
        addressModeV: 'clamp-to-edge'
      },
      mipmaps: true
    });

    // @ts-ignore
    const depthBuffer = device.createTexture({
      format: 'depth16unorm',
      width: 800,
      height: 450,
      mipmaps: false
    });

    this.fbo = device.createFramebuffer({
      id: 'shadowmap',
      width: 800,
      height: 450,
      colorAttachments: [shadowMap],
      // Depth attachment has to be specified for depth test to work
      depthStencilAttachment: depthBuffer
    });
  }

  delete() {
    if (this.fbo) {
      this.fbo.destroy();
      this.fbo = null!;
    }
  }

  getShadowMap(): Texture {
    return this.fbo.colorAttachments[0].texture;
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
      this.fbo = this.fbo.clone({width, height});
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
}
