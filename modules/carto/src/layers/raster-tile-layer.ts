// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  CompositeLayer,
  CompositeLayerProps,
  DefaultProps,
  FilterContext,
  Layer,
  LayersList
} from '@deck.gl/core';
import RasterLayer, {RasterLayerProps} from './raster-layer';
import QuadbinTileset2D from './quadbin-tileset-2d';
import type {TilejsonResult} from '@carto/api-client';
import {injectAccessToken, TilejsonPropType} from './utils';
import {DEFAULT_TILE_SIZE} from '../constants';
import {TileLayer, TileLayerProps} from '@deck.gl/geo-layers';
import {copy, PostProcessModifier} from './post-process-utils';

export const renderSubLayers = props => {
  const tileIndex = props.tile?.index?.q;
  if (!tileIndex) return null;
  return new RasterLayer(props, {tileIndex});
};

const defaultProps: DefaultProps<RasterTileLayerProps> = {
  data: TilejsonPropType,
  refinementStrategy: 'no-overlap',
  tileSize: DEFAULT_TILE_SIZE
};

/** All properties supported by RasterTileLayer. */
export type RasterTileLayerProps<DataT = unknown> = _RasterTileLayerProps<DataT> &
  CompositeLayerProps;

/** Properties added by RasterTileLayer. */
type _RasterTileLayerProps<DataT> = Omit<RasterLayerProps<DataT>, 'data'> &
  Omit<TileLayerProps<DataT>, 'data'> & {
    data: null | TilejsonResult | Promise<TilejsonResult>;
  };

class PostProcessTileLayer extends PostProcessModifier(TileLayer, copy) {
  filterSubLayer(context: FilterContext) {
    // Handle DrawCallbackLayer
    const {tile} = (context.layer as Layer<{tile: any}>).props;
    if (!tile) return true;

    return super.filterSubLayer(context);
  }
}

export default class RasterTileLayer<
  DataT = any,
  ExtraProps extends {} = {}
> extends CompositeLayer<ExtraProps & Required<_RasterTileLayerProps<DataT>>> {
  static layerName = 'RasterTileLayer';
  static defaultProps = defaultProps;

  getLoadOptions(): any {
    const loadOptions = super.getLoadOptions() || {};
    const tileJSON = this.props.data as TilejsonResult;
    injectAccessToken(loadOptions, tileJSON.accessToken);
    return loadOptions;
  }

  renderLayers(): Layer | null | LayersList {
    const tileJSON = this.props.data as TilejsonResult;
    if (!tileJSON) return null;

    const {tiles: data, minzoom: minZoom, maxzoom: maxZoom, raster_metadata: metadata} = tileJSON;
    const SubLayerClass = this.getSubLayerClass('tile', PostProcessTileLayer);
    return new SubLayerClass(this.props, {
      id: `raster-tile-layer-${this.props.id}`,
      data,
      // TODO: Tileset2D should be generic over TileIndex type
      TilesetClass: QuadbinTileset2D as any,
      renderSubLayers,
      minZoom,
      maxZoom,
      loadOptions: {
        cartoRasterTile: {metadata},
        ...this.getLoadOptions()
      }
    });
  }
}
