// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {AccessorFunction, DefaultProps} from '@deck.gl/core';
import GeoCellLayer, {GeoCellLayerProps} from '../geo-cell-layer/GeoCellLayer';
import {GlobalGridDecoder} from './global-grid-decoders/global-grid-decoder';
import {flattenPolygon} from '../h3-layers/h3-utils';

/** All properties supported by GlobalGridLayer. */
export type GlobalGridLayerProps<DataT = unknown> = _GlobalGridLayerProps<DataT> &
  GeoCellLayerProps<DataT>;

/** Properties added by GlobalGridLayer. */
type _GlobalGridLayerProps<DataT> = {
  /** Called for each data object to retrieve the DGGS cell identifier. By default, it reads `cellId` property of data object. */
  getCellId?: AccessorFunction<DataT, string | bigint>;
  /** The DGGS decoder to use. */
  dggsDecoder: GlobalGridDecoder;
};

/** Render filled and/or stroked polygons based on the specified DGGS geospatial indexing system. */
export class GlobalGridLayer<DataT = any, ExtraProps extends {} = {}> extends GeoCellLayer<
  DataT,
  Required<_GlobalGridLayerProps<DataT>> & ExtraProps
> {
  static layerName = 'GlobalGridLayer';
  static defaultProps: DefaultProps<GlobalGridLayerProps> = {
    getCellId: {type: 'accessor', value: (d: any) => d.cellId},
    dggsDecoder: {type: 'object', compare: true, value: undefined!}
  };

  indexToBounds(): Partial<GeoCellLayer['props']> | null {
    const {data, getCellId} = this.props;

    return {
      data,
      _normalize: false,
      _windingOrder: 'CCW',
      positionFormat: 'XY',
      getPolygon: (x: DataT, objectInfo) => {
        const {dggsDecoder} = this.props;
        const cell = getCellId(x, objectInfo);
        const cellId = typeof cell === 'string' ? dggsDecoder.tokenToBigInt(cell) : cell;
        const boundary = dggsDecoder.cellToBoundary(cellId);
        boundary.push(boundary[0]);
        return flattenPolygon(boundary);
      }
    };
  }
}
