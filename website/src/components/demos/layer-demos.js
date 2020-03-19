import createLayerDemoClass from './layer-demo-base';
import {DATA_URI} from '../../constants/defaults';

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

import {colorToRGBArray} from '../../utils/format-utils';

export const ArcLayerDemo = createLayerDemoClass({
  Layer: ArcLayer,
  dataUrl: `${DATA_URI}/bart-segments.json`,
  formatTooltip: d => `${d.from.name} to ${d.to.name}`,
  props: {
    pickable: true,
    getWidth: 12,
    getSourcePosition: d => d.from.coordinates,
    getTargetPosition: d => d.to.coordinates,
    getSourceColor: d => [Math.sqrt(d.inbound), 140, 0],
    getTargetColor: d => [Math.sqrt(d.outbound), 140, 0]
  }
});

export const ColumnLayerDemo = createLayerDemoClass({
  Layer: ColumnLayer,
  dataUrl: `${DATA_URI}/hexagons.json`,
  formatTooltip: d => `height: ${d.value * 5000}m`,
  props: {
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

export const GridCellLayerDemo = createLayerDemoClass({
  Layer: GridCellLayer,
  dataUrl: `${DATA_URI}/hexagons.json`,
  formatTooltip: d => `height: ${d.value * 5000}m`,
  props: {
    pickable: true,
    extruded: true,
    cellSize: 200,
    elevationScale: 5000,
    getPosition: d => d.centroid,
    getFillColor: d => [48, 128, d.value * 255, 255],
    getElevation: d => d.value
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

export const LineLayerDemo = createLayerDemoClass({
  Layer: LineLayer,
  dataUrl: `${DATA_URI}/bart-segments.json`,
  formatTooltip: d => `${d.from.name} to ${d.to.name}`,
  props: {
    pickable: true,
    getWidth: 12,
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
    parameters: {
      depthMask: false
    },
    pickable: true,
    widthScale: 20,
    widthMinPixels: 2,
    getPath: d => d.path,
    getColor: d => colorToRGBArray(d.color),
    getWidth: d => 5
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
    pointSize: 2,
    getPosition: d => d.position,
    getNormal: d => d.normal,
    getColor: d => d.color
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

export const BitmapLayerDemo = createLayerDemoClass({
  Layer: BitmapLayer,
  props: {
    bounds: [-122.519, 37.7045, -122.355, 37.829],
    image: `${DATA_URI}/sf-districts.png`
  }
});
