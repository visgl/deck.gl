// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';
import type {ColumnSource} from '@deck.gl/core/arrow';
import {
  _LayerColumns as LayerColumns,
  type _ColumnDefinition as ColumnDefinition
} from '@deck.gl/core';

const DEFINITIONS: Record<string, ColumnDefinition> = {
  positions: {
    attribute: 'instancePositions',
    accessor: 'getPosition',
    semantic: 'position',
    size: 3
  },
  elevations: {
    attribute: 'instanceElevations',
    accessor: 'getElevation',
    semantic: 'scalar',
    size: 1,
    defaultValue: 1000
  },
  fillColors: {
    attribute: 'instanceFillColors',
    accessor: 'getFillColor',
    semantic: 'color',
    size: 4
  },
  lineColors: {
    attribute: 'instanceLineColors',
    accessor: 'getLineColor',
    semantic: 'color',
    size: 4
  },
  lineWidths: {
    attribute: 'instanceStrokeWidths',
    accessor: 'getLineWidth',
    semantic: 'scalar',
    size: 1,
    defaultValue: 1
  }
};

/** Arrow columns overriding ColumnLayer accessors. */
export type ColumnLayerColumnProps = {
  /** Point positions. */
  positions?: ColumnSource | null;
  /** Column elevations. */
  elevations?: ColumnSource | null;
  /** Fill colors. */
  fillColors?: ColumnSource | null;
  /** Outline colors. */
  lineColors?: ColumnSource | null;
  /** Outline widths. */
  lineWidths?: ColumnSource | null;
};

/** Returns whether any Arrow column is supplied. */
export function hasColumnLayerColumns(props: ColumnLayerColumnProps): boolean {
  return Object.keys(DEFINITIONS).some(name => Boolean(props[name]));
}

/** Prepares ColumnLayer column inputs. */
export class ColumnLayerColumns extends LayerColumns {
  /** Reuses shared Arrow conversion and accessor fallback with ColumnLayer shader names. */
  constructor(device: Device) {
    super(device, DEFINITIONS, 'Column');
  }
}
