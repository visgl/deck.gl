// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {cellsToMultiPolygon, H3IndexInput} from 'h3-js';

import {AccessorFunction, createIterable, UpdateParameters, DefaultProps} from '@deck.gl/core';
import {default as H3HexagonLayer} from './h3-hexagon-layer';
import GeoCellLayer, {GeoCellLayerProps} from '../geo-cell-layer/GeoCellLayer';
import {normalizeLongitudes} from './h3-utils';

const defaultProps: DefaultProps<H3ClusterLayerProps> = {
  getHexagons: {type: 'accessor', value: (d: any) => d.hexagons}
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
   */
  getHexagons?: AccessorFunction<DataT, H3IndexInput[]>;
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

  updateState({props, changeFlags}: UpdateParameters<this>): void {
    if (
      changeFlags.dataChanged ||
      (changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.getHexagons)
    ) {
      const {data, getHexagons} = props;
      const polygons: {polygon: number[][][]}[] = [];

      const {iterable, objectInfo} = createIterable(data);
      for (const object of iterable) {
        objectInfo.index++;
        const hexagons = getHexagons(object, objectInfo);
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

  indexToBounds(): Partial<GeoCellLayer['props']> {
    const {getElevation, getFillColor, getLineColor, getLineWidth} = this.props;

    return {
      data: this.state.polygons,
      getPolygon: d => d.polygon,

      getElevation: this.getSubLayerAccessor(getElevation),
      getFillColor: this.getSubLayerAccessor(getFillColor),
      getLineColor: this.getSubLayerAccessor(getLineColor),
      getLineWidth: this.getSubLayerAccessor(getLineWidth)
    };
  }
}
