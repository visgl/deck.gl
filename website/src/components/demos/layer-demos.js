/* global fetch */
import {VectorTile} from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import createLayerDemoClass from './layer-demo-base';
import {DATA_URI} from '../../constants/defaults';

import {
  COORDINATE_SYSTEM,
  ScatterplotLayer,
  LineLayer,
  ArcLayer,
  PathLayer,
  IconLayer,
  ScreenGridLayer,
  TextLayer,
  GridLayer,
  HexagonLayer,
  PolygonLayer,
  GeoJsonLayer,
  PointCloudLayer,
  TileLayer,
  ColumnLayer,
  GridCellLayer,
  S2Layer
} from 'deck.gl';
import ContourLayer from '@deck.gl/aggregation-layers/contour-layer/contour-layer';

import {colorToRGBArray} from '../../utils/format-utils';

export const ScatterplotLayerDemo = createLayerDemoClass({
  Layer: ScatterplotLayer,
  dataUrl: `${DATA_URI}/bart-stations.json`,
  formatTooltip: d => `${d.name}\n${d.address}`,
  props: {
    pickable: true,
    opacity: 0.8,
    stroked: true,
    radiusScale: 6,
    radiusMinPixels: 1,
    radiusMaxPixels: 100,
    lineWidthMinPixels: 1,
    getPosition: d => d.coordinates,
    getRadius: d => Math.sqrt(d.exits),
    getFillColor: [255, 140, 0],
    getLineColor: [0, 0, 0]
  }
});

export const ArcLayerDemo = createLayerDemoClass({
  Layer: ArcLayer,
  dataUrl: `${DATA_URI}/bart-segments.json`,
  formatTooltip: d => `${d.from.name} to ${d.to.name}`,
  props: {
    pickable: true,
    getStrokeWidth: 12,
    getSourcePosition: d => d.from.coordinates,
    getTargetPosition: d => d.to.coordinates,
    getSourceColor: d => [Math.sqrt(d.inbound), 140, 0],
    getTargetColor: d => [Math.sqrt(d.outbound), 140, 0]
  }
});

export const LineLayerDemo = createLayerDemoClass({
  Layer: LineLayer,
  dataUrl: `${DATA_URI}/bart-segments.json`,
  formatTooltip: d => `${d.from.name} to ${d.to.name}`,
  props: {
    pickable: true,
    getStrokeWidth: 12,
    getSourcePosition: d => d.from.coordinates,
    getTargetPosition: d => d.to.coordinates,
    getColor: d => [Math.sqrt(d.inbound + d.outbound), 140, 0]
  }
});

export const PathLayerDemo = createLayerDemoClass({
  Layer: PathLayer,
  dataUrl: `${DATA_URI}/bart-lines.json`,
  formatTooltip: d => d.name,
  props: {
    pickable: true,
    widthScale: 20,
    widthMinPixels: 2,
    getPath: d => d.path,
    getColor: d => colorToRGBArray(d.color),
    getWidth: d => 5
  }
});

export const IconLayerDemo = createLayerDemoClass({
  Layer: IconLayer,
  dataUrl: `${DATA_URI}/bart-stations.json`,
  formatTooltip: d => `${d.name}\n${d.address}`,
  props: {
    pickable: true,
    iconAtlas: 'images/icon-atlas.png',
    iconMapping: {
      marker: {
        x: 0,
        y: 0,
        width: 128,
        height: 128,
        anchorY: 128,
        mask: true
      }
    },
    sizeScale: 8,
    getPosition: d => d.coordinates,
    getIcon: d => 'marker',
    getSize: d => 5,
    getColor: d => [Math.sqrt(d.exits), 140, 0]
  }
});

export const ScreenGridLayerDemo = createLayerDemoClass({
  Layer: ScreenGridLayer,
  dataUrl: `${DATA_URI}/sf-bike-parking.json`,
  formatTooltip: d => 'aggregated cell',
  props: {
    pickable: false,
    opacity: 0.8,
    cellSizePixels: 50,
    minColor: [0, 0, 0, 0],
    maxColor: [0, 180, 0, 255],
    getPosition: d => d.COORDINATES,
    getWeight: d => d.SPACES
  }
});

export const GridLayerDemo = createLayerDemoClass({
  Layer: GridLayer,
  dataUrl: `${DATA_URI}/sf-bike-parking.json`,
  formatTooltip: d => `${d.position.join(', ')}\nCount: ${d.count}`,
  props: {
    pickable: true,
    extruded: true,
    cellSize: 200,
    elevationScale: 4,
    getPosition: d => d.COORDINATES
  }
});

export const HexagonLayerDemo = createLayerDemoClass({
  Layer: HexagonLayer,
  dataUrl: `${DATA_URI}/sf-bike-parking.json`,
  formatTooltip: d => `${d.position.join(', ')}\nCount: ${d.count}`,
  props: {
    extruded: true,
    radius: 200,
    elevationScale: 4,
    getPosition: d => d.COORDINATES
  }
});

