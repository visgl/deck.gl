import {
  MapView,
  OrthographicView,
  OrbitView,
  FirstPersonView,
  _GlobeView as GlobeView
} from '@deck.gl/core';
import {
  S2Layer,
  QuadkeyLayer,
  TileLayer,
  TripsLayer,
  H3ClusterLayer,
  H3HexagonLayer,
  Tile3DLayer,
  TerrainLayer,
  MVTLayer,
  GeohashLayer
} from '@deck.gl/geo-layers';
import {
  ArcLayer,
  BitmapLayer,
  IconLayer,
  LineLayer,
  PointCloudLayer,
  ScatterplotLayer,
  ColumnLayer,
  GridCellLayer,
  PathLayer,
  PolygonLayer,
  GeoJsonLayer,
  TextLayer,
  SolidPolygonLayer
} from '@deck.gl/layers';
import type {Instance} from './types';

// IDEA: we can technically move this purely to userland so that a user is defining precisely
// the layers they are intending to use in their app. May help out with bundle size for a
// tradeoff on developer experience / maintainability.

export type Catalogue = {
  [name: string]: {
    new (...args: unknown[]): Instance;
  };
};

export const catalogue: Catalogue = {};

export function extend(objects: object) {
  Object.assign(catalogue, objects);
}

extend({
  // @deck.gl/core
  MapView,
  OrthographicView,
  OrbitView,
  FirstPersonView,
  GlobeView,
  // @deck.gl/layers
  ArcLayer,
  BitmapLayer,
  IconLayer,
  LineLayer,
  PointCloudLayer,
  ScatterplotLayer,
  ColumnLayer,
  GridCellLayer,
  PathLayer,
  PolygonLayer,
  GeoJsonLayer,
  TextLayer,
  SolidPolygonLayer,
  // @deck.gl/geo-layers
  S2Layer,
  QuadkeyLayer,
  TileLayer,
  TripsLayer,
  H3ClusterLayer,
  H3HexagonLayer,
  Tile3DLayer,
  TerrainLayer,
  MVTLayer,
  GeohashLayer
});
