import LayersPass from '@deck.gl/core/src/passes/layers-pass';
import {Framebuffer, Texture2D, withParameters} from '@luma.gl/core';

export default class ShadowPass extends LayersPass {
  constructor(gl, {target}) {
    super(gl);

    this.dummyShadowMap = new Texture2D(gl, {width: 1, height: 1});
    this.target = target;
    this.fbo = new Framebuffer(gl, {
      id: 'shadowmap',
      width: target.width,
      height: target.height,
      attachments: {
        [gl.COLOR_ATTACHMENT0]: target
      }
    });
    this.props.pixelRatio = 2;
  }

  render(params) {
    withParameters(
      this.gl,
      {
        framebuffer: this.fbo,
        depthRange: [0, 1],
        blend: false,
        clearColor: [1, 1, 1, 1]
      },
      () => {
        const viewport = params.viewports[0];
        const width = viewport.width * this.props.pixelRatio;
        const height = viewport.height * this.props.pixelRatio;
        if (width !== this.target.width || height !== this.target.height) {
          this.target.resize({width, height});
          this.fbo.resize({width, height});
        }

        super.render(params);
        // this.target.generateMipmap();
      }
    );
  }

  shouldDrawLayer(layer) {
    return layer.props.castShadow;
  }

  getModuleParameters(layer, effects, effectProps) {
    const moduleParameters = Object.assign(Object.create(layer.props), {
      viewport: layer.context.viewport,
      pickingActive: 1,
      drawToShadowMap: this.dummyShadowMap,
      devicePixelRatio: this.props.pixelRatio
    });
    for (const effect of effects) {
      Object.assign(moduleParameters, effect.getParameters(layer));
    }
    return moduleParameters;
  }
}
