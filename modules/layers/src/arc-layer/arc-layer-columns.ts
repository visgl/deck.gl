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
  sourceColors: {
    attribute: 'instanceSourceColors',
    accessor: 'getSourceColor',
    arrowAccessor: true,
    semantic: 'color',
    size: 4
  },
  targetColors: {
    attribute: 'instanceTargetColors',
    accessor: 'getTargetColor',
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
  },
  heights: {
    attribute: 'instanceHeights',
    accessor: 'getHeight',
    arrowAccessor: true,
    semantic: 'scalar',
    size: 1,
    defaultValue: 1
  },
  tilts: {
    attribute: 'instanceTilts',
    accessor: 'getTilt',
    arrowAccessor: true,
    semantic: 'scalar',
    size: 1
  }
};

/** Experimental GPU-resident columns. CPU columns are supplied through accessors. */
export type ArcColumnProps = {
  /** @experimental GPU-resident column. */
  sourcePositions?: GPUVector | null;
  /** @experimental GPU-resident column. */
  targetPositions?: GPUVector | null;
  /** @experimental GPU-resident column. */
  sourceColors?: GPUVector | null;
  /** @experimental GPU-resident column. */
  targetColors?: GPUVector | null;
  /** @experimental GPU-resident column. */
  widths?: GPUVector | null;
  /** @experimental GPU-resident column. */
  heights?: GPUVector | null;
  /** @experimental GPU-resident column. */
  tilts?: GPUVector | null;
};

/** Returns whether a column prop selects the column path. */
export function hasArcColumns(props: Readonly<Record<string, unknown>>): boolean {
  return Object.keys(resolveColumns(props, DEFINITIONS)).length > 0;
}

/** Prepares ArcLayer columns and accessor fallbacks. */
export class ArcLayerColumns extends LayerColumns {
  constructor(device: Device) {
    super(device, DEFINITIONS, 'Arc');
  }
}
