// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {LayerExtension} from '@deck.gl/core';
import {scatterplotDashShaders, textBackgroundDashShaders} from './shaders.glsl';

import type {Layer, LayerContext, Accessor, UpdateParameters} from '@deck.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';

const defaultProps = {
  getDashArray: {type: 'accessor', value: [0, 0]},
  dashGapPickable: false
};

type StrokeStyleProps = {
  dashGapPickable: boolean;
};

type SupportedLayerType = 'scatterplot' | 'textBackground' | null;

export type StrokeStyleExtensionProps<DataT = any> = {
  /**
   * Accessor for the dash array to draw each stroke with: `[dashSize, gapSize]` relative to the stroke width.
   * Requires the `dash` option to be on.
   * @default [0, 0]
   */
  getDashArray?: Accessor<DataT, [number, number]>;
  /**
   * If `true`, gaps between solid strokes are pickable. If `false`, only the solid strokes are pickable.
   * @default false
   */
  dashGapPickable?: boolean;
};

export type StrokeStyleExtensionOptions = {
  /**
   * Add capability to render dashed strokes.
   * @default true
   */
  dash?: boolean;
};

/**
 * Adds dash rendering capability to stroked layers.
 *
 * Supported layers:
 * - ScatterplotLayer: Dashed circle strokes (angle-based calculation)
 * - TextBackgroundLayer: Dashed rectangle strokes (perimeter-based calculation)
 */
export default class StrokeStyleExtension extends LayerExtension<StrokeStyleExtensionOptions> {
  static defaultProps = defaultProps;
  static extensionName = 'StrokeStyleExtension';

  constructor({dash = true}: Partial<StrokeStyleExtensionOptions> = {}) {
    super({dash});
  }

  /**
   * Detect which layer type this is to use the appropriate shader injections
   */
  private getLayerType(layer: Layer<StrokeStyleExtensionProps>): SupportedLayerType {
    const layerName = layer.constructor.name;

    // ScatterplotLayer detection
    if (layerName === 'ScatterplotLayer' || 'radiusScale' in layer.props) {
      return 'scatterplot';
    }

    // TextBackgroundLayer detection
    if (layerName === 'TextBackgroundLayer' || 'getBoundingRect' in layer.props) {
      return 'textBackground';
    }

    return null;
  }

  isEnabled(layer: Layer<StrokeStyleExtensionProps>): boolean {
    return this.getLayerType(layer) !== null;
  }

  getShaders(this: Layer<StrokeStyleExtensionProps>, extension: this): any {
    const layerType = extension.getLayerType(this);
    if (!layerType || !extension.opts.dash) {
      return null;
    }

    // Select the appropriate shader injections based on layer type
    const shaderInjections =
      layerType === 'scatterplot' ? scatterplotDashShaders : textBackgroundDashShaders;

    const strokeStyle: ShaderModule<StrokeStyleProps> = {
      name: 'strokeStyle',
      inject: shaderInjections.inject,
      uniformTypes: {
        dashGapPickable: 'i32'
      }
    };

    return {
      modules: [strokeStyle]
    };
  }

  initializeState(this: Layer<StrokeStyleExtensionProps>, context: LayerContext, extension: this) {
    const attributeManager = this.getAttributeManager();
    if (!attributeManager || !extension.isEnabled(this)) {
      return;
    }

    if (extension.opts.dash) {
      attributeManager.addInstanced({
        instanceDashArrays: {size: 2, accessor: 'getDashArray'}
      });
    }
  }

  updateState(
    this: Layer<StrokeStyleExtensionProps>,
    params: UpdateParameters<Layer<StrokeStyleExtensionProps>>,
    extension: this
  ) {
    if (!extension.isEnabled(this)) {
      return;
    }

    if (extension.opts.dash) {
      const strokeStyleProps: StrokeStyleProps = {
        dashGapPickable: Boolean(this.props.dashGapPickable)
      };
      this.setShaderModuleProps({strokeStyle: strokeStyleProps});
    }
  }
}
