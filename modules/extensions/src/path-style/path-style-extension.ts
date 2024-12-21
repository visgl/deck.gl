// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {LayerExtension, _mergeShaders as mergeShaders} from '@deck.gl/core';
import {vec3} from '@math.gl/core';
import {dashShaders, offsetShaders} from './shaders.glsl';

import type {Layer, LayerContext, Accessor, UpdateParameters} from '@deck.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';

const defaultProps = {
  getDashArray: {type: 'accessor', value: [0, 0]},
  getOffset: {type: 'accessor', value: 0},
  dashJustified: false,
  dashGapPickable: false
};

type PathStyleProps = {
  dashAlignMode: number;
  dashGapPickable: boolean;
};

export type PathStyleExtensionProps<DataT = any> = {
  /**
   * Accessor for the dash array to draw each path with: `[dashSize, gapSize]` relative to the width of the path.
   * Requires the `dash` option to be on.
   */
  getDashArray?: Accessor<DataT, [number, number]>;
  /**
   * Accessor for the offset to draw each path with, relative to the width of the path.
   * Negative offset is to the left hand side, and positive offset is to the right hand side.
   * @default 0
   */
  getOffset?: Accessor<DataT, number>;
  /**
   * If `true`, adjust gaps for the dashes to align at both ends.
   * @default false
   */
  dashJustified?: boolean;
  /**
   * If `true`, gaps between solid strokes are pickable. If `false`, only the solid strokes are pickable.
   * @default false
   */
  dashGapPickable?: boolean;
};

export type PathStyleExtensionOptions = {
  /**
   * Add capability to render dashed lines.
   * @default false
   */
  dash: boolean;
  /**
   * Add capability to offset lines.
   * @default false
   */
  offset: boolean;
  /**
   * Improve dash rendering quality in certain circumstances. Note that this option introduces additional performance overhead.
   * @default false
   */
  highPrecisionDash: boolean;
};

/** Adds selected features to the `PathLayer` and composite layers that render the `PathLayer`. */
export default class PathStyleExtension extends LayerExtension<PathStyleExtensionOptions> {
  static defaultProps = defaultProps;
  static extensionName = 'PathStyleExtension';

  constructor({
    dash = false,
    offset = false,
    highPrecisionDash = false
  }: Partial<PathStyleExtensionOptions> = {}) {
    super({dash: dash || highPrecisionDash, offset, highPrecisionDash});
  }

  isEnabled(layer: Layer<PathStyleExtensionProps>): boolean {
    return 'pathTesselator' in layer.state;
  }

  getShaders(this: Layer<PathStyleExtensionProps>, extension: this): any {
    if (!extension.isEnabled(this)) {
      return null;
    }

    // Merge shader injection
    let result = {} as {inject: Record<string, string>};
    if (extension.opts.dash) {
      result = mergeShaders(result, dashShaders);
    }
    if (extension.opts.offset) {
      result = mergeShaders(result, offsetShaders);
    }

    const {inject} = result;
    const pathStyle: ShaderModule<PathStyleProps> = {
      name: 'pathStyle',
      inject,
      uniformTypes: {
        dashAlignMode: 'f32',
        dashGapPickable: 'i32'
      }
    };
    return {
      modules: [pathStyle]
    };
  }

  initializeState(this: Layer<PathStyleExtensionProps>, context: LayerContext, extension: this) {
    const attributeManager = this.getAttributeManager();
    if (!attributeManager || !extension.isEnabled(this)) {
      // This extension only works with the PathLayer
      return;
    }

    if (extension.opts.dash) {
      attributeManager.addInstanced({
        instanceDashArrays: {size: 2, accessor: 'getDashArray'},
        instanceDashOffsets: extension.opts.highPrecisionDash
          ? {
              size: 1,
              accessor: 'getPath',
              transform: extension.getDashOffsets.bind(this)
            }
          : {
              size: 1,
              update: attribute => {
                attribute.constant = true;
                attribute.value = [0];
              }
            }
      });
    }
    if (extension.opts.offset) {
      attributeManager.addInstanced({
        instanceOffsets: {size: 1, accessor: 'getOffset'}
      });
    }
  }

  updateState(
    this: Layer<PathStyleExtensionProps>,
    params: UpdateParameters<Layer<PathStyleExtensionProps>>,
    extension: this
  ) {
    if (!extension.isEnabled(this)) {
      return;
    }

    if (extension.opts.dash) {
      const pathStyleProps: PathStyleProps = {
        dashAlignMode: this.props.dashJustified ? 1 : 0,
        dashGapPickable: Boolean(this.props.dashGapPickable)
      };
      this.setShaderModuleProps({pathStyle: pathStyleProps});
    }
  }

  getDashOffsets(this: Layer<PathStyleExtensionProps>, path: number[] | number[][]): number[] {
    const result = [0];
    const positionSize = this.props.positionFormat === 'XY' ? 2 : 3;
    const isNested = Array.isArray(path[0]);
    const geometrySize = isNested ? path.length : path.length / positionSize;

    let p;
    let prevP;
    for (let i = 0; i < geometrySize - 1; i++) {
      p = isNested ? path[i] : path.slice(i * positionSize, i * positionSize + positionSize);
      p = this.projectPosition(p);

      if (i > 0) {
        result[i] = result[i - 1] + vec3.dist(prevP, p);
      }

      prevP = p;
    }
    result[geometrySize - 1] = 0;
    return result;
  }
}
