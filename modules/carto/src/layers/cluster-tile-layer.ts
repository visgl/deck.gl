// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {GeoJsonLayer, GeoJsonLayerProps} from '@deck.gl/layers';
import {
  TileLayer,
  _Tile2DHeader as Tile2DHeader,
  TileLayerProps,
  TileLayerPickingInfo
} from '@deck.gl/geo-layers';
import {registerLoaders} from '@loaders.gl/core';
import {binaryToGeojson} from '@loaders.gl/gis';
import {BinaryFeatureCollection} from '@loaders.gl/schema';
import type {Feature, Geometry} from 'geojson';

import {
  Accessor,
  DefaultProps,
  CompositeLayer,
  _deepEqual as deepEqual,
  GetPickingInfoParams,
  Layer,
  LayersList,
  PickingInfo
} from '@deck.gl/core';

import {
  aggregateTile,
  ClusteredFeaturePropertiesT,
  clustersToBinary,
  computeAggregationStats,
  extractAggregationProperties,
  ParsedQuadbinCell,
  ParsedQuadbinTile
} from './cluster-utils';
import {DEFAULT_TILE_SIZE} from '../constants';
import QuadbinTileset2D from './quadbin-tileset-2d';
import {getQuadbinPolygon} from './quadbin-utils';
import CartoSpatialTileLoader from './schema/carto-spatial-tile-loader';
import {injectAccessToken, TilejsonPropType} from './utils';
import type {TilejsonResult} from '@carto/api-client';

registerLoaders([CartoSpatialTileLoader]);

const defaultProps: DefaultProps<ClusterTileLayerProps> = {
  data: TilejsonPropType,
  clusterLevel: {type: 'number', value: 5, min: 1},
  getPosition: {
    type: 'accessor',
    value: ({id}) => getQuadbinPolygon(id, 0.5).slice(2, 4) as [number, number]
  },
  getWeight: {type: 'accessor', value: 1},
  refinementStrategy: 'no-overlap',
  tileSize: DEFAULT_TILE_SIZE
};

export type ClusterTileLayerPickingInfo<FeaturePropertiesT = {}> = TileLayerPickingInfo<
  ParsedQuadbinTile<FeaturePropertiesT>,
  PickingInfo<Feature<Geometry, FeaturePropertiesT>>
>;

/** All properties supported by ClusterTileLayer. */
export type ClusterTileLayerProps<FeaturePropertiesT = unknown> =
  _ClusterTileLayerProps<FeaturePropertiesT> &
    Omit<TileLayerProps<ParsedQuadbinTile<FeaturePropertiesT>>, 'data'>;

/** Properties added by ClusterTileLayer. */
type _ClusterTileLayerProps<FeaturePropertiesT> = Omit<
  GeoJsonLayerProps<ClusteredFeaturePropertiesT<FeaturePropertiesT>>,
  'data'
> & {
  data: null | TilejsonResult | Promise<TilejsonResult>;

  /**
   * The number of aggregation levels to cluster cells by. Larger values increase
   * the clustering radius, with an increment of `clusterLevel` doubling the radius.
   *
   * @default 5
   */
  clusterLevel?: number;

  /**
   * The (average) position of points in a cell used for clustering.
   * If not supplied the center of the quadbin cell is used.
   *
   * @default cell center
   */
  getPosition?: Accessor<ParsedQuadbinCell<FeaturePropertiesT>, [number, number]>;

  /**
   * The weight of each cell used for clustering.
   *
   * @default 1
   */
  getWeight?: Accessor<ParsedQuadbinCell<FeaturePropertiesT>, number>;
};

class ClusterGeoJsonLayer<
  FeaturePropertiesT extends {} = {},
  ExtraProps extends {} = {}
> extends TileLayer<
  ParsedQuadbinTile<FeaturePropertiesT>,
  ExtraProps & Required<_ClusterTileLayerProps<FeaturePropertiesT>>
