import {
  CompositeLayer,
  CompositeLayerProps,
  Layer,
  LayersList,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';
import {H3HexagonLayer} from '@deck.gl/geo-layers';
import H3Tileset2D from './h3-tileset-2d';
import SpatialIndexTileLayer from './spatial-index-tile-layer';

const renderSubLayers = props => {
  const {data} = props;
  const {index} = props.tile;
  if (!data || !data.length) return null;

  return new H3HexagonLayer(props, {
    getHexagon: d => d.id,
    centerHexagon: index,
    highPrecision: true
  });
};

const defaultProps: DefaultProps<H3HexagonLayerProps> = {
  aggregationResLevel: 4
};

/** All properties supported by H3TileLayer. */
export type H3TileLayerProps<DataT = any> = _H3TileLayerProps<DataT> & CompositeLayerProps<DataT>;

// TODO: use type from h3-hexagon-layer when available
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type H3HexagonLayerProps<DataT = any> = Record<string, any>;

/** Properties added by H3TileLayer. */
type _H3TileLayerProps<DataT> = H3HexagonLayerProps<DataT> & {
  aggregationResLevel?: number;
};

export default class H3TileLayer<DataT = any, ExtraPropsT = {}> extends CompositeLayer<
  ExtraPropsT & Required<_H3TileLayerProps<DataT>>
> {
  static layerName = 'H3TileLayer';
  static defaultProps = defaultProps;

  state!: {
    tileJSON: any;
    data: any;
  };

  initializeState(): void {
    H3HexagonLayer._checkH3Lib();
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
    const maxZoom = parseInt(tileJSON.maxresolution);
    return [
      new SpatialIndexTileLayer(this.props, {
        id: `h3-tile-layer-${this.props.id}`,
        data,
        // @ts-expect-error Tileset2D should be generic over TileIndex
        TilesetClass: H3Tileset2D,
        renderSubLayers,
        maxZoom
      })
    ];
  }
}
