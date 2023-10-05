import {registerLoaders} from '@loaders.gl/core';
import CartoVectorTileLoader from './schema/carto-vector-tile-loader';
registerLoaders([CartoVectorTileLoader]);

import {DefaultProps} from '@deck.gl/core';
import {ClipExtension} from '@deck.gl/extensions';
import {
  MVTLayer,
  MVTLayerProps,
  TileLayer,
  _getURLFromTemplate,
  _Tile2DHeader,
  _TileLoadProps as TileLoadProps
} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {binaryToGeojson} from '@loaders.gl/gis';
import type {BinaryFeatures} from '@loaders.gl/schema';
import {TileFormat, TILE_FORMATS} from '../api/maps-api-common';
import type {Feature} from 'geojson';
import {TilejsonPropType, CartoTilejsonResult} from '../sources/common';
import {injectAccessToken} from './utils';

const defaultTileFormat = TILE_FORMATS.BINARY;

const defaultProps: DefaultProps<VectorTileLayerProps> = {
  ...MVTLayer.defaultProps,
  data: TilejsonPropType,
  formatTiles: defaultTileFormat
};

/** All properties supported by VectorTileLayer. */
export type VectorTileLayerProps = _VectorTileLayerProps & Omit<MVTLayerProps, 'data'>;

/** Properties added by VectorTileLayer. */
type _VectorTileLayerProps = {
  data: null | CartoTilejsonResult | Promise<CartoTilejsonResult>;
  /** Use to override the default tile data format.
   *
   * Possible values are: `TILE_FORMATS.BINARY`, `TILE_FORMATS.GEOJSON` and `TILE_FORMATS.MVT`.
   *
   * Only supported when `apiVersion` is `API_VERSIONS.V3` and `format` is `FORMATS.TILEJSON`.
   */
  formatTiles?: TileFormat;
};

// TODO Perhaps we can't subclass MVTLayer and keep types. Better to subclass TileLayer instead?
// @ts-ignore
export default class VectorTileLayer<ExtraProps extends {} = {}> extends MVTLayer<
  Required<_VectorTileLayerProps> & ExtraProps
> {
  static layerName = 'VectorTileLayer';
  static defaultProps = defaultProps;

  state!: MVTLayer['state'] & {
    mvt: boolean;
  };

  initializeState(): void {
    super.initializeState();
    const binary = this.props.formatTiles === TILE_FORMATS.BINARY || TILE_FORMATS.MVT;
    this.setState({binary});
  }

  updateState(parameters) {
    const {props} = parameters;
    if (props.data) {
      super.updateState(parameters);

      const formatTiles = new URL(props.data.tiles[0]).searchParams.get('formatTiles');
      const mvt = formatTiles === TILE_FORMATS.MVT;
      this.setState({mvt});
    }
  }

  getLoadOptions(): any {
    const loadOptions = super.getLoadOptions() || {};
    const tileJSON = this.props.data as CartoTilejsonResult;
    injectAccessToken(loadOptions, tileJSON.accessToken);
    loadOptions.gis = {format: 'binary'}; // Use binary for MVT loading
    return loadOptions;
  }

  getTileData(tile: TileLoadProps) {
    const url = _getURLFromTemplate(this.state.data, tile);
    if (!url) {
      return Promise.reject('Invalid URL');
    }

    const loadOptions = this.getLoadOptions();
    const {fetch} = this.props;
    const {signal} = tile;
    return fetch(url, {propName: 'data', layer: this, loadOptions, signal});
  }

  renderSubLayers(
    props: TileLayer['props'] & {
      id: string;
      data: any;
      _offset: number;
      tile: _Tile2DHeader;
    }
  ): GeoJsonLayer | null {
    if (props.data === null) {
      return null;
    }

    if (this.state.mvt) {
      return super.renderSubLayers(props) as GeoJsonLayer;
    }

    const tileBbox = props.tile.bbox as any;
    const {west, south, east, north} = tileBbox;

    const subLayerProps = {
      ...props,
      autoHighlight: false,
      extensions: [new ClipExtension(), ...(props.extensions || [])],
      clipBounds: [west, south, east, north]
    };

    const subLayer = new GeoJsonLayer(subLayerProps);
    return subLayer;
  }

  getPickingInfo(params) {
    const info = super.getPickingInfo(params);

    if (this.state.binary && info.index !== -1) {
      const {data} = params.sourceLayer!.props;
      info.object = binaryToGeojson(data as BinaryFeatures, {
        globalFeatureId: info.index
      }) as Feature;
    }

    return info;
  }
}
