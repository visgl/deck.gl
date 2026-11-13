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

/** Column semantics shared by Scatterplot selection and preparation. */
export const SCATTERPLOT_COLUMN_DEFINITIONS: Record<string, ColumnDefinition> = {
  positions: {
    attribute: 'instancePositions',
    accessor: 'getPosition',
    arrowAccessor: true,
    semantic: 'position',
    size: 3
  },
  radii: {
    attribute: 'instanceRadius',
    accessor: 'getRadius',
    arrowAccessor: true,
    semantic: 'scalar',
    size: 1,
    defaultValue: 1
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
    attribute: 'instanceLineWidths',
    accessor: 'getLineWidth',
    arrowAccessor: true,
    semantic: 'scalar',
    size: 1,
    defaultValue: 1
  },
  pixelOffsets: {
    attribute: 'instancePixelOffset',
    accessor: 'getPixelOffset',
    semantic: 'vector',
    size: 2,
    prop: false
  }
};
/** Experimental GPU-resident columns. CPU columns are supplied through accessors. */
export type ScatterplotColumnProps = {
  /** @experimental GPU-resident column. */
  positions?: GPUVector | null;
  /** @experimental GPU-resident column. */
  radii?: GPUVector | null;
  /** @experimental GPU-resident column. */
  fillColors?: GPUVector | null;
  /** @experimental GPU-resident column. */
  lineColors?: GPUVector | null;
  /** @experimental GPU-resident column. */
  lineWidths?: GPUVector | null;
};

/** Returns whether a column prop or an opted-in Arrow accessor drives the layer. */
export function hasScatterplotColumns(props: Readonly<Record<string, unknown>>): boolean {
  return Object.keys(resolveColumns(props, SCATTERPLOT_COLUMN_DEFINITIONS)).length > 0;
}

/** Prepares Scatterplot columns using the shared column implementation. */
export class ScatterplotLayerColumns extends LayerColumns {
  constructor(device: Device) {
    super(device, SCATTERPLOT_COLUMN_DEFINITIONS, 'Scatterplot', true);
  }
}
