// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  LayerExtension,
  _deepEqual as deepEqual,
  _mergeShaders as mergeShaders
} from '@deck.gl/core';
import {vec3} from '@math.gl/core';
import {
  dashShaders,
  Defines,
  offsetShaders,
  scatterplotDashShaders,
  textBackgroundDashShaders
} from './shaders.glsl';

import type {Accessor, Attribute, Layer, LayerContext, UpdateParameters} from '@deck.gl/core';
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

/** How the dash pattern is positioned along a path. */
export type DashMode = 'segment' | 'path';

/** Options for configuring a {@link PathStyleExtension}. */
export type PathStyleExtensionOptions = {
  /**
   * Add capability to render dashed lines.
   * @default false
   */
  dash?: boolean;
  /**
   * Add capability to offset lines.
   * @default false
   */
  offset?: boolean;
  /**
   * How the dash pattern is positioned along a path. `'path'` keeps dashes continuous across
   * rendered segments, at the cost of a vertex attribute and a CPU pass over the geometry.
   * @default 'segment'
   */
  dashMode?: DashMode;
  /**
   * Improve dash rendering quality in certain circumstances. Note that this option introduces additional performance overhead.
   * @deprecated Use `dashMode: 'path'` instead, which this is now an alias for.
   * @default false
   */
  highPrecisionDash?: boolean;
};

type ResolvedPathStyleExtensionOptions = Required<PathStyleExtensionOptions>;

type LayerType = 'path' | 'scatterplot' | 'textBackground';

const PATH_STYLE_ATTRIBUTES = ['instanceDashArrays', 'instanceDashOffsets', 'instanceOffsets'];

/** Adds selected features to the `PathLayer`, `ScatterplotLayer`, `TextBackgroundLayer`, and composite layers that render them. */
export default class PathStyleExtension extends LayerExtension<ResolvedPathStyleExtensionOptions> {
  static defaultProps = defaultProps;
  static extensionName = 'PathStyleExtension';

  constructor({
    dash = false,
    offset = false,
    dashMode,
    highPrecisionDash = false
  }: PathStyleExtensionOptions = {}) {
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

  private synchronizeAttributes(layer: Layer<PathStyleExtensionProps>): boolean {
    const attributeManager = layer.getAttributeManager();
    const layerType = this.getLayerType(layer);
    if (!attributeManager || !layerType) {
      return false;
    }

    const attributes = attributeManager.getAttributes();
    const desiredAttributes = new Set<string>();
    if (this.opts.dash) {
      desiredAttributes.add('instanceDashArrays');
    }
    if (layerType === 'path' && this.opts.dash && this.opts.dashMode === 'path') {
      desiredAttributes.add('instanceDashOffsets');
    }
    if (layerType === 'path' && this.opts.offset) {
      desiredAttributes.add('instanceOffsets');
    }

    let topologyChanged = false;
    for (const attributeName of PATH_STYLE_ATTRIBUTES) {
      if (attributes[attributeName] && !desiredAttributes.has(attributeName)) {
        attributeManager.remove([attributeName]);
        topologyChanged = true;
      }
    }

    if (desiredAttributes.has('instanceDashArrays') && !attributes.instanceDashArrays) {
      attributeManager.addInstanced({
        instanceDashArrays: {size: 2, accessor: 'getDashArray'}
      });
      topologyChanged = true;
    }
    if (desiredAttributes.has('instanceDashOffsets') && !attributes.instanceDashOffsets) {
      attributeManager.addInstanced({
        instanceDashOffsets: {
          // [distance from the start of the path, total length of the path]
          size: 2,
          // Keep getPath as an update trigger without allowing a binary getPath buffer to
          // bypass this updater. Dash phase must follow the normalized geometry that the
          // PathLayer actually renders.
          accessor: ['getPath'],
          // eslint-disable-next-line @typescript-eslint/unbound-method
          update: this.calculateDashMetrics
        }
      });
      topologyChanged = true;
    }
    if (desiredAttributes.has('instanceOffsets') && !attributes.instanceOffsets) {
      attributeManager.addInstanced({
        instanceOffsets: {size: 1, accessor: 'getOffset'}
      });
      topologyChanged = true;
    }

    return topologyChanged;
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
      if (extension.opts.dashMode === 'path') {
        defines.HIGH_PRECISION_DASH = true;
      }
    }
    if (extension.opts.offset) {
      result = mergeShaders(result, offsetShaders);
    }

    const {inject} = result;
    const pathStyle: ShaderModule<PathStyleProps> = {
      name: 'pathStyle',
      inject
    };
    if (extension.opts.dash) {
      pathStyle.uniformTypes = {
        dashAlignMode: 'f32',
        dashGapPickable: 'i32',
        dashUnits: 'i32'
      };
    }
    return {
      modules: [pathStyle],
      defines
    };
  }

