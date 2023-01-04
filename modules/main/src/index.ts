// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
/* eslint-disable max-len */

//
// CORE LIBRARY
//

export {
  // CONSTANTS
  VERSION,
  COORDINATE_SYSTEM,
  OPERATION,
  UNIT,
  // Main class
  Deck,
  // Base Layers
  Layer,
  CompositeLayer,
  // Views
  View,
  MapView,
  FirstPersonView,
  OrbitView,
  OrthographicView,
  _GlobeView,
  // Viewports
  Viewport,
  WebMercatorViewport,
  _GlobeViewport,
  OrbitViewport,
  OrthographicViewport,
  FirstPersonViewport,
  // Controllers
  Controller,
  MapController,
  OrbitController,
  FirstPersonController,
  OrthographicController,
  _GlobeController,
  // For custom layers
  AttributeManager,
  // Shader modules
  picking,
  project,
  project32,
  gouraudLighting,
  phongLighting,
  shadow,
  // Internal classes
  LayerManager,
  DeckRenderer,
  // Logging
  log,
  assert,
  // Transition bindings
  TRANSITION_EVENTS,
  TransitionInterpolator,
  LinearInterpolator,
  FlyToInterpolator,
  // Effects
  LightingEffect,
  PostProcessEffect,
  // Lights
  AmbientLight,
  PointLight,
  DirectionalLight,
  // Extension
  LayerExtension,
  // Utilities
  Tesselator,
  fp64LowPart,
  createIterable
} from '@deck.gl/core';

//
// LAYERS PACKAGES
//

export {
  ArcLayer,
  BitmapLayer,
  IconLayer,
  LineLayer,
  PointCloudLayer,
  ScatterplotLayer,
  GridCellLayer,
  ColumnLayer,
  PathLayer,
  PolygonLayer,
  SolidPolygonLayer,
  GeoJsonLayer,
  TextLayer
} from '@deck.gl/layers';

export {
  ScreenGridLayer,
  CPUGridLayer,
  HexagonLayer,
  ContourLayer,
  GridLayer,
  GPUGridLayer,
  AGGREGATION_OPERATION,
  HeatmapLayer
} from '@deck.gl/aggregation-layers';

export {
  GreatCircleLayer,
  S2Layer,
  QuadkeyLayer,
  H3ClusterLayer,
  H3HexagonLayer,
  TileLayer,
  _Tileset2D,
  TripsLayer,
  Tile3DLayer,
  TerrainLayer,
  MVTLayer,
  GeohashLayer
} from '@deck.gl/geo-layers';

export {SimpleMeshLayer, ScenegraphLayer} from '@deck.gl/mesh-layers';

//
// REACT BINDINGS PACKAGE
//

export {default, DeckGL} from '@deck.gl/react';

/* Types */

export type {
  MapViewState,
  FirstPersonViewState,
  OrbitViewState,
  OrthographicViewState,
  GlobeViewState,
  CoordinateSystem,
  ChangeFlags,
  LayersList,
  LayerContext,
  UpdateParameters,
  DeckProps,
  LayerProps,
  CompositeLayerProps,
  Accessor,
  AccessorFunction,
  LayerData,
  Unit,
  Position,
  Color,
  Texture,
  PickingInfo,
  GetPickingInfoParams,
  BinaryAttribute,
  Effect
} from '@deck.gl/core';

export type {
  ArcLayerProps,
  BitmapLayerProps,
  ColumnLayerProps,
  ScatterplotLayerProps,
  IconLayerProps,
  LineLayerProps,
  PolygonLayerProps,
  GeoJsonLayerProps,
  GridCellLayerProps,
  TextLayerProps,
  MultiIconLayerProps,
  PointCloudLayerProps,
  TextBackgroundLayerProps,
  PathLayerProps,
  SolidPolygonLayerProps
} from '@deck.gl/layers';

export type {
  ContourLayerProps,
  CPUGridLayerProps,
  GridLayerProps,
  GPUGridLayerProps,
  HeatmapLayerProps,
  HexagonLayerProps,
  ScreenGridLayerProps
} from '@deck.gl/aggregation-layers';

export type {MVTLayerProps, QuadkeyLayerProps, TileLayerProps} from '@deck.gl/geo-layers';

export type {DeckGLProps, DeckGLRef, DeckGLContextValue} from '@deck.gl/react';
