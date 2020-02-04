import {CompositeLayer, COORDINATE_SYSTEM, WebMercatorViewport} from '@deck.gl/core';
import Martini from '@mapbox/martini';
import {getImageData, getImageSize} from '@loaders.gl/images';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';

const MERCATOR_TILE_SIZE = 512; // web mercator projection constant

const defaultProps = {
  surfaceImage: {type: 'object', value: null, async: true},
  terrainImage: {type: 'object', value: null, async: true},

  meshMaxError: {type: 'number', value: 4.0},
  bbox: {type: 'object', value: {north: null, south: null, west: null, east: null}},
  getScale: {type: 'accessor', value: [1, 1, 1]}
};

export default class TerrainLayer extends CompositeLayer {
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

  // eslint-disable-next-line max-params
  _getMeshAttributes(vertices, terrain, tileSize, gridSize, bbox, zoom) {
    const numOfVerticies = vertices.length / 2;
    // vec3. x, y in pixels, z in meters
    const positions = new Float32Array(numOfVerticies * 3);
    // vec2. 1 to 1 relationship with position. represents the uv on the texture image. 0,0 to 1,1.
    const texCoords = new Float32Array(numOfVerticies * 2);

    const bboxVp = new WebMercatorViewport({
      longitude: bbox.west,
      latitude: bbox.north,
      zoom
    });

    const [x0, y0] = bboxVp.projectFlat([bbox.west, bbox.north]);

    const pixelScale = MERCATOR_TILE_SIZE / tileSize / bboxVp.scale;

    const zScale = bboxVp.distanceScales.unitsPerMeter.z;

    for (let i = 0; i < numOfVerticies; i++) {
      const x = vertices[i * 2];
      const y = vertices[i * 2 + 1];
      const pixelIdx = y * gridSize + x;

      positions[3 * i + 0] = x * pixelScale + x0;
      positions[3 * i + 1] = -y * pixelScale + y0;
      positions[3 * i + 2] = terrain[pixelIdx] * zScale;

      texCoords[2 * i + 0] = x / tileSize;
      texCoords[2 * i + 1] = y / tileSize;
    }

    return {
      positions: {value: positions, size: 3},
      texCoords: {value: texCoords, size: 2}
      // normals: [], - optional, but creates the high poly look with lighting
    };
  }

  _getMartiniTileMesh(terrainImage, meshMaxError, bbox, zoom) {
    if (terrainImage === null) {
      return null;
    }
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
      attributes: this._getMeshAttributes(vertices, terrain, tileSize, gridSize, bbox, zoom)
    };
  }

  _getTileScale(bbox, terrainImage) {
    /* Use southLat because it produces a better aligned tile.
      west, east: lng
      north, south: lat
    */
    if (terrainImage === null) {
      return [0,0,0]
    }

    // Use the same lng,lat as coordinate origin.
    const bboxVp = new WebMercatorViewport({
      longitude: bbox.west,
      latitude: bbox.north
    });

    const topLeft = bboxVp.projectFlat([bbox.west, bbox.north])
    const bottomRight = bboxVp.projectFlat([bbox.east, bbox.south])

    const tileWidth = bottomRight[0] - topLeft[0];
    const tileHeight = bottomRight[1] - topLeft[1];

    const tileWidthMeters = tileWidth * bboxVp.distanceScales.metersPerUnit.x;
    const tileHeightMeters = tileHeight * bboxVp.distanceScales.metersPerUnit.y;

    const size = getImageSize(terrainImage);

    const widthMetersPerPixel = tileWidthMeters / size.width;
    const heightMetersPerPixel = tileHeightMeters / size.height;

    console.log("1. world point", [bbox.west, bbox.north], [bbox.east, bbox.south])
    console.log("2. projected point", topLeft, bottomRight)
    console.log("3. common? size", tileWidth, tileHeight)
    console.log("4. meters size", tileWidthMeters, tileHeightMeters)
    console.log("5. pixel size", size.width, size.height);
    console.log("6. meters per pixel", widthMetersPerPixel, heightMetersPerPixel);

    return [widthMetersPerPixel, heightMetersPerPixel, 1];
  }

  _oldGetTileScale(westLng, northLat, z) {
    const bboxVp = new WebMercatorViewport({
      longitude: westLng,
      latitude: northLat,
      zoom: z
    });
    const metersPerPixel = bboxVp.metersPerPixel;

    console.log("meters per pixel", metersPerPixel, -metersPerPixel)

    return [metersPerPixel, -metersPerPixel, 1];
  }

  renderLayers() {
    const {
      id,
      bbox,
      z,
      meshMaxError,
      terrainImage,
      surfaceImage
    } = this.props;

    return new SimpleMeshLayer({
      id: `terrain-${id}`,
      data: [1],
      opacity: 0.1,
      wireframe: true,
      mesh: this._getMartiniTileMesh(terrainImage, meshMaxError, bbox, z),
      texture: surfaceImage,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      // coordinateOrigin: [bbox.west, bbox.north],
      // getScale: this._getTileScale(bbox, terrainImage),
      // getScale: this._oldGetTileScale(bbox.west, bbox.north, z),
      getPosition: d => [0, 0, 0],
      getColor: d => [255, 255, 255]
    });
  }
}

