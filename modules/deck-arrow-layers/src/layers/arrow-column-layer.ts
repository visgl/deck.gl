// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {CompositeLayer, type Color, type UpdateParameters} from '@deck.gl/core';
import {GPUColumnLayer, type GPUColumnLayerProps} from '@deck.gl-community/gpu-layers';
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

/** Arrow adapter props retaining deck's standard Column accessor names. */
export type ArrowColumnLayerProps = Omit<
  GPUColumnLayerProps,
  'getPosition' | 'getFillColor' | 'getRadius' | 'getElevation'
> & {
  data: ArrowGPUVectorLayerData;
  getPosition: ArrowGPUVectorColumnSelector<PositionType>;
  getFillColor?: Color | ArrowGPUVectorColumnSelector<ColorType>;
  getRadius?: number | ArrowGPUVectorColumnSelector<Float32>;
  getElevation?: number | ArrowGPUVectorColumnSelector<Float32>;
};

type ArrowColumnLayerState = {
  positions?: GPUVector<'float32x2'>;
  colors?: GPUVector<'unorm8x4'>;
  radii?: GPUVector<'float32'>;
  elevations?: GPUVector<'float32'>;
};

/** Converts Arrow columns to owned GPUVectors, then delegates to GPUColumnLayer. */
export class ArrowColumnLayer extends CompositeLayer<ArrowColumnLayerProps> {
  static override layerName = 'ArrowColumnLayer';

  override initializeState(): void {
    this.setState({} satisfies ArrowColumnLayerState);
  }

  override updateState({props, oldProps, changeFlags}: UpdateParameters<this>): void {
    if (
      changeFlags.dataChanged ||
      props.getPosition !== oldProps.getPosition ||
      props.getFillColor !== oldProps.getFillColor ||
      props.getRadius !== oldProps.getRadius ||
      props.getElevation !== oldProps.getElevation ||
      !(this.state as ArrowColumnLayerState).positions
    ) {
      this.destroyVectors();
      assertPositionColumn(props.data, props.getPosition);
      this.setState({
        positions: makeVector(this, props.data, props.getPosition, 'positions', 'float32x2'),
        colors: makeOptionalVector(this, props.data, props.getFillColor, 'colors', 'unorm8x4'),
        radii: makeOptionalVector(this, props.data, props.getRadius, 'radii', 'float32'),
        elevations: makeOptionalVector(
          this,
          props.data,
          props.getElevation,
          'elevations',
          'float32'
        )
      } satisfies ArrowColumnLayerState);
    }
  }

  override renderLayers(): GPUColumnLayer | null {
    const state = this.state as ArrowColumnLayerState;
    if (!state.positions) return null;
    const {data, getPosition, getFillColor, getRadius, getElevation, ...props} = this.props;
    return new GPUColumnLayer({
      ...props,
      id: `${this.props.id}-gpu`,
      getPosition: state.positions,
      getFillColor: state.colors ?? (isColor(getFillColor) ? getFillColor : undefined),
      getRadius: state.radii ?? (typeof getRadius === 'number' ? getRadius : undefined),
      getElevation:
        state.elevations ?? (typeof getElevation === 'number' ? getElevation : undefined)
    });
  }

  override finalizeState(): void {
    this.destroyVectors();
  }

  private destroyVectors(): void {
    destroyLayerGPUVectors(Object.values(this.state as ArrowColumnLayerState));
  }
}

function makeVector<FormatT extends 'float32x2' | 'float32' | 'unorm8x4'>(
  layer: ArrowColumnLayer,
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
  layer: ArrowColumnLayer,
  data: ArrowGPUVectorLayerData,
  selector: number | Color | ArrowGPUVectorColumnSelector | undefined,
  name: string,
  format: FormatT
): GPUVector<FormatT> | undefined {
  return isSelector(selector) ? makeVector(layer, data, selector, name, format) : undefined;
}

function assertPositionColumn(
  data: ArrowGPUVectorLayerData,
  selector: ArrowGPUVectorColumnSelector
): void {
  const vector = resolveVector(data, selector);
  if (!DataType.isFixedSizeList(vector.type) || vector.type.listSize !== 2) {
    throw new Error('ArrowColumnLayer getPosition must be FixedSizeList[2]');
  }
}

function resolveVector(
  data: ArrowGPUVectorLayerData,
  selector: ArrowGPUVectorColumnSelector
): Vector {
  if (selector instanceof Vector) return selector;
  const vector = (data instanceof Table ? data : new Table([data])).getChild(selector);
  if (!vector) throw new Error(`ArrowColumnLayer column "${selector}" is missing`);
  return vector;
}

function isSelector(value: unknown): value is ArrowGPUVectorColumnSelector {
  return typeof value === 'string' || value instanceof Vector;
}

function isColor(value: unknown): value is Color {
  return Array.isArray(value) || ArrayBuffer.isView(value);
}
