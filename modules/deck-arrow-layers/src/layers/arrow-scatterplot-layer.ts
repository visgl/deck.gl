// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {CompositeLayer, type Color, type UpdateParameters} from '@deck.gl/core';
import {GPUScatterplotLayer, type GPUScatterplotLayerProps} from '@deck.gl-community/gpu-layers';
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
type ScalarAccessor = number | ArrowGPUVectorColumnSelector<Float32>;
type ColorAccessor = Color | ArrowGPUVectorColumnSelector<ColorType>;

/** Arrow adapter props retaining deck's standard Scatterplot accessor names. */
export type ArrowScatterplotLayerProps = Omit<
  GPUScatterplotLayerProps,
  'getPosition' | 'getRadius' | 'getFillColor'
> & {
  data: ArrowGPUVectorLayerData;
  getPosition: ArrowGPUVectorColumnSelector<PositionType>;
  getRadius?: ScalarAccessor;
  getFillColor?: ColorAccessor;
};

type ArrowScatterplotLayerState = {
  positions?: GPUVector<'float32x2'>;
  radii?: GPUVector<'float32'>;
  fillColors?: GPUVector<'unorm8x4'>;
};

/** Converts Arrow columns to owned GPUVectors, then delegates to GPUScatterplotLayer. */
export class ArrowScatterplotLayer extends CompositeLayer<ArrowScatterplotLayerProps> {
  static override layerName = 'ArrowScatterplotLayer';

  override initializeState(): void {
    this.setState({} satisfies ArrowScatterplotLayerState);
  }

  override updateState({props, oldProps, changeFlags}: UpdateParameters<this>): void {
    if (
      changeFlags.dataChanged ||
      props.getPosition !== oldProps.getPosition ||
      props.getRadius !== oldProps.getRadius ||
      props.getFillColor !== oldProps.getFillColor ||
      !(this.state as ArrowScatterplotLayerState).positions
    ) {
      this.destroyVectors();
      this.setState(this.makeVectors(props));
    }
  }

  override renderLayers(): GPUScatterplotLayer | null {
    const state = this.state as ArrowScatterplotLayerState;
    if (!state.positions) return null;
    const {data, getPosition, getRadius, getFillColor, ...props} = this.props;
    return new GPUScatterplotLayer({
      ...props,
      id: `${this.props.id}-gpu`,
      getPosition: state.positions,
      getRadius: state.radii ?? (typeof getRadius === 'number' ? getRadius : undefined),
      getFillColor: state.fillColors ?? (isColor(getFillColor) ? getFillColor : undefined)
    });
  }

  override finalizeState(): void {
    this.destroyVectors();
  }

  private makeVectors(props: ArrowScatterplotLayerProps): ArrowScatterplotLayerState {
    const positionFormat = getPositionFormat(props.data, props.getPosition, 'getPosition');
    return {
      positions: makeLayerGPUVectorFromArrow(this.context.device, props.data, props.getPosition, {
        name: 'positions',
        id: `${this.id}-positions`,
        format: positionFormat
      }),
      radii: makeOptionalVector(this, props.data, props.getRadius, 'radii', 'float32'),
      fillColors: makeOptionalVector(
        this,
        props.data,
        props.getFillColor,
        'fill-colors',
        'unorm8x4'
      )
    };
  }

  private destroyVectors(): void {
    destroyLayerGPUVectors(Object.values(this.state as ArrowScatterplotLayerState));
  }
}

function makeOptionalVector<FormatT extends 'float32' | 'unorm8x4'>(
  layer: ArrowScatterplotLayer,
  data: ArrowGPUVectorLayerData,
  selector: number | Color | ArrowGPUVectorColumnSelector | undefined,
  name: string,
  format: FormatT
): GPUVector<FormatT> | undefined {
  if (!isSelector(selector)) return undefined;
  return makeLayerGPUVectorFromArrow(layer.context.device, data, selector, {
    name,
    id: `${layer.id}-${name}`,
    format
  });
}

function getPositionFormat(
  data: ArrowGPUVectorLayerData,
  selector: ArrowGPUVectorColumnSelector<PositionType>,
  inputName: string
): 'float32x2' {
  const vector =
    selector instanceof Vector
      ? selector
      : (data instanceof Table ? data : new Table([data])).getChild(selector);
  if (!vector || !DataType.isFixedSizeList(vector.type) || vector.type.listSize !== 2) {
    throw new Error(`ArrowScatterplotLayer ${inputName} must be FixedSizeList[2]`);
  }
  return 'float32x2';
}

function isSelector(value: unknown): value is ArrowGPUVectorColumnSelector {
  return typeof value === 'string' || value instanceof Vector;
}

function isColor(value: unknown): value is Color {
  return Array.isArray(value) || ArrayBuffer.isView(value);
}
