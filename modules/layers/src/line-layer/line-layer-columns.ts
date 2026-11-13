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

const DEFINITIONS: Record<string, ColumnDefinition> = {
  sourcePositions: {
    attribute: 'instanceSourcePositions',
    accessor: 'getSourcePosition',
    arrowAccessor: true,
    semantic: 'position',
    size: 3
  },
  targetPositions: {
    attribute: 'instanceTargetPositions',
    accessor: 'getTargetPosition',
    arrowAccessor: true,
    semantic: 'position',
    size: 3
  },
  colors: {
    attribute: 'instanceColors',
    accessor: 'getColor',
    arrowAccessor: true,
    semantic: 'color',
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
  /** @experimental GPU-resident column. */
  sourcePositions?: GPUVector | null;
  /** @experimental GPU-resident column. */
  targetPositions?: GPUVector | null;
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
