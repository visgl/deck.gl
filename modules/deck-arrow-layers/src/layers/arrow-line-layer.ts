// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {CompositeLayer, type Color, type UpdateParameters} from '@deck.gl/core';
import {GPULineLayer, type GPULineLayerProps} from '@deck.gl-community/gpu-layers';
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

/** Arrow adapter props retaining deck's standard Line accessor names. */
export type ArrowLineLayerProps = Omit<
  GPULineLayerProps,
  'getSourcePosition' | 'getTargetPosition' | 'getColor' | 'getWidth'
> & {
  data: ArrowGPUVectorLayerData;
  getSourcePosition: ArrowGPUVectorColumnSelector<PositionType>;
  getTargetPosition: ArrowGPUVectorColumnSelector<PositionType>;
  getColor?: Color | ArrowGPUVectorColumnSelector<ColorType>;
  getWidth?: number | ArrowGPUVectorColumnSelector<Float32>;
};

type ArrowLineLayerState = {
  sourcePositions?: GPUVector<'float32x2'>;
  targetPositions?: GPUVector<'float32x2'>;
  colors?: GPUVector<'unorm8x4'>;
  widths?: GPUVector<'float32'>;
};

/** Converts Arrow columns to owned GPUVectors, then delegates to GPULineLayer. */
export class ArrowLineLayer extends CompositeLayer<ArrowLineLayerProps> {
  static override layerName = 'ArrowLineLayer';

  override initializeState(): void {
    this.setState({} satisfies ArrowLineLayerState);
  }

  override updateState({props, oldProps, changeFlags}: UpdateParameters<this>): void {
    if (
      changeFlags.dataChanged ||
      props.getSourcePosition !== oldProps.getSourcePosition ||
      props.getTargetPosition !== oldProps.getTargetPosition ||
      props.getColor !== oldProps.getColor ||
      props.getWidth !== oldProps.getWidth ||
      !(this.state as ArrowLineLayerState).sourcePositions
    ) {
      this.destroyVectors();
      const sourceFormat = getPositionFormat(props.data, props.getSourcePosition);
      const targetFormat = getPositionFormat(props.data, props.getTargetPosition);
      if (sourceFormat !== targetFormat) {
        throw new Error('ArrowLineLayer source and target position dimensions must match');
      }
      this.setState({
        sourcePositions: makeLayerGPUVectorFromArrow(
          this.context.device,
          props.data,
          props.getSourcePosition,
          {name: 'sourcePositions', id: `${this.id}-source`, format: sourceFormat}
        ),
        targetPositions: makeLayerGPUVectorFromArrow(
          this.context.device,
          props.data,
          props.getTargetPosition,
          {name: 'targetPositions', id: `${this.id}-target`, format: targetFormat}
        ),
        colors: isSelector(props.getColor)
          ? makeLayerGPUVectorFromArrow(this.context.device, props.data, props.getColor, {
              name: 'colors',
              id: `${this.id}-colors`,
              format: 'unorm8x4'
            })
          : undefined,
        widths: isSelector(props.getWidth)
          ? makeLayerGPUVectorFromArrow(this.context.device, props.data, props.getWidth, {
              name: 'widths',
              id: `${this.id}-widths`,
              format: 'float32'
            })
          : undefined
      } satisfies ArrowLineLayerState);
    }
  }

  override renderLayers(): GPULineLayer | null {
    const state = this.state as ArrowLineLayerState;
    if (!state.sourcePositions || !state.targetPositions) return null;
    const {data, getSourcePosition, getTargetPosition, getColor, getWidth, ...props} = this.props;
    return new GPULineLayer({
      ...props,
      id: `${this.props.id}-gpu`,
      getSourcePosition: state.sourcePositions,
      getTargetPosition: state.targetPositions,
      getColor: state.colors ?? (isColor(getColor) ? getColor : undefined),
      getWidth: state.widths ?? (typeof getWidth === 'number' ? getWidth : undefined)
    });
  }

  override finalizeState(): void {
    this.destroyVectors();
  }

  private destroyVectors(): void {
    destroyLayerGPUVectors(Object.values(this.state as ArrowLineLayerState));
  }
}

function getPositionFormat(
  data: ArrowGPUVectorLayerData,
  selector: ArrowGPUVectorColumnSelector<PositionType>
): 'float32x2' {
  const vector =
    selector instanceof Vector
      ? selector
      : (data instanceof Table ? data : new Table([data])).getChild(selector);
  if (!vector || !DataType.isFixedSizeList(vector.type) || vector.type.listSize !== 2) {
    throw new Error('ArrowLineLayer positions must be FixedSizeList[2]');
  }
  return 'float32x2';
}

function isSelector(value: unknown): value is ArrowGPUVectorColumnSelector {
  return typeof value === 'string' || value instanceof Vector;
}

function isColor(value: unknown): value is Color {
  return Array.isArray(value) || ArrayBuffer.isView(value);
}
