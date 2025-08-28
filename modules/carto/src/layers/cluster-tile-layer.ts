// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-shadow */

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
  PickingInfo,
  WebMercatorViewport
} from '@deck.gl/core';

import {
  aggregateTile,
  ClusteredFeaturePropertiesT,
  clustersToBinary,
  computeAggregationStats,
  extractAggregationProperties,
  ParsedQuadbinCell,
  ParsedQuadbinTile,
  ParsedH3Cell,
  ParsedH3Tile
} from './cluster-utils';
import {DEFAULT_TILE_SIZE} from '../constants';
import QuadbinTileset2D from './quadbin-tileset-2d';
import H3Tileset2D, { getHexagonResolution } from './h3-tileset-2d';
import {getQuadbinPolygon} from './quadbin-utils';
import {getResolution, cellToLatLng} from 'h3-js';
import CartoSpatialTileLoader from './schema/carto-spatial-tile-loader';
import {TilejsonPropType, mergeLoadOptions} from './utils';
import type {TilejsonResult} from '@carto/api-client';

registerLoaders([CartoSpatialTileLoader]);

function getScheme(tilesetClass: typeof H3Tileset2D | typeof QuadbinTileset2D): 'h3' | 'quadbin' {
  if (tilesetClass === H3Tileset2D) return 'h3';
  if (tilesetClass === QuadbinTileset2D) return 'quadbin';
  throw new Error('Invalid tileset class');
}

const defaultProps: DefaultProps<ClusterTileLayerProps> = {
  data: TilejsonPropType,
  clusterLevel: {type: 'number', value: 5, min: 1},
  getPosition: {
    type: 'accessor',
    value: ({id}) => {
      // Determine scheme based on ID type: H3 uses string IDs, Quadbin uses bigint IDs
      if (typeof id === 'string') {
        const [lat, lng] = cellToLatLng(id);
        return [lng, lat];
      }
      return getQuadbinPolygon(id as bigint, 0.5).slice(2, 4) as [number, number];
    }
  },
  getWeight: {type: 'accessor', value: 1},
  refinementStrategy: 'no-overlap',
  tileSize: DEFAULT_TILE_SIZE
};

export type ClusterTileLayerPickingInfo<FeaturePropertiesT = {}> = TileLayerPickingInfo<
  ParsedQuadbinTile<FeaturePropertiesT> | ParsedH3Tile<FeaturePropertiesT>,
  PickingInfo<Feature<Geometry, FeaturePropertiesT>>
>;

/** All properties supported by ClusterTileLayer. */
export type ClusterTileLayerProps<FeaturePropertiesT = unknown> =
  _ClusterTileLayerProps<FeaturePropertiesT> &
    Omit<TileLayerProps<ParsedQuadbinTile<FeaturePropertiesT> | ParsedH3Tile<FeaturePropertiesT>>, 'data'>;

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
   * If not supplied the center of the quadbin cell or H3 cell is used.
   *
   * @default cell center
   */
  getPosition?: Accessor<ParsedQuadbinCell<FeaturePropertiesT> | ParsedH3Cell<FeaturePropertiesT>, [number, number]>;

  /**
   * The weight of each cell used for clustering.
   *
   * @default 1
   */
  getWeight?: Accessor<ParsedQuadbinCell<FeaturePropertiesT> | ParsedH3Cell<FeaturePropertiesT>, number>;
};

class ClusterGeoJsonLayer<
  FeaturePropertiesT extends {} = {},
  ExtraProps extends {} = {}
> extends TileLayer<
  ParsedQuadbinTile<FeaturePropertiesT> | ParsedH3Tile<FeaturePropertiesT>,
  ExtraProps & Required<_ClusterTileLayerProps<FeaturePropertiesT>>
