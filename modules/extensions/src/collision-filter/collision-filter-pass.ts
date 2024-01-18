import {Framebuffer} from '@luma.gl/core';
import {withGLParameters} from '@luma.gl/webgl';
import {_LayersPass as LayersPass, LayersPassRenderOptions} from '@deck.gl/core';

type CollisionFilterPassRenderOptions = LayersPassRenderOptions & {};

export default class CollisionFilterPass extends LayersPass {
  renderCollisionMap(target: Framebuffer, options: CollisionFilterPassRenderOptions) {
    const padding = 1;
    const clearColor = [0, 0, 0, 0];

    return withGLParameters(
      this.device,
      {
        scissorTest: true,
        scissor: [padding, padding, target.width - 2 * padding, target.height - 2 * padding],
        blend: false,
        depthTest: true,
        depthRange: [0, 1]
      },
      () => this.render({...options, clearColor, target, pass: 'collision'})
    );
  }

  getModuleParameters() {
    // Draw picking colors into collision FBO
    return {
      drawToCollisionMap: true,
      picking: {
        isActive: 1,
        isAttribute: false
      },
      lightSources: {}
    };
  }
}
