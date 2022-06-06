import {default as LayersPass} from './layers-pass';
import {
  Framebuffer,
  Texture2D,
  Renderbuffer,
  withParameters,
  cssToDeviceRatio
} from '@luma.gl/core';

export default class ShadowPass extends LayersPass {
  shadowMap: Texture2D;
  depthBuffer: Renderbuffer;
  fbo: Framebuffer;

  constructor(
    gl: WebGLRenderingContext,
    props?: {
      id;
    }
  ) {
    super(gl, props);

    // The shadowMap texture
    this.shadowMap = new Texture2D(gl, {
      width: 1,
      height: 1,
      parameters: {
        [gl.TEXTURE_MIN_FILTER]: gl.LINEAR,
        [gl.TEXTURE_MAG_FILTER]: gl.LINEAR,
        [gl.TEXTURE_WRAP_S]: gl.CLAMP_TO_EDGE,
        [gl.TEXTURE_WRAP_T]: gl.CLAMP_TO_EDGE
      }
    });

    this.depthBuffer = new Renderbuffer(gl, {
      format: gl.DEPTH_COMPONENT16,
      width: 1,
      height: 1
    });

    this.fbo = new Framebuffer(gl, {
      id: 'shadowmap',
      width: 1,
      height: 1,
      attachments: {
        [gl.COLOR_ATTACHMENT0]: this.shadowMap,
        // Depth attachment has to be specified for depth test to work
        [gl.DEPTH_ATTACHMENT]: this.depthBuffer
      }
    });
  }

  render(params) {
    const target = this.fbo;

    withParameters(
      this.gl,
      {
        depthRange: [0, 1],
        depthTest: true,
        blend: false,
        clearColor: [1, 1, 1, 1]
      },
      () => {
        const viewport = params.viewports[0];
        const pixelRatio = cssToDeviceRatio(this.gl);
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
      this.fbo.delete();
      this.fbo = null;
    }

    if (this.shadowMap) {
      this.shadowMap.delete();
      this.shadowMap = null;
    }

    if (this.depthBuffer) {
      this.depthBuffer.delete();
      this.depthBuffer = null;
    }
  }
}
