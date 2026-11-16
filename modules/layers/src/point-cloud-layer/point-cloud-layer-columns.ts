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
  normals: {
    attribute: 'instanceNormals',
    accessor: 'getNormal',
    arrowAccessor: true,
    semantic: 'vector',
    size: 3
  },
  colors: {
    attribute: 'instanceColors',
    accessor: 'getColor',
    arrowAccessor: true,
    semantic: 'color',
    size: 4
  }
};

/** Experimental GPU-resident columns. CPU columns are supplied through accessors. */
export type PointCloudColumnProps = {
  /** @experimental GPU-resident column. */
  positions?: GPUVector | null;
  /** @experimental GPU-resident column. */
  normals?: GPUVector | null;
  /** @experimental GPU-resident column. */
  colors?: GPUVector | null;
};

/** Returns whether an Arrow accessor or experimental GPU column selects column processing. */
export function hasPointCloudColumns(props: Readonly<Record<string, unknown>>): boolean {
  return Object.keys(resolveColumns(props, DEFINITIONS)).length > 0;
}

/** Prepares PointCloudLayer column inputs. */
export class PointCloudLayerColumns extends LayerColumns {
  constructor(device: Device) {
    super(device, DEFINITIONS, 'PointCloud');
  }
}