> {
  static layerName = 'ClusterGeoJsonLayer';
  static defaultProps = defaultProps;
  state!: TileLayer<FeaturePropertiesT>['state'] & {
    data: BinaryFeatureCollection;
    clusterIds: (bigint | string)[];
    hoveredFeatureId: bigint | string | number | null;
    highlightColor: number[];
    aggregationCache: WeakMap<any, Map<number, ClusteredFeaturePropertiesT<FeaturePropertiesT>[]>>;
    scheme: string | null;
  };

  initializeState() {
    super.initializeState();
    this.state.aggregationCache = new WeakMap();
    this.state.scheme = getScheme(this.props.TilesetClass as any);
  }

  updateState(opts) {
    const {props} = opts;
    const scheme = getScheme(props.TilesetClass as any);
    if (this.state.scheme !== scheme) {
      // Clear caches when scheme changes
      this.setState({scheme, tileset: null});
      this.state.aggregationCache = new WeakMap();
    }

    super.updateState(opts);
  }

  // eslint-disable-next-line max-statements
  renderLayers(): Layer | null | LayersList {
    const visibleTiles = this.state.tileset?.tiles.filter((tile: Tile2DHeader) => {
      return tile.isLoaded && tile.content && this.state.tileset!.isTileVisible(tile);
    }) as Tile2DHeader<ParsedQuadbinTile<FeaturePropertiesT> | ParsedH3Tile<FeaturePropertiesT>>[];
    if (!visibleTiles?.length || !this.state.tileset) {
      return null;
    }
    visibleTiles.sort((a, b) => b.zoom - a.zoom);
    const {getPosition, getWeight} = this.props;
    const {aggregationCache, scheme} = this.state;
    
    const isH3 = scheme === 'h3';

    const properties = extractAggregationProperties(visibleTiles[0]);
    const data = [] as ClusteredFeaturePropertiesT<FeaturePropertiesT>[];
    let needsUpdate = false;

    const aggregationLevels = this._getAggregationLevels(visibleTiles);

    for (const tile of visibleTiles) {
      // Calculate aggregation based on viewport zoom
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
        getWeight,
        isH3 ? 'h3' : 'quadbin'
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
    const info = params.info as TileLayerPickingInfo<ParsedQuadbinTile<FeaturePropertiesT> | ParsedH3Tile<FeaturePropertiesT>>;

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

  private _getAggregationLevels(visibleTiles: Tile2DHeader[]) : number {
    const isH3 = this.state.scheme === 'h3';
    const firstTile = visibleTiles[0];

    // Resolution of data present in tiles
    let tileResolution;

    // Resolution of tiles that should be (eventually) visible in the viewport
    let viewportResolution;
    if (isH3) {
      tileResolution = getResolution(firstTile.id);
      viewportResolution = getHexagonResolution(this.context.viewport as WebMercatorViewport, (this.state.tileset as any).opts.tileSize);
    } else {
      tileResolution = firstTile.zoom;
      viewportResolution = this.context.viewport.zoom;
    }

    const resolutionDiff = Math.round(viewportResolution - tileResolution);
    const aggregationLevels = Math.round(this.props.clusterLevel) - resolutionDiff;
    return aggregationLevels;
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
    const tileJSON = this.props.data as TilejsonResult;
    const scheme = tileJSON && 'scheme' in tileJSON ? tileJSON.scheme : 'quadbin';
    return mergeLoadOptions(super.getLoadOptions(), {
      fetch: {headers: {Authorization: `Bearer ${tileJSON.accessToken}`}},
      cartoSpatialTile: {scheme}
    });
  }

  renderLayers(): Layer | null | LayersList {
    const tileJSON = this.props.data as TilejsonResult;
    if (!tileJSON) return null;

    const {tiles: data, maxresolution: maxZoom} = tileJSON;
    const isH3 = tileJSON && 'scheme' in tileJSON && tileJSON.scheme === 'h3';
    const TilesetClass = isH3 ? H3Tileset2D : QuadbinTileset2D;
    
    return [
      // @ts-ignore
      new ClusterGeoJsonLayer(this.props, {
        id: `cluster-geojson-layer-${this.props.id}`,
        data,
        // TODO: Tileset2D should be generic over TileIndex type
        TilesetClass: TilesetClass as any,
        maxZoom,
        loadOptions: this.getLoadOptions()
      })
    ];
  }
}
