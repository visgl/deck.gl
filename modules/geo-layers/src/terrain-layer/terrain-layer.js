import {CompositeLayer, COORDINATE_SYSTEM} from '@deck.gl/core';
import Martini from '@mapbox/martini';
import {getImageData, getImageSize} from '@loaders.gl/images';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';

const MERCATOR_TILE_SIZE = 512; // web mercator projection constant

const defaultProps = {
  surfaceImage: {type: 'object', value: null},
  terrainImage: {type: 'object', value: null},
  meshMaxError: {type: 'number', value: 4.0}
};

export default class TerrainLayer extends CompositeLayer {

  // initializeState() {

  //   this.setState({
  //     terrainImage: null,
  //     surfaceImage: null
  //   });

  // }

  _getTerrain(data, tileSize, gridSize) {
    // From Martini demo
    // https://observablehq.com/@mourner/martin-real-time-rtin-terrain-mesh
    const terrain = new Float32Array(gridSize * gridSize);
    // decode terrain values
    for (let y = 0; y < tileSize; y++) {
      for (let x = 0; x < tileSize; x++) {
        const k = (y * tileSize + x) * 4;
        const r = data[k + 0];
        const g = data[k + 1];
        const b = data[k + 2];
        terrain[y * gridSize + x] = (r * 256 * 256 + g * 256.0 + b) / 10.0 - 10000.0;
      }
    }
    // backfill right and bottom borders
    for (let x = 0; x < gridSize - 1; x++) {
      terrain[gridSize * (gridSize - 1) + x] = terrain[gridSize * (gridSize - 2) + x];
    }
    for (let y = 0; y < gridSize; y++) {
      terrain[gridSize * y + gridSize - 1] = terrain[gridSize * y + gridSize - 2];
    }
    return terrain;
  }

  _getMeshAttributes(vertices, terrain, tileSize, gridSize) {
    const pixelScale = MERCATOR_TILE_SIZE / tileSize;
    const numOfVerticies = vertices.length / 2;
    // vec3. x, y in pixels, z in meters
    const positions = new Float32Array(numOfVerticies * 3);
    // vec2. 1 to 1 relationship with position. represents the uv on the texture image. 0,0 to 1,1.
    const texCoords = new Float32Array(numOfVerticies * 2);

    for (let i = 0; i < numOfVerticies; i++) {
      const x = vertices[i * 2];
      const y = vertices[i * 2 + 1];
      const pixelIdx = y * gridSize + x;

      positions[3 * i + 0] = x * pixelScale;
      positions[3 * i + 1] = y * pixelScale;
      positions[3 * i + 2] = terrain[pixelIdx];

      texCoords[2 * i + 0] = x / tileSize;
      texCoords[2 * i + 1] = y / tileSize;
    }

    return {
      positions: {value: positions, size: 3},
      texCoords: {value: texCoords, size: 2}
      // normals: [], - optional, but creates the high poly look with lighting
    }
  }

  _getMartiniTileMesh(terrainImage, meshMaxError) {
    const data = getImageData(terrainImage);
    const size = getImageSize(terrainImage);

    const tileSize = size.width;
    const gridSize = tileSize + 1;

    const terrain = this._getTerrain(data, tileSize, gridSize);

    const martini = new Martini(gridSize);
    const tile = martini.createTile(terrain);
    const {vertices, triangles} = tile.getMesh(meshMaxError);

    return {
      indices: triangles,
      attributes: this._getMeshAttributes(vertices, terrain, tileSize, gridSize)
    };
  }

  // updateState({props, oldProps, changeFlags}) {
  //   // if(this.state.isAsyncPropLoading('images'))

  // }

  renderLayers() {
    const {
      id,
      coordinateOrigin,
      getScale,
      meshMaxError,
      // images,
      terrainImage,
      surfaceImage
    } = this.props;

    // console.log(images)

    // const terrainImage = images && images.terrain;
    // const surfaceImage = images && images.surface;

    return new SimpleMeshLayer({
      id: `terrain-${id}`,
      data: [1],
      mesh: this._getMartiniTileMesh(terrainImage, meshMaxError),
      texture: surfaceImage,
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin,
      getScale,
      getPosition: d => [0, 0, 0],
      getColor: d => [255, 255, 255]
    })
  }
}

TerrainLayer.layerName = 'TerrainLayer';
TerrainLayer.defaultProps = defaultProps;