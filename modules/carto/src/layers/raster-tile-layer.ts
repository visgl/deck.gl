import {
  CompositeLayer,
  CompositeLayerProps,
  Layer,
  LayersList,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';
import RasterLayer, {RasterLayerProps} from './raster-layer';
import QuadbinTileset2D from './quadbin-tileset-2d';
import SpatialIndexTileLayer from './spatial-index-tile-layer';
import {hexToBigInt} from 'quadbin';

export const renderSubLayers = props => {
  return new RasterLayer(props);
};

/** All properties supported by RasterTileLayer. */
export type RasterTileLayerProps<DataT = any> = _RasterTileLayerProps<DataT> & CompositeLayerProps;

/** Properties added by RasterTileLayer. */
type _RasterTileLayerProps<DataT> = RasterLayerProps<DataT> & {
  data: string;
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

  renderLayers(): Layer | null | LayersList {
    const {data, tileJSON} = this.state;
    const maxZoom = parseInt(tileJSON?.maxresolution);
    return [
      new SpatialIndexTileLayer(this.props, {
        id: `raster-tile-layer-${this.props.id}`,
        data,
        // TODO: Tileset2D should be generic over TileIndex type
        TilesetClass: QuadbinTileset2D as any,
        renderSubLayers,
        // HACK while server broken
        minZoom: 7,
        maxZoom: 7
      })
    ];
  }
}
