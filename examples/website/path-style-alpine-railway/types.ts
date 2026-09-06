// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {MapViewState} from '@deck.gl/core';

export type Position3D = [longitude: number, latitude: number, elevationMeters: number];
export type RailwayStructure = 'open' | 'bridge' | 'tunnel' | 'covered' | 'unknown';
export type SceneId = 'albula-landwasser' | 'bernina-pass' | 'brusio-spiral';
export type ViewMode = 'finished' | 'anatomy';

export type RailwayTrack = {
  id: string;
  label: string;
  path: Position3D[];
  gaugeMeters: number | null;
  structure: RailwayStructure;
  sourceObjectIds: Array<string | number>;
  sourceClass: string | null;
  sourceUpdatedAt: string | null;
  sourceTrackCount: number | null;
  representativeAxis: boolean;
};

export type RailwayScene = {
  id: SceneId;
  label: string;
  description: string;
  initialViewState: MapViewState;
  bounds: [west: number, south: number, east: number, north: number];
  terrain: {
    id: SceneId;
    bounds: [west: number, south: number, east: number, north: number];
    elevationRangeMeters: [minimum: number, maximum: number];
  };
  tracks: RailwayTrack[];
};

export type RenderedRailwayTrack = RailwayTrack & {renderedPath: Position3D[]};

export type RailCopy = RenderedRailwayTrack & {side: -1 | 1};

export type SourceVertex = {
  position: Position3D;
  trackId: string;
  vertexIndex: number;
};

export type TerrainAssets = {
  elevation: string;
  texture: string;
  color: [number, number, number];
};
