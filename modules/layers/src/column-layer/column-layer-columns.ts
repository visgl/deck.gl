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
  positions: {
    attribute: 'instancePositions',
    accessor: 'getPosition',
    arrowAccessor: true,
    semantic: 'position',
    size: 3
  },
  elevations: {
    attribute: 'instanceElevations',
    accessor: 'getElevation',
    arrowAccessor: true,
    semantic: 'scalar',
    size: 1,
    defaultValue: 1000
  },
  fillColors: {
    attribute: 'instanceFillColors',
    accessor: 'getFillColor',
    arrowAccessor: true,
    semantic: 'color',
    size: 4
  },
  lineColors: {
    attribute: 'instanceLineColors',
    accessor: 'getLineColor',
    arrowAccessor: true,
    semantic: 'color',
    size: 4
  },
  lineWidths: {
    attribute: 'instanceStrokeWidths',
    accessor: 'getLineWidth',
    arrowAccessor: true,
    semantic: 'scalar',
    size: 1,
    defaultValue: 1
  }
};

/** Experimental GPU-resident columns. CPU columns are supplied through accessors. */
export type ColumnLayerColumnProps = {
  /** @experimental GPU-resident column. */
  positions?: GPUVector | null;
  /** @experimental GPU-resident column. */
  elevations?: GPUVector | null;
  /** @experimental GPU-resident column. */
  fillColors?: GPUVector | null;
  /** @experimental GPU-resident column. */
  lineColors?: GPUVector | null;
  /** @experimental GPU-resident column. */
  lineWidths?: GPUVector | null;
};

/** Returns whether an Arrow accessor or experimental GPU column selects column processing. */
export function hasColumnLayerColumns(props: Readonly<Record<string, unknown>>): boolean {
  return Object.keys(resolveColumns(props, DEFINITIONS)).length > 0;
}

/** Prepares ColumnLayer column inputs. */
export class ColumnLayerColumns extends LayerColumns {
  /** Reuses shared Arrow conversion and accessor fallback with ColumnLayer shader names. */
  constructor(device: Device) {
    super(device, DEFINITIONS, 'Column');
  }
}
