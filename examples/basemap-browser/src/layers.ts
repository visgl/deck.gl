// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {GeoJsonLayer, ArcLayer, TextLayer} from '@deck.gl/layers';
import {TileLayer} from '@deck.gl/geo-layers';
import {BitmapLayer} from '@deck.gl/layers';
import {MapView, OrthographicView} from '@deck.gl/core';
import type {Layer, View} from '@deck.gl/core';
import {AIR_PORTS, LONDON_COORDINATES} from './constants';
import type {MapType} from './types';

// Layer configurations from get-started examples
export function getAirportLayers(interleaved?: boolean, mapType?: MapType): Layer[] {
  // In interleaved mode, render the layers under map labels
  // Mapbox uses slot, MapLibre uses beforeId, Google Maps doesn't support layer positioning
  const interleavedProps: any = interleaved
    ? mapType === 'mapbox'
      ? {slot: 'middle'}
      : mapType === 'maplibre'
        ? {beforeId: 'watername_ocean'}
        : {} // google-maps
    : {};

  return [
    new GeoJsonLayer({
      id: 'airports',
      data: AIR_PORTS,
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 2000,
      getPointRadius: (f: any) => 11 - f.properties.scalerank,
      getFillColor: [200, 0, 80, 180],
      pickable: true,
      autoHighlight: true,
      ...interleavedProps
    }),
    new ArcLayer({
      id: 'arcs',
      data: AIR_PORTS,
      dataTransform: (d: any) => d.features.filter((f: any) => f.properties.scalerank < 4),
      getSourcePosition: () => LONDON_COORDINATES,
      getTargetPosition: (f: any) => f.geometry.coordinates,
      getSourceColor: [0, 128, 200],
      getTargetColor: [200, 0, 80],
      getWidth: 1,
      ...interleavedProps
    })
  ];
}

export function getAirportLayersWithGlobe(interleaved?: boolean, mapType?: MapType): Layer[] {
  // In interleaved mode, render the layers under map labels
  // Mapbox uses slot, MapLibre uses beforeId, Google Maps doesn't support layer positioning
  const interleavedProps: any = interleaved
    ? mapType === 'mapbox'
      ? {slot: 'middle'}
      : mapType === 'maplibre'
        ? {beforeId: 'watername_ocean'}
        : {} // google-maps
    : {};

  return [
    new GeoJsonLayer({
      id: 'airports',
      data: AIR_PORTS,
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 2000,
      getPointRadius: (f: any) => 11 - f.properties.scalerank,
      getFillColor: [200, 0, 80, 180],
      pickable: true,
      autoHighlight: true,
      ...interleavedProps
    }),
    new ArcLayer({
      id: 'arcs',
      data: AIR_PORTS,
      parameters: {
        cullMode: 'none'
      },
      dataTransform: (d: any) => d.features.filter((f: any) => f.properties.scalerank < 4),
      getSourcePosition: () => LONDON_COORDINATES,
      getTargetPosition: (f: any) => f.geometry.coordinates,
      getSourceColor: [0, 128, 200],
      getTargetColor: [200, 0, 80],
      getWidth: 1,
      ...interleavedProps
    })
  ];
}

// Multi-view configuration
export function getMultiViewViews(): View[] {
  return [
    // Orthographic view for text overlay (static, no controller)
    new OrthographicView({
      id: 'ortho',
      controller: false,
      x: 0,
      y: 0,
      width: '100%',
      height: '100%',
      flipY: true
    }),
    // Minimap in bottom-right corner with OSM tiles
    new MapView({
      id: 'minimap',
      x: '75%',
      y: '75%',
      width: '25%',
      height: '25%',
      controller: true
    })
  ];
}

export function getMultiViewInitialViewState() {
  return {
    // MapView state for 'mapbox' and 'minimap' views
    mapbox: {
      latitude: 51.47,
      longitude: 0.45,
      zoom: 4,
      bearing: 0,
      pitch: 30
    },
    minimap: {
      latitude: 51.47,
      longitude: 0.45,
      zoom: 4,
      bearing: 0,
      pitch: 0
    },
    // OrthographicView state for 'ortho' view
    ortho: {
      target: [0, 0, 0],
      zoom: 0
    }
  };
}

export function getMultiViewLayers(
  interleaved?: boolean,
  exampleName?: string,
  mapType?: MapType
): Layer[] {
  const interleavedProps: any = interleaved
    ? mapType === 'mapbox'
      ? {slot: 'middle'}
      : {beforeId: 'watername_ocean'}
    : {};

  return [
    // OSM tile layer for minimap only
    new TileLayer({
      id: 'osm-tiles',
      data: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,
      renderSubLayers: props => {
        const {boundingBox} = props.tile;
        return new BitmapLayer(props, {
          data: null,
          image: props.data,
          bounds: [boundingBox[0][0], boundingBox[0][1], boundingBox[1][0], boundingBox[1][1]]
        });
      }
    }),
    // Airport markers for orthographic view
    new GeoJsonLayer({
      id: 'airports',
      data: AIR_PORTS,
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 2000,
      getPointRadius: (f: any) => 11 - f.properties.scalerank,
      getFillColor: [200, 0, 80, 180],
      pickable: true,
      autoHighlight: true,
      ...interleavedProps
    }),
    // Arcs for orthographic view
    new ArcLayer({
      id: 'arcs',
      data: AIR_PORTS,
      dataTransform: (d: any) => d.features.filter((f: any) => f.properties.scalerank < 4),
      getSourcePosition: () => LONDON_COORDINATES,
      getTargetPosition: (f: any) => f.geometry.coordinates,
      getSourceColor: [0, 128, 200],
      getTargetColor: [200, 0, 80],
      getWidth: 1,
      ...interleavedProps
    }),
    // Text layer showing example name for orthographic view
    new TextLayer({
      id: 'example-name-text',
      data: [{position: [0, 0, 0], text: exampleName || 'Multi-View Example'}],
      getPosition: (d: any) => d.position,
      getText: (d: any) => d.text,
      getSize: 64,
      getColor: [0, 0, 0, 255],
      getAngle: 0,
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'center',
      background: true,
      getBackgroundColor: [255, 255, 255, 200],
      backgroundPadding: [8, 4]
    })
  ];
}

// Layer filter for multi-view
export function getMultiViewLayerFilter({layer, viewport}: {layer: Layer; viewport: any}): boolean {
  if (layer.id === 'osm-tiles') {
    return viewport.id === 'minimap';
  }
  if (layer.id === 'airports' || layer.id === 'arcs') {
    return viewport.id === 'mapbox'; // MapboxOverlay's internal view
  }
  if (layer.id === 'example-name-text') {
    return viewport.id === 'ortho';
  }
  return false;
}