export const PolygonLayerDemo = createLayerDemoClass({
  Layer: PolygonLayer,
  dataUrl: `${DATA_URI}/sf-zipcodes.json`,
  formatTooltip: d => `${d.zipcode}\nPopulation: ${d.population}`,
  props: {
    pickable: true,
    stroked: true,
    filled: true,
    wireframe: true,
    lineWidthMinPixels: 1,
    getPolygon: d => d.contour,
    getElevation: d => d.population / d.area / 10,
    getFillColor: d => [d.population / d.area / 60, 140, 0],
    getLineColor: [80, 80, 80],
    getLineWidth: d => 1
  }
});

export const GeoJsonLayerDemo = createLayerDemoClass({
  Layer: GeoJsonLayer,
  dataUrl: `${DATA_URI}/bart.geo.json`,
  formatTooltip: d => d.properties.name || d.properties.station,
  props: {
    pickable: true,
    stroked: false,
    filled: true,
    extruded: true,
    lineWidthScale: 20,
    lineWidthMinPixels: 2,
    getFillColor: [160, 160, 180, 200],
    getLineColor: d => colorToRGBArray(d.properties.color),
    getRadius: 100,
    getLineWidth: 1,
    getElevation: 30
  }
});

export const PointCloudLayerDemo = createLayerDemoClass({
  Layer: PointCloudLayer,
  dataUrl: `${DATA_URI}/pointcloud.json`,
  formatTooltip: d => d.position.join(', '),
  props: {
    pickable: false,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: [-122.4, 37.74],
    radiusPixels: 2,
    getPosition: d => d.position,
    getNormal: d => d.normal,
    getColor: d => d.color
  }
});

export const TextLayerDemo = createLayerDemoClass({
  Layer: TextLayer,
  dataUrl: `${DATA_URI}/bart-stations.json`,
  formatTooltip: d => `${d.name}\n${d.address}`,
  props: {
    pickable: true,
    sizeScale: 1,
    getPosition: d => d.coordinates,
    getText: d => d.name,
    getSize: 16,
    getAngle: 0,
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'center'
  }
});

export const TileLayerDemo = createLayerDemoClass({
  Layer: TileLayer,
  formatTooltip: f => JSON.stringify(f.properties),
  allowMissingData: true,
  props: {
    stroked: false,
    opacity: 1,

    getLineColor: [192, 192, 192],
    getFillColor: [140, 170, 180],

    getLineWidth: f => {
      if (f.properties.layer === 'transportation') {
        switch (f.properties.class) {
          case 'primary':
            return 12;
          case 'motorway':
            return 16;
          default:
            return 6;
        }
      }
      return 1;
    },
    lineWidthMinPixels: 1,

    getTileData: ({x, y, z}) => {
      const mapSource = `https://a.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/${z}/${x}/${y}.vector.pbf?access_token=${MapboxAccessToken}`;
      return fetch(mapSource)
        .then(response => response.arrayBuffer())
        .then(buffer => {
          const tile = new VectorTile(new Protobuf(buffer));
          const features = [];
          for (const layerName in tile.layers) {
            const vectorTileLayer = tile.layers[layerName];
            for (let i = 0; i < vectorTileLayer.length; i++) {
              const vectorTileFeature = vectorTileLayer.feature(i);
              const feature = vectorTileFeature.toGeoJSON(x, y, z);
              features.push(feature);
            }
          }
          return features;
        });
    }
  }
});

export const ContourLayerDemo = createLayerDemoClass({
  Layer: ContourLayer,
  dataUrl: `${DATA_URI}/sf-bike-parking.json`,
  formatTooltip: d => `threshold: ${d.threshold}`,
  props: {
    pickable: true,
    cellSize: 200,
    elevationScale: 4,
    getPosition: d => d.COORDINATES,
    contours: [
      {threshold: 1, color: [255, 0, 0], strokeWidth: 2, zIndex: 1},
      {threshold: [3, 10], color: [55, 0, 55], zIndex: 0},
      {threshold: 5, color: [0, 255, 0], strokeWidth: 6, zIndex: 2},
      {threshold: 15, color: [0, 0, 255], strokeWidth: 4, zIndex: 3}
    ]
  }
});

export const ColumnLayerDemo = createLayerDemoClass({
  Layer: ColumnLayer,
  dataUrl: `${DATA_URI}/hexagons.json`,
  props: {
    diskResolution: 12,
    radius: 250,
    extruded: true,
    pickable: true,
    elevationScale: 5000,
    getPosition: d => d.centroid,
    getColor: d => [48, 128, d.value * 255, 255],
    getElevation: d => d.value
  }
});

export const GridCellLayerDemo = createLayerDemoClass({
  Layer: GridCellLayer,
  dataUrl: `${DATA_URI}/hexagons.json`,
  props: {
    pickable: true,
    extruded: true,
    cellSize: 200,
    elevationScale: 5000,
    getPosition: d => d.centroid,
    getColor: d => [48, 128, d.value * 255, 255],
    getElevation: d => d.value
  }
});

export const S2LayerDemo = createLayerDemoClass({
  Layer: S2Layer,
  dataUrl: `${DATA_URI}/sf.s2cells.json`,
  props: {
    opacity: 0.6,
    pickable: true,
    stroked: true,
    filled: true,
    extruded: true,
    elevationScale: 1000,
    getS2Token: d => d.token,
    getFillColor: d => [d.value * 255, (1 - d.value) * 255, (1 - d.value) * 128, 128],
    getElevation: d => d.value
  }
});
