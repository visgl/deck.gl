// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {CompositeLayer, type Color, type UpdateParameters} from '@deck.gl/core';
import {GPUIconLayer, type GPUIconLayerProps} from '@deck.gl-community/gpu-layers';
import {makeArrowFixedSizeListVector} from '@luma.gl/arrow';
import type {GPUVector} from '@luma.gl/gpgpu/gpu-data';
import {
  DataType,
  Float32,
  Table,
  Vector,
  makeVector,
  vectorFromArray,
  type Data,
  type FixedSizeList,
  type Uint8
} from 'apache-arrow';
import {
  destroyLayerGPUVectors,
  makeLayerGPUVectorFromArrow,
  type ArrowGPUVectorColumnSelector,
  type ArrowGPUVectorLayerData
} from './arrow-gpu-layer-utils';

type PositionType = FixedSizeList<Float32>;
type ColorType = FixedSizeList<Uint8>;

/** Prepacked deck icon atlas entry used by the Arrow icon-name adapter. */
export type ArrowIconMapping = Record<
  string,
  {
    x: number;
    y: number;
    width: number;
    height: number;
    anchorX?: number;
    anchorY?: number;
    mask?: boolean;
  }
>;

/** Arrow adapter props retaining deck's standard Icon accessor names. */
export type ArrowIconLayerProps = Omit<
  GPUIconLayerProps,
  | 'getPosition'
  | 'iconOffsets'
  | 'iconFrames'
  | 'iconColorModes'
  | 'getColor'
  | 'getSize'
  | 'getAngle'
  | 'getPixelOffset'
  | 'iconMapping'
> & {
  data: ArrowGPUVectorLayerData;
  iconMapping: ArrowIconMapping;
  getPosition: ArrowGPUVectorColumnSelector<PositionType>;
  getIcon: ArrowGPUVectorColumnSelector;
  getColor?: Color | ArrowGPUVectorColumnSelector<ColorType>;
  getSize?: number | ArrowGPUVectorColumnSelector<Float32>;
  getAngle?: number | ArrowGPUVectorColumnSelector<Float32>;
  getPixelOffset?: ArrowGPUVectorColumnSelector<PositionType>;
};

type ArrowIconLayerState = {
  positions?: GPUVector<'float32x2'>;
  iconOffsets?: GPUVector<'float32x2'>;
  iconFrames?: GPUVector<'float32x4'>;
  iconColorModes?: GPUVector<'float32'>;
  colors?: GPUVector<'unorm8x4'>;
  sizes?: GPUVector<'float32'>;
  angles?: GPUVector<'float32'>;
  pixelOffsets?: GPUVector<'float32x2'>;
};

/** Converts Arrow columns and icon identifiers to owned GPUVectors before GPU icon rendering. */
export class ArrowIconLayer extends CompositeLayer<ArrowIconLayerProps> {
  static override layerName = 'ArrowIconLayer';

  override initializeState(): void {
    this.setState({} satisfies ArrowIconLayerState);
  }

  override updateState({props, oldProps, changeFlags}: UpdateParameters<this>): void {
    if (
      changeFlags.dataChanged ||
      props.getPosition !== oldProps.getPosition ||
      props.getIcon !== oldProps.getIcon ||
      props.iconMapping !== oldProps.iconMapping ||
      props.getColor !== oldProps.getColor ||
      props.getSize !== oldProps.getSize ||
      props.getAngle !== oldProps.getAngle ||
      props.getPixelOffset !== oldProps.getPixelOffset ||
      !(this.state as ArrowIconLayerState).positions
    ) {
      this.destroyVectors();
      this.setState(this.makeVectors(props));
    }
  }

  override renderLayers(): GPUIconLayer | null {
    const state = this.state as ArrowIconLayerState;
    if (!state.positions || !state.iconOffsets || !state.iconFrames || !state.iconColorModes) {
      return null;
    }
    const {data, getPosition, getIcon, getColor, getSize, getAngle, getPixelOffset, ...props} =
      this.props;
    return new GPUIconLayer({
      ...props,
      id: `${this.props.id}-gpu`,
      getPosition: state.positions,
      iconOffsets: state.iconOffsets,
      iconFrames: state.iconFrames,
      iconColorModes: state.iconColorModes,
      getColor: state.colors ?? (isColor(getColor) ? getColor : undefined),
      getSize: state.sizes ?? (typeof getSize === 'number' ? getSize : undefined),
      getAngle: state.angles ?? (typeof getAngle === 'number' ? getAngle : undefined),
      getPixelOffset: state.pixelOffsets
    });
  }

  override finalizeState(): void {
    this.destroyVectors();
  }

