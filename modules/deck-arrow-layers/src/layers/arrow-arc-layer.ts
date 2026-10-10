// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {CompositeLayer, type Color, type UpdateParameters} from '@deck.gl/core';
import {GPUArcLayer, type GPUArcLayerProps} from '@deck.gl-community/gpu-layers';
import type {GPUVector} from '@luma.gl/gpgpu/gpu-data';
import {DataType, Table, Vector, type FixedSizeList, type Float32, type Uint8} from 'apache-arrow';
import {
  destroyLayerGPUVectors,
  makeLayerGPUVectorFromArrow,
  type ArrowGPUVectorColumnSelector,
  type ArrowGPUVectorLayerData
} from './arrow-gpu-layer-utils';

type PositionType = FixedSizeList<Float32>;
type ColorType = FixedSizeList<Uint8>;

/** Arrow adapter props retaining deck's standard Arc accessor names. */
export type ArrowArcLayerProps = Omit<
  GPUArcLayerProps,
  | 'getSourcePosition'
  | 'getTargetPosition'
  | 'getSourceColor'
  | 'getTargetColor'
  | 'getWidth'
  | 'getHeight'
> & {
  data: ArrowGPUVectorLayerData;
  getSourcePosition: ArrowGPUVectorColumnSelector<PositionType>;
  getTargetPosition: ArrowGPUVectorColumnSelector<PositionType>;
  getSourceColor?: Color | ArrowGPUVectorColumnSelector<ColorType>;
  getTargetColor?: Color | ArrowGPUVectorColumnSelector<ColorType>;
  getWidth?: number | ArrowGPUVectorColumnSelector<Float32>;
  getHeight?: number | ArrowGPUVectorColumnSelector<Float32>;
};

type ArrowArcLayerState = {
  sourcePositions?: GPUVector<'float32x2'>;
  targetPositions?: GPUVector<'float32x2'>;
  sourceColors?: GPUVector<'unorm8x4'>;
  targetColors?: GPUVector<'unorm8x4'>;
  widths?: GPUVector<'float32'>;
  heights?: GPUVector<'float32'>;
};

/** Converts Arrow columns to owned GPUVectors, then delegates to GPUArcLayer. */
export class ArrowArcLayer extends CompositeLayer<ArrowArcLayerProps> {
  static override layerName = 'ArrowArcLayer';

  override initializeState(): void {
    this.setState({} satisfies ArrowArcLayerState);
  }

  override updateState({props, oldProps, changeFlags}: UpdateParameters<this>): void {
    if (
      changeFlags.dataChanged ||
      props.getSourcePosition !== oldProps.getSourcePosition ||
      props.getTargetPosition !== oldProps.getTargetPosition ||
      props.getSourceColor !== oldProps.getSourceColor ||
      props.getTargetColor !== oldProps.getTargetColor ||
      props.getWidth !== oldProps.getWidth ||
      props.getHeight !== oldProps.getHeight ||
      !(this.state as ArrowArcLayerState).sourcePositions
    ) {
      this.destroyVectors();
      assertPositionColumn(props.data, props.getSourcePosition, 'getSourcePosition');
      assertPositionColumn(props.data, props.getTargetPosition, 'getTargetPosition');
      this.setState({
        sourcePositions: makeVector(
          this,
          props.data,
          props.getSourcePosition,
          'source-positions',
          'float32x2'
        ),
        targetPositions: makeVector(
          this,
          props.data,
          props.getTargetPosition,
          'target-positions',
          'float32x2'
        ),
        sourceColors: makeOptionalVector(
          this,
          props.data,
          props.getSourceColor,
          'source-colors',
          'unorm8x4'
        ),
        targetColors: makeOptionalVector(
          this,
          props.data,
          props.getTargetColor,
          'target-colors',
          'unorm8x4'
        ),
        widths: makeOptionalVector(this, props.data, props.getWidth, 'widths', 'float32'),
        heights: makeOptionalVector(this, props.data, props.getHeight, 'heights', 'float32')
      } satisfies ArrowArcLayerState);
    }
  }

  override renderLayers(): GPUArcLayer | null {
    const state = this.state as ArrowArcLayerState;
    if (!state.sourcePositions || !state.targetPositions) return null;
    const {
      data,
      getSourcePosition,
      getTargetPosition,
      getSourceColor,
      getTargetColor,
      getWidth,
      getHeight,
      ...props
    } = this.props;
    return new GPUArcLayer({
      ...props,
      id: `${this.props.id}-gpu`,
      getSourcePosition: state.sourcePositions,
      getTargetPosition: state.targetPositions,
      getSourceColor: state.sourceColors ?? (isColor(getSourceColor) ? getSourceColor : undefined),
      getTargetColor: state.targetColors ?? (isColor(getTargetColor) ? getTargetColor : undefined),
      getWidth: state.widths ?? (typeof getWidth === 'number' ? getWidth : undefined),
      getHeight: state.heights ?? (typeof getHeight === 'number' ? getHeight : undefined)
    });
  }

  override finalizeState(): void {
    this.destroyVectors();
  }

  private destroyVectors(): void {
    destroyLayerGPUVectors(Object.values(this.state as ArrowArcLayerState));
  }
}

function makeVector<FormatT extends 'float32x2' | 'float32' | 'unorm8x4'>(
  layer: ArrowArcLayer,
  data: ArrowGPUVectorLayerData,
  selector: ArrowGPUVectorColumnSelector,
  name: string,
  format: FormatT
): GPUVector<FormatT> {
  return makeLayerGPUVectorFromArrow(layer.context.device, data, selector, {
    name,
    id: `${layer.id}-${name}`,
    format
  });
}

function makeOptionalVector<FormatT extends 'float32' | 'unorm8x4'>(
  layer: ArrowArcLayer,
  data: ArrowGPUVectorLayerData,
  selector: number | Color | ArrowGPUVectorColumnSelector | undefined,
  name: string,
  format: FormatT
): GPUVector<FormatT> | undefined {
  return isSelector(selector) ? makeVector(layer, data, selector, name, format) : undefined;
}

function assertPositionColumn(
  data: ArrowGPUVectorLayerData,
  selector: ArrowGPUVectorColumnSelector<PositionType>,
  name: string
): void {
  const vector = resolveVector(data, selector);
  if (!DataType.isFixedSizeList(vector.type) || vector.type.listSize !== 2) {
    throw new Error(`ArrowArcLayer ${name} must be FixedSizeList[2]`);
  }
}

function resolveVector(
  data: ArrowGPUVectorLayerData,
  selector: ArrowGPUVectorColumnSelector
): Vector {
  if (selector instanceof Vector) return selector;
  const vector = (data instanceof Table ? data : new Table([data])).getChild(selector);
  if (!vector) throw new Error(`ArrowArcLayer column "${selector}" is missing`);
  return vector;
}

function isSelector(value: unknown): value is ArrowGPUVectorColumnSelector {
  return typeof value === 'string' || value instanceof Vector;
}

function isColor(value: unknown): value is Color {
  return Array.isArray(value) || ArrayBuffer.isView(value);
}
