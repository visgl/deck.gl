import {Framebuffer, withParameters} from '@luma.gl/core';
import {_LayersPass as LayersPass, LayersPassRenderOptions} from '@deck.gl/core';

type CollisionFilterPassRenderOptions = LayersPassRenderOptions & {};

export default class CollisionFilterPass extends LayersPass {
  renderCollisionMap(target: Framebuffer, options: CollisionFilterPassRenderOptions) {
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
      () => this.render({...options, target, pass: 'collision'})
    );
  }

  getModuleParameters() {
    // Draw picking colors into collision FBO
    return {
      drawToCollisionMap: true,
      pickingActive: 1,
      pickingAttribute: false,
      lightSources: {}
    };
  }
}
