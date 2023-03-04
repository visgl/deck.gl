/* eslint-disable no-template-curly-in-string */
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {
  ArcLayer,
  BitmapLayer,
  ColumnLayer,
  GeoJsonLayer,
  GridCellLayer,
  IconLayer,
  LineLayer,
  PathLayer,
  PointCloudLayer,
  PolygonLayer,
  ScatterplotLayer,
  TextLayer
} from '@deck.gl/layers';

import {makeLayerDemo} from './demo-base';
import {DATA_URI} from '../constants/defaults';

export const ArcLayerDemo = makeLayerDemo({
  Layer: ArcLayer,
  getTooltip: '({object}) => object && `${object.from.name} to ${object.to.name}`',
  props: `{
    data: '${DATA_URI}/bart-segments.json',
    pickable: true,
    getWidth: 12,
    getSourcePosition: d => d.from.coordinates,
    getTargetPosition: d => d.to.coordinates,
    getSourceColor: d => [Math.sqrt(d.inbound), 140, 0],
    getTargetColor: d => [Math.sqrt(d.outbound), 140, 0]
  }`
});

export const BitmapLayerDemo = makeLayerDemo({
  Layer: BitmapLayer,
  props: `{
    bounds: [-122.519, 37.7045, -122.355, 37.829],
    image: '${DATA_URI}/sf-districts.png'
  }`
});

export const ColumnLayerDemo = makeLayerDemo({
  Layer: ColumnLayer,
  getTooltip: '({object}) => object && `height: ${object.value * 5000}m`',
  props: `{
    data: '${DATA_URI}/hexagons.json',
    diskResolution: 12,
    radius: 250,
    extruded: true,
    pickable: true,
    elevationScale: 100,
    getPosition: d => d.centroid,
    getFillColor: d => [48, 128, d.value * 255, 255],
    getLineColor: [0, 0, 0],
    getLineWidth: 20,
    getElevation: d => d.value * 50
  }`
});

export const GeoJsonLayerDemo = makeLayerDemo({
  Layer: GeoJsonLayer,
  getTooltip: '({object}) => object && (object.properties.name || object.properties.station)',
  props: `{
    data: '${DATA_URI}/bart.geo.json',
    pickable: true,
    stroked: false,
    filled: true,
    extruded: true,
    lineWidthMinPixels: 2,
    pointType: 'circle+text',
    pointRadiusUnits: 'pixels',
    getText: f => f.properties.name,
    getTextSize: 12,
    getFillColor: [160, 160, 180, 200],
    getLineColor: f => {
      const hex = f.properties.color;
      // convert to RGB
      return hex ? hex.match(/[0-9a-f]{2}/g).map(x => parseInt(x, 16)) : [0, 0, 0];
    },
    getPointRadius: 4,
    getLineWidth: 20,
    getElevation: 30
  }`
});

export const GridCellLayerDemo = makeLayerDemo({
  Layer: GridCellLayer,
  getTooltip: '({object}) => object && `height: ${object.value * 5000}m`',
  props: `{
    data: '${DATA_URI}/hexagons.json',
    pickable: true,
    extruded: true,
    cellSize: 200,
    elevationScale: 5000,
    getPosition: d => d.centroid,
    getFillColor: d => [48, 128, d.value * 255, 255],
    getElevation: d => d.value
  }`
});

export const IconLayerDemo = makeLayerDemo({
  Layer: IconLayer,
  getTooltip: '({object}) => object && `${object.name}\n${object.address}`',
  props: `{
    data: '${DATA_URI}/bart-stations.json',
    pickable: true,
    iconAtlas: '${DATA_URI}/icon-atlas.png',
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
  }`
});

export const LineLayerDemo = makeLayerDemo({
  Layer: LineLayer,
  getTooltip: '({object}) => object && `${object.from.name} to ${object.to.name}`',
  props: `{
    data: '${DATA_URI}/bart-segments.json',
    pickable: true,
    getWidth: 12,
    getSourcePosition: d => d.from.coordinates,
    getTargetPosition: d => d.to.coordinates,
    getColor: d => [Math.sqrt(d.inbound + d.outbound), 140, 0]
  }`
});

export const PathLayerDemo = makeLayerDemo({
  Layer: PathLayer,
  getTooltip: '({object}) => object && object.name',
  props: `{
    data: '${DATA_URI}/bart-lines.json',
    parameters: {
      depthMask: false
    },
    pickable: true,
    widthScale: 20,
    widthMinPixels: 2,
    getPath: d => d.path,
    getColor: d => {
      const hex = d.color;
      // convert to RGB
      return hex.match(/[0-9a-f]{2}/g).map(x => parseInt(x, 16));
    },
    getWidth: d => 5
  }`
});

export const PointCloudLayerDemo = makeLayerDemo({
  Layer: PointCloudLayer,
  getTooltip: `({object}) => object && object.position.join(', ')`,
  imports: {COORDINATE_SYSTEM},
  props: `{
    data: '${DATA_URI}/pointcloud.json',
    pickable: false,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: [-122.4, 37.74],
    pointSize: 2,
    getPosition: d => d.position,
    getNormal: d => d.normal,
    getColor: d => d.color
  }`
});

export const PolygonLayerDemo = makeLayerDemo({
  Layer: PolygonLayer,
  getTooltip: '({object}) => object && `${object.zipcode}\nPopulation: ${object.population}`',
  props: `{
    data: '${DATA_URI}/sf-zipcodes.json',
    pickable: true,
    stroked: true,
    filled: true,
    extruded: true,
    wireframe: true,
    lineWidthMinPixels: 1,
    getPolygon: d => d.contour,
    getElevation: d => d.population / d.area / 10,
    getFillColor: d => [d.population / d.area / 60, 140, 0],
    getLineColor: [80, 80, 80],
    getLineWidth: d => 1
  }`
});

export const ScatterplotLayerDemo = makeLayerDemo({
  Layer: ScatterplotLayer,
  getTooltip: '({object}) => object && `${object.name}\n${object.address}`',
  props: `{
    data: '${DATA_URI}/bart-stations.json',
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
  }`
});

export const TextLayerDemo = makeLayerDemo({
  Layer: TextLayer,
  getTooltip: '({object}) => object && `${object.name}\n${object.address}`',
  props: `{
    data: '${DATA_URI}/bart-stations.json',
    pickable: true,
    sizeScale: 1,
    getPosition: d => d.coordinates,
    getText: d => d.name,
    getColor: [255, 128, 0],
    getSize: 16,
    getAngle: 0,
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'center'
  }`
});
