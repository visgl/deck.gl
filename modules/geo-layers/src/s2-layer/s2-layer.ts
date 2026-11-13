// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Vector} from 'apache-arrow';

import {AccessorFunction, DefaultProps} from '@deck.gl/core';
import GeoCellLayer, {GeoCellLayerProps} from '../geo-cell-layer/GeoCellLayer';
import {getS2Polygon} from './s2-utils';

import {hasCellColumns, getCellValue, renderCellColumns} from '../geo-cell-layer/cell-columns';

const defaultProps: DefaultProps<S2LayerProps> = {
  getS2Token: {type: 'accessor', arrow: true, value: (d: any) => d.token}
};

/** All properties supported by S2Layer. */
export type S2LayerProps<DataT = unknown> = _S2LayerProps<DataT> & GeoCellLayerProps<DataT>;

/** Properties added by S2Layer. */
type _S2LayerProps<DataT> = {
  /**
   * Called for each data object to retrieve the quadkey string identifier.
   *
   * By default, it reads `token` property of data object.
   * Also accepts an Arrow vector of identifiers or identifier lists in source-feature order.
   */
  getS2Token?: AccessorFunction<DataT, string> | Vector;
};

/** Render filled and/or stroked polygons based on the [S2](http://s2geometry.io/) geospatial indexing system. */
export default class S2Layer<DataT = any, ExtraProps extends {} = {}> extends GeoCellLayer<
  DataT,
  Required<_S2LayerProps<DataT>> & ExtraProps
> {
  static layerName = 'S2Layer';
  static defaultProps = defaultProps;

  /** Routes cell columns through source-preserving geometry and style accessors. */
  renderLayers() {
    if (hasCellColumns(this.props, 'getS2Token'))
      return renderCellColumns(this, 'getS2Token', false, {
        row: this.getSubLayerRow.bind(this),
        accessor: this.getSubLayerAccessor.bind(this),
        props: this.getSubLayerProps.bind(this)
      });
    return super.renderLayers();
  }

  indexToBounds(): Partial<GeoCellLayer['props']> | null {
    const {data, getS2Token} = this.props;

    return {
      data,
      _normalize: false,
      positionFormat: 'XY',
      getPolygon: (x: DataT, objectInfo) => getS2Polygon(getCellValue(getS2Token, x, objectInfo))
    };
  }
}
