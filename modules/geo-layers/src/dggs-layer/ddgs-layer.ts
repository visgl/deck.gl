// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {AccessorFunction, DefaultProps} from '@deck.gl/core';
import GeoCellLayer, {GeoCellLayerProps} from '../geo-cell-layer/GeoCellLayer';
import {DGGSDecoder} from './dggs-decoder';
import {flattenPolygon} from '../h3-layers/h3-utils';

/** All properties supported by DGGSLayer. */
export type DGGSLayerProps<DataT = unknown> = _DGGSLayerProps<DataT> & GeoCellLayerProps<DataT>;

/** Properties added by DGGSLayer. */
type _DGGSLayerProps<DataT> = {
  /** Called for each data object to retrieve the DGGS cell identifier. By default, it reads `cellId` property of data object. */
  getDGGSCellId?: AccessorFunction<DataT, string | bigint>;
  /** The DGGS decoder to use. */
  dggsDecoder: DGGSDecoder;
};

/** Render filled and/or stroked polygons based on the specified DGGS geospatial indexing system. */
export class DGGSLayer<DataT = any, ExtraProps extends {} = {}> extends GeoCellLayer<
  DataT,
  Required<_DGGSLayerProps<DataT>> & ExtraProps
> {
  static layerName = 'DGGSLayer';
  static defaultProps: DefaultProps<DGGSLayerProps> = {
    getDGGSCellId: {type: 'accessor', value: (d: any) => d.cellId}
  };

  indexToBounds(): Partial<GeoCellLayer['props']> | null {
    const {data, getDGGSCellId} = this.props;

    return {
      data,
      _normalize: false,
      _windingOrder: 'CCW',
      positionFormat: 'XY',
      getPolygon: (x: DataT, objectInfo) => {
        const {dggsDecoder} = this.props;
        const cellIdOrIndex = getDGGSCellId(x, objectInfo);
        const cellId =
          typeof cellIdOrIndex === 'bigint'
            ? dggsDecoder.getTokenFromCellIndex?.(cellIdOrIndex)
            : cellIdOrIndex;
        const boundary = dggsDecoder.getCellBoundaryPolygon(cellId!);
        boundary.push(boundary[0]);
        return flattenPolygon(boundary);
      }
    };
  }
}
