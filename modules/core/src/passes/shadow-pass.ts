import type {Device} from '@luma.gl/api';
import {GL, Framebuffer, Texture2D, Renderbuffer, withParameters} from '@luma.gl/webgl-legacy';
import {default as LayersPass} from './layers-pass';

export default class ShadowPass extends LayersPass {
  shadowMap: Texture2D;
  depthBuffer: Renderbuffer;
  fbo: Framebuffer;

  constructor(
    device: Device,
    props?: {
      id;
    }
  ) {
    super(device, props);

    // The shadowMap texture
    this.shadowMap = new Texture2D(device, {
      width: 1,
      height: 1,
      parameters: {
        [GL.TEXTURE_MIN_FILTER]: GL.LINEAR,
        [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
        [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
        [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
      }
    });

    this.depthBuffer = new Renderbuffer(device, {
      format: GL.DEPTH_COMPONENT16,
      width: 1,
      height: 1
    });

    this.fbo = new Framebuffer(device, {
      id: 'shadowmap',
      width: 1,
      height: 1,
      attachments: {
        [GL.COLOR_ATTACHMENT0]: this.shadowMap,
        // Depth attachment has to be specified for depth test to work
        [GL.DEPTH_ATTACHMENT]: this.depthBuffer
      }
    });
  }

  render(params) {
    const target = this.fbo;

    withParameters(
      this.device,
      {
        depthRange: [0, 1],
        depthTest: true,
        blend: false,
        clearColor: [1, 1, 1, 1]
      },
      () => {
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
