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

const renderSubLayers = props => {
  const {data} = props;
  if (!data || !data.length) return null;
  return new QuadbinLayer(props, {
    getQuadbin: d => d.id
  });
};

const defaultProps: DefaultProps<QuadbinTileLayerProps> = {
  aggregationResLevel: 6
};

/** All properties supported by QuadbinTileLayer. */
export type QuadbinTileLayerProps<DataT = any> = _QuadbinTileLayerProps<DataT> &
  CompositeLayerProps<DataT>;

/** Properties added by QuadbinTileLayer. */
type _QuadbinTileLayerProps<DataT> = QuadbinLayerProps<DataT> & {
  aggregationResLevel?: number;
};

export default class QuadbinTileLayer<DataT = any, ExtraProps = {}> extends CompositeLayer<
  ExtraProps & Required<_QuadbinTileLayerProps<DataT>>
> {
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
        maxZoom
      })
    ];
  }
}
