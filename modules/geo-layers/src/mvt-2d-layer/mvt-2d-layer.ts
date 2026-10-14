// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  COORDINATE_SYSTEM,
  type GetPickingInfoParams,
  type UpdateParameters,
  type Layer,
  type PickingInfo
} from '@deck.gl/core';
import {GeoJsonLayer, type GeoJsonLayerProps} from '@deck.gl/layers';
import {ClipExtension} from '@deck.gl/extensions';
import {Matrix4} from '@math.gl/core';
import {worldToLngLat} from '@math.gl/web-mercator';
import {load} from '@loaders.gl/core';
import {MVTWorkerLoader} from '@loaders.gl/mvt';
import {Tile2DLayer, type Tile2DLayerProps} from '../tile-2d-layer/index';
import type {Tile2DHeader, TileLoadProps} from '../tileset-2d/index';
import {getURLFromTemplate} from '../tileset-2d/utils';

/** GeoJSON features decoded in normalized tile-local coordinates. */
export type MVT2DData = Array<any>;
/** MVT rendering props; external tilesets must contain tile-local GeoJSON. */
export type MVT2DLayerProps = Tile2DLayerProps<MVT2DData> &
  Omit<GeoJsonLayerProps, 'data'> & {
    /** Feature property used to match highlights across tile boundaries. */
    uniqueIdProperty?: string;
    /** Explicit feature ID to highlight for this layer. */
    highlightedFeatureId?: string | number | null;
  };

const WORLD_SIZE = 512;
const CLIP_BOUNDS = [0, 0, 1, 1] as const;

const geographicTiles = new WeakMap<MVT2DData, Map<string, MVT2DData>>();

/** Converts local tile geometry without mutating shared decoded content. */
export function getMVTDataInWGS84(
  data: MVT2DData,
  index: {
    /** Horizontal tile index or screen-space position in the enclosing coordinate system. */
    x: number;
    /** Vertical tile index. */
    y: number;
    /** Tile pyramid zoom level. */
    z: number;
  }
): MVT2DData {
  const key = `${index.x}/${index.y}/${index.z}`;
  let cache = geographicTiles.get(data);
  if (!cache) {
    cache = new Map();
    geographicTiles.set(data, cache);
  }
  let converted = cache.get(key);
  if (!converted) {
    const scale = 2 ** index.z;
    const convertCoordinates = (coordinates: any): any => {
      if (typeof coordinates[0] === 'number') {
        const [x, y, ...rest] = coordinates;
        return [
          ...worldToLngLat([
            (WORLD_SIZE * (index.x + x)) / scale,
            WORLD_SIZE * (1 - (index.y + y) / scale)
          ]),
          ...rest
        ];
      }
      return coordinates.map(convertCoordinates);
    };
    const convertGeometry = (geometry: any): any =>
      geometry &&
      (geometry.type === 'GeometryCollection'
        ? {...geometry, geometries: geometry.geometries.map(convertGeometry)}
        : {...geometry, coordinates: convertCoordinates(geometry.coordinates)});
    converted = data.map(feature => ({...feature, geometry: convertGeometry(feature.geometry)}));
    cache.set(key, converted);
  }
  return converted;
}

/** MVT adapter with view-independent decoded data and shared cache ownership. */
export class MVT2DLayer extends Tile2DLayer<
  MVT2DData,
  Omit<MVT2DLayerProps, keyof Tile2DLayerProps>
