// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {CompositeLayer, CompositeLayerProps, Layer, LayersList, DefaultProps} from '@deck.gl/core';
import QuadbinLayer, {QuadbinLayerProps} from './quadbin-layer';
import QuadbinTileset2D from './quadbin-tileset-2d';
import SpatialIndexTileLayer, {SpatialIndexTileLayerProps} from './spatial-index-tile-layer';
import {hexToBigInt} from 'quadbin';
import type {TilejsonResult} from '@carto/api-client';
import {injectAccessToken, TilejsonPropType} from './utils';
import {DEFAULT_TILE_SIZE} from '../constants';

export const renderSubLayers = props => {
  const {data} = props;
  if (!data || !data.length) return null;
  const isBigInt = typeof data[0].id === 'bigint';
  return new QuadbinLayer(props, {
    getQuadbin: isBigInt ? d => d.id : d => hexToBigInt(d.id)
  });
};

const defaultProps: DefaultProps<QuadbinTileLayerProps> = {
  data: TilejsonPropType,
  tileSize: DEFAULT_TILE_SIZE
};

/** All properties supported by QuadbinTileLayer. */
export type QuadbinTileLayerProps<DataT = unknown> = _QuadbinTileLayerProps<DataT> &
  CompositeLayerProps;

/** Properties added by QuadbinTileLayer. */
type _QuadbinTileLayerProps<DataT> = Omit<QuadbinLayerProps<DataT>, 'data'> &
  Omit<SpatialIndexTileLayerProps<DataT>, 'data'> & {
    data: null | TilejsonResult | Promise<TilejsonResult>;
  };

export default class QuadbinTileLayer<
  DataT = any,
  ExtraProps extends {} = {}
> extends CompositeLayer<ExtraProps & Required<_QuadbinTileLayerProps<DataT>>> {
  static layerName = 'QuadbinTileLayer';
  static defaultProps = defaultProps;

  getLoadOptions(): any {
    const loadOptions = super.getLoadOptions() || {};
    const tileJSON = this.props.data as TilejsonResult;
    injectAccessToken(loadOptions, tileJSON.accessToken);
    loadOptions.cartoSpatialTile = {...loadOptions.cartoSpatialTile, scheme: 'quadbin'};
    return loadOptions;
  }

  renderLayers(): SpatialIndexTileLayer | null {
    const tileJSON = this.props.data as TilejsonResult;
    if (!tileJSON) return null;

    const {tiles: data, maxresolution: maxZoom} = tileJSON;
    const SubLayerClass = this.getSubLayerClass('spatial-index-tile', SpatialIndexTileLayer);
    return new SubLayerClass(this.props, {
      id: `quadbin-tile-layer-${this.props.id}`,
      data,
      // TODO: Tileset2D should be generic over TileIndex type
      TilesetClass: QuadbinTileset2D as any,
      renderSubLayers,
      maxZoom,
      loadOptions: this.getLoadOptions()
    });
  }
}
