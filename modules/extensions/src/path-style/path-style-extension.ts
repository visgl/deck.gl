// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {LayerExtension, _mergeShaders as mergeShaders} from '@deck.gl/core';
import {vec3} from '@math.gl/core';
import {
  dashShaders,
  Defines,
  offsetShaders,
  scatterplotDashShaders,
  textBackgroundDashShaders
} from './shaders.glsl';

import type {Accessor, Layer, LayerContext, UpdateParameters} from '@deck.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';

const defaultProps = {
  getDashArray: {type: 'accessor', value: [0, 0]},
  getOffset: {type: 'accessor', value: 0},
  dashJustified: false,
  dashGapPickable: false,
  dashUnits: 'widths'
};

/**
 * What `getDashArray` is measured in.
 *
 * `'widths'` is relative to half the stroke width and is the historical behavior, so a dash
 * scales with the line. The others are absolute: `'pixels'` keeps a dash the same size on
 * screen at every zoom, while `'meters'` and `'common'` keep it the same size on the ground.
 */
export type DashUnits = 'widths' | 'pixels' | 'meters' | 'common';

/** Keep in sync with the branch in the dash vertex shader. */
const DASH_UNITS: Record<DashUnits, number> = {
  widths: 0,
  pixels: 1,
  meters: 2,
  common: 3
};

type PathStyleProps = {
  dashAlignMode: number;
  dashGapPickable: boolean;
  dashUnits: number;
};

type SDFDashStyleProps = {
  dashGapPickable: boolean;
};

export type PathStyleExtensionProps<DataT = any> = {
  /**
   * Accessor for the dash array to draw each path with: `[dashSize, gapSize]` in the units
   * selected by `dashUnits`. By default those units are relative to *half* the path width,
   * so `[4, 5]` on a path 10 pixels wide draws 20 pixel dashes separated by 25 pixel gaps.
   * Requires the `dash` option to be on.
   */
  getDashArray?: Accessor<DataT, Readonly<[number, number]>>;
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
  /**
   * What `getDashArray` is measured in. `'widths'` is relative to half the stroke width, so a
   * dash scales with the line. `'pixels'` keeps a dash the same size on screen at every zoom,
   * which is useful when `widthUnits` is `'meters'` and the stroke itself does not.
   * Only applies to `PathLayer` and composite layers that render paths; scatterplot outlines
   * and text backgrounds continue to interpret dash arrays relative to their stroke width.
   * @default 'widths'
   */
  dashUnits?: DashUnits;
};

/**
 * How the dash pattern is positioned along a path.
 *
 * - `'segment'` restarts the pattern at every vertex. A dash therefore depends on how the
 *   path happens to be divided into segments, and a path whose segments are shorter than one
 *   dash period renders solid.
 * - `'path'` runs the pattern continuously from the start of each path, so the result is
 *   invariant to how densely the path is tessellated. This costs a vertex attribute and a
 *   CPU pass over the geometry to accumulate distance.
 */
export type DashMode = 'segment' | 'path';

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
   * How the dash pattern is positioned along a path. `'path'` keeps dashes invariant to how
   * the path is divided into segments, at the cost of a vertex attribute and a CPU pass over
   * the geometry.
   * @default 'segment'
   */
  dashMode: DashMode;
  /**
   * Improve dash rendering quality in certain circumstances. Note that this option introduces additional performance overhead.
   * @deprecated Use `dashMode: 'path'` instead, which this is now an alias for.
   * @default false
   */
  highPrecisionDash: boolean;
};

type LayerType = 'path' | 'scatterplot' | 'textBackground';

/** Adds selected features to the `PathLayer`, `ScatterplotLayer`, `TextBackgroundLayer`, and composite layers that render them. */
export default class PathStyleExtension extends LayerExtension<PathStyleExtensionOptions> {
  static defaultProps = defaultProps;
  static extensionName = 'PathStyleExtension';

  constructor({
    dash = false,
    offset = false,
    dashMode,
    highPrecisionDash = false
  }: Partial<PathStyleExtensionOptions> = {}) {
    // `highPrecisionDash` is the old spelling of `dashMode: 'path'`. Naming a dashMode at all
    // is a request for dashes - resolving `'segment'` to `dash: false` would make
    // `{dashMode: 'segment'}` silently draw solid lines while `{dashMode: 'path'}` worked.
    const resolvedDashMode: DashMode = dashMode ?? (highPrecisionDash ? 'path' : 'segment');
    super({
      dash: dash || highPrecisionDash || dashMode !== undefined,
      offset,
      dashMode: resolvedDashMode,
      highPrecisionDash: resolvedDashMode === 'path'
    });
  }

