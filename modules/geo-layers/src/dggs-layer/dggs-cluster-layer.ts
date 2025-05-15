// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  type AccessorFunction,
  type UpdateParameters,
  type DefaultProps,
  createIterable,
  log
} from '@deck.gl/core';
import {type DGGSDecoder} from './dggs-decoder';
import GeoCellLayer, {type GeoCellLayerProps} from '../geo-cell-layer/GeoCellLayer';
import {normalizeLongitudes} from './h3-decoder';

/** All properties supported by DGGSClusterLayer. */
export type DGGSClusterLayerProps<DataT = unknown> = _DGGSClusterLayerProps<DataT> &
  GeoCellLayerProps<DataT>;

/** Properties added by DGGSClusterLayer. */
type _DGGSClusterLayerProps<DataT> = {
  /** Called for each data object to retrieve the hexagon identifiers. By default, it reads `cellIds` property of data object. */
  getCellIds?: AccessorFunction<DataT, (string | bigint)[]>;
  /** The DGGS decoder to use. */
  dggsDecoder: DGGSDecoder;
};

export class DGGSClusterLayer<DataT = any, ExtraProps extends {} = {}> extends GeoCellLayer<
  DataT,
  Required<_DGGSClusterLayerProps<DataT>> & ExtraProps
> {
  static layerName = 'DGGSClusterLayer';
  static defaultProps = {
    getCellIds: {type: 'accessor', value: (d: any) => d.cellIds},
    dggsDecoder: {type: 'object', compare: true, value: undefined!}
  } as const satisfies DefaultProps<DGGSClusterLayerProps>;

  state!: {
    polygons: {polygon: number[][][]}[];
  };

  initializeState(): void {
    this.props.dggsDecoder.initialize?.();
  }

  updateState({props, changeFlags}: UpdateParameters<this>): void {
    if (
      changeFlags.dataChanged ||
      (changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.getCellIds)
    ) {
      const {data, getCellIds, dggsDecoder} = props;
      const polygons: {polygon: number[][][]}[] = [];

      const {iterable, objectInfo} = createIterable(data);
      for (const object of iterable) {
        objectInfo.index++;
        const cellIds = getCellIds(object, objectInfo);
        const cellIndexes = cellIds.map(cellId =>
          typeof cellId === 'string' ? dggsDecoder.getCellIndexFromToken(cellId) : cellId
        );

        if (!dggsDecoder.getMultiCellBoundaryAsMultiPolygon) {
          log.warn('getMultiCellBoundaryAsMultiPolygon not supported by provided DGGSDecoder')();
          continue;
        }
        const multiPolygon = dggsDecoder.getMultiCellBoundaryAsMultiPolygon?.(cellIndexes);

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
