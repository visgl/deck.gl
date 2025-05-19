// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {AccessorFunction, DefaultProps} from '@deck.gl/core';
import GeoCellLayer, {GeoCellLayerProps} from '../geo-cell-layer/GeoCellLayer';
import {GlobalGrid} from '../global-grid-systems/grids/global-grid';
import {flattenPolygon} from '../global-grid-systems/utils/geometry-utils';

/** All properties supported by GlobalGridLayer. */
export type GlobalGridLayerProps<DataT = unknown> = _GlobalGridLayerProps<DataT> &
  GeoCellLayerProps<DataT>;

/** Properties added by GlobalGridLayer. */
type _GlobalGridLayerProps<DataT> = {
  /** The DGGS decoder to use. */
  globalGrid: GlobalGrid;
  /** Called for each data object to retrieve the DGGS cell identifier. By default, it reads `cellId` property of data object. */
  getCellId?: AccessorFunction<DataT, string | bigint>;
};

/** Render filled and/or stroked polygons based on the specified DGGS geospatial indexing system. */
export class GlobalGridLayer<DataT = any, ExtraProps extends {} = {}> extends GeoCellLayer<
  DataT,
  Required<_GlobalGridLayerProps<DataT>> & ExtraProps
> {
  static layerName = 'GlobalGridLayer';
  static defaultProps: DefaultProps<GlobalGridLayerProps> = {
    getCellId: {type: 'accessor', value: (d: any) => d.cellId},
    globalGrid: {type: 'object', compare: true, value: undefined!}
  };

  initializeState(): void {
    this.props.globalGrid?.initialize?.();
  }

  indexToBounds(): Partial<GeoCellLayer['props']> | null {
    const {data, getCellId} = this.props;

    return {
      data,
      _normalize: false,
      _windingOrder: 'CCW',
      positionFormat: 'XY',
      getPolygon: (x: DataT, objectInfo) => {
        const {globalGrid} = this.props;
        const cell = getCellId(x, objectInfo);
        const boundary = globalGrid.cellToBoundary(cell);
        boundary.push(boundary[0]);
        return flattenPolygon(boundary);
      }
    };
  }
}
