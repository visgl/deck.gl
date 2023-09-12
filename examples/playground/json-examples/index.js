import heatmap from './3d-heatmap.json';
import heatmapMinimap from './3d-heatmap-minimap.json';
import geojson from './geojson.json';
import line from './line.json';
import scatterplot from './scatterplot.json';
import screenGrid from './screen-grid.json';
import tagmap from './tagmap.json';
import tile3DRoyal from './3d-tiles-royal.json';
import tile3DStHelens from './3d-tiles-st-helens.json';
import tile3DCairo from './3d-tiles-cairo-vricon.json';
import tile3DNY from './3d-tiles-new-york.json';
import carto from './carto.json';
import usMap from './us-map.json';
import dotText from './dot-text.json';

export default {
  'website/Scatterplot (ScatterplotLayer)': scatterplot,
  // WEBSITE EXAMPLES AS JSON PAYLOADS
  'website/3D Heatmap (HexagonLayer)': heatmap,
  'website/3D Heatmap (wth Minimap)': heatmapMinimap,
  'website/GeoJSON (GeoJsonLayer)': geojson,
  'website/Line (LineLayer)': line,
  'website/Scatterplot (ScatterplotLayer)': scatterplot,
  'website/Screen Grid (ScreenGridLayer)': screenGrid,
  'website/TagMap (TextLayer)': tagmap,
  'website/3D Tiles (Tile3DLayer, Royal)': tile3DRoyal,
  'website/3D Tiles (Tile3DLayer, St Helens)': tile3DStHelens,
  'website/3D Tiles (Tile3DLayer, Cairo/vricon)': tile3DCairo,
  'website/3D Tiles (Tile3DLayer, New York)': tile3DNY,
  'website/CartoLayer': carto,
  // GET STARTED EXAMPLES AS JSON PAYLOADS
  'get-started/US map (GeoJsonLayer)': usMap,
  'get-started/Dot Text (Scatterplot/TextLayer)': dotText
};