TerrainLayer.layerName = 'TerrainLayer';
TerrainLayer.defaultProps = defaultProps;


// _getTileScale(bbox, terrainImage) {
//   /* Use southLat because it produces a better aligned tile.
//     west, east: lng
//     north, south: lat
//   */
//   if (terrainImage === null) {
//     return [0,0,0]
//   }

//   // Use the same lng,lat as coordinadat origin.
//   const bboxVp = new WebMercatorViewport({
//     longitude: bbox.west,
//     latitude: bbox.north
//   });

//   console.log("1. world point", [bbox.west, bbox.north], [bbox.east, bbox.south])

//   const tileWidthDeg = bbox.east - bbox.west;
//   const tileHeightDeg = bbox.south - bbox.north;

//   const topLeft = bboxVp.projectFlat([bbox.west, bbox.north])
//   const bottomRight = bboxVp.projectFlat([bbox.east, bbox.south])

//   console.log("2. common? point", topLeft, bottomRight)

//   const tileWidthCommon = bottomRight[0] - topLeft[0];
//   const tileHeightCommon = bottomRight[1] - topLeft[1];

//   console.log("3. common? size", tileWidthCommon, tileHeightCommon)

//   const tileWidthMeters = tileWidthCommon * bboxVp.distanceScales.metersPerUnit.x;
//   const tileHeightMeters = tileHeightCommon * bboxVp.distanceScales.metersPerUnit.y;

//   console.log("4. meters size", tileWidthMeters, tileHeightMeters)

//   const size = getImageSize(terrainImage);

//   console.log("5. pixel size", size.width, size.height);

//   const widthMetersPerPixel = tileWidthMeters / size.width;
//   const heightMetersPerPixel = tileHeightMeters / size.height;

//   console.log("6. meters per pixel", widthMetersPerPixel, heightMetersPerPixel);


//   console.table({
//     world: {Left: bbox.west, Top: bbox.north, Right: bbox.east, Bottom: bbox.south},
//     common: {Left: topLeft[1], Top: topLeft[0], Right: bottomRight[1], Bottom: bottomRight[0]}
//   })

//   console.table({
//     metersPerUnit: {x: bboxVp.distanceScales.metersPerUnit.x, y: bboxVp.distanceScales.metersPerUnit.y},
//     metersPerPixel: {x: widthMetersPerPixel, y: heightMetersPerPixel}
//   })

//   console.table({
//     deg: {Width: tileWidthDeg, Height: tileHeightDeg},
//     common: {Width: tileWidthCommon, Height: tileHeightCommon},
//     meters: {Width: tileWidthMeters, Height: tileHeightMeters},
//     pixel: {Width: size.width, Height: size.height}
//   })

//   return [widthMetersPerPixel, heightMetersPerPixel, 1];
//   // return [metersPerPixel, -metersPerPixel, 1];
// }