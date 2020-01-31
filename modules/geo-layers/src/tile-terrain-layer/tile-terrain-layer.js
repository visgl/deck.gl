import {CompositeLayer, WebMercatorViewport} from '@deck.gl/core';
import {tile2lngLat} from '../tile-layer/utils/tile-util';
import TerrainLayer from '../terrain-layer/terrain-layer';

const defaultProps = {
  tile: {type: 'object', value: null}, // {x,y,z}
  images: {type: 'object', value: null, async: true},
  meshMaxError: {type: 'number', value: 4.0}
};

export default class TileTerrainLayer extends CompositeLayer {

  _getTileScale(x, y, z) {
    const [lng, lat] = tile2lngLat(x, y, z);
    const bboxVp = new WebMercatorViewport({
      longitude: lng,
      latitude: lat,
      zoom: z
    });
    const metersPerPixel = bboxVp.metersPerPixel;

    return [metersPerPixel, -metersPerPixel, 1];
  }

  renderLayers() {
    const {
      id,
      tile: {x,y,z},
      images,
      meshMaxError
    } = this.props;

    const isLoading = this.internalState.isAsyncPropLoading('images')
    const terrainImage = isLoading ? null : images.terrain;
    const surfaceImage = isLoading ? null : images.surface;

    return new TerrainLayer({
      id: `tile-terrain-${id}`,
      coordinateOrigin: tile2lngLat(x, y, z), // lng, lat, alt of top left
      getScale: this._getTileScale(x, y, z), // some magic constant. dependent on lat of origin
      meshMaxError,
      terrainImage,
      surfaceImage
    })
  }
}

TileTerrainLayer.layerName = 'TileTerrainLayer';
TileTerrainLayer.defaultProps = defaultProps;