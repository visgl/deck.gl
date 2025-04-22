// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {registerLoaders} from '@loaders.gl/core';
import {BinaryFeatureCollection, BinaryPointFeature} from '@loaders.gl/schema';
import CartoPropertiesTileLoader from './schema/carto-properties-tile-loader';
import CartoVectorTileLoader from './schema/carto-vector-tile-loader';
registerLoaders([CartoPropertiesTileLoader, CartoVectorTileLoader]);

import {DefaultProps, Layer, LayersList} from '@deck.gl/core';
import {ClipExtension, CollisionFilterExtension} from '@deck.gl/extensions';
import {
  MVTLayer,
  MVTLayerProps,
  TileLayer,
  _getURLFromTemplate,
  _Tile2DHeader,
  _TileLoadProps as TileLoadProps,
  GeoBoundingBox
} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';

import type {TilejsonResult} from '@carto/api-client';
import {TilejsonPropType, mergeLoadOptions, mergeBoundaryData} from './utils';
import {DEFAULT_TILE_SIZE} from '../constants';
import {createPointsFromLines, createPointsFromPolygons} from './label-utils';
import {createEmptyBinary} from '../utils';
import PointLabelLayer from './point-label-layer';

const defaultProps: DefaultProps<VectorTileLayerProps> = {
  ...MVTLayer.defaultProps,
  autoLabels: false,
  data: TilejsonPropType,
  dataComparator: TilejsonPropType.equal,
  tileSize: DEFAULT_TILE_SIZE
};

/** All properties supported by VectorTileLayer. */
export type VectorTileLayerProps<FeaturePropertiesT = unknown> = _VectorTileLayerProps &
  Omit<MVTLayerProps<FeaturePropertiesT>, 'data'>;

/** Properties added by VectorTileLayer. */
type _VectorTileLayerProps = {
  data: null | TilejsonResult | Promise<TilejsonResult>;

  /**
   * If true, create labels for lines and polygons.
   * Specify uniqueIdProperty to only create a single label for each unique feature.
   */
  autoLabels?: boolean | {uniqueIdProperty: string};
};

// @ts-ignore
export default class VectorTileLayer<
  FeaturePropertiesT = any,
  ExtraProps extends {} = {}
> extends MVTLayer<FeaturePropertiesT, Required<_VectorTileLayerProps> & ExtraProps> {
  static layerName = 'VectorTileLayer';
  static defaultProps = defaultProps;

  state!: MVTLayer['state'] & {
    mvt: boolean;
  };

  constructor(...propObjects: VectorTileLayerProps<FeaturePropertiesT>[]) {
    // Force externally visible props type, as it is not possible modify via extension
    // @ts-ignore
    super(...propObjects);
  }

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
    const tileJSON = this.props.data as TilejsonResult;
    return mergeLoadOptions(super.getLoadOptions(), {
      fetch: {headers: {Authorization: `Bearer ${tileJSON.accessToken}`}},
      gis: {format: 'binary'} // Use binary for MVT loading
    });
  }

  /* eslint-disable camelcase */
  async getTileData(tile: TileLoadProps) {
    const tileJSON = this.props.data as TilejsonResult;
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

    return attributes ? mergeBoundaryData(geometry, attributes) : geometry;
  }
  /* eslint-enable camelcase */

  renderSubLayers(
    props: VectorTileLayer['props'] & {
      id: string;
      data: any;
      _offset: number;
      tile: _Tile2DHeader;
    }
  ): GeoJsonLayer | GeoJsonLayer[] | null {
    if (props.data === null) {
      return null;
    }

    const tileBbox = props.tile.bbox as GeoBoundingBox;

    const subLayers: GeoJsonLayer[] = [];

    const defaultToPointLabelLayer = {
      'points-text': {
        type: PointLabelLayer,
        ...props?._subLayerProps?.['points-text'],
        extensions: [
          new CollisionFilterExtension(),
          ...(props.extensions || []),
          ...(props?._subLayerProps?.['points-text']?.extensions || [])
        ]
      }
    };

    if (this.state.mvt) {
      subLayers.push(super.renderSubLayers(props) as GeoJsonLayer);
    } else {
      const {west, south, east, north} = tileBbox;

      const extensions = [new ClipExtension(), ...(props.extensions || [])];
      const clipProps = {
        clipBounds: [west, south, east, north]
      };

      const applyClipExtensionToSublayerProps = (subLayerId: string) => {
        return {
          [subLayerId]: {
            ...clipProps,
            ...props?._subLayerProps?.[subLayerId],
            extensions: [...extensions, ...(props?._subLayerProps?.[subLayerId]?.extensions || [])]
          }
        };
      };

      const subLayerProps = {
        ...props,
        data: {...props.data, tileBbox},
        autoHighlight: false,
        // Do not perform clipping on points (#9059)
        _subLayerProps: {
          ...props._subLayerProps,
          ...defaultToPointLabelLayer,
          ...applyClipExtensionToSublayerProps('polygons-fill'),
          ...applyClipExtensionToSublayerProps('polygons-stroke'),
          ...applyClipExtensionToSublayerProps('linestrings')
        }
      };

      subLayers.push(new GeoJsonLayer(subLayerProps));
    }

    // Add labels
    if (subLayers[0] && props.autoLabels) {
      const labelData = createEmptyBinary();
      if (props.data.lines && props.data.lines.positions.value.length > 0) {
        labelData.points = createPointsFromLines(
          props.data.lines,
          typeof props.autoLabels === 'object' ? props.autoLabels.uniqueIdProperty : undefined
        ) as BinaryPointFeature;
      }
      if (props.data.polygons && props.data.polygons.positions.value.length > 0) {
        labelData.points = createPointsFromPolygons(props.data.polygons, tileBbox, props);
      }

      subLayers.push(
        subLayers[0].clone({
          id: `${props.id}-labels`,
          data: labelData,
          pickable: false,
          autoHighlight: false
        })
      );
    }
    return subLayers;
  }

  renderLayers(): Layer | null | LayersList {
    const layers = super.renderLayers() as LayersList;
    if (!this.props.autoLabels) {
      return layers;
    }

    // Sort layers so that label layers are rendered after the main layer
    const validLayers = layers.flat().filter(Boolean) as Layer[];
    validLayers.sort((a: Layer, b: Layer) => {
      const aHasLabel = a.id.includes('labels');
      const bHasLabel = b.id.includes('labels');
      if (aHasLabel && !bHasLabel) return 1;
      if (!aHasLabel && bHasLabel) return -1;
      return 0;
    });
    return validLayers.map(l =>
      l.id.includes('labels') ? l.clone({highlightedObjectIndex: -1}) : l
    );
  }

  protected override _isWGS84(): boolean {
    // CARTO binary tile coordinates are [lng, lat], not tile-relative like MVT.
    if (this.state.mvt) return super._isWGS84();
    return true;
  }
}
