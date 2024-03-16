import {CompositeLayer, CompositeLayerProps, DefaultProps, Layer, LayersList} from '@deck.gl/core';
import RasterLayer, {RasterLayerProps} from './raster-layer';
import QuadbinTileset2D from './quadbin-tileset-2d';
import SpatialIndexTileLayer, {SpatialIndexTileLayerProps} from './spatial-index-tile-layer';
import type {TilejsonResult} from '../sources/types';
import {injectAccessToken, TilejsonPropType} from './utils';
import {DEFAULT_TILE_SIZE} from '../constants';

export const renderSubLayers = props => {
  const tileIndex = props.tile?.index?.q;
  if (!tileIndex) return null;
  return new RasterLayer(props, {tileIndex});
};

const defaultProps: DefaultProps<RasterTileLayerProps> = {
  data: TilejsonPropType,
  tileSize: DEFAULT_TILE_SIZE
};

/** All properties supported by RasterTileLayer. */
export type RasterTileLayerProps<DataT = unknown> = _RasterTileLayerProps<DataT> &
  CompositeLayerProps;

/** Properties added by RasterTileLayer. */
type _RasterTileLayerProps<DataT> = Omit<RasterLayerProps<DataT>, 'data'> &
  Omit<SpatialIndexTileLayerProps<DataT>, 'data'> & {
    data: null | TilejsonResult | Promise<TilejsonResult>;
  };

export default class RasterTileLayer<
  DataT = any,
  ExtraProps extends {} = {}
> extends CompositeLayer<ExtraProps & Required<_RasterTileLayerProps<DataT>>> {
  static layerName = 'RasterTileLayer';
  static defaultProps = defaultProps;

  getLoadOptions(): any {
    const loadOptions = super.getLoadOptions() || {};
    const tileJSON = this.props.data as TilejsonResult;
    injectAccessToken(loadOptions, tileJSON.accessToken);
    return loadOptions;
  }

  renderLayers(): Layer | null | LayersList {
    const tileJSON = this.props.data as TilejsonResult;
    if (!tileJSON) return null;

    const {tiles: data, minzoom: minZoom, maxzoom: maxZoom} = tileJSON;
    return [
      // @ts-ignore
      new SpatialIndexTileLayer(this.props, {
        id: `raster-tile-layer-${this.props.id}`,
        data,
        // TODO: Tileset2D should be generic over TileIndex type
        TilesetClass: QuadbinTileset2D as any,
        renderSubLayers,
        minZoom,
        maxZoom,
        loadOptions: this.getLoadOptions()
      })
    ];
  }
}
