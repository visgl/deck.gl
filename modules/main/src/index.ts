// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable max-len */

//
// CORE LIBRARY
//

export {
  VERSION,
  OPERATION,
  UNIT,
  Deck,
  Layer,
  CompositeLayer,
  View,
  MapView,
  FirstPersonView,
  OrbitView,
  OrthographicView,
  _CustomProjectionView,
  _GlobeView,
  Viewport,
  WebMercatorViewport,
  _GlobeViewport,
  OrbitViewport,
  OrthographicViewport,
  FirstPersonViewport,
  _CustomProjectionViewport,
  Controller,
  MapController,
  TerrainController,
  OrbitController,
  FirstPersonController,
  OrthographicController,
  _CustomProjectionController,
  _GlobeController,
  Attribute,
  AttributeManager,
  color,
  picking,
  pickingPlugin,
  project,
  project32,
  gouraudMaterial,
  phongMaterial,
  shadow,
  shadowPlugin,
  LayerManager,
  DeckRenderer,
  log,
  assert,
  TRANSITION_EVENTS,
  TransitionInterpolator,
  LinearInterpolator,
  FlyToInterpolator,
  LightingEffect,
  PostProcessEffect,
  AmbientLight,
  PointLight,
  DirectionalLight,
  LayerExtension,
  Tesselator,
  fp64LowPart,
  createIterable,
  getShaderAssembler,
  Widget
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
  CPUAggregator,
  ReadbackAggregator,
  GraphScreenGridAggregator
} from '@deck.gl/aggregation-layers';

export {
  A5Layer,
  GreatCircleLayer,
  S2Layer,
  QuadkeyLayer,
  H3ClusterLayer,
  H3HexagonLayer,
  TileLayer,
  Tileset2D,
  Tile2DHeader,
  tile2DDeckAdapter,
  /** @deprecated Use Tileset2D. */
  _Tileset2D,
  TripsLayer,
  Tile3DLayer,
  TerrainLayer,
  MVTLayer,
  GeohashLayer
} from '@deck.gl/geo-layers';

export {ScenegraphLayer, SimpleMeshLayer} from '@deck.gl/mesh-layers';

//
// MAPLIBRE INTEGRATION PACKAGE
//

export {MapLibreOverlay} from '@deck.gl/maplibre';
export type {MapLibreOverlayProps} from '@deck.gl/maplibre';

//
// REACT BINDINGS PACKAGE
//

export {default, DeckGL} from '@deck.gl/react';

//
// WIDGETS PACKAGE
//

export {
  // Navigation widgets
  ZoomWidget,
  ResetViewWidget,
  GimbalWidget,
  // Geospatial widgets
  CompassWidget,
  _ScaleWidget,
  _GeocoderWidget,
  // View widgets
  FullscreenWidget,
  _SplitterWidget,
  buildViewsFromViewLayout,
  // Information widgets
  InfoWidget,
  PopupWidget,
  ContextMenuWidget,
  ScrollbarWidget,
  // Control widgets
  IconWidget,
  ToggleWidget,
  SelectorWidget,
  _TimelineWidget,
  // Utility widgets
  ScreenshotWidget,
  ThemeWidget,
  LoadingWidget,
  _StatsWidget
} from '@deck.gl/widgets';

/* Types */

export type {
  MapViewState,
  FirstPersonViewState,
  OrbitViewState,
  OrthographicViewState,
  GlobeViewState,
  CustomProjectionViewState,
  CustomProjectionViewProps,
  CustomProjectionViewportOptions,
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
  GridLayerProps,
  HeatmapLayerProps,
  HexagonLayerProps,
  ScreenGridLayerProps
} from '@deck.gl/aggregation-layers';

export type {
  MVTLayerProps,
  QuadkeyLayerProps,
  RefinementStrategy,
  TileLoadProps,
  Tileset2DAdapter,
  Tileset2DListener,
  Tileset2DProps,
  Tileset2DTileContext,
  Tileset2DTraversalContext,
  TileLayerProps
} from '@deck.gl/geo-layers';

export type {DeckGLProps, DeckGLRef, DeckGLContextValue} from '@deck.gl/react';

export type {
  FullscreenWidgetProps,
  CompassWidgetProps,
  ZoomWidgetProps,
  ScreenshotWidgetProps,
  ResetViewWidgetProps,
  GeocoderWidgetProps,
  LoadingWidgetProps,
  IconWidgetProps,
  ToggleWidgetProps,
  ScaleWidgetProps,
  ThemeWidgetProps,
  InfoWidgetProps,
  PopupWidgetProps,
  StatsWidgetProps,
  ContextMenuWidgetProps,
  SplitterWidgetProps,
  SplitterWidgetViewLayout,
  CompiledDeckViews,
  ViewLayout,
  TimelineWidgetProps,
  SelectorWidgetProps,
  GimbalWidgetProps,
  ScrollbarWidgetProps
} from '@deck.gl/widgets';
