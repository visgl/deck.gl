// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {CompositeLayer, CompositeLayerProps, Layer, LayersList, DefaultProps} from '@deck.gl/core';
import {H3HexagonLayer, H3HexagonLayerProps} from '@deck.gl/geo-layers';
import H3Tileset2D, {getHexagonResolution} from './h3-tileset-2d';
import SpatialIndexTileLayer, {SpatialIndexTileLayerProps} from './spatial-index-tile-layer';
import type {TilejsonResult} from '@carto/api-client';
import {injectAccessToken, TilejsonPropType} from './utils';
import {DEFAULT_TILE_SIZE} from '../constants';

export const renderSubLayers = props => {
  const {data} = props;
  const {index} = props.tile;
  if (!data || !data.length) return null;

  return new H3HexagonLayer(props, {
    getHexagon: d => d.id,
    centerHexagon: index,
    highPrecision: true
  });
};

const defaultProps: DefaultProps<H3TileLayerProps> = {
  data: TilejsonPropType,
  tileSize: DEFAULT_TILE_SIZE
};

/** All properties supported by H3TileLayer. */
export type H3TileLayerProps<DataT = unknown> = _H3TileLayerProps<DataT> & CompositeLayerProps;

/** Properties added by H3TileLayer. */
type _H3TileLayerProps<DataT> = Omit<H3HexagonLayerProps<DataT>, 'data'> &
  Omit<SpatialIndexTileLayerProps<DataT>, 'data'> & {
    data: null | TilejsonResult | Promise<TilejsonResult>;
  };

export default class H3TileLayer<DataT = any, ExtraPropsT extends {} = {}> extends CompositeLayer<
  ExtraPropsT & Required<_H3TileLayerProps<DataT>>
> {
  static layerName = 'H3TileLayer';
  static defaultProps = defaultProps;

  initializeState(): void {
    H3HexagonLayer._checkH3Lib();
  }

  getLoadOptions(): any {
    const loadOptions = super.getLoadOptions() || {};
    const tileJSON = this.props.data as TilejsonResult;
    injectAccessToken(loadOptions, tileJSON.accessToken);
    loadOptions.cartoSpatialTile = {...loadOptions.cartoSpatialTile, scheme: 'h3'};
    return loadOptions;
  }

  renderLayers(): SpatialIndexTileLayer | null {
    const tileJSON = this.props.data as TilejsonResult;
    if (!tileJSON) return null;

    const {tiles: data} = tileJSON;
    let {minresolution, maxresolution} = tileJSON;
    // Convert Mercator zooms provided in props into H3 res levels
    // and clip into valid range provided from the tilejson
    if (this.props.minZoom) {
      minresolution = Math.max(
        minresolution,
        getHexagonResolution({zoom: this.props.minZoom, latitude: 0}, this.props.tileSize)
      );
    }
    if (this.props.maxZoom) {
      maxresolution = Math.min(
        maxresolution,
        getHexagonResolution({zoom: this.props.maxZoom, latitude: 0}, this.props.tileSize)
      );
    }

    const SubLayerClass = this.getSubLayerClass('spatial-index-tile', SpatialIndexTileLayer);
    // The naming is unfortunate, but minZoom & maxZoom in the context
    // of a Tileset2D refer to the resolution levels, not the Mercator zooms
    return new SubLayerClass(this.props, {
      id: `h3-tile-layer-${this.props.id}`,
      data,
      // TODO: Tileset2D should be generic over TileIndex type
      TilesetClass: H3Tileset2D as any,
      renderSubLayers,
      // minZoom and maxZoom are H3 resolutions, however we must use this naming as that is what the Tileset2D class expects
      minZoom: minresolution,
      maxZoom: maxresolution,
      loadOptions: this.getLoadOptions()
    });
  }
}
