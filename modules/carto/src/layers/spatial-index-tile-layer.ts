import {registerLoaders} from '@loaders.gl/core';
import {DefaultProps, UpdateParameters} from '@deck.gl/core';
import CartoRasterTileLoader from './schema/carto-raster-tile-loader';
import CartoSpatialTileLoader from './schema/carto-spatial-tile-loader';
registerLoaders([CartoRasterTileLoader, CartoSpatialTileLoader]);

import {PickingInfo} from '@deck.gl/core';
import {TileLayer, _Tile2DHeader as Tile2DHeader} from '@deck.gl/geo-layers';

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
type _SpatialIndexTileLayerProps<DataT = any> = {
  aggregationResLevel?: number;
};

export default class SpatialIndexTileLayer<
  DataT = any,
  ExtraProps extends {} = {}
> extends TileLayer<DataT, ExtraProps & Required<_SpatialIndexTileLayerProps<DataT>>> {
  static layerName = 'SpatialIndexTileLayer';
  static defaultProps = defaultProps;

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
    if (
      !isFeatureIdPresent ||
      !Array.isArray(data) ||
      // Quick check for whether id is within tile. data.findIndex is expensive
      !this._featureInTile(tile, hoveredFeatureId)
    ) {
      return -1;
    }

    return data.findIndex(feature => feature.id === hoveredFeatureId);
  }

  _featureInTile(tile: Tile2DHeader, featureId: BigInt | number) {
    const {getTileZoom, getParentIndex} = this.state.tileset;
    const tileZoom = getTileZoom(tile.index);
    // @ts-ignore
    const KEY = tile.index.q ? 'q' : 'i';
    let featureIndex = {[KEY]: featureId};
    let featureZoom = getTileZoom(featureIndex);
    while (!(featureZoom <= tileZoom)) {
      featureIndex = getParentIndex(featureIndex);
      featureZoom = getTileZoom(featureIndex);
    }

    return featureIndex[KEY] === tile.index[KEY];
  }
}
