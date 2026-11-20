// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Framebuffer, Parameters} from '@luma.gl/core';
import {Layer, _LayersPass as LayersPass, LayersPassRenderOptions, Viewport} from '@deck.gl/core';

type CollisionFilterPassRenderOptions = LayersPassRenderOptions & {};

export default class CollisionFilterPass extends LayersPass {
  /** This pass draws into its own map, so it ignores the temporal jitter and render scale. */
  protected get usesTemporalInputs(): boolean {
    return false;
  }

  renderCollisionMap(target: Framebuffer, options: CollisionFilterPassRenderOptions) {
    const padding = 1;
    const clearColor = [0, 0, 0, 0];
    const scissorRect = [padding, padding, target.width - 2 * padding, target.height - 2 * padding];

    this.render({...options, clearColor, scissorRect, target, pass: 'collision'});
  }

  protected getLayerParameters(layer: Layer, layerIndex: number, viewport: Viewport): Parameters {
    return {
      ...layer.props.parameters,
      blend: false,
      depthWriteEnabled: true,
      depthCompare: 'less-equal'
    };
  }

  getShaderModuleProps() {
    // Draw picking colors into collision FBO
    return {
      collision: {
        drawToCollisionMap: true
      },
      picking: {
        isActive: 1,
        isAttribute: false
      },
      lighting: {enabled: false}
    };
  }
}
