// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {AccessorFunction, DefaultProps} from '@deck.gl/core';
import GeoCellLayer, {GeoCellLayerProps} from '../geo-cell-layer/GeoCellLayer';
import {cellToBoundary, hexToU64} from 'a5-js';
import {flattenPolygon} from '../h3-layers/h3-utils';

import {
  cellColumnDefaults,
  renderCellColumns,
  type CellColumnProps
} from '../geo-cell-layer/cell-columns';

const defaultProps: DefaultProps<A5LayerProps> = {
  ...cellColumnDefaults,
  getPentagon: {type: 'accessor', value: (d: any) => d.pentagon}
};

/** All properties supported by A5Layer. */
export type A5LayerProps<DataT = unknown> = _A5LayerProps<DataT> & GeoCellLayerProps<DataT>;

/** Properties added by A5Layer. */
type _A5LayerProps<DataT> = CellColumnProps & {
  /**
   * Called for each data object to retrieve the A5 pentagonal cell identifier.
   *
   * By default, it reads `pentagon` property of data object.
   */
  getPentagon?: AccessorFunction<DataT, string | bigint>;
};

/** Render filled and/or stroked polygons based on the [A5](https://a5geo.org) geospatial indexing system. */
export default class A5Layer<DataT = any, ExtraProps extends {} = {}> extends GeoCellLayer<
  DataT,
  Required<_A5LayerProps<DataT>> & ExtraProps
> {
  static layerName = 'A5Layer';
  static defaultProps = defaultProps;

  /** Routes cell columns through source-preserving geometry and style accessors. */
  renderLayers() {
    if (this.props.cells)
      return renderCellColumns(this, 'getPentagon', false, {
        row: this.getSubLayerRow.bind(this),
        accessor: this.getSubLayerAccessor.bind(this),
        props: this.getSubLayerProps.bind(this)
      });
    return super.renderLayers();
  }

  indexToBounds(): Partial<GeoCellLayer['props']> | null {
    const {data, getPentagon} = this.props;

    return {
      data,
      _normalize: false,
      _windingOrder: 'CCW',
      positionFormat: 'XY',
      getPolygon: (x: DataT, objectInfo) => {
        const pentagon = getPentagon(x, objectInfo);
        const boundary = cellToBoundary(
          typeof pentagon === 'string' ? hexToU64(pentagon) : pentagon,
          {closedRing: true, segments: 'auto'}
        );
        return flattenPolygon(boundary);
      }
    };
  }
}
