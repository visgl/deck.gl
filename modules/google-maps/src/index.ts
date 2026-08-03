// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export {default as GoogleMapsOverlay} from './google-maps-overlay';
export {
  createMap3DEditorState,
  createMap3DGeometryState,
  getMap3DEditorInsertIndex,
  normalizeMap3DCoordinate,
  toMap3DEditorGeoJSON
} from './map-3d-editor-state';
export type {
  GoogleMapsMap3DDepthMode,
  GoogleMapsMap3DFallbackMode,
  GoogleMapsOverlayProps
} from './google-maps-overlay';
export type {
  Map3DEditorCoordinate,
  Map3DEditorCoordinateLike,
  Map3DEditorFeature,
  Map3DEditorGeoJSON,
  Map3DEditorGeometry,
  Map3DEditorMode,
  Map3DEditorMutationResult,
  Map3DEditorSelection,
  Map3DEditorSnapshot,
  Map3DEditorState
} from './map-3d-editor-state';
export type {GoogleMapsMap3DElement} from './utils';
