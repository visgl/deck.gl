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
import {type GlobalGridDecoder} from './global-grid-decoders/global-grid-decoder';
import GeoCellLayer, {type GeoCellLayerProps} from '../geo-cell-layer/GeoCellLayer';
import {normalizeLongitudes} from './global-grid-utils/global-grid-utils';

/** All properties supported by GlobalGridClusterLayer. */
export type GlobalGridClusterLayerProps<DataT = unknown> = _GlobalGridClusterLayerProps<DataT> &
  GeoCellLayerProps<DataT>;

/** Properties added by GlobalGridClusterLayer. */
type _GlobalGridClusterLayerProps<DataT> = {
  /** Called for each data object to retrieve the hexagon identifiers. By default, it reads `cellIds` property of data object. */
  getCellIds?: AccessorFunction<DataT, (string | bigint)[]>;
  /** The DGGS decoder to use. */
  dggsDecoder: GlobalGridDecoder;
};

export class GlobalGridClusterLayer<DataT = any, ExtraProps extends {} = {}> extends GeoCellLayer<
  DataT,
  Required<_GlobalGridClusterLayerProps<DataT>> & ExtraProps
> {
  static layerName = 'GlobalGridClusterLayer';
  static defaultProps = {
    getCellIds: {type: 'accessor', value: (d: any) => d.cellIds},
    dggsDecoder: {type: 'object', compare: true, value: undefined!}
  } as const satisfies DefaultProps<GlobalGridClusterLayerProps>;

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
          typeof cellId === 'string' ? dggsDecoder.tokenToBigInt(cellId) : cellId
        );

        if (!dggsDecoder.cellsToBoundaryMultiPolygon) {
          log.warn(
            'getMultiCellBoundaryAsMultiPolygon not supported by provided GlobalGridDecoder'
          )();
          continue;
        }
        const multiPolygon = dggsDecoder.cellsToBoundaryMultiPolygon?.(cellIndexes);

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
