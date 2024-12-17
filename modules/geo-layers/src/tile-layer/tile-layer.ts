// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  CompositeLayer,
  CompositeLayerProps,
  Layer,
  LayerProps,
  UpdateParameters,
  PickingInfo,
  GetPickingInfoParams,
  DefaultProps,
  FilterContext,
  _flatten as flatten
} from '@deck.gl/core';
import {GeoJsonLayer} from '@deck.gl/layers';
import {LayersList} from '@deck.gl/core';

import type {TileLoadProps, ZRange} from '../tileset-2d/index';
import {
  Tileset2D,
  Tile2DHeader,
  RefinementStrategy,
  STRATEGY_DEFAULT,
  Tileset2DProps
} from '../tileset-2d/index';
import {urlType, URLTemplate, getURLFromTemplate} from '../tileset-2d/index';

const defaultProps: DefaultProps<TileLayerProps> = {
  TilesetClass: Tileset2D,
  data: {type: 'data', value: []},
  dataComparator: urlType.equal,
  renderSubLayers: {type: 'function', value: (props: any) => new GeoJsonLayer(props)},
  getTileData: {type: 'function', optional: true, value: null},
  // TODO - change to onViewportLoad to align with Tile3DLayer
  onViewportLoad: {type: 'function', optional: true, value: null},
  onTileLoad: {type: 'function', value: tile => {}},
  onTileUnload: {type: 'function', value: tile => {}},
  // eslint-disable-next-line
  onTileError: {type: 'function', value: err => console.error(err)},
  extent: {type: 'array', optional: true, value: null, compare: true},
  tileSize: 512,
  maxZoom: null,
  minZoom: 0,
  maxCacheSize: null,
  maxCacheByteSize: null,
  refinementStrategy: STRATEGY_DEFAULT,
  zRange: null,
  maxRequests: 6,
  debounceTime: 0,
  zoomOffset: 0
};

/** All props supported by the TileLayer */
export type TileLayerProps<DataT = unknown> = CompositeLayerProps & _TileLayerProps<DataT>;

/** Props added by the TileLayer */
type _TileLayerProps<DataT> = {
  data: URLTemplate;
  /**
   * Optionally implement a custom indexing scheme.
   */
  TilesetClass?: typeof Tileset2D;
  /**
   * Renders one or an array of Layer instances.
   */
  renderSubLayers?: (
    props: TileLayerProps<DataT> & {
      id: string;
      data: DataT;
      _offset: number;
      tile: Tile2DHeader<DataT>;
    }
  ) => Layer | null | LayersList;
  /**
   * If supplied, `getTileData` is called to retrieve the data of each tile.
   */
  getTileData?: ((props: TileLoadProps) => Promise<DataT> | DataT) | null;

  /** Called when all tiles in the current viewport are loaded. */
  onViewportLoad?: ((tiles: Tile2DHeader<DataT>[]) => void) | null;

  /** Called when a tile successfully loads. */
  onTileLoad?: (tile: Tile2DHeader<DataT>) => void;

  /** Called when a tile is cleared from cache. */
  onTileUnload?: (tile: Tile2DHeader<DataT>) => void;

  /** Called when a tile failed to load. */
  onTileError?: (err: any, tile?) => void;

  /** The bounding box of the layer's data. */
  extent?: number[] | null;

  /** The pixel dimension of the tiles, usually a power of 2. */
  tileSize?: number;

  /** The max zoom level of the layer's data.
   * @default null
   */
  maxZoom?: number | null;

  /** The min zoom level of the layer's data.
   * @default 0
   */
  minZoom?: number | null;

  /** The maximum number of tiles that can be cached. */
  maxCacheSize?: number | null;

  /**
   * The maximum memory used for caching tiles.
   *
   * @default null
   */
  maxCacheByteSize?: number | null;

  /**
   * How the tile layer refines the visibility of tiles.
   *
   * @default 'best-available'
   */
  refinementStrategy?: RefinementStrategy;

  /** Range of minimum and maximum heights in the tile. */
  zRange?: ZRange | null;

  /**
   * The maximum number of concurrent getTileData calls.
   *
   * @default 6
   */
  maxRequests?: number;

  /**
   * Queue tile requests until no new tiles have been requested for at least `debounceTime` milliseconds.
   *
   * @default 0
   */
  debounceTime?: number;

  /**
   * This offset changes the zoom level at which the tiles are fetched.
   *
   * Needs to be an integer.
   *
   * @default 0
   */
  zoomOffset?: number;
};

