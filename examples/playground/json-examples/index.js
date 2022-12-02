import heatmap from './3d-heatmap.json';
import heatmapMinimap from './3d-heatmap-minimap.json';
import geojson from './geojson.json';
import line from './line.json';
import scatterplot from './scatterplot.json';
import screenGrid from './screen-grid.json';
import tagmap from './tagmap.json';
import tilesRoyal from './3d-tiles-royal.json';
import tilesStHelens from './3d-tiles-st-helens.json';
import tilesCairoVricon from './3d-tiles-cairo-vricon.json';
import tilesNewYork from './3d-tiles-new-york.json';
import carto from './carto.json';
// GET STARTED EXAMPLES AS JSON PAYLOADS
import usmap from './us-map.json';
import dotText from './dot-text.json';

export default {
  // WEBSITE EXAMPLES AS JSON PAYLOADS
  'website/3D Heatmap (HexagonLayer)': heatmap,
  'website/3D Heatmap (wth Minimap)': heatmapMinimap,
  'website/GeoJSON (GeoJsonLayer)': geojson,
  'website/Line (LineLayer)': line,
  'website/Scatterplot (ScatterplotLayer)': scatterplot,
  'website/Screen Grid (ScreenGridLayer)': screenGrid,
  'website/TagMap (TextLayer)': tagmap,
  'website/3D Tiles (Tile3DLayer, Royal)': tilesRoyal,
  'website/3D Tiles (Tile3DLayer, St Helens)': tilesStHelens,
  'website/3D Tiles (Tile3DLayer, Cairo/vricon)': tilesCairoVricon,
  'website/3D Tiles (Tile3DLayer, New York)': tilesNewYork,
  'website/CartoLayer': carto,
  // GET STARTED EXAMPLES AS JSON PAYLOADS
  'get-started/US map (GeoJsonLayer)': usmap,
  'get-started/Dot Text (Scatterplot/TextLayer)': dotText
};
