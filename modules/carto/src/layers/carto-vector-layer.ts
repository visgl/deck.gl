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
import type {CartoTilejsonResult} from '../sources/common';

const defaultTileFormat = TILE_FORMATS.BINARY;

export const tilejsonType = {
  type: 'object' as const,
  value: null as Promise<CartoTilejsonResult> | null,
  validate: (value, propType) =>
    (propType.optional && value === null) ||
    (typeof value === 'object' &&
      Array.isArray(value.tiles) &&
      value.tiles.every(url => typeof url === 'string')),
  compare: 2,
  async: true
};

const defaultProps: DefaultProps<CartoVectorLayerProps> = {
  ...MVTLayer.defaultProps,
  data: tilejsonType,
  formatTiles: defaultTileFormat
};

/** All properties supported by CartoVectorLayer. */
export type CartoVectorLayerProps = _CartoVectorLayerProps & Omit<MVTLayerProps, 'data'>;

/** Properties added by CartoVectorLayer. */
type _CartoVectorLayerProps = {
  data: Promise<CartoTilejsonResult> | null;
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
export default class CartoVectorLayer<ExtraProps extends {} = {}> extends MVTLayer<
  Required<_CartoVectorLayerProps> & ExtraProps
> {
  static layerName = 'CartoVectorLayer';
  static defaultProps = defaultProps;

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
    // Insert access token if not specified
    const loadOptions = super.getLoadOptions() || {};
    // @ts-ignore
    const {accessToken} = this.props.data;
    if (!loadOptions?.fetch?.headers?.Authorization) {
      loadOptions.fetch = {
        ...loadOptions.fetch,
        headers: {...loadOptions.fetch?.headers, Authorization: `Bearer ${accessToken}`}
      };
    }

    // Use binary for MVT loading
    loadOptions.gis = {format: 'binary'};
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
