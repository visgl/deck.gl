// core layers
import coreLayersTests from './core-layers';
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
import s2LayerTests from './s2-layer';
import tripsLayerTests from './trips-layer';
import mvtLayerTests from './mvt-layer';
// mesh-layers
import simpleMeshLayerTests from './simple-mesh-layer';
// other
import viewsTests from './views';
import effectsTests from './effects';
import transitionTests from './transitions';

export default [].concat(
  coreLayersTests,
  columnLayerTests,
  geojsonLayerTests,
  pathLayerTests,
  pointCloudLayerTests,
  polygonLayerTests,
  iconLayerTests,
  textLayerTests,
  contourLayerTests,
  gridLayerTests,
  hexagonLayerTests,
  screenGridLayerTests,
  heatmapLayerTests,
  h3LayersTests,
  s2LayerTests,
  tripsLayerTests,
  mvtLayerTests,
  simpleMeshLayerTests,
  viewsTests,
  effectsTests,
  transitionTests
);
