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
import {TilejsonPropType, type CartoTilejsonResult} from '../sources/common';

const renderSubLayers = (props: H3HexagonLayerProps) => {
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
  aggregationResLevel: 4,
  data: TilejsonPropType
};

/** All properties supported by H3TileLayer. */
export type H3TileLayerProps<DataT = any> = _H3TileLayerProps<DataT> & CompositeLayerProps;

// TODO: use type from h3-hexagon-layer when available
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type H3HexagonLayerProps<DataT = any> = Record<string, any>;

/** Properties added by H3TileLayer. */
type _H3TileLayerProps<DataT> = Omit<H3HexagonLayerProps<DataT>, 'data'> & {
  data: null | CartoTilejsonResult | Promise<CartoTilejsonResult>;
  aggregationResLevel?: number;
};

export default class H3TileLayer<DataT = any, ExtraPropsT extends {} = {}> extends CompositeLayer<
  ExtraPropsT & Required<_H3TileLayerProps<DataT>>
> {
  static layerName = 'H3TileLayer';
  static defaultProps = defaultProps;

  initializeState(): void {
    H3HexagonLayer._checkH3Lib();
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
    loadOptions.cartoSpatialTile = {...loadOptions.cartoSpatialTile, scheme: 'h3'};

    return loadOptions;
  }

  renderLayers(): Layer | null | LayersList {
    const tileJSON = this.props.data as CartoTilejsonResult;
    if (!tileJSON) return null;

    const {tiles: data} = tileJSON;
    let {minresolution, maxresolution} = tileJSON;
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
      // @ts-ignore
      new SpatialIndexTileLayer(this.props, {
        id: `h3-tile-layer-${this.props.id}`,
        data,
        // TODO: Tileset2D should be generic over TileIndex type
        TilesetClass: H3Tileset2D as any,
        renderSubLayers,
        // minZoom and maxZoom are H3 resolutions, however we must use this naming as that is what the Tileset2D class expects
        minZoom: minresolution,
        maxZoom: maxresolution,
        loadOptions: this.getLoadOptions()
      })
    ];
  }
}
