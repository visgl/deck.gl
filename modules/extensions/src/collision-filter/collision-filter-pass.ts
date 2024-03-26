import {Framebuffer} from '@luma.gl/core';
import {Layer, _LayersPass as LayersPass, LayersPassRenderOptions, Viewport} from '@deck.gl/core';

type CollisionFilterPassRenderOptions = LayersPassRenderOptions & {};

export default class CollisionFilterPass extends LayersPass {
  renderCollisionMap(target: Framebuffer, options: CollisionFilterPassRenderOptions) {
    const padding = 1;
    const clearColor = [0, 0, 0, 0];
    const scissorRect = [padding, padding, target.width - 2 * padding, target.height - 2 * padding];

    this.render({...options, clearColor, scissorRect, target, pass: 'collision'});
  }

  protected getLayerParameters(layer: Layer, layerIndex: number, viewport: Viewport): any {
    return {...layer.props.parameters, blend: false, depthRange: [0, 1], depthTest: true};
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
