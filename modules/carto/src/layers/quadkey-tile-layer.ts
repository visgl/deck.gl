import {
  CompositeLayer,
  CompositeLayerProps,
  Layer,
  LayersList,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';
import {QuadkeyLayer, QuadkeyLayerProps} from '@deck.gl/geo-layers';
import QuadkeyTileset2D from './quadkey-tileset-2d';
import SpatialIndexTileLayer from './spatial-index-tile-layer';

const renderSubLayers = props => {
  const {data} = props;
  if (!data || !data.length) return null;
  return new QuadkeyLayer(props, {getQuadkey: d => d.id});
};

const defaultProps: DefaultProps<QuadkeyTileLayerProps> = {
  aggregationResLevel: 6
};

/** All properties supported by QuadkeyTileLayer. */
export type QuadkeyTileLayerProps<DataT = any> = _QuadkeyTileLayerProps<DataT> &
  CompositeLayerProps<DataT>;

/** Properties added by QuadkeyTileLayer. */
type _QuadkeyTileLayerProps<DataT> = QuadkeyLayerProps<DataT> & {
  aggregationResLevel?: number;
};

export default class QuadkeyTileLayer<DataT = any, ExtraProps = {}> extends CompositeLayer<
  ExtraProps & Required<_QuadkeyTileLayerProps<DataT>>
> {
  static layerName = 'QuadkeyTileLayer';
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
        id: `quadkey-tile-layer-${this.props.id}`,
        data,
        // TODO: Tileset2D should be generic over TileIndex type
        TilesetClass: QuadkeyTileset2D as any,
        renderSubLayers,
        maxZoom
      })
    ];
  }
}
