import {PickingInfo} from '@deck.gl/core';
import {TileLayer, _Tile2DHeader as Tile2DHeader} from '@deck.gl/geo-layers';

function isFeatureIdDefined(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}

export default class SpatialIndexTileLayer<ExtraProps = {}> extends TileLayer<any, ExtraProps> {
  static layerName = 'SpatialIndexTileLayer';

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
