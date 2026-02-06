// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Layer, View} from '@deck.gl/core';

// ===== Base Types =====

export type Basemap = 'deck-only' | 'google-maps' | 'mapbox' | 'maplibre';

export type Framework = 'pure-js' | 'react';

export type StressTest =
  | 'none'
  | 'points-10k'
  | 'points-100k'
  | 'points-1m'
  | 'points-5m'
  | 'points-10m';

export type InitialViewState = {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
};

export type MultiViewState = {
  [viewId: string]: InitialViewState | {target: number[]; zoom: number};
};

// ===== Dimension Types =====

export type Dimensions = {
  basemap: Basemap;
  framework: Framework;
  interleaved: boolean;
  batched: boolean;
  globe: boolean;
  multiView: boolean;
  billboard: boolean;
  stressTest: StressTest;
};

// ===== Validation Types =====

export type ValidationWarning = {
  dimension: keyof Dimensions;
  message: string;
  severity: 'warning' | 'info';
};

export type ValidationResult = {
  warnings: ValidationWarning[];
};

// ===== Callbacks =====

export type ViewStateChangeCallback = (viewState: InitialViewState) => void;

// ===== Configuration Output =====

export type Config = {
  // Core dimensions
  basemap: Basemap;
  framework: Framework;
  interleaved: boolean;
  batched: boolean;
  globe: boolean;
  multiView: boolean;
  billboard: boolean;
  stressTest: StressTest;

  // Computed configuration
  mapStyle: string;
  initialViewState: InitialViewState | MultiViewState;
  layers: Layer[];

  // Multi-view specific (only present when multiView: true)
  views?: View[];
  layerFilter?: (args: {layer: Layer; viewport: any}) => boolean;

  // Callbacks
  onViewStateChange?: ViewStateChangeCallback;

  // Validation results
  validation: ValidationResult;
};
