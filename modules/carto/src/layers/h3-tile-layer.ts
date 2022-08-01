import {
  CompositeLayer,
  CompositeLayerProps,
  Layer,
  LayersList,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';
import {H3HexagonLayer} from '@deck.gl/geo-layers';
import H3Tileset2D, {getHexagonResolution} from './h3-tileset-2d';
import SpatialIndexTileLayer from './spatial-index-tile-layer';

import {binaryToSpatialjson, spatialjsonToBinary} from './schema/spatialjson-utils';
import {binaryToTile, tileToBinary, TileReader} from './schema/carto-spatial-tile';

import Protobuf from 'pbf';
import protobuf from 'protobufjs'; // Remove from final PR
import path from 'path';

let Tile = null;
const root = protobuf.load(
  path.join(__dirname, './carto-spatial-tile.proto'),
  function (err, root) {
    // @ts-ignore
    Tile = root.lookupType('carto.Tile');
  }
);

const renderSubLayers = props => {
  const {data} = props;
  const {index} = props.tile;
  if (!data || !data.length) return null;

  // Try if conversion working
  // To binary
  const binary = spatialjsonToBinary(data);

  // To tile
  const tile = binaryToTile(binary);
  // @ts-ignore
  const pbDoc = Tile.create(tile);
  // @ts-ignore
  const buffer = Tile.encode(pbDoc).finish();

  // Load buffer
  const pbf = new Protobuf(buffer);
  const decodedTile = TileReader.read(pbf);
  // @ts-ignore
  decodedTile.cells.properties = decodedTile.cells.properties.map(({data}) => data);

  // Back to standard data format to display
  // @ts-ignore
  props.data = binaryToSpatialjson(decodedTile);

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
    let minresolution = parseInt(tileJSON.minresolution);
    let maxresolution = parseInt(tileJSON.maxresolution);

    // Convert Mercator zooms provided in props into H3 res levels
    // and clip into valid range provided from the tilejson
    if (this.props.minZoom) {
      minresolution = Math.max(
        minresolution,
        getHexagonResolution({zoom: this.props.minZoom, latitude: 0})
      );
    }
    if (this.props.maxZoom) {
      maxresolution = Math.min(
        maxresolution,
        getHexagonResolution({zoom: this.props.maxZoom, latitude: 0})
      );
    }

    // The naming is unfortunate, but minZoom & maxZoom in the context
    // of a Tileset2D refer to the resolution levels, not the Mercator zooms
    return [
      new SpatialIndexTileLayer(this.props, {
        id: `h3-tile-layer-${this.props.id}`,
        // data,
        data: data.map(url => `${url}&formatTiles=binary`),
        // @ts-expect-error Tileset2D should be generic over TileIndex
        TilesetClass: H3Tileset2D,
        renderSubLayers,
        // minZoom and maxZoom are H3 resolutions, however we must use this naming as that is what the Tileset2D class expects
        minZoom: minresolution,
        maxZoom: maxresolution
      })
    ];
  }
}
