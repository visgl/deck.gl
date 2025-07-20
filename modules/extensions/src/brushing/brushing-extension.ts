// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {LayerExtension} from '@deck.gl/core';
import shaderModule, {BrushingModuleProps} from './shader-module';

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
          stepMode: 'dynamic',
          accessor: 'getBrushingTarget'
        }
      });
    }

    // Trigger redraw when mouse moves
    const onMouseMove = () => {
      this.getCurrentLayer()?.setNeedsRedraw();
    };
    // TODO - expose this in a better way
    this.state.onMouseMove = onMouseMove;
    if (context.deck) {
      // @ts-expect-error (2446) accessing protected property
      context.deck.eventManager.on({
        pointermove: onMouseMove,
        pointerleave: onMouseMove
      });
    }
  }

  finalizeState(this: Layer<BrushingExtensionProps>, context: LayerContext, extension: this) {
    // Remove event listeners
    if (context.deck) {
      const onMouseMove = this.state.onMouseMove as () => void;
      // @ts-expect-error (2446) accessing protected property
      context.deck.eventManager.off({
        pointermove: onMouseMove,
        pointerleave: onMouseMove
      });
    }
  }

  draw(this: Layer<BrushingExtensionProps>, params: any, extension: this) {
    const {viewport, mousePosition} = params.context;
    const {brushingEnabled, brushingRadius, brushingTarget} = this.props;
    const brushingProps: BrushingModuleProps = {
      viewport,
      mousePosition,
      brushingEnabled,
      brushingRadius,
      brushingTarget
    };
    this.setShaderModuleProps({brushing: brushingProps});
  }
}
