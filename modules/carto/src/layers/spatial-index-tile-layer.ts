import {registerLoaders} from '@loaders.gl/core';
import {DefaultProps, UpdateParameters} from '@deck.gl/core';
import CartoSpatialTileLoader from './schema/carto-spatial-tile-loader';
registerLoaders([CartoSpatialTileLoader]);

import {PickingInfo} from '@deck.gl/core';
import {
  TileLayer,
  TileLayerProps,
  _getURLFromTemplate,
  _Tile2DHeader as Tile2DHeader,
  _TileLoadProps as TileLoadProps
} from '@deck.gl/geo-layers';
import {TILE_FORMATS} from '../api/maps-api-common';

function isFeatureIdDefined(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}

const defaultProps: DefaultProps<SpatialIndexTileLayerProps> = {
  aggregationResLevel: 4
};

/** All properties supported by SpatialIndexTileLayer. */
export type SpatialIndexTileLayerProps<DataT = any> = _SpatialIndexTileLayerProps<DataT> &
  TileLayer<DataT>;

/** Properties added by SpatialIndexTileLayer. */
type _SpatialIndexTileLayerProps<DataT> = {
  aggregationResLevel?: number;
};

export default class SpatialIndexTileLayer<DataT = any, ExtraProps = {}> extends TileLayer<
  DataT,
  ExtraProps & Required<_SpatialIndexTileLayerProps<DataT>>
> {
  static layerName = 'SpatialIndexTileLayer';
  static defaultProps = defaultProps;

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

  updateState(params: UpdateParameters<this>) {
    const {props, oldProps} = params;
    if (props.aggregationResLevel !== oldProps.aggregationResLevel) {
      // Tileset cache is invalid when resLevel changes
      this.setState({tileset: null});
    }
    super.updateState(params);
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
