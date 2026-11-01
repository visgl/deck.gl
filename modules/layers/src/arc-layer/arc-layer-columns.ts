// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';
import type {ColumnSource} from '@deck.gl/core/arrow';
import {LayerColumns, type ColumnDefinition} from '../utils/layer-columns';

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
  sourceColors: {
    attribute: 'instanceSourceColors',
    accessor: 'getSourceColor',
    semantic: 'color',
    size: 4
  },
  targetColors: {
    attribute: 'instanceTargetColors',
    accessor: 'getTargetColor',
    semantic: 'color',
    size: 4
  },
  widths: {attribute: 'instanceWidths', accessor: 'getWidth', semantic: 'scalar', size: 1},
  heights: {attribute: 'instanceHeights', accessor: 'getHeight', semantic: 'scalar', size: 1},
  tilts: {attribute: 'instanceTilts', accessor: 'getTilt', semantic: 'scalar', size: 1}
};

/** Arrow columns overriding the corresponding ArcLayer accessors. */
export type ArcColumnProps = {
  /** Arrow XY/XYZ source positions. */
  sourcePositions?: ColumnSource | null;
  /** Arrow XY/XYZ target positions. */
  targetPositions?: ColumnSource | null;
  /** Arrow RGB/RGBA source colors. */
  sourceColors?: ColumnSource | null;
  /** Arrow RGB/RGBA target colors. */
  targetColors?: ColumnSource | null;
  /** Arrow numeric widths. */
  widths?: ColumnSource | null;
  /** Arrow numeric heights. */
  heights?: ColumnSource | null;
  /** Arrow numeric tilts. */
  tilts?: ColumnSource | null;
};

/** Returns whether a column prop selects the column path. */
export function hasArcColumns(props: ArcColumnProps): boolean {
  return Object.keys(DEFINITIONS).some(name => Boolean(props[name]));
}

/** Prepares ArcLayer columns and accessor fallbacks. */
export class ArcLayerColumns extends LayerColumns {
  constructor(device: Device) {
    super(device, DEFINITIONS, 'Arc');
  }
}
