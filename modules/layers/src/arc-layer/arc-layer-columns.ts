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
  sourceColors: {
    attribute: 'instanceSourceColors',
    accessor: 'getSourceColor',
    arrowAccessor: true,
    semantic: 'color',
    defaultColor: DEFAULT_COLOR,
    size: 4
  },
  targetColors: {
    attribute: 'instanceTargetColors',
    accessor: 'getTargetColor',
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
  /** @experimental Borrowed XY or XYZ source positions. XY implies zero elevation. */
  sourcePositions?: GPUVector<'float32x2' | 'float32x3'> | null;
  /** @experimental Borrowed XY or XYZ target positions. XY implies zero elevation. */
  targetPositions?: GPUVector<'float32x2' | 'float32x3'> | null;
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
export function hasArcColumns(
  props: Readonly<Record<string, unknown>>,
  extraColumns?: Readonly<Record<string, ColumnDefinition>>
): boolean {
  /** Combined definitions used to discover a column declared by the base layer or a subclass. */
  const definitions = extraColumns ? {...DEFINITIONS, ...extraColumns} : DEFINITIONS;
  return Object.keys(resolveColumns(props, definitions)).length > 0;
}

/** Prepares ArcLayer columns and accessor fallbacks. */
export class ArcLayerColumns extends LayerColumns {
  /** Prepares columns for the Arc shaders and any additional inputs from a subclass. */
  constructor(device: Device, extraColumns: Readonly<Record<string, ColumnDefinition>> = {}) {
    super(device, {...DEFINITIONS, ...extraColumns}, 'Arc');
  }
}
