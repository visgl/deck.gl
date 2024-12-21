// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {registerLoaders} from '@loaders.gl/core';
import {DefaultProps, LayerProps} from '@deck.gl/core';
import CartoRasterTileLoader from './schema/carto-raster-tile-loader';
import CartoSpatialTileLoader from './schema/carto-spatial-tile-loader';
registerLoaders([CartoRasterTileLoader, CartoSpatialTileLoader]);

import {PickingInfo} from '@deck.gl/core';
import {TileLayer, _Tile2DHeader as Tile2DHeader, TileLayerProps} from '@deck.gl/geo-layers';
import {DEFAULT_TILE_SIZE} from '../constants';

function isFeatureIdDefined(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}

const defaultProps: DefaultProps<SpatialIndexTileLayerProps> = {
  tileSize: DEFAULT_TILE_SIZE
};

/** All properties supported by SpatialIndexTileLayer. */
export type SpatialIndexTileLayerProps<DataT = unknown> = _SpatialIndexTileLayerProps &
  TileLayerProps<DataT>;

/** Properties added by SpatialIndexTileLayer. */
type _SpatialIndexTileLayerProps = {};

export default class SpatialIndexTileLayer<
  DataT = any,
  ExtraProps extends {} = {}
> extends TileLayer<DataT, ExtraProps & Required<_SpatialIndexTileLayerProps>> {
  static layerName = 'SpatialIndexTileLayer';
  static defaultProps = defaultProps;

  state!: TileLayer<DataT>['state'] & {
    hoveredFeatureId: BigInt | number | null;
    highlightColor: number[];
  };

  protected _updateAutoHighlight(info: PickingInfo): void {
    const {hoveredFeatureId} = this.state;
    const hoveredFeature = info.object;
    let newHoveredFeatureId: BigInt | number | null = null;

    if (hoveredFeature) {
      newHoveredFeatureId = hoveredFeature.id;
    }

    if (hoveredFeatureId !== newHoveredFeatureId) {
      let {highlightColor} = this.props;
      if (typeof highlightColor === 'function') {
        highlightColor = highlightColor(info);
      }

      this.setState({
        highlightColor,
        hoveredFeatureId: newHoveredFeatureId
      });
    }
  }

  getSubLayerPropsByTile(tile: Tile2DHeader): Partial<LayerProps> | null {
    return {
      highlightedObjectIndex: this.getHighlightedObjectIndex(tile),
      highlightColor: this.state.highlightColor
    };
  }

  getHighlightedObjectIndex(tile: Tile2DHeader) {
    const {hoveredFeatureId} = this.state;
    const data = tile.content;

    const isFeatureIdPresent = isFeatureIdDefined(hoveredFeatureId);
    if (
      !isFeatureIdPresent ||
      !Array.isArray(data) ||
      // Quick check for whether id is within tile. data.findIndex is expensive
      !this._featureInTile(tile, hoveredFeatureId!)
    ) {
      return -1;
    }

    return data.findIndex(feature => feature.id === hoveredFeatureId);
  }

  _featureInTile(tile: Tile2DHeader, featureId: BigInt | number) {
    // TODO: Tile2DHeader index should be generic for H3TileIndex or QuadbinTileIndex
    const tileset = this.state.tileset!;
    const tileZoom = tileset.getTileZoom(tile.index);
    // @ts-ignore
    const KEY = tile.index.q ? 'q' : 'i';
    // TODO - Tileset2D methods expect tile index in the shape of {x, y, z}
    let featureIndex: any = {[KEY]: featureId};
    let featureZoom = tileset.getTileZoom(featureIndex);
    while (!(featureZoom <= tileZoom)) {
      featureIndex = tileset.getParentIndex(featureIndex);
      featureZoom = tileset.getTileZoom(featureIndex);
    }

    return featureIndex[KEY] === tile.index[KEY];
  }
}
