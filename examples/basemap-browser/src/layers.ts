// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {GeoJsonLayer, ArcLayer} from '@deck.gl/layers';
import type {Layer} from '@deck.gl/core';
import {AIR_PORTS, LONDON_COORDINATES} from './constants';
import type {MapType} from './types';

// Layer configurations from get-started examples
export function getAirportLayers(interleaved?: boolean, mapType?: MapType): Layer[] {
  // In interleaved mode, render the layers under map labels
  // Mapbox uses slot, MapLibre uses beforeId
  const interleavedProps = interleaved
    ? mapType === 'mapbox'
      ? {slot: 'middle'}
      : {beforeId: 'watername_ocean'}
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
  // Mapbox uses slot, MapLibre uses beforeId
  const interleavedProps = interleaved
    ? mapType === 'mapbox'
      ? {slot: 'middle'}
      : {beforeId: 'watername_ocean'}
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
