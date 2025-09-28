import {_ConstructorOf, Layer} from '@deck.gl/core';
import ClusterTileLayer from '../layers/cluster-tile-layer';
import H3TileLayer from '../layers/h3-tile-layer';
import HeatmapTileLayer from '../layers/heatmap-tile-layer';
import VectorTileLayer from '../layers/vector-tile-layer';
import QuadbinTileLayer from '../layers/quadbin-tile-layer';
import RasterTileLayer from '../layers/raster-tile-layer';

import {
  fetchMap as _fetchMap,
  FetchMapOptions as _FetchMapOptions,
  FetchMapResult as _FetchMapResult,
  LayerDescriptor,
  LayerType
} from '@carto/api-client';

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

export function LayerFactory(descriptor: LayerDescriptor): Layer {
  const LayerClass = layerClasses[descriptor.type];
  if (!LayerClass) {
    throw new Error(`No layer class found for type: ${descriptor.type}`);
  }
  return new LayerClass(descriptor.props);
}

function createResult(result: _FetchMapResult): FetchMapResult {
  return {
    ...result,
    layers: result.layers.map(descriptor => LayerFactory(descriptor))
  };
}

/**
 * fetchMap is a wrapper around the @carto/api-client fetchMap function, with additions for convenience and backward-compatibility.
 * Where @carto/api-client fetchMap returns layer props, @deck.gl/carto fetchMap returns Layer instances ready for use.
 * For greater control, use the @carto/api-client fetchMap function directly and use LayerFactory to create layers manually.
 */
export async function fetchMap(options: FetchMapOptions): Promise<FetchMapResult> {
  const {onNewData, ...rest} = options;
  const _options: _FetchMapOptions = {
    ...rest,
    onNewData:
      typeof onNewData === 'function'
        ? result => {
            onNewData(createResult(result));
          }
        : undefined
  };

  // For backwards compatibility, provide a shim for the old API
  const _result: _FetchMapResult = await _fetchMap(_options);
  const result: FetchMapResult = createResult(_result);
  return result;
}
