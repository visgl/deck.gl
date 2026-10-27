// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';
import type {GPUVector} from '@luma.gl/gpgpu/gpu-data';

/** Structural Arrow vector contract; importing the layer does not load Apache Arrow. */
export type ColumnSource = {
  readonly length: number;
  readonly type: unknown;
  readonly data: readonly unknown[];
};
/** Owned conversion result returned by the optional Arrow integration. */
export type ConvertedColumn = {
  vector: GPUVector;
  residualVector?: GPUVector;
  destroy(): void;
};
/** Minimal semantic conversion interface used by the standard Scatterplot column path. */
export type ColumnConverter = {
  convert(
    source: ColumnSource,
    options: {name: string; semantic: 'position' | 'scalar' | 'color'}
  ): Promise<ConvertedColumn>;
};
/** Factory keeping Arrow dependencies outside the standard layers package. */
export type ColumnConverterFactory = (device: Device) => ColumnConverter;

let factory: ColumnConverterFactory | undefined;

/** Registers optional column conversion without importing Arrow in the main core entry. */
export function registerColumnConverter(converter: ColumnConverterFactory): void {
  factory = converter;
}

/** Creates the registered converter for one layer/device. */
export function createColumnConverter(device: Device): ColumnConverter {
  if (!factory) throw new Error('Register an Arrow converter before using column props');
  return factory(device);
}
