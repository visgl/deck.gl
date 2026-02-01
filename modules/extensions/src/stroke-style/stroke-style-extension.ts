// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {LayerExtension} from '@deck.gl/core';
import {dashShaders} from './shaders.glsl';

import type {Layer, LayerContext, Accessor, UpdateParameters} from '@deck.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';

const defaultProps = {
  getDashArray: {type: 'accessor', value: [0, 0]},
  dashGapPickable: false
};

type StrokeStyleProps = {
  dashGapPickable: boolean;
};

export type StrokeStyleExtensionProps<DataT = any> = {
  /**
   * Accessor for the dash array to draw each circle stroke with: `[dashSize, gapSize]` relative to the stroke width.
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
   * Add capability to render dashed strokes on circle outlines.
   * @default true
   */
  dash?: boolean;
};

/** Adds dash rendering capability to ScatterplotLayer circle strokes. */
export default class StrokeStyleExtension extends LayerExtension<StrokeStyleExtensionOptions> {
  static defaultProps = defaultProps;
  static extensionName = 'StrokeStyleExtension';

  constructor({dash = true}: Partial<StrokeStyleExtensionOptions> = {}) {
    super({dash});
  }

  isEnabled(layer: Layer<StrokeStyleExtensionProps>): boolean {
    // Check if this is a ScatterplotLayer by looking for its characteristic state/props
    // ScatterplotLayer has specific uniforms in its shader
    return layer.constructor.name === 'ScatterplotLayer' || 'radiusScale' in layer.props;
  }

  getShaders(this: Layer<StrokeStyleExtensionProps>, extension: this): any {
    if (!extension.isEnabled(this)) {
      return null;
    }

    if (!extension.opts.dash) {
      return null;
    }

    const strokeStyle: ShaderModule<StrokeStyleProps> = {
      name: 'strokeStyle',
      inject: dashShaders.inject,
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