export type TileLayerPickingInfo<
  DataT = any,
  SubLayerPickingInfo = PickingInfo
> = SubLayerPickingInfo & {
  /** The picked tile */
  tile?: Tile2DHeader<DataT>;
  /** the tile that emitted the picking event */
  sourceTile: Tile2DHeader<DataT>;
  /** a layer created by props.renderSubLayer() that emitted the picking event */
  sourceTileSubLayer: Layer;
};

/**
 * The TileLayer is a composite layer that makes it possible to visualize very large datasets.
 *
 * Instead of fetching the entire dataset, it only loads and renders what's visible in the current viewport.
 */
export default class TileLayer<DataT = any, ExtraPropsT extends {} = {}> extends CompositeLayer<
  ExtraPropsT & Required<_TileLayerProps<DataT>>
> {
  static defaultProps: DefaultProps = defaultProps;
  static layerName = 'TileLayer';

  state!: {
    tileset: Tileset2D | null;
    isLoaded: boolean;
    frameNumber?: number;
  };

  initializeState() {
    this.state = {
      tileset: null,
      isLoaded: false
    };
  }

  finalizeState() {
    this.state?.tileset?.finalize();
  }

  get isLoaded(): boolean {
    return Boolean(
      this.state?.tileset?.selectedTiles?.every(
        tile => tile.isLoaded && tile.layers && tile.layers.every(layer => layer.isLoaded)
      )
    );
  }

  shouldUpdateState({changeFlags}): boolean {
    return changeFlags.somethingChanged;
  }

  updateState({changeFlags}: UpdateParameters<this>) {
    let {tileset} = this.state;
    const propsChanged = changeFlags.propsOrDataChanged || changeFlags.updateTriggersChanged;
    const dataChanged =
      changeFlags.dataChanged ||
      (changeFlags.updateTriggersChanged &&
        (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getTileData));

    if (!tileset) {
      tileset = new this.props.TilesetClass(this._getTilesetOptions());
      this.setState({tileset});
    } else if (propsChanged) {
      tileset.setOptions(this._getTilesetOptions());

      if (dataChanged) {
        // reload all tiles
        // use cached layers until new content is loaded
        tileset.reloadAll();
      } else {
        // some render options changed, regenerate sub layers now
        tileset.tiles.forEach(tile => {
          tile.layers = null;
        });
      }
    }

    this._updateTileset();
  }

  _getTilesetOptions(): Tileset2DProps {
    const {
      tileSize,
      maxCacheSize,
      maxCacheByteSize,
      refinementStrategy,
      extent,
      maxZoom,
      minZoom,
      maxRequests,
      debounceTime,
      zoomOffset
    } = this.props;

    return {
      maxCacheSize,
      maxCacheByteSize,
      maxZoom,
      minZoom,
      tileSize,
      refinementStrategy,
      extent,
      maxRequests,
      debounceTime,
      zoomOffset,

      getTileData: this.getTileData.bind(this),
      onTileLoad: this._onTileLoad.bind(this),
      onTileError: this._onTileError.bind(this),
      onTileUnload: this._onTileUnload.bind(this)
    };
  }

  private _updateTileset(): void {
    const tileset = this.state.tileset!;
    const {zRange, modelMatrix} = this.props;
    const frameNumber = tileset.update(this.context.viewport, {zRange, modelMatrix});
    const {isLoaded} = tileset;

    const loadingStateChanged = this.state.isLoaded !== isLoaded;
    const tilesetChanged = this.state.frameNumber !== frameNumber;

    if (isLoaded && (loadingStateChanged || tilesetChanged)) {
      this._onViewportLoad();
    }

    if (tilesetChanged) {
      // Save the tileset frame number - trigger a rerender
      this.setState({frameNumber});
    }
    // Save the loaded state - should not trigger a rerender
    this.state.isLoaded = isLoaded;
  }

  _onViewportLoad(): void {
    const {tileset} = this.state;
    const {onViewportLoad} = this.props;

    if (onViewportLoad) {
      // This method can only be called when tileset is defined and updated
      onViewportLoad(tileset!.selectedTiles!);
    }
  }

  _onTileLoad(tile: Tile2DHeader<DataT>): void {
    this.props.onTileLoad(tile);
    tile.layers = null;

    this.setNeedsUpdate();
  }

  _onTileError(error: any, tile: Tile2DHeader<DataT>) {
    this.props.onTileError(error);
    tile.layers = null;

    this.setNeedsUpdate();
  }

  _onTileUnload(tile: Tile2DHeader<DataT>) {
    this.props.onTileUnload(tile);
  }

  // Methods for subclass to override

  getTileData(tile: TileLoadProps): Promise<DataT> | DataT | null {
    const {data, getTileData, fetch} = this.props;
    const {signal} = tile;

    tile.url =
      typeof data === 'string' || Array.isArray(data) ? getURLFromTemplate(data, tile) : null;

    if (getTileData) {
      return getTileData(tile);
    }
    if (fetch && tile.url) {
      return fetch(tile.url, {propName: 'data', layer: this, signal});
    }
    return null;
  }

  renderSubLayers(
    props: TileLayer['props'] & {
      id: string;
      data: DataT;
      _offset: number;
      tile: Tile2DHeader<DataT>;
    }
  ): Layer | null | LayersList {
    return this.props.renderSubLayers(props);
  }

  getSubLayerPropsByTile(tile: Tile2DHeader): Partial<LayerProps> | null {
    return null;
  }

  getPickingInfo(params: GetPickingInfoParams): TileLayerPickingInfo<DataT> {
    // TileLayer does not directly render anything, sourceLayer cannot be null
    const sourceLayer = params.sourceLayer!;
    const sourceTile: Tile2DHeader<DataT> = (sourceLayer.props as any).tile;
    const info = params.info as TileLayerPickingInfo<DataT>;
    if (info.picked) {
      info.tile = sourceTile;
    }
    info.sourceTile = sourceTile;
    info.sourceTileSubLayer = sourceLayer;
    return info;
  }

  protected _updateAutoHighlight(info: TileLayerPickingInfo<DataT>): void {
    info.sourceTileSubLayer.updateAutoHighlight(info);
  }

  renderLayers(): Layer | null | LayersList {
    return this.state.tileset!.tiles.map((tile: Tile2DHeader) => {
      const subLayerProps = this.getSubLayerPropsByTile(tile);
      // cache the rendered layer in the tile
      if (!tile.isLoaded && !tile.content) {
        // nothing to show
      } else if (!tile.layers) {
        const layers = this.renderSubLayers({
          ...this.props,
          ...this.getSubLayerProps({
            id: tile.id,
            updateTriggers: this.props.updateTriggers
          }),
          data: tile.content,
          _offset: 0,
          tile
        });
        tile.layers = (flatten(layers, Boolean) as Layer<{tile?: Tile2DHeader}>[]).map(layer =>
          layer.clone({
            tile,
            ...subLayerProps
          })
        );
      } else if (
        subLayerProps &&
        tile.layers[0] &&
        Object.keys(subLayerProps).some(
          propName => tile.layers![0].props[propName] !== subLayerProps[propName]
        )
      ) {
        tile.layers = tile.layers.map(layer => layer.clone(subLayerProps));
      }
      return tile.layers;
    });
  }

  filterSubLayer({layer, cullRect}: FilterContext) {
    const {tile} = (layer as Layer<{tile: Tile2DHeader}>).props;
    return this.state.tileset!.isTileVisible(tile, cullRect);
  }
}
