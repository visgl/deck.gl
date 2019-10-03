import {default as LayersPass} from './layers-pass';
import {isWebGL2, Framebuffer, Texture2D, withParameters, cssToDeviceRatio} from '@luma.gl/core';
import GL from '@luma.gl/constants';

export default class ShadowPass extends LayersPass {
  constructor(gl, props) {
    super(gl, props);

    if (Framebuffer.isSupported(gl, {colorBufferFloat: true})) {
      // The shadowMap texture
      this.shadowMap = new Texture2D(gl, {
        format: isWebGL2(gl) ? GL.RGBA32F : GL.RGBA,
        type: GL.FLOAT,
        width: 1,
        height: 1,
        parameters: {
          [GL.TEXTURE_MIN_FILTER]: GL.LINEAR,
          [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
          [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
          [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
        }
      });

      this.fbo = new Framebuffer(gl, {id: 'shadowmap'});
      this.fbo.attach({
        [GL.COLOR_ATTACHMENT0]: this.shadowMap
      });
    }
  }

  render(params) {
    const target = this.fbo;
    if (!target) {
      return;
    }

    withParameters(
      this.gl,
      {
        framebuffer: target,
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

        this.drawLayers(params);
      }
    );
  }

  getModuleParameters(layer, effects, effectProps) {
    const moduleParameters = Object.assign(Object.create(layer.props), {
      viewport: layer.context.viewport,
      pickingActive: 0,
      drawToShadowMap: true,
      devicePixelRatio: cssToDeviceRatio(this.gl)
    });

    Object.assign(moduleParameters, effectProps);
    return moduleParameters;
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
  }
}
