// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Framebuffer, Parameters} from '@luma.gl/core';
import {Layer, _LayersPass as LayersPass, LayersPassRenderOptions, Viewport} from '@deck.gl/core';

type CollisionFilterPassRenderOptions = LayersPassRenderOptions & {};

export default class CollisionFilterPass extends LayersPass {
  private drawToCollisionVisibility = false;
  private drawToCollisionPlacement = false;

  renderCollisionMap(target: Framebuffer, options: CollisionFilterPassRenderOptions) {
    const padding = 1;
    const clearColor = [0, 0, 0, 0];
    const scissorRect = [padding, padding, target.width - 2 * padding, target.height - 2 * padding];

    this.render({...options, clearColor, scissorRect, target, pass: 'collision'});
  }

  renderCollisionVisibility(target: Framebuffer, options: CollisionFilterPassRenderOptions) {
    this.drawToCollisionVisibility = true;
    try {
      // Cells start unoccluded and undrawn. Each world copy of a label that is not culled writes
      // its cell: red keeps the minimum, so any occluded copy hides the label, and alpha keeps
      // the maximum, so a label that no copy drew stays hidden.
      this.render({...options, clearColor: [1, 1, 1, 0], target, pass: 'collision'});
    } finally {
      this.drawToCollisionVisibility = false;
    }
  }

  /** Write the placement data of each label to its cell, for greedy placement on the CPU */
  renderCollisionPlacement(target: Framebuffer, options: CollisionFilterPassRenderOptions) {
    this.drawToCollisionVisibility = true;
    this.drawToCollisionPlacement = true;
    try {
      // Cells start without data, and the last copy of a label that writes its cell wins
      this.render({...options, clearColor: [0, 0, 0, 0], target, pass: 'collision'});
    } finally {
      this.drawToCollisionVisibility = false;
      this.drawToCollisionPlacement = false;
    }
  }

  protected getLayerParameters(layer: Layer, layerIndex: number, viewport: Viewport): Parameters {
    return {
      ...layer.props.parameters,
      ...(this.drawToCollisionVisibility && !this.drawToCollisionPlacement
        ? {
            blend: true,
            blendColorOperation: 'min',
            blendColorSrcFactor: 'one',
            blendColorDstFactor: 'one',
            blendAlphaOperation: 'max',
            blendAlphaSrcFactor: 'one',
            blendAlphaDstFactor: 'one'
          }
        : {blend: false}),
      // Collision depth encodes priority, independent of the layer's display order.
      depthBias: 0,
      depthBiasSlopeScale: 0,
      // Visibility cells are screen-space quads, so the view's back-face culling does not apply
      ...(this.drawToCollisionVisibility ? {cullMode: 'none'} : null),
      depthWriteEnabled: !this.drawToCollisionVisibility,
      depthCompare: this.drawToCollisionVisibility ? 'always' : 'less-equal'
    };
  }

  getShaderModuleProps() {
    // Draw picking colors into collision FBO
    return {
      collision: {
        drawToCollisionMap: !this.drawToCollisionVisibility,
        drawToCollisionVisibility: this.drawToCollisionVisibility,
        drawToCollisionPlacement: this.drawToCollisionPlacement
      },
      picking: {
        isActive: 1,
        isAttribute: false
      },
      lighting: {enabled: false}
    };
  }
}
