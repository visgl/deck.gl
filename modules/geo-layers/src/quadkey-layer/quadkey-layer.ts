// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {AccessorFunction, DefaultProps} from '@deck.gl/core';
import GeoCellLayer, {GeoCellLayerProps} from '../geo-cell-layer/GeoCellLayer';
import {getQuadkeyPolygon} from './quadkey-utils';

const defaultProps: DefaultProps<QuadkeyLayerProps> = {
  getQuadkey: {type: 'accessor', value: (d: any) => d.quadkey}
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
   */
  getQuadkey?: AccessorFunction<DataT, string>;
};

/** Render filled and/or stroked polygons based on the [Quadkey](https://towardsdatascience.com/geospatial-indexing-with-quadkeys-d933dff01496) geospatial indexing system. */
export default class QuadkeyLayer<DataT = any, ExtraProps extends {} = {}> extends GeoCellLayer<
  DataT,
  Required<_QuadkeyLayerProps<DataT>> & ExtraProps
> {
  static layerName = 'QuadkeyLayer';
  static defaultProps = defaultProps;

  indexToBounds(): Partial<GeoCellLayer['props']> | null {
    const {data, extruded, getQuadkey} = this.props;
    // To avoid z-fighting reduce polygon footprint when extruding
    const coverage = extruded ? 0.99 : 1;

    return {
      data,
      _normalize: false,
      positionFormat: 'XY',

      getPolygon: (x: DataT, objectInfo) => getQuadkeyPolygon(getQuadkey(x, objectInfo), coverage),
      updateTriggers: {getPolygon: coverage}
    };
  }
}
