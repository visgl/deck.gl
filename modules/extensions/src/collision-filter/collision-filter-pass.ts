// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Framebuffer, Parameters} from '@luma.gl/core';
import {Layer, _LayersPass as LayersPass, LayersPassRenderOptions, Viewport} from '@deck.gl/core';

type CollisionFilterPassRenderOptions = LayersPassRenderOptions & {};

export default class CollisionFilterPass extends LayersPass {
  private drawToCollisionVisibility = false;

  renderCollisionMap(target: Framebuffer, options: CollisionFilterPassRenderOptions) {
    const padding = 1;
    const clearColor = [0, 0, 0, 0];
    const scissorRect = [padding, padding, target.width - 2 * padding, target.height - 2 * padding];

    this.render({...options, clearColor, scissorRect, target, pass: 'collision'});
  }

  renderCollisionVisibility(target: Framebuffer, options: CollisionFilterPassRenderOptions) {
    this.drawToCollisionVisibility = true;
    try {
      this.render({...options, clearColor: [0, 0, 0, 0], target, pass: 'collision'});
    } finally {
      this.drawToCollisionVisibility = false;
    }
  }

  protected getLayerParameters(layer: Layer, layerIndex: number, viewport: Viewport): Parameters {
    return {
      ...layer.props.parameters,
      blend: false,
      depthWriteEnabled: !this.drawToCollisionVisibility,
      depthCompare: this.drawToCollisionVisibility ? 'always' : 'less-equal'
    };
  }

  getShaderModuleProps() {
    // Draw picking colors into collision FBO
    return {
      collision: {
        drawToCollisionMap: !this.drawToCollisionVisibility,
        drawToCollisionVisibility: this.drawToCollisionVisibility
      },
      picking: {
        isActive: 1,
        isAttribute: false
      },
      lighting: {enabled: false}
    };
  }
}
