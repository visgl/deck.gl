import {CompositeLayer, CompositeLayerProps, Layer, LayersList, DefaultProps} from '@deck.gl/core';
import QuadbinLayer, {QuadbinLayerProps} from './quadbin-layer';
import QuadbinTileset2D from './quadbin-tileset-2d';
import SpatialIndexTileLayer from './spatial-index-tile-layer';
import {hexToBigInt} from 'quadbin';
import {TilejsonPropType, type CartoTilejsonResult} from '../sources/common';

export const renderSubLayers = props => {
  const {data} = props;
  if (!data || !data.length) return null;
  const isBigInt = typeof data[0].id === 'bigint';
  return new QuadbinLayer(props, {
    getQuadbin: isBigInt ? d => d.id : d => hexToBigInt(d.id)
  });
};

const defaultProps: DefaultProps<QuadbinTileLayerProps> = {
  aggregationResLevel: 6,
  data: TilejsonPropType
};

/** All properties supported by QuadbinTileLayer. */
export type QuadbinTileLayerProps<DataT = any> = _QuadbinTileLayerProps<DataT> &
  CompositeLayerProps;

/** Properties added by QuadbinTileLayer. */
type _QuadbinTileLayerProps<DataT> = Omit<QuadbinLayerProps<DataT>, 'data'> & {
  data: null | CartoTilejsonResult | Promise<CartoTilejsonResult>;
  aggregationResLevel?: number;
};

export default class QuadbinTileLayer<
  DataT = any,
  ExtraProps extends {} = {}
> extends CompositeLayer<ExtraProps & Required<_QuadbinTileLayerProps<DataT>>> {
  static layerName = 'QuadbinTileLayer';
  static defaultProps = defaultProps;

  getLoadOptions(): any {
    // Insert access token if not specified
    const loadOptions = super.getLoadOptions() || {};
    const tileJSON = this.props.data as CartoTilejsonResult;
    const {accessToken} = tileJSON;
    if (!loadOptions?.fetch?.headers?.Authorization) {
      loadOptions.fetch = {
        ...loadOptions.fetch,
        headers: {...loadOptions.fetch?.headers, Authorization: `Bearer ${accessToken}`}
      };
    }

    return loadOptions;
  }

  renderLayers(): Layer | null | LayersList {
    const tileJSON = this.props.data as CartoTilejsonResult;
    if (!tileJSON) return null;

    const maxZoom = tileJSON.maxresolution;
    return [
      // @ts-ignore
      new SpatialIndexTileLayer(this.props, {
        id: `quadbin-tile-layer-${this.props.id}`,
        data: tileJSON.tiles,
        // TODO: Tileset2D should be generic over TileIndex type
        TilesetClass: QuadbinTileset2D as any,
        renderSubLayers,
        maxZoom,
        loadOptions: {
          ...this.getLoadOptions(),
          cartoSpatialTile: {scheme: 'quadbin'}
        }
      })
    ];
  }
}
