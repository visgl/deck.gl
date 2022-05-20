import {TileLayer} from '@deck.gl/geo-layers';

function isFeatureIdDefined(value) {
  return value !== undefined && value !== null && value !== '';
}

export default class SpatialIndexTileLayer extends TileLayer {
  _updateAutoHighlight(info) {
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

  getSubLayerPropsByTile(tile) {
    return {
      highlightedObjectIndex: this.getHighlightedObjectIndex(tile),
      highlightColor: this.state.highlightColor
    };
  }

  getHighlightedObjectIndex(tile) {
    const {hoveredFeatureId} = this.state;
    const data = tile.content;

    const isFeatureIdPresent = isFeatureIdDefined(hoveredFeatureId);
    if (!isFeatureIdPresent || !Array.isArray(data)) {
      return -1;
    }

    return data.findIndex(feature => feature.id === hoveredFeatureId);
  }
}
