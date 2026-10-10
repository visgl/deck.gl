// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {CompositeLayer, type Color, type UpdateParameters} from '@deck.gl/core';
import {GPUPointCloudLayer, type GPUPointCloudLayerProps} from '@deck.gl-community/gpu-layers';
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

/** Arrow adapter props retaining deck's standard PointCloud accessor names. */
export type ArrowPointCloudLayerProps = Omit<
  GPUPointCloudLayerProps,
  'getPosition' | 'getNormal' | 'getColor'
> & {
  data: ArrowGPUVectorLayerData;
  getPosition: ArrowGPUVectorColumnSelector<PositionType>;
  getNormal?: ArrowGPUVectorColumnSelector<PositionType>;
  getColor?: Color | ArrowGPUVectorColumnSelector<ColorType>;
};

type ArrowPointCloudLayerState = {
  positions?: GPUVector<'float32x3'>;
  normals?: GPUVector<'float32x3'>;
  colors?: GPUVector<'unorm8x4'>;
};

/** Converts Arrow columns to owned GPUVectors, then delegates to GPUPointCloudLayer. */
export class ArrowPointCloudLayer extends CompositeLayer<ArrowPointCloudLayerProps> {
  static override layerName = 'ArrowPointCloudLayer';

  override initializeState(): void {
    this.setState({} satisfies ArrowPointCloudLayerState);
  }

  override updateState({props, oldProps, changeFlags}: UpdateParameters<this>): void {
    if (
      changeFlags.dataChanged ||
      props.getPosition !== oldProps.getPosition ||
      props.getNormal !== oldProps.getNormal ||
      props.getColor !== oldProps.getColor ||
      !(this.state as ArrowPointCloudLayerState).positions
    ) {
      this.destroyVectors();
      assertVector3(props.data, props.getPosition, 'getPosition');
      if (props.getNormal) assertVector3(props.data, props.getNormal, 'getNormal');
      this.setState({
        positions: makeVector(this, props.data, props.getPosition, 'positions', 'float32x3'),
        normals: props.getNormal
          ? makeVector(this, props.data, props.getNormal, 'normals', 'float32x3')
          : undefined,
        colors: isSelector(props.getColor)
          ? makeVector(this, props.data, props.getColor, 'colors', 'unorm8x4')
          : undefined
      } satisfies ArrowPointCloudLayerState);
    }
  }

  override renderLayers(): GPUPointCloudLayer | null {
    const state = this.state as ArrowPointCloudLayerState;
    if (!state.positions) return null;
    const {data, getPosition, getNormal, getColor, ...props} = this.props;
    return new GPUPointCloudLayer({
      ...props,
      id: `${this.props.id}-gpu`,
      getPosition: state.positions,
      getNormal: state.normals,
      getColor: state.colors ?? (isColor(getColor) ? getColor : undefined)
    });
  }

  override finalizeState(): void {
    this.destroyVectors();
  }

  private destroyVectors(): void {
    destroyLayerGPUVectors(Object.values(this.state as ArrowPointCloudLayerState));
  }
}

function makeVector<FormatT extends 'float32x3' | 'unorm8x4'>(
  layer: ArrowPointCloudLayer,
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

function assertVector3(
  data: ArrowGPUVectorLayerData,
  selector: ArrowGPUVectorColumnSelector,
  name: string
): void {
  const vector = resolveVector(data, selector);
  if (!DataType.isFixedSizeList(vector.type) || vector.type.listSize !== 3) {
    throw new Error(`ArrowPointCloudLayer ${name} must be FixedSizeList[3]`);
  }
}

function resolveVector(
  data: ArrowGPUVectorLayerData,
  selector: ArrowGPUVectorColumnSelector
): Vector {
  if (selector instanceof Vector) return selector;
  const vector = (data instanceof Table ? data : new Table([data])).getChild(selector);
  if (!vector) throw new Error(`ArrowPointCloudLayer column "${selector}" is missing`);
  return vector;
}

function isSelector(value: unknown): value is ArrowGPUVectorColumnSelector {
  return typeof value === 'string' || value instanceof Vector;
}

function isColor(value: unknown): value is Color {
  return Array.isArray(value) || ArrayBuffer.isView(value);
}
