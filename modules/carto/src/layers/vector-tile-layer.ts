import {registerLoaders} from '@loaders.gl/core';
import CartoPropertiesTileLoader from './schema/carto-properties-tile-loader';
import CartoVectorTileLoader from './schema/carto-vector-tile-loader';
registerLoaders([CartoPropertiesTileLoader, CartoVectorTileLoader]);

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
import type {BinaryFeatureCollection} from '@loaders.gl/schema';
import type {Feature} from 'geojson';

import type {TilejsonResult} from '../sources/types';
import {TilejsonPropType, injectAccessToken, mergeBoundaryData} from './utils';

const defaultProps: DefaultProps<VectorTileLayerProps> = {
  ...MVTLayer.defaultProps,
  data: TilejsonPropType
};

/** All properties supported by VectorTileLayer. */
export type VectorTileLayerProps = _VectorTileLayerProps & Omit<MVTLayerProps, 'data'>;

/** Properties added by VectorTileLayer. */
type _VectorTileLayerProps = {
  data: null | TilejsonResult | Promise<TilejsonResult>;
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
    this.setState({binary: true});
  }

  updateState(parameters) {
    const {props} = parameters;
    if (props.data) {
      super.updateState(parameters);

      const formatTiles = new URL(props.data.tiles[0]).searchParams.get('formatTiles');
      const mvt = formatTiles === 'mvt';
      this.setState({mvt});
    }
  }

  getLoadOptions(): any {
    const loadOptions = super.getLoadOptions() || {};
    const tileJSON = this.props.data as TilejsonResult;
    injectAccessToken(loadOptions, tileJSON.accessToken);
    loadOptions.gis = {format: 'binary'}; // Use binary for MVT loading
    return loadOptions;
  }

  async getTileData(tile: TileLoadProps) {
    const tileJSON = this.props.data as CartoTilejsonResult;
    const {tiles, properties_tiles} = tileJSON;
    const url = _getURLFromTemplate(tiles, tile);
    if (!url) {
      return Promise.reject('Invalid URL');
    }

    const loadOptions = this.getLoadOptions();
    const {fetch} = this.props;
    const {signal} = tile;

    // Fetch geometry and attributes separately
    const geometryFetch = fetch(url, {propName: 'data', layer: this, loadOptions, signal});

    if (!properties_tiles) {
      return await geometryFetch;
    }

    const propertiesUrl = _getURLFromTemplate(properties_tiles, tile);
    if (!propertiesUrl) {
      return Promise.reject('Invalid properties URL');
    }

    const attributesFetch = fetch(propertiesUrl, {
      propName: 'data',
      layer: this,
      loadOptions,
      signal
    });
    const [geometry, attributes] = await Promise.all([geometryFetch, attributesFetch]);
    if (!geometry) return null;

    return mergeBoundaryData(geometry, attributes);
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
      info.object = binaryToGeojson(data as BinaryFeatureCollection, {
        globalFeatureId: info.index
      }) as Feature;
    }

    return info;
  }
}
