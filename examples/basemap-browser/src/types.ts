// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Layer} from '@deck.gl/core';

export type MapType = 'google-maps' | 'mapbox' | 'maplibre';

export type Framework = 'pure-js' | 'react';

export type InitialViewState = {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
};

export type BasemapExample = {
  name: string;
  mapType: MapType;
  framework: Framework;
  mapStyle?: string;
  initialViewState: InitialViewState;
  getLayers: (interleaved?: boolean) => Layer[];
  globe?: boolean;
};

export type ExampleCategory = {
  [key: string]: BasemapExample;
};

export type ExampleCategories = {
  [category: string]: ExampleCategory;
};
