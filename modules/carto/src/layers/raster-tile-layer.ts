import {CompositeLayer, CompositeLayerProps, DefaultProps, Layer, LayersList} from '@deck.gl/core';
import RasterLayer, {RasterLayerProps} from './raster-layer';
import QuadbinTileset2D from './quadbin-tileset-2d';
import SpatialIndexTileLayer from './spatial-index-tile-layer';
import {TilejsonPropType, type CartoTilejsonResult} from '../sources/common';

export const renderSubLayers = props => {
  const tileIndex = props.tile?.index?.q;
  if (!tileIndex) return null;
  return new RasterLayer(props, {tileIndex});
};

const defaultProps: DefaultProps<RasterTileLayerProps> = {
  data: TilejsonPropType
};

/** All properties supported by RasterTileLayer. */
export type RasterTileLayerProps<DataT = any> = _RasterTileLayerProps<DataT> & CompositeLayerProps;

/** Properties added by RasterTileLayer. */
type _RasterTileLayerProps<DataT> = Omit<RasterLayerProps<DataT>, 'data'> & {
  data: null | CartoTilejsonResult | Promise<CartoTilejsonResult>;
};

export default class RasterTileLayer<
  DataT = any,
  ExtraProps extends {} = {}
> extends CompositeLayer<ExtraProps & Required<_RasterTileLayerProps<DataT>>> {
  static layerName = 'RasterTileLayer';
  static defaultProps = {};

  state!: {tileJSON: any; data: any};
  initializeState(): void {
    this.setState({data: null, tileJSON: null});
  }

  updateState({changeFlags}: UpdateParameters<this>): void {
    if (changeFlags.dataChanged) {
      let {data} = this.props;
      const tileJSON = data;
      data = (tileJSON as any).tiles;
      this.setState({data, tileJSON});
    }
  }

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