  private makeVectors(props: ArrowIconLayerProps): ArrowIconLayerState {
    const positionFormat = getPositionFormat(props.data, props.getPosition);
    const iconSource = resolveVector(props.data, props.getIcon);
    const iconOffsets = new Float32Array(iconSource.length * 2);
    const iconFrames = new Float32Array(iconSource.length * 4);
    const iconColorModes = new Float32Array(iconSource.length);
    for (let rowIndex = 0; rowIndex < iconSource.length; rowIndex++) {
      const iconName = String(iconSource.get(rowIndex));
      const icon = props.iconMapping[iconName];
      if (!icon) throw new Error(`ArrowIconLayer iconMapping has no entry for "${iconName}"`);
      iconOffsets.set(
        [
          icon.width / 2 - (icon.anchorX ?? icon.width / 2),
          icon.height / 2 - (icon.anchorY ?? icon.height / 2)
        ],
        rowIndex * 2
      );
      iconFrames.set([icon.x, icon.y, icon.width, icon.height], rowIndex * 4);
      iconColorModes[rowIndex] = icon.mask ? 1 : 0;
    }
    const offsetVector = makeChunkedFixedSizeListVector(iconSource, iconOffsets, 2);
    const frameVector = makeChunkedFixedSizeListVector(iconSource, iconFrames, 4);
    const colorModeVector = makeChunkedScalarVector(iconSource, iconColorModes);
    return {
      positions: makeLayerGPUVectorFromArrow(this.context.device, props.data, props.getPosition, {
        name: 'positions',
        id: `${this.id}-positions`,
        format: positionFormat
      }),
      iconOffsets: makeLayerGPUVectorFromArrow(this.context.device, props.data, offsetVector, {
        name: 'iconOffsets',
        id: `${this.id}-icon-offsets`,
        format: 'float32x2'
      }),
      iconFrames: makeLayerGPUVectorFromArrow(this.context.device, props.data, frameVector, {
        name: 'iconFrames',
        id: `${this.id}-icon-frames`,
        format: 'float32x4'
      }),
      iconColorModes: makeLayerGPUVectorFromArrow(
        this.context.device,
        props.data,
        colorModeVector,
        {
          name: 'iconColorModes',
          id: `${this.id}-icon-color-modes`,
          format: 'float32'
        }
      ),
      colors: makeOptionalVector(this, props.data, props.getColor, 'colors', 'unorm8x4'),
      sizes: makeOptionalVector(this, props.data, props.getSize, 'sizes', 'float32'),
      angles: makeOptionalVector(this, props.data, props.getAngle, 'angles', 'float32'),
      pixelOffsets: props.getPixelOffset
        ? makeLayerGPUVectorFromArrow(this.context.device, props.data, props.getPixelOffset, {
            name: 'pixelOffsets',
            id: `${this.id}-pixel-offsets`,
            format: 'float32x2'
          })
        : undefined
    };
  }

  private destroyVectors(): void {
    destroyLayerGPUVectors(Object.values(this.state as ArrowIconLayerState));
  }
}

function makeOptionalVector<FormatT extends 'float32' | 'unorm8x4'>(
  layer: ArrowIconLayer,
  data: ArrowGPUVectorLayerData,
  selector: number | Color | ArrowGPUVectorColumnSelector | undefined,
  name: string,
  format: FormatT
): GPUVector<FormatT> | undefined {
  if (!(typeof selector === 'string' || selector instanceof Vector)) return undefined;
  return makeLayerGPUVectorFromArrow(layer.context.device, data, selector, {
    name,
    id: `${layer.id}-${name}`,
    format
  });
}

function resolveVector(
  data: ArrowGPUVectorLayerData,
  selector: ArrowGPUVectorColumnSelector
): Vector {
  if (selector instanceof Vector) return selector;
  const vector = (data instanceof Table ? data : new Table([data])).getChild(selector);
  if (!vector) throw new Error(`ArrowIconLayer column "${selector}" is missing`);
  return vector;
}

function makeChunkedFixedSizeListVector(
  source: Vector,
  values: Float32Array,
  listSize: 2 | 4
): Vector<FixedSizeList<Float32>> {
  const chunks: Data<FixedSizeList<Float32>>[] = [];
  let rowOffset = 0;
  for (const sourceChunk of source.data) {
    const valueStart = rowOffset * listSize;
    const valueEnd = valueStart + sourceChunk.length * listSize;
    chunks.push(
      ...makeArrowFixedSizeListVector(
        new Float32(),
        listSize,
        values.subarray(valueStart, valueEnd)
      ).data
    );
    rowOffset += sourceChunk.length;
  }
  return makeVector(chunks);
}

function makeChunkedScalarVector(source: Vector, values: Float32Array): Vector<Float32> {
  const chunks: Data<Float32>[] = [];
  let rowOffset = 0;
  for (const sourceChunk of source.data) {
    chunks.push(
      ...vectorFromArray(
        Array.from(values.subarray(rowOffset, rowOffset + sourceChunk.length)),
        new Float32()
      ).data
    );
    rowOffset += sourceChunk.length;
  }
  return makeVector(chunks);
}

function getPositionFormat(
  data: ArrowGPUVectorLayerData,
  selector: ArrowGPUVectorColumnSelector<PositionType>
): 'float32x2' {
  const vector = resolveVector(data, selector);
  if (!DataType.isFixedSizeList(vector.type) || vector.type.listSize !== 2) {
    throw new Error('ArrowIconLayer positions must be FixedSizeList[2]');
  }
  return 'float32x2';
}

function isColor(value: unknown): value is Color {
  return Array.isArray(value) || ArrayBuffer.isView(value);
}
