import {CompositeLayer} from '@deck.gl/core';
// import {getImageData, getImageSize} from '@loaders.gl/images';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';

const defaultProps = {
  // Image that encodes height data
  terrain: {type: 'object', value: null},
  // Image to use as texture
  surfaceImage: {type: 'object', value: null, async: true},
  // Martini error tolerance in meters, smaller number -> more detailed mesh
  meshMaxError: {type: 'number', value: 4.0},
  // Bounding box of the terrain image, [minX, minY, maxX, maxY] in world coordinates
  bounds: {type: 'object', value: [0, 0, 1, 1]},
  // Color to use if surfaceImage is unavailable
  color: {type: 'color', value: [255, 255, 255]},
  // Object to decode height data, from (r, g, b) to height in meters
  elevationDecoder: {
    type: 'object',
    value: {
      rScale: 1,
      gScale: 0,
      bScale: 0,
      offset: 0
    }
  },
  // Same as SimpleMeshLayer wireframe
  wireframe: false
};

export default class TerrainLayer extends CompositeLayer {
  renderLayers() {
    const {color, terrain, surfaceImage, wireframe} = this.props;

    return new SimpleMeshLayer(
      this.getSubLayerProps({
        id: 'terrain'
      }),
      {
        data: [1],
        mesh: terrain,
        texture: surfaceImage,
        getPosition: d => [0, 0, 0],
        getColor: d => color,
        wireframe
      }
    );
  }
}

TerrainLayer.layerName = 'TerrainLayer';
TerrainLayer.defaultProps = defaultProps;