> {
  static layerName = 'ClusterGeoJsonLayer';
  static defaultProps = defaultProps;
  state!: TileLayer<FeaturePropertiesT>['state'] & {
    data: BinaryFeatureCollection;
    clusterIds: bigint[];
    hoveredFeatureId: bigint | number | null;
    highlightColor: number[];
    aggregationCache: WeakMap<any, Map<number, ClusteredFeaturePropertiesT<FeaturePropertiesT>[]>>;
  };

  initializeState() {
    super.initializeState();
    this.state.aggregationCache = new WeakMap();
  }

  // eslint-disable-next-line max-statements
  renderLayers(): Layer | null | LayersList {
    const visibleTiles = this.state.tileset?.tiles.filter((tile: Tile2DHeader) => {
      return tile.isLoaded && tile.content && this.state.tileset!.isTileVisible(tile);
    }) as Tile2DHeader<ParsedQuadbinTile<FeaturePropertiesT>>[];
    if (!visibleTiles?.length) {
      return null;
    }
    visibleTiles.sort((a, b) => b.zoom - a.zoom);

    const {zoom} = this.context.viewport;
    const {clusterLevel, getPosition, getWeight} = this.props;
    const {aggregationCache} = this.state;

    const properties = extractAggregationProperties(visibleTiles[0]);
    const data = [] as ClusteredFeaturePropertiesT<FeaturePropertiesT>[];
    let needsUpdate = false;
    for (const tile of visibleTiles) {
      // Calculate aggregation based on viewport zoom
      const overZoom = Math.round(zoom - tile.zoom);
      const aggregationLevels = Math.round(clusterLevel) - overZoom;
      let tileAggregationCache = aggregationCache.get(tile.content);
      if (!tileAggregationCache) {
        tileAggregationCache = new Map();
        aggregationCache.set(tile.content, tileAggregationCache);
      }
      const didAggregate = aggregateTile(
        tile,
        tileAggregationCache,
        aggregationLevels,
        properties,
        getPosition,
        getWeight
      );
      needsUpdate ||= didAggregate;
      data.push(...tileAggregationCache.get(aggregationLevels)!);
    }

    data.sort((a, b) => Number(b.count - a.count));

    const clusterIds = data?.map((tile: any) => tile.id);
    needsUpdate ||= !deepEqual(clusterIds, this.state.clusterIds, 1);
    this.setState({clusterIds});

    if (needsUpdate) {
      const stats = computeAggregationStats(data, properties);
      const binaryData = clustersToBinary(data);
      binaryData.points.attributes = {stats};
      this.setState({data: binaryData});
    }

    const props = {
      ...this.props,
      id: 'clusters',
      data: this.state.data,
      dataComparator: (data?: BinaryFeatureCollection, oldData?: BinaryFeatureCollection) => {
        const newIds = data?.points?.properties?.map((tile: any) => tile.id);
        const oldIds = oldData?.points?.properties?.map((tile: any) => tile.id);
        return deepEqual(newIds, oldIds, 1);
      }
    } as GeoJsonLayerProps<ClusteredFeaturePropertiesT<FeaturePropertiesT>>;

    return new GeoJsonLayer(this.getSubLayerProps(props));
  }

  getPickingInfo(params: GetPickingInfoParams): ClusterTileLayerPickingInfo<FeaturePropertiesT> {
    const info = params.info as TileLayerPickingInfo<ParsedQuadbinTile<FeaturePropertiesT>>;

    if (info.index !== -1) {
      const {data} = params.sourceLayer!.props;
      info.object = binaryToGeojson(data as BinaryFeatureCollection, {
        globalFeatureId: info.index
      }) as Feature;
    }

    return info;
  }

  protected _updateAutoHighlight(info: PickingInfo): void {
    for (const layer of this.getSubLayers()) {
      layer.updateAutoHighlight(info);
    }
  }

  filterSubLayer() {
    return true;
  }
}

// Adapter layer around ClusterLayer that converts tileJSON into TileLayer API
export default class ClusterTileLayer<
  FeaturePropertiesT = any,
  ExtraProps extends {} = {}
> extends CompositeLayer<ExtraProps & Required<_ClusterTileLayerProps<FeaturePropertiesT>>> {
  static layerName = 'ClusterTileLayer';
  static defaultProps = defaultProps;

  getLoadOptions(): any {
    const loadOptions = super.getLoadOptions() || {};
    const tileJSON = this.props.data as TilejsonResult;
    injectAccessToken(loadOptions, tileJSON.accessToken);
    loadOptions.cartoSpatialTile = {...loadOptions.cartoSpatialTile, scheme: 'quadbin'};
    return loadOptions;
  }

  renderLayers(): Layer | null | LayersList {
    const tileJSON = this.props.data as TilejsonResult;
    if (!tileJSON) return null;

    const {tiles: data, maxresolution: maxZoom} = tileJSON;
    return [
      // @ts-ignore
      new ClusterGeoJsonLayer(this.props, {
        id: `cluster-geojson-layer-${this.props.id}`,
        data,
        // TODO: Tileset2D should be generic over TileIndex type
        TilesetClass: QuadbinTileset2D as any,
        maxZoom,
        loadOptions: this.getLoadOptions()
      })
    ];
  }
}
