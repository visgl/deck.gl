// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';
import type {ColumnSource} from '@deck.gl/core/arrow';
import {LayerColumns, type ColumnDefinition} from '../utils/layer-columns';

const DEFINITIONS: Record<string, ColumnDefinition> = {
  positions: {
    attribute: 'instancePositions',
    accessor: 'getPosition',
    semantic: 'position',
    size: 3
  },
  radii: {attribute: 'instanceRadius', accessor: 'getRadius', semantic: 'scalar', size: 1},
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
    attribute: 'instanceLineWidths',
    accessor: 'getLineWidth',
    semantic: 'scalar',
    size: 1
  },
  pixelOffsets: {
    attribute: 'instancePixelOffset',
    accessor: 'getPixelOffset',
    semantic: 'vector',
    size: 2,
    prop: false
  }
};
/** Explicit column props override the matching accessors when supplied. */
export type ScatterplotColumnProps = {
  /** Arrow XY/XYZ position column overriding getPosition. */
  positions?: ColumnSource | null;
  /** Arrow numeric radius column overriding getRadius. */
  radii?: ColumnSource | null;
  /** Arrow RGB/RGBA fill column overriding getFillColor. */
  fillColors?: ColumnSource | null;
  /** Arrow RGB/RGBA stroke column overriding getLineColor. */
  lineColors?: ColumnSource | null;
  /** Arrow numeric stroke width column overriding getLineWidth. */
  lineWidths?: ColumnSource | null;
};

/** Returns whether any Arrow column prop is present. */
export function hasScatterplotColumns(props: ScatterplotColumnProps): boolean {
  return Object.keys(DEFINITIONS).some(name => name !== 'pixelOffsets' && Boolean(props[name]));
}

/** Prepares Scatterplot columns using the shared column implementation. */
export class ScatterplotLayerColumns extends LayerColumns {
  constructor(device: Device) {
    super(device, DEFINITIONS, 'Scatterplot', true);
  }
}