  private getLayerType(layer: Layer): LayerType | null {
    if ('pathTesselator' in layer.state) {
      return 'path';
    }
    const layerName = (layer.constructor as any).layerName;
    if (layerName === 'ScatterplotLayer') {
      return 'scatterplot';
    }
    if (layerName === 'TextBackgroundLayer') {
      return 'textBackground';
    }
    return null;
  }

  isEnabled(layer: Layer<PathStyleExtensionProps>): boolean {
    return this.getLayerType(layer) !== null;
  }

  getShaders(this: Layer<PathStyleExtensionProps>, extension: this): any {
    const layerType = extension.getLayerType(this);
    if (!layerType) {
      return null;
    }

    if (layerType === 'scatterplot' || layerType === 'textBackground') {
      if (!extension.opts.dash) {
        return null;
      }
      const inject =
        layerType === 'scatterplot'
          ? scatterplotDashShaders.inject
          : textBackgroundDashShaders.inject;
      const pathStyle: ShaderModule<SDFDashStyleProps> = {
        name: 'pathStyle',
        inject,
        uniformTypes: {
          dashGapPickable: 'i32'
        }
      };
      return {modules: [pathStyle]};
    }

    // PathLayer: existing logic
    let result = {} as {inject: Record<string, string>};
    const defines: Defines = {};
    if (extension.opts.dash) {
      result = mergeShaders(result, dashShaders);
      defines.DASH_ENABLED = true;
      if (extension.opts.highPrecisionDash) {
        defines.HIGH_PRECISION_DASH = true;
      }
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
        dashGapPickable: 'i32',
        dashUnits: 'i32'
      }
    };
    return {
      modules: [pathStyle],
      defines
    };
  }

  initializeState(this: Layer<PathStyleExtensionProps>, context: LayerContext, extension: this) {
    const attributeManager = this.getAttributeManager();
    const layerType = extension.getLayerType(this);
    if (!attributeManager || !layerType) {
      return;
    }

    if (extension.opts.dash) {
      attributeManager.addInstanced({
        instanceDashArrays: {size: 2, accessor: 'getDashArray'},
        ...(layerType === 'path' && extension.opts.dashMode === 'path'
          ? {
              // [distance from the start of the path, total length of the path]. Packing both
              // into one vec2 keeps this to a single vertex attribute slot, which matters
              // against the 16 attribute ceiling noted in the extension docs.
              instanceDashOffsets: {
                size: 2,
                accessor: 'getPath',
                transform: extension.getDashOffsets.bind(this)
              }
            }
          : {})
      });
    }
    if (layerType === 'path' && extension.opts.offset) {
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
      const layerType = extension.getLayerType(this);
      if (layerType === 'scatterplot' || layerType === 'textBackground') {
        const pathStyleProps: SDFDashStyleProps = {
          dashGapPickable: Boolean(this.props.dashGapPickable)
        };
        this.setShaderModuleProps({pathStyle: pathStyleProps});
      } else {
        const pathStyleProps: PathStyleProps = {
          dashAlignMode: this.props.dashJustified ? 1 : 0,
          dashGapPickable: Boolean(this.props.dashGapPickable),
          dashUnits: DASH_UNITS[this.props.dashUnits ?? 'widths']
        };
        this.setShaderModuleProps({pathStyle: pathStyleProps});
      }
    }
  }

  /**
   * Per vertex, `[distance from the start of the path, total length of the path]`, both in
   * common space. Distance is measured in 3D, matching the shader's along-segment coordinate,
   * which scales by the same 3D-to-2D arclength ratio.
   */
  getDashOffsets(this: Layer<PathStyleExtensionProps>, path: number[] | number[][]): number[] {
    const positionSize = this.props.positionFormat === 'XY' ? 2 : 3;
    const isNested = Array.isArray(path[0]);
    const geometrySize = isNested ? path.length : path.length / positionSize;

    // Accumulate across every point, including the last. The original implementation stopped
    // one short, which was fine when only per-vertex offsets were needed - the final vertex is
    // the tesselator's trailing INVALID padding and is never drawn - but the total length of
    // the path is exactly the distance the final point sits at.
    const distances = [0];
    let p;
    let prevP;
    for (let i = 0; i < geometrySize; i++) {
      p = isNested ? path[i] : path.slice(i * positionSize, i * positionSize + positionSize);
      p = this.projectPosition(p);

      if (i > 0) {
        distances[i] = distances[i - 1] + vec3.dist(prevP, p);
      }

      prevP = p;
    }
    const totalLength = distances[geometrySize - 1];

    const result: number[] = new Array(geometrySize * 2);
    for (let i = 0; i < geometrySize; i++) {
      result[i * 2] = distances[i];
      result[i * 2 + 1] = totalLength;
    }
    // Keep the padding vertex's offset zeroed, as before.
    result[(geometrySize - 1) * 2] = 0;
    return result;
  }
}