  initializeState(this: Layer<PathStyleExtensionProps>, context: LayerContext, extension: this) {
    extension.synchronizeAttributes(this);
  }

  updateState(
    this: Layer<PathStyleExtensionProps>,
    params: UpdateParameters<Layer<PathStyleExtensionProps>>,
    extension: this
  ) {
    if (!extension.isEnabled(this)) {
      return;
    }

    if (params.changeFlags.extensionsChanged) {
      const topologyChanged = extension.synchronizeAttributes(this);
      const attributeManager = this.getAttributeManager();
      if (attributeManager && topologyChanged) {
        // PathLayer recreates its model before extension updateState runs. Refresh the new
        // model's layout after adding or removing extension-owned attributes, then ensure all
        // managed buffers are rebound to the recreated vertex array.
        attributeManager.invalidateAll();
        for (const model of this.getModels()) {
          model.setBufferLayout(attributeManager.getBufferLayouts(model));
        }
      }
    }

    if (extension.opts.dash) {
      const layerType = extension.getLayerType(this);
      if (
        layerType === 'path' &&
        extension.opts.dashMode === 'path' &&
        (!deepEqual(params.props.modelMatrix, params.oldProps.modelMatrix, 2) ||
          params.props.coordinateSystem !== params.oldProps.coordinateSystem ||
          !deepEqual(params.props.coordinateOrigin, params.oldProps.coordinateOrigin, 1))
      ) {
        this.getAttributeManager()?.invalidate('instanceDashOffsets');
      }
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

  private calculateDashMetrics(
    this: Layer<PathStyleExtensionProps>,
    attribute: Attribute,
    {startRow, endRow}: {startRow: number; endRow: number}
  ): void {
    const pathTesselator = (this.state as any).pathTesselator;
    const vertexStarts = pathTesselator?.vertexStarts as number[] | undefined;
    const instanceCount = pathTesselator?.instanceCount as number | undefined;
    const packedPositions = pathTesselator?.get('positions');

    if (
      !vertexStarts ||
      instanceCount === undefined ||
      typeof pathTesselator?.getPathSegmentIndices !== 'function'
    ) {
      throw new Error('PathStyleExtension requires PathLayer tessellation data for path dashes.');
    }

    const binaryPath = (this.props.data as any)?.attributes?.getPath;
    const binaryValue = ArrayBuffer.isView(binaryPath) ? binaryPath : binaryPath?.value;
    const hasReadableBinaryPath = ArrayBuffer.isView(binaryValue);
    // With `_pathType`, WebGL binds binary positions directly and the tesselator's allocated
    // positions array is only a zero-filled placeholder. WebGPU materializes packed neighboring
    // positions when the binary source is CPU-readable; GPU-only sources are rejected below.
    const usePackedPositions =
      packedPositions && (!binaryPath || pathTesselator.normalize || pathTesselator.opts?.isWebGPU);
    if ((binaryPath && !hasReadableBinaryPath) || (!usePackedPositions && !hasReadableBinaryPath)) {
      throw new Error(
        'PathStyleExtension cannot calculate whole-path dash metrics from GPU-only getPath data; ' +
          'supply data.attributes.instanceDashOffsets.'
      );
    }

    const output = attribute.value as Float32Array;
    const metricSize = attribute.size;
    const firstRow = Math.max(0, startRow);
    const lastRow = Math.min(endRow, vertexStarts.length - 1);

    let binarySize = 3;
    let binaryStride = 3;
    let binaryOffset = 0;
    if (!usePackedPositions) {
      const bytesPerElement = (binaryValue as any).BYTES_PER_ELEMENT;
      binarySize = binaryPath?.size || (this.props.positionFormat === 'XY' ? 2 : 3);
      binaryStride = binaryPath?.stride ? binaryPath.stride / bytesPerElement : binarySize;
      binaryOffset = binaryPath?.offset ? binaryPath.offset / bytesPerElement : 0;
    }

    const sourcePosition = new Array(3);
    const readPosition = (vertexIndex: number): number[] => {
      if (usePackedPositions) {
        sourcePosition[0] = packedPositions[vertexIndex * 3];
        sourcePosition[1] = packedPositions[vertexIndex * 3 + 1];
        sourcePosition[2] = packedPositions[vertexIndex * 3 + 2];
      } else {
        const sourceIndex = binaryOffset + vertexIndex * binaryStride;
        sourcePosition[0] = binaryValue[sourceIndex];
        sourcePosition[1] = binaryValue[sourceIndex + 1];
        sourcePosition[2] = binarySize === 3 ? binaryValue[sourceIndex + 2] : 0;
      }
      return sourcePosition;
    };

    attribute.startIndices = vertexStarts;
    for (let row = firstRow; row < lastRow; row++) {
      const rowStart = vertexStarts[row];
      const rowEnd = Math.min(vertexStarts[row + 1] ?? instanceCount, instanceCount);
      output.fill(0, rowStart * metricSize, rowEnd * metricSize);

      const validSegments = pathTesselator.getPathSegmentIndices(row);

      let phase = 0;
      let previousSegment = -2;
      let previousEnd: [number, number, number] | null = null;
      for (const segmentIndex of validSegments) {
        const outputIndex = segmentIndex * metricSize;
        output[outputIndex] = phase;

        const start =
          segmentIndex === previousSegment + 1 && previousEnd
            ? previousEnd
            : this.projectPosition(readPosition(segmentIndex), {autoOffset: false});
        const end = this.projectPosition(readPosition(segmentIndex + 1), {autoOffset: false});
        phase += vec3.dist(start, end);
        previousSegment = segmentIndex;
        previousEnd = end;
      }

      if (metricSize > 1) {
        for (let vertexIndex = rowStart; vertexIndex < rowEnd; vertexIndex++) {
          output[vertexIndex * metricSize + 1] = phase;
        }
      }
    }
  }

  /**
   * Calculates the distance from the start of a path to each rendered segment.
   *
   * The final entry is zero because PathLayer reserves the final vertex as invalid padding.
   * This scalar return shape is retained for compatibility; path-mode rendering uses an
   * internal attribute containing both each segment offset and the total path length.
   */
  getDashOffsets(this: Layer<PathStyleExtensionProps>, path: number[] | number[][]): number[] {
    const result = [0];
    const positionSize = this.props.positionFormat === 'XY' ? 2 : 3;
    const isNested = Array.isArray(path[0]);
    const geometrySize = isNested ? path.length : path.length / positionSize;

    let p;
    let prevP;
    for (let i = 0; i < geometrySize - 1; i++) {
      p = isNested ? path[i] : path.slice(i * positionSize, i * positionSize + positionSize);
      p = this.projectPosition(p, {autoOffset: false});

      if (i > 0) {
        result[i] = result[i - 1] + vec3.dist(prevP, p);
      }

      prevP = p;
    }
    result[geometrySize - 1] = 0;
    return result;
  }
}
