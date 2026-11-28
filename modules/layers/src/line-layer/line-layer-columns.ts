// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';
import type {GPUVector} from '@luma.gl/graph/gpu-data';
import {
  _LayerColumns as LayerColumns,
  _resolveColumns as resolveColumns,
  type _ColumnDefinition as ColumnDefinition
} from '@deck.gl/core';

/** Shared byte-color default, recognized by reference in both rendering paths. */
export const DEFAULT_COLOR = [0, 0, 0, 255] as const;

const DEFINITIONS: Record<string, ColumnDefinition> = {
  sourcePositions: {
    attribute: 'instanceSourcePositions',
    accessor: 'getSourcePosition',
    arrowAccessor: true,
    semantic: 'position',
    allowPackedXY: true,
    size: 3
  },
  targetPositions: {
    attribute: 'instanceTargetPositions',
    accessor: 'getTargetPosition',
    arrowAccessor: true,
    semantic: 'position',
    allowPackedXY: true,
    size: 3
  },
  colors: {
    attribute: 'instanceColors',
    accessor: 'getColor',
    arrowAccessor: true,
    semantic: 'color',
    defaultColor: DEFAULT_COLOR,
    size: 4
  },
  widths: {
    attribute: 'instanceWidths',
    accessor: 'getWidth',
    arrowAccessor: true,
    semantic: 'scalar',
    size: 1,
    defaultValue: 1
  }
};

/** Experimental GPU-resident columns. CPU columns are supplied through accessors. */
export type LineColumnProps = {
  /** @experimental Borrowed XY or XYZ source positions. XY implies zero elevation. */
  sourcePositions?: GPUVector<'float32x2' | 'float32x3'> | null;
  /** @experimental Borrowed XY or XYZ target positions. XY implies zero elevation. */
  targetPositions?: GPUVector<'float32x2' | 'float32x3'> | null;
  /** @experimental GPU-resident column. */
  colors?: GPUVector | null;
  /** @experimental GPU-resident column. */
  widths?: GPUVector | null;
};

/** Returns whether an Arrow accessor or experimental GPU column selects column processing. */
export function hasLineColumns(props: Readonly<Record<string, unknown>>): boolean {
  return Object.keys(resolveColumns(props, DEFINITIONS)).length > 0;
}

/** Prepares LineLayer column inputs. */
export class LineLayerColumns extends LayerColumns {
  constructor(device: Device) {
    super(device, DEFINITIONS, 'Line');
  }
}
