import {
  CompositeLayer,
  CompositeLayerProps,
  Layer,
  LayersList,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';
import QuadbinLayer, {QuadbinLayerProps} from './quadbin-layer';
import QuadbinTileset2D from './quadbin-tileset-2d';
import SpatialIndexTileLayer from './spatial-index-tile-layer';
import {hexToBigInt} from 'quadbin';

export const renderSubLayers = props => {
  const {data} = props;
  if (!data || !data.length) return null;
  const isBigInt = typeof data[0].id === 'bigint';
  return new QuadbinLayer(props, {
    getQuadbin: isBigInt ? d => d.id : d => hexToBigInt(d.id)
  });
};

const defaultProps: DefaultProps<QuadbinTileLayerProps> = {
  aggregationResLevel: 6
};

/** All properties supported by QuadbinTileLayer. */
export type QuadbinTileLayerProps<DataT = any> = _QuadbinTileLayerProps<DataT> &
  CompositeLayerProps;

/** Properties added by QuadbinTileLayer. */
type _QuadbinTileLayerProps<DataT> = QuadbinLayerProps<DataT> & {
  data: string;
  aggregationResLevel?: number;
};

export default class QuadbinTileLayer<
  DataT = any,
  ExtraProps extends {} = {}
> extends CompositeLayer<ExtraProps & Required<_QuadbinTileLayerProps<DataT>>> {
  static layerName = 'QuadbinTileLayer';
  static defaultProps = defaultProps;

  state!: {
    tileJSON: any;
    data: any;
  };
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

  renderLayers(): Layer | null | LayersList {
    const {data, tileJSON} = this.state;
    const maxZoom = parseInt(tileJSON?.maxresolution);
    return [
      new SpatialIndexTileLayer(this.props, {
        id: `quadbin-tile-layer-${this.props.id}`,
        data,
        // TODO: Tileset2D should be generic over TileIndex type
        TilesetClass: QuadbinTileset2D as any,
        renderSubLayers,
        maxZoom,
        loadOptions: {
          ...this.getLoadOptions(),
          cartoSpatialTile: {scheme: 'quadbin'},
          mimeType: 'application/vnd.carto-spatial-tile'
        }
      })
    ];
  }
}
