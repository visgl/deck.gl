// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

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
  Attribute,
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
  createIterable,
  getShaderAssembler
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
  HexagonLayer,
  ContourLayer,
  GridLayer,
  HeatmapLayer,
  WebGLAggregator,
  CPUAggregator
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

export {ScenegraphLayer, SimpleMeshLayer} from '@deck.gl/mesh-layers';

//
// REACT BINDINGS PACKAGE
//

export {default, DeckGL} from '@deck.gl/react';

//
// WIDGETS PACKAGE
//

export {FullscreenWidget, ZoomWidget, CompassWidget} from '@deck.gl/widgets';

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
  TextureSource,
  PickingInfo,
  GetPickingInfoParams,
  BinaryAttribute,
  Effect,
  Widget
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
  GridLayerProps,
  HeatmapLayerProps,
  HexagonLayerProps,
  ScreenGridLayerProps
} from '@deck.gl/aggregation-layers';

export type {MVTLayerProps, QuadkeyLayerProps, TileLayerProps} from '@deck.gl/geo-layers';

export type {DeckGLProps, DeckGLRef, DeckGLContextValue} from '@deck.gl/react';

export type {FullscreenWidgetProps, ZoomWidgetProps, CompassWidgetProps} from '@deck.gl/widgets';
