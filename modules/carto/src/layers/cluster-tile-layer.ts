import {registerLoaders} from '@loaders.gl/core';
import {DefaultProps} from '@deck.gl/core';
import CartoSpatialTileLoader from './schema/carto-spatial-tile-loader';
registerLoaders([CartoSpatialTileLoader]);

import {ScatterplotLayer, TextLayer} from '@deck.gl/layers';
import {_deepEqual as deepEqual, Layer, PickingInfo} from '@deck.gl/core';
import type {GetPickingInfoParams, LayersList} from '@deck.gl/core';
import {
  TileLayer,
  _Tile2DHeader as Tile2DHeader,
  TileLayerProps,
  TileLayerPickingInfo
} from '@deck.gl/geo-layers';
import {DEFAULT_TILE_SIZE} from '../constants';
import {aggregateTile, brokenCell, formatCount, highlightBroken} from './cluster-utils';

const defaultProps: DefaultProps<ClusterTileLayerProps> = {
  tileSize: DEFAULT_TILE_SIZE,
  refinementStrategy: 'no-overlap'
};

/** All properties supported by ClusterTileLayer. */
export type ClusterTileLayerProps<DataT = unknown> = _ClusterTileLayerProps & TileLayerProps<DataT>;

/** Properties added by ClusterTileLayer. */
type _ClusterTileLayerProps = {};

export default class ClusterTileLayer<DataT = any, ExtraProps extends {} = {}> extends TileLayer<
  DataT,
  ExtraProps & Required<_ClusterTileLayerProps>
> {
  static layerName = 'ClusterTileLayer';
  static defaultProps = defaultProps;
  state!: TileLayer<DataT>['state'] & {
    hoveredFeatureId: BigInt | number | null;
    highlightColor: number[];
  };

  renderLayers(): Layer | null | LayersList {
    // let _layers = super.renderLayers()?.flat();
    const _layers = [];
    // _layers = highlightBroken(_layers);

    const visibleTiles = this.state.tileset?.tiles.filter((tile: Tile2DHeader) => {
      return tile.isLoaded && tile.content && this.state.tileset!.isTileVisible(tile);
    });
    if (!visibleTiles?.length) {
      return null;
    }
    visibleTiles.sort((a, b) => b.zoom - a.zoom);

    const {zoom} = this.context.viewport;
    // @ts-ignore
    const {getFillColor, aggregation = 5, radiusRange} = this.props;

    const data: any[] = [];
    for (const tile of visibleTiles) {
      // Calculate aggregation based on viewport zoom
      const overZoom = Math.round(zoom - tile.zoom);
      const aggregationLevels = Math.round(aggregation) - overZoom;
      aggregateTile(tile, aggregationLevels);
      data.push(...tile.userData![aggregationLevels]);
    }

    data.sort((a, b) => Number(b.count - a.count));

    let maxTotalWeight = 0;
    for (let d of data) {
      maxTotalWeight = Math.max(maxTotalWeight, d.count);
    }

    const zoomScale = Math.max(1, maxTotalWeight);

    const [radiusMin, radiusMax] = radiusRange;
    const radiusDelta = (radiusMax - radiusMin) / Math.sqrt(zoomScale);
    const props = {
      data,
      dataComparator: (data?: any, oldData?: any) => {
        const newIds = data?.map(tile => tile.id);
        const oldIds = oldData?.map(tile => tile.id);
        // Replace with hash?
        return deepEqual(newIds, oldIds, 1);
      },
      getPosition: d => d.position,
      radiusScale: 1,
      getRadius: d => radiusMin + radiusDelta * Math.sqrt(d.count),
      getFillColor: d => {
        const value = d.count / zoomScale; // Range 0-1
        return getFillColor({properties: {value}});
      },
      radiusUnits: 'pixels'
    };

    const updateTriggers = {
      ...this.props.updateTriggers,
      getRadius: [radiusMin, radiusDelta]
    };

    // TODO implement via renderSubLayers prop?
    // Use GeoJSONLayer?
    const clusters = [
      new ScatterplotLayer({
        ...this.props,
        ...this.getSubLayerProps({id: 'centers', updateTriggers}),
        ...props
      }),
      new TextLayer({
        ...this.props,
        ...this.getSubLayerProps({id: 'labels', updateTriggers}),
        ...props,

        getSize: 16,
        getColor: d => [255, 255, 255],
        outlineColor: [0, 0, 0, 100],
        outlineWidth: 3,
        fontWeight: 'bold',
        fontSettings: {sdf: true, smoothing: 0.2}
      })
    ];

    return [_layers, clusters];
  }

  getPickingInfo(params: GetPickingInfoParams): TileLayerPickingInfo<DataT> {
    const info = params.info as TileLayerPickingInfo<DataT>;
    // if (info.object) {
    //   // TODO don't use __sourceTile (only for debug)
    //   const sourceTile: Tile2DHeader<DataT> = info.object.__sourceTile;
    //   if (info.picked) {
    //     info.tile = sourceTile;
    //   }
    //   info.sourceTile = sourceTile;
    // }
    return info;
  }

  // Use implementation from CompositeLayer
  protected _updateAutoHighlight(info: PickingInfo): void {
    for (const layer of this.getSubLayers()) {
      layer.updateAutoHighlight(info);
    }
  }

  filterSubLayer() {
    return true;
  }
}
