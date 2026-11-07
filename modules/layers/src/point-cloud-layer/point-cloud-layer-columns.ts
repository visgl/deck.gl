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
  normals: {attribute: 'instanceNormals', accessor: 'getNormal', semantic: 'vector', size: 3},
  colors: {attribute: 'instanceColors', accessor: 'getColor', semantic: 'color', size: 4}
};

/** Arrow columns overriding PointCloudLayer accessors. */
export type PointCloudColumnProps = {
  /** Point positions. */
  positions?: ColumnSource | null;
  /** Point normals. */
  normals?: ColumnSource | null;
  /** Point colors. */
  colors?: ColumnSource | null;
};

/** Returns whether any Arrow column is supplied. */
export function hasPointCloudColumns(props: PointCloudColumnProps): boolean {
  return Object.keys(DEFINITIONS).some(name => Boolean(props[name]));
}

/** Prepares PointCloudLayer column inputs. */
export class PointCloudLayerColumns extends LayerColumns {
  constructor(device: Device) {
    super(device, DEFINITIONS, 'PointCloud');
  }
}
