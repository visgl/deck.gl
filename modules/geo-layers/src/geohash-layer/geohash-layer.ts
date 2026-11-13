// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {ArrowAccessor, DefaultProps} from '@deck.gl/core';
import GeoCellLayer, {GeoCellLayerProps} from '../geo-cell-layer/GeoCellLayer';
import {getGeohashPolygon} from './geohash-utils';

import {hasCellColumns, getCellValue, renderCellColumns} from '../geo-cell-layer/cell-columns';

const defaultProps: DefaultProps<GeohashLayerProps> = {
  getGeohash: {
    type: 'accessor',
    arrow: true,
    constantTypes: ['string'],
    value: (d: any) => d.geohash
  }
};

/** All properties supported by GeohashLayer. */
export type GeohashLayerProps<DataT = unknown> = _GeohashLayerProps<DataT> &
  GeoCellLayerProps<DataT>;

/** Properties added by GeohashLayer. */
type _GeohashLayerProps<DataT> = {
  /**
   * Called for each data object to retrieve the geohash string identifier.
   *
   * By default, it reads `geohash` property of data object.
   * Also accepts an Arrow vector of identifiers or identifier lists in source-feature order.
   */
  getGeohash?: ArrowAccessor<DataT, string>;
};

/** Render filled and/or stroked polygons based on the [Geohash](https://en.wikipedia.org/wiki/Geohash) geospatial indexing system. */
export default class GeohashLayer<DataT = any, ExtraProps extends {} = {}> extends GeoCellLayer<
  DataT,
  Required<_GeohashLayerProps<DataT>> & ExtraProps
> {
  static layerName = 'GeohashLayer';
  static defaultProps = defaultProps;

  /** Routes cell columns through source-preserving geometry and style accessors. */
  renderLayers() {
    if (hasCellColumns(this.props, 'getGeohash'))
      return renderCellColumns(this, 'getGeohash', false, {
        row: this.getSubLayerRow.bind(this),
        accessor: this.getSubLayerAccessor.bind(this),
        props: this.getSubLayerProps.bind(this)
      });
    return super.renderLayers();
  }

  indexToBounds(): Partial<GeoCellLayer['props']> | null {
    const {data, getGeohash} = this.props;

    return {
      data,
      _normalize: false,
      positionFormat: 'XY',
      getPolygon: (x: DataT, objectInfo) =>
        getGeohashPolygon(getCellValue(getGeohash, x, objectInfo))
    };
  }
}
