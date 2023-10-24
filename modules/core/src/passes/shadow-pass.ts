import type {Device, Framebuffer, Texture} from '@luma.gl/core';
import {WEBGLRenderbuffer, withGLParameters} from '@luma.gl/webgl';
import {default as LayersPass} from './layers-pass';

export default class ShadowPass extends LayersPass {
  shadowMap: Texture;
  depthBuffer: WEBGLRenderbuffer;
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

    this.depthBuffer = new WEBGLRenderbuffer(device as any, {
      format: 'depth16unorm',
      width: 1,
      height: 1
    });

    this.fbo = device.createFramebuffer({
      id: 'shadowmap',
      width: 1,
      height: 1,
      colorAttachments: [this.shadowMap],
      // Depth attachment has to be specified for depth test to work
      // @ts-expect-error Renderbuffer typing not solved in luma.gl
      depthStencilAttachment: this.depthBuffer
    });
  }

  render(params) {
    const target = this.fbo;

    withGLParameters(
      this.device,
      {
        depthRange: [0, 1],
        depthTest: true,
        blend: false,
        clearColor: [1, 1, 1, 1]
      },
      () => {
        // @ts-expect-error TODO - assuming WebGL context
        const pixelRatio = this.device.canvasContext.cssToDeviceRatio();

        const viewport = params.viewports[0];
        const width = viewport.width * pixelRatio;
        const height = viewport.height * pixelRatio;
        if (width !== target.width || height !== target.height) {
          target.resize({width, height});
        }

        super.render({...params, target, pass: 'shadow'});
      }
    );
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