> {
  /** Layer-local render mode and feature highlighting state. */
  declare state: Tile2DLayer<MVT2DData>['state'] & {
    /** Whether sublayers currently use WGS84 coordinates. */
    geographic?: boolean;
    /** Whether the current view uses globe rendering without planar clipping. */
    globe?: boolean;
    /** Feature ID highlighted by this layer hover interaction. */
    hoveredFeatureId?: string | number | null;
    /** MVT source-layer name associated with the hovered feature. */
    hoveredFeatureLayerName?: string | null;
    /** Color used for this layer highlight. */
    highlightColor?: number[];
  };

  /** Public layer name used by logging and default IDs. */
  static layerName = 'MVT2DLayer';
  /** Default layer property descriptors. */
  static defaultProps: typeof Tile2DLayer.defaultProps = {
    ...GeoJsonLayer.defaultProps,
    ...Tile2DLayer.defaultProps,
    loaders: [MVTWorkerLoader],
    // External cache owners can load tiles before any consumer is initialized.
    fetch: (url, {layer, loadOptions, signal}) =>
      load(url, layer.props.loaders, {
        ...loadOptions,
        core: {...loadOptions?.core, fetch: {...loadOptions?.core?.fetch, signal}}
      }),
    uniqueIdProperty: '',
    highlightedFeatureId: null
  };

  /** Always decode locally so the same cache can serve map and globe consumers. */
  async getTileData(tile: TileLoadProps): Promise<MVT2DData> {
    const {data, fetch, getTileData} = this.props;
    if (getTileData) {
      return Promise.resolve(getTileData(tile) as MVT2DData);
    }
    const url = getURLFromTemplate(data as string | string[] | null, tile);
    if (!url) {
      return Promise.reject(new Error('Invalid MVT URL template'));
    }
    const loadOptions = this.getLoadOptions();
    const tileData = await fetch(url, {
      propName: 'data',
      layer: this,
      signal: tile.signal,
      loadOptions: {
        ...loadOptions,
        mimeType: 'application/x-protobuf',
        mvt: {
          ...loadOptions?.mvt,
          shape: 'geojson-table',
          coordinates: 'local',
          tileIndex: tile.index
        }
      }
    });
    return tileData?.shape === 'geojson-table' ? tileData.features : tileData;
  }

  /** View changes invalidate render geometry, never the shared decoded cache. */
  updateState(params: UpdateParameters<this>): void {
    const geographic = this._usesGeographicCoordinates();
    const globe = Boolean(this.context.viewport.resolution);
    if (this.state.geographic !== geographic || this.state.globe !== globe) {
      this.state.tileLayers.clear();
      this.state.geographic = geographic;
      this.state.globe = globe;
    }
    super.updateState(params);
  }

  /** Uses per-vertex latitude scaling for low-zoom extrusions and globe rendering. */
  private _usesGeographicCoordinates(): boolean {
    const viewport = this.context.viewport;
    return Boolean(viewport.resolution) || Boolean(this.props.extruded && viewport.zoom < 12);
  }

  /** Supplies local transforms/clipping on maps and geographic geometry on globes. */
  renderSubLayers(props: Parameters<Tile2DLayer<MVT2DData>['renderSubLayers']>[0]) {
    if (!props.data) return null;
    const {x, y, z} = props.tile.index;
    const scale = WORLD_SIZE / 2 ** z;
    const geographic = this._usesGeographicCoordinates();
    return super.renderSubLayers({
      ...props,
      autoHighlight: false,
      data: geographic ? getMVTDataInWGS84(props.data, props.tile.index) : props.data,
      modelMatrix: geographic ? new Matrix4() : new Matrix4().scale([scale, -scale, 1]),
      coordinateOrigin: geographic ? [0, 0, 0] : [scale * x, WORLD_SIZE - scale * y, 0],
      coordinateSystem: geographic ? COORDINATE_SYSTEM.LNGLAT : COORDINATE_SYSTEM.CARTESIAN,
      extensions:
        geographic && this.context.viewport.resolution
          ? props.extensions
          : [...(props.extensions || []), new ClipExtension()]
    });
  }

  /** Highlight matching feature IDs across every tile of this consumer. */
  getSubLayerPropsByTile(tile: Tile2DHeader<MVT2DData>, layer?: Layer): Record<string, any> {
    const {uniqueIdProperty, highlightedFeatureId} = this.props;
    const state = this.state;
    const explicit = highlightedFeatureId !== null && highlightedFeatureId !== undefined;
    const featureId = explicit ? highlightedFeatureId : state.hoveredFeatureId;
    const data = Array.isArray(layer?.props.data) ? layer.props.data : tile.content || [];
    const highlightedObjectIndex =
      featureId === null || featureId === undefined
        ? -1
        : data.findIndex(
            feature =>
              (uniqueIdProperty ? feature.properties?.[uniqueIdProperty] : feature.id) ===
                featureId &&
              (explicit || feature.properties?.layerName === state.hoveredFeatureLayerName)
          );
    return {
      clipBounds:
        layer?.props.coordinateSystem === COORDINATE_SYSTEM.LNGLAT && 'west' in tile.bbox
          ? [tile.bbox.west, tile.bbox.south, tile.bbox.east, tile.bbox.north]
          : CLIP_BOUNDS,
      highlightedObjectIndex,
      highlightColor: state.highlightColor || this.props.highlightColor
    };
  }

  /** Keep per-consumer highlight state rather than changing shared tile content. */
  protected _updateAutoHighlight(info: PickingInfo): void {
    const feature = info.object;
    const {uniqueIdProperty} = this.props;
    const highlightColor =
      typeof this.props.highlightColor === 'function'
        ? this.props.highlightColor(info)
        : this.props.highlightColor;
    this.setState({
      hoveredFeatureId: feature
        ? uniqueIdProperty
          ? feature.properties?.[uniqueIdProperty]
          : feature.id
        : null,
      hoveredFeatureLayerName: feature?.properties?.layerName,
      highlightColor
    });
  }

  /** Return geographic picked geometry without changing the cached local feature. */
  getPickingInfo(params: GetPickingInfoParams) {
    const info = super.getPickingInfo(params);
    if (info.object && params.sourceLayer?.props.coordinateSystem === COORDINATE_SYSTEM.CARTESIAN) {
      info.object = getMVTDataInWGS84([info.object], info.sourceTile.index)[0];
    }
    return info;
  }
}
