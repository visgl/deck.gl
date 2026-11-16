// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Vector} from 'apache-arrow';

import {AccessorFunction, DefaultProps} from '@deck.gl/core';
import GeoCellLayer, {GeoCellLayerProps} from '../geo-cell-layer/GeoCellLayer';
import {getQuadkeyPolygon} from './quadkey-utils';

import {hasCellColumns, getCellValue, renderCellColumns} from '../geo-cell-layer/cell-columns';

const defaultProps: DefaultProps<QuadkeyLayerProps> = {
  getQuadkey: {
    type: 'accessor',
    arrow: true,
    value: (d: any) => d.quadkey
  }
};

/** All properties supported by QuadkeyLayer. */
export type QuadkeyLayerProps<DataT = unknown> = _QuadkeyLayerProps<DataT> &
  GeoCellLayerProps<DataT>;

/** Properties added by QuadkeyLayer. */
type _QuadkeyLayerProps<DataT> = {
  /**
   * Called for each data object to retrieve the quadkey string identifier.
   *
   * By default, it reads `quadkey` property of data object.
   * Also accepts an Arrow vector of identifiers or identifier lists in source-feature order.
   */
  getQuadkey?: AccessorFunction<DataT, string> | Vector;
};

/** Render filled and/or stroked polygons based on the [Quadkey](https://towardsdatascience.com/geospatial-indexing-with-quadkeys-d933dff01496) geospatial indexing system. */
export default class QuadkeyLayer<DataT = any, ExtraProps extends {} = {}> extends GeoCellLayer<
  DataT,
  Required<_QuadkeyLayerProps<DataT>> & ExtraProps
> {
  static layerName = 'QuadkeyLayer';
  static defaultProps = defaultProps;

  /** Routes cell columns through source-preserving geometry and style accessors. */
  renderLayers() {
    if (hasCellColumns(this.props, 'getQuadkey'))
      return renderCellColumns(this, 'getQuadkey', false, {
        row: this.getSubLayerRow.bind(this),
        accessor: this.getSubLayerAccessor.bind(this),
        props: this.getSubLayerProps.bind(this)
      });
    return super.renderLayers();
  }

  indexToBounds(): Partial<GeoCellLayer['props']> | null {
    const {data, extruded, getQuadkey} = this.props;
    // To avoid z-fighting reduce polygon footprint when extruding
    const coverage = extruded ? 0.99 : 1;

    return {
      data,
      _normalize: false,
      positionFormat: 'XY',

      getPolygon: (x: DataT, objectInfo) =>
        getQuadkeyPolygon(getCellValue(getQuadkey, x, objectInfo), coverage),
      updateTriggers: {getPolygon: coverage}
    };
  }
}
