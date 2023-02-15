import {Framebuffer, withParameters} from '@luma.gl/core';
import {_LayersPass as LayersPass, LayersPassRenderOptions} from '@deck.gl/core';

type CollidePassRenderOptions = LayersPassRenderOptions & {};

export default class CollidePass extends LayersPass {
  renderCollideMap(target: Framebuffer, options: CollidePassRenderOptions) {
    const gl = this.gl;

    const padding = 1;

    return withParameters(
      gl,
      {
        scissorTest: true,
        scissor: [padding, padding, target.width - 2 * padding, target.height - 2 * padding],
        clearColor: [0, 0, 0, 0],
        blend: false,
        depthTest: true,
        depthRange: [0, 1]
      },
      () => this.render({...options, target, pass: 'collide'})
    );
  }

  getModuleParameters() {
    // Draw picking colors into collide FBO
    return {
      drawToCollideMap: true,
      pickingActive: 1,
      pickingAttribute: false,
      lightSources: {}
    };
  }
}
