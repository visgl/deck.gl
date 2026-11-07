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
  sourcePositions: {
    attribute: 'instanceSourcePositions',
    accessor: 'getSourcePosition',
    semantic: 'position',
    size: 3
  },
  targetPositions: {
    attribute: 'instanceTargetPositions',
    accessor: 'getTargetPosition',
    semantic: 'position',
    size: 3
  },
  colors: {attribute: 'instanceColors', accessor: 'getColor', semantic: 'color', size: 4},
  widths: {
    attribute: 'instanceWidths',
    accessor: 'getWidth',
    semantic: 'scalar',
    size: 1,
    defaultValue: 1
  }
};

/** Arrow columns overriding LineLayer accessors. */
export type LineColumnProps = {
  /** Source positions. */
  sourcePositions?: ColumnSource | null;
  /** Target positions. */
  targetPositions?: ColumnSource | null;
  /** Line colors. */
  colors?: ColumnSource | null;
  /** Line widths. */
  widths?: ColumnSource | null;
};

/** Returns whether any Arrow column is supplied. */
export function hasLineColumns(props: LineColumnProps): boolean {
  return Object.keys(DEFINITIONS).some(name => Boolean(props[name]));
}

/** Prepares LineLayer column inputs. */
export class LineLayerColumns extends LayerColumns {
  constructor(device: Device) {
    super(device, DEFINITIONS, 'Line');
  }
}
