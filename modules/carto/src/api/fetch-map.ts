import {_ConstructorOf, Layer} from '@deck.gl/core';
import ClusterTileLayer from '../layers/cluster-tile-layer';
import H3TileLayer from '../layers/h3-tile-layer';
import HeatmapTileLayer from '../layers/heatmap-tile-layer';
import VectorTileLayer from '../layers/vector-tile-layer';
import QuadbinTileLayer from '../layers/quadbin-tile-layer';
import RasterTileLayer from '../layers/raster-tile-layer';

import {fetchMap as _fetchMap, FetchMapOptions as _FetchMapOptions, FetchMapResult as _FetchMapResult, LayerType} from '@carto/api-client';

export type FetchMapResult = Omit<_FetchMapResult, 'layers'> & {
  layers: Layer[];
};

export type FetchMapOptions = Omit<_FetchMapOptions, 'onNewData'> & {
  onNewData?: (result: FetchMapResult) => void;
};

// Layer factory to create deck.gl layers from layer descriptors
const layerClasses: Record<LayerType, _ConstructorOf<Layer>> = {
  clusterTile: ClusterTileLayer,
  h3: H3TileLayer,
  heatmapTile: HeatmapTileLayer,
  mvt: VectorTileLayer,
  quadbin: QuadbinTileLayer,
  raster: RasterTileLayer,
  tileset: VectorTileLayer
} as const;

export async function fetchMap(options: FetchMapOptions): Promise<FetchMapResult> {
  // TODO handle onNewData

  // For backwards compatibility, provide a shim for the old API
  // TODO: v9.2 remove `fetchMap` from @deck.gl/carto and only provide LayerFactory
  const _result: _FetchMapResult = await _fetchMap(options);
  const result: FetchMapResult = {
    ..._result,
    layers: _result.layers.map(({type, props}) => {
      const LayerClass = layerClasses[type];
      return new LayerClass(props);
    }
  };

  return result;
}