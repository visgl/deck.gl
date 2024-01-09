// core layers
import coreLayersTests from './core-layers';
import arcLayersTests from './arc-layer';
import columnLayerTests from './column-layer';
import geojsonLayerTests from './geojson-layer';
import pathLayerTests from './path-layer';
import pointCloudLayerTests from './point-cloud-layer';
import polygonLayerTests from './polygon-layer';
import iconLayerTests from './icon-layer';
import textLayerTests from './text-layer';
// aggregation-layers
import contourLayerTests from './contour-layer';
import gridLayerTests from './grid-layer';
import screenGridLayerTests from './screen-grid-layer';
import heatmapLayerTests from './heatmap-layer';
import hexagonLayerTests from './hexagon-layer';
// geo-layers
import h3LayersTests from './h3-layers';
import quadkeyLayerTests from './quadkey-layer';
import s2LayerTests from './s2-layer';
import tripsLayerTests from './trips-layer';
import mvtLayerTests from './mvt-layer';
import geohashLayerTests from './geohash-layer';
import terrainLayerTests from './terrain-layer';
// mesh-layers
import simpleMeshLayerTests from './simple-mesh-layer';
// import scenegraphLayerTests from './scenegraph-layer';
// other
import viewsTests from './views';
import effectsTests from './effects';
import collisionFilterExtensionTests from './collision-filter-extension';
import transitionTests from './transitions';

export default [].concat(
  // coreLayersTests, // TODO(v9): Re-check after PR#8334
  arcLayersTests,
  // columnLayerTests, // TODO(v9): Re-check after PR#8334
  geojsonLayerTests,
  // pathLayerTests, // TODO(v9): Re-check after PR#8334
  pointCloudLayerTests,
  // polygonLayerTests,
  iconLayerTests,
  textLayerTests,
  // contourLayerTests,
  // gridLayerTests,
  hexagonLayerTests,
  // screenGridLayerTests,
  // heatmapLayerTests,
  // h3LayersTests, // TODO(v9): Re-check after PR#8334
  quadkeyLayerTests,
  s2LayerTests,
  tripsLayerTests,
  mvtLayerTests,
  geohashLayerTests,
  simpleMeshLayerTests,
  // scenegraphLayerTests,
  viewsTests,
  // effectsTests,
  // TODO - Broken in headless mode with Chrome 113
  // transitionTests,
  terrainLayerTests
  // collisionFilterExtensionTests
);
