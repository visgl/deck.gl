// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import {LayerExtension} from '@deck.gl/core';
import shaderModule from './shader-module';

import type {Layer, LayerContext, Accessor} from '@deck.gl/core';

const defaultProps = {
  getBrushingTarget: {type: 'accessor', value: [0, 0]},

  brushingTarget: 'source',
  brushingEnabled: true,
  brushingRadius: 10000
};

export type BrushingExtensionProps<DataT = any> = {
  /**
   * Called to retrieve an arbitrary position for each object that it will be filtered by.
   * Only effective if `brushingTarget` is set to `custom`.
   */
  getBrushingTarget?: Accessor<DataT, [number, number]>;
  /**
   * Enable/disable brushing. If brushing is disabled, all objects are rendered.
   * @default true
   */
  brushingEnabled?: boolean;
  /**
   * The position used to filter each object by.
   */
  brushingTarget?: 'source' | 'target' | 'source_target' | 'custom';
  /** The brushing radius centered at the pointer, in meters. If a data object is within this circle, it is rendered; otherwise it is hidden.
   * @default 10000
   */
  brushingRadius?: number;
};

/** Adds GPU-based data brushing functionalities to layers. It allows the layer to show/hide objects based on the current pointer position. */
export default class BrushingExtension extends LayerExtension {
  static defaultProps = defaultProps;
  static extensionName = 'BrushingExtension';

  getShaders(): any {
    return {
      modules: [shaderModule]
    };
  }

  initializeState(this: Layer<BrushingExtensionProps>, context: LayerContext, extension: this) {
    const attributeManager = this.getAttributeManager();
    if (attributeManager) {
      attributeManager.add({
        brushingTargets: {
          size: 2,
          accessor: 'getBrushingTarget',
          shaderAttributes: {
            brushingTargets: {
              divisor: 0
            },
            instanceBrushingTargets: {
              divisor: 1
            }
          }
        }
      });
    }

    // Trigger redraw when mouse moves
    // TODO - expose this in a better way
    this.state.onMouseMove = () => {
      this.getCurrentLayer()?.setNeedsRedraw();
    };
    if (context.deck) {
      // @ts-expect-error (2446) accessing protected property
      context.deck.eventManager.on({
        pointermove: this.state.onMouseMove,
        pointerleave: this.state.onMouseMove
      });
    }
  }

  finalizeState(this: Layer<BrushingExtensionProps>, context: LayerContext, extension: this) {
    // Remove event listeners
    if (context.deck) {
      // @ts-expect-error (2446) accessing protected property
      context.deck.eventManager.off({
        pointermove: this.state.onMouseMove,
        pointerleave: this.state.onMouseMove
      });
    }
  }
}
