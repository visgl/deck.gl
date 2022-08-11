import {registerLoaders} from '@loaders.gl/core';
import CartoSpatialTileLoader from './schema/carto-spatial-tile-loader';
registerLoaders([CartoSpatialTileLoader]);

import {PickingInfo} from '@deck.gl/core';
import {
  TileLayer,
  _getURLFromTemplate,
  _Tile2DHeader as Tile2DHeader,
  _TileLoadProps as TileLoadProps
} from '@deck.gl/geo-layers';
import {TILE_FORMATS} from '../api/maps-api-common';

function isFeatureIdDefined(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}

export default class SpatialIndexTileLayer<ExtraProps = {}> extends TileLayer<any, ExtraProps> {
  static layerName = 'SpatialIndexTileLayer';

  getTileData(tile: TileLoadProps) {
    const {data, getTileData, fetch} = this.props;
    const {signal} = tile;

    tile.url =
      typeof data === 'string' || Array.isArray(data) ? _getURLFromTemplate(data, tile) : null;
    if (!tile.url) {
      return Promise.reject('Invalid URL');
    }

    if (getTileData) {
      return getTileData(tile);
    }

    let loadOptions = this.getLoadOptions();
    // @ts-ignore
    const {formatTiles} = this.props;

    // The backend doesn't yet support our custom mime-type, so force it here
    // TODO remove entire `getTileData` method once backend sends the correct mime-type
    if (formatTiles === TILE_FORMATS.BINARY) {
      loadOptions = {
        ...loadOptions,
        mimeType: 'application/vnd.carto-spatial-tile'
      };
    }

    return fetch(tile.url, {propName: 'data', layer: this, loadOptions, signal});
  }

  protected _updateAutoHighlight(info: PickingInfo): void {
    const {hoveredFeatureId} = this.state;
    const hoveredFeature = info.object;
    let newHoveredFeatureId;

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

  getSubLayerPropsByTile(tile: Tile2DHeader) {
    return {
      highlightedObjectIndex: this.getHighlightedObjectIndex(tile),
      highlightColor: this.state.highlightColor
    };
  }

  getHighlightedObjectIndex(tile: Tile2DHeader) {
    const {hoveredFeatureId} = this.state;
    const data = tile.content;

    const isFeatureIdPresent = isFeatureIdDefined(hoveredFeatureId);
    if (!isFeatureIdPresent || !Array.isArray(data)) {
      return -1;
    }

    return data.findIndex(feature => feature.id === hoveredFeatureId);
  }
}
