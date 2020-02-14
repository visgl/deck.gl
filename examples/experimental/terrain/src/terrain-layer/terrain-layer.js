import {CompositeLayer} from '@deck.gl/core';
import Martini from '@mapbox/martini';
import {getImageData, getImageSize} from '@loaders.gl/images';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';

const defaultProps = {
  // Image that encodes height data
  terrainImage: {type: 'object', value: null, async: true},
  // Image to use as texture
  surfaceImage: {type: 'object', value: null, async: true},
  // Martini error tolerance in meters, smaller number -> more detailed mesh
  meshMaxError: {type: 'number', value: 4.0},
  // Bounding box of the terrain image, [minX, minY, maxX, maxY] in world coordinates
  bounds: {type: 'object', value: [0, 0, 1, 1]},
  // Color to use if surfaceImage is unavailable
  color: {type: 'color', value: [255, 255, 255]},
  // Function to decode height data, from (r, g, b) to height in meters
  getElevation: {type: 'accessor', value: (r, g, b) => r},
  // Same as SimpleMeshLayer wireframe
  wireframe: false
};

function getTerrain(imageData, tileSize, getElevation) {
  const gridSize = tileSize + 1;
  // From Martini demo
  // https://observablehq.com/@mourner/martin-real-time-rtin-terrain-mesh
  const terrain = new Float32Array(gridSize * gridSize);
  // decode terrain values
  for (let i = 0, y = 0; y < tileSize; y++) {
    for (let x = 0; x < tileSize; x++, i++) {
      const k = i * 4;
      const r = imageData[k + 0];
      const g = imageData[k + 1];
      const b = imageData[k + 2];
      terrain[i + y] = getElevation(r, g, b);
    }
  }
  // backfill bottom border
  for (let i = gridSize * (gridSize - 1), x = 0; x < gridSize - 1; x++, i++) {
    terrain[i] = terrain[i - gridSize];
  }
  // backfill right border
  for (let i = gridSize - 1, y = 0; y < gridSize; y++, i += gridSize) {
    terrain[i] = terrain[i - 1];
  }
  return terrain;
}

function getMeshAttributes(vertices, terrain, tileSize, bounds) {
  const gridSize = tileSize + 1;
  const numOfVerticies = vertices.length / 2;
  // vec3. x, y in pixels, z in meters
  const positions = new Float32Array(numOfVerticies * 3);
  // vec2. 1 to 1 relationship with position. represents the uv on the texture image. 0,0 to 1,1.
  const texCoords = new Float32Array(numOfVerticies * 2);

  const [minX, minY, maxX, maxY] = bounds;
  const xScale = (maxX - minX) / tileSize;
  const yScale = (maxY - minY) / tileSize;

  for (let i = 0; i < numOfVerticies; i++) {
    const x = vertices[i * 2];
    const y = vertices[i * 2 + 1];
    const pixelIdx = y * gridSize + x;

    positions[3 * i + 0] = x * xScale + minX;
    positions[3 * i + 1] = -y * yScale + maxY;
    positions[3 * i + 2] = terrain[pixelIdx];

    texCoords[2 * i + 0] = x / tileSize;
    texCoords[2 * i + 1] = y / tileSize;
  }

  return {
    positions: {value: positions, size: 3},
    texCoords: {value: texCoords, size: 2}
    // normals: [], - optional, but creates the high poly look with lighting
  };
}

function getMartiniTileMesh(terrainImage, getElevation, meshMaxError, bounds) {
  if (terrainImage === null) {
    return null;
  }
  const data = getImageData(terrainImage);
  const size = getImageSize(terrainImage);

  const tileSize = size.width;
  const gridSize = tileSize + 1;

  const terrain = getTerrain(data, tileSize, getElevation);

  const martini = new Martini(gridSize);
  const tile = martini.createTile(terrain);
  const {vertices, triangles} = tile.getMesh(meshMaxError);

  return {
    indices: triangles,
    attributes: getMeshAttributes(vertices, terrain, tileSize, bounds)
  };
}

export default class TerrainLayer extends CompositeLayer {
  renderLayers() {
    const {
      bounds,
      color,
      getElevation,
      meshMaxError,
      terrainImage,
      surfaceImage,
      wireframe
    } = this.props;

    return new SimpleMeshLayer(
      this.getSubLayerProps({
        id: 'terrain'
      }),
      {
        data: [1],
        mesh: getMartiniTileMesh(terrainImage, getElevation, meshMaxError, bounds),
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
