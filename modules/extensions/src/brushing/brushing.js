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

const defaultProps = {
  getBrushingTarget: {type: 'accessor', value: [0, 0]},

  brushingTarget: 'source',
  brushingEnabled: true,
  brushingRadius: 10000
};

export default class BrushingExtension extends LayerExtension {
  getShaders(extension) {
    return {
      modules: [shaderModule]
    };
  }

  initializeState(context, extension) {
    const attributeManager = this.getAttributeManager();
    if (attributeManager) {
      attributeManager.add({
        brushingTargets: {
          size: 2,
          accessor: 'getBrushingTarget',
          // Hack: extension's defaultProps is not merged with the layer's defaultProps,
          // So we can't use the standard accessor when the prop is undefined
          update: !this.props.getBrushingTarget && extension.useConstantTargetPositions,
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
    extension.onMouseMove = () => {
      this.getCurrentLayer().setNeedsRedraw();
    };
    if (this.context.deck) {
      this.context.deck.eventManager.on({
        pointermove: extension.onMouseMove,
        pointerleave: extension.onMouseMove
      });
    }
  }

  finalizeState(extension) {
    // Remove event listeners
    if (this.context.deck) {
      this.context.deck.eventManager.off({
        pointermove: extension.onMouseMove,
        pointerleave: extension.onMouseMove
      });
    }
  }

  useConstantTargetPositions(attribute) {
    attribute.constant = true;
    attribute.value = new Float32Array(2);
    return;
  }
}

BrushingExtension.extensionName = 'BrushingExtension';
BrushingExtension.defaultProps = defaultProps;
