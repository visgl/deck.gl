import {Matrix4} from 'math.gl';
import {MVTLoader} from '@loaders.gl/mvt';
import {load} from '@loaders.gl/core';
import {COORDINATE_SYSTEM} from '@deck.gl/core';

import TileLayer from '../tile-layer/tile-layer';
import {getURLFromTemplate} from '../tile-layer/utils';
import ClipExtension from './clip-extension';

const WORLD_SIZE = 512;

const defaultProps = {
  uniquePropertyId: {type: 'string', value: '', compare: false}
};

export default class MVTLayer extends TileLayer {
  getTileData(tile) {
    const url = getURLFromTemplate(this.props.data, tile);
    if (!url) {
      return Promise.reject('Invalid URL');
    }
    return load(url, MVTLoader, this.getLoadOptions());
  }

  renderSubLayers(props) {
    const {tile} = props;
    const worldScale = Math.pow(2, tile.z);

    const xScale = WORLD_SIZE / worldScale;
    const yScale = -xScale;

    const xOffset = (WORLD_SIZE * tile.x) / worldScale;
    const yOffset = WORLD_SIZE * (1 - tile.y / worldScale);

    const modelMatrix = new Matrix4().translate([xOffset, yOffset, 0]).scale([xScale, yScale, 1]);

    props.autoHighlight = false;
    props.modelMatrix = modelMatrix;
    props.coordinateSystem = COORDINATE_SYSTEM.CARTESIAN;
    props.extensions = [...(props.extensions || []), new ClipExtension()];

    return super.renderSubLayers(props);
  }

  onHover(info, pickingEvent) {
    const {uniquePropertyId, autoHighlight} = this.props;

    if (autoHighlight) {
      const {highlightedFeatureId} = this.state;
      const hoveredFeature = info.object;
      let hoveredFeatureId;

      if (hoveredFeature) {
        hoveredFeatureId = getFeatureUniqueId(hoveredFeature, uniquePropertyId);
      }

      if (hoveredFeatureId !== highlightedFeatureId) {
        this.setState({highlightedFeatureId: hoveredFeatureId});
      }
    }

    return super.onHover(info, pickingEvent);
  }

  getHighlightedObjectIndex(tile) {
    const {highlightedFeatureId} = this.state;
    const {uniquePropertyId, highlightedObjectIndex: highlightedFeatureProp} = this.props;
    const {data} = tile;

    if ((!highlightedFeatureId && !highlightedFeatureProp) || !Array.isArray(data)) {
      return -1;
    }

    const featureIdToHighlight = highlightedFeatureProp || highlightedFeatureId;

    return data.findIndex(
      feature =>
        feature.id
          ? feature.id === featureIdToHighlight
          : feature.properties[uniquePropertyId] === featureIdToHighlight
    );
  }
}

function getFeatureUniqueId(feature, uniquePropertyId) {
  const hasFeatureId = Boolean(feature.id);
  const hasUniquePropertyId = Boolean(uniquePropertyId);

  if (hasFeatureId) {
    return feature.id;
  }

  if (hasUniquePropertyId) {
    return feature.properties[uniquePropertyId];
  }

  return -1;
}

MVTLayer.layerName = 'MVTLayer';
MVTLayer.defaultProps = defaultProps;
