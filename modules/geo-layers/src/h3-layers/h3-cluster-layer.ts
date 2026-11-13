// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {cellsToMultiPolygon, H3IndexInput} from 'h3-js';

import {ArrowAccessor, createIterable, UpdateParameters, DefaultProps} from '@deck.gl/core';
import {default as H3HexagonLayer} from './h3-hexagon-layer';
import GeoCellLayer, {GeoCellLayerProps} from '../geo-cell-layer/GeoCellLayer';
import {normalizeLongitudes} from './h3-utils';

import {hasCellColumns, getCellValue, renderCellColumns} from '../geo-cell-layer/cell-columns';

const defaultProps: DefaultProps<H3ClusterLayerProps> = {
  getHexagons: {type: 'accessor', arrow: true, value: (d: any) => d.hexagons}
};

/** All properties supported by H3ClusterLayer. */
export type H3ClusterLayerProps<DataT = unknown> = _H3ClusterLayerProps<DataT> &
  GeoCellLayerProps<DataT>;

/** Properties added by H3ClusterLayer. */
type _H3ClusterLayerProps<DataT> = {
  /**
   * Called for each data object to retrieve the hexagon identifiers.
   *
   * By default, it reads `hexagons` property of data object.
   * Also accepts an Arrow vector of identifiers or identifier lists in source-feature order.
   */
  getHexagons?: ArrowAccessor<DataT, H3IndexInput[]>;
};

export default class H3ClusterLayer<DataT = any, ExtraProps extends {} = {}> extends GeoCellLayer<
  DataT,
  Required<_H3ClusterLayerProps<DataT>> & ExtraProps
> {
  static layerName = 'H3ClusterLayer';
  static defaultProps = defaultProps;

  state!: {
    polygons: {polygon: number[][][]}[];
  };

  initializeState(): void {
    H3HexagonLayer._checkH3Lib();
  }

  updateState({props, oldProps, changeFlags}: UpdateParameters<this>): void {
    if (hasCellColumns(props, 'getHexagons')) return;
    if (
      hasCellColumns(oldProps, 'getHexagons') ||
      changeFlags.dataChanged ||
      (changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.getHexagons)
    ) {
      const {data, getHexagons} = props;
      const polygons: {polygon: number[][][]}[] = [];

      const {iterable, objectInfo} = createIterable(data);
      for (const object of iterable) {
        objectInfo.index++;
        const hexagons = getCellValue(getHexagons, object, objectInfo);
        const multiPolygon = cellsToMultiPolygon(hexagons, true);

        for (const polygon of multiPolygon) {
          // Normalize polygons to prevent wrapping over the anti-meridian
          for (const ring of polygon) {
            normalizeLongitudes(ring);
          }
          polygons.push(this.getSubLayerRow({polygon}, object, objectInfo.index));
        }
      }

      this.setState({polygons});
    }
  }

  /** Routes cell columns through source-preserving geometry and style accessors. */
  renderLayers() {
    if (hasCellColumns(this.props, 'getHexagons'))
      return renderCellColumns(this, 'getHexagons', true, {
        row: this.getSubLayerRow.bind(this),
        accessor: this.getSubLayerAccessor.bind(this),
        props: this.getSubLayerProps.bind(this)
      });
    return super.renderLayers();
  }

  indexToBounds(): Partial<GeoCellLayer['props']> {
    const {getElevation, getFillColor, getLineColor, getLineWidth} = this.props;

    return {
      data: this.state.polygons,
      getPolygon: d => d.polygon,

      getElevation: this.getSubLayerAccessor((row, info) => getCellValue(getElevation, row, info)),
      getFillColor: this.getSubLayerAccessor((row, info) => getCellValue(getFillColor, row, info)),
      getLineColor: this.getSubLayerAccessor((row, info) => getCellValue(getLineColor, row, info)),
      getLineWidth: this.getSubLayerAccessor((row, info) => getCellValue(getLineWidth, row, info))
    };
  }
}
