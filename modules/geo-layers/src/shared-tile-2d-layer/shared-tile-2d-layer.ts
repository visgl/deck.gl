// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  CompositeLayer,
  type CompositeLayerProps,
  type DefaultProps,
  type FilterContext,
  type GetPickingInfoParams,
  type Layer,
  type LayerProps,
  type LayersList,
  type PickingInfo,
  type UpdateParameters,
  type Viewport,
  _flatten as flatten
} from '@deck.gl/core';
import {GeoJsonLayer} from '@deck.gl/layers';
import type {TileSource} from '@loaders.gl/loader-utils';
import {Matrix4} from '@math.gl/core';

import {
  SharedTile2DHeader,
  SharedTileset2D,
  STRATEGY_DEFAULT,
  type SharedRefinementStrategy,
  type SharedTileset2DProps
} from '../shared-tileset-2d';
import type {TileLoadProps, ZRange} from '../tileset-2d';
import {getURLFromTemplate, type URLTemplate, urlType} from '../tileset-2d';
import {sharedTile2DDeckAdapter} from './deck-tileset-adapter';
import {SharedTile2DView} from './shared-tile-2d-view';

function isTileSource(value: unknown): value is TileSource {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'getTileData' in value &&
      typeof (value as TileSource).getTileData === 'function' &&
      'getMetadata' in value &&
      typeof (value as TileSource).getMetadata === 'function'
  );
}

function isURLTemplate(value: unknown): value is URLTemplate {
  return (
    value === null ||
    typeof value === 'string' ||
    (Array.isArray(value) && value.every(url => typeof url === 'string'))
  );
}

const tile2DDataType = {
  type: 'object' as const,
  value: null as URLTemplate | SharedTileset2D | TileSource,
  validate: (value, propType) =>
    (propType.optional && value === null) ||
    value instanceof SharedTileset2D ||
    isTileSource(value) ||
    isURLTemplate(value),
  equal: (value1, value2) =>
    isURLTemplate(value1) && isURLTemplate(value2)
      ? urlType.equal(value1, value2)
      : value1 === value2
};

const defaultProps: DefaultProps<SharedTile2DLayerProps> = {
  TilesetClass: SharedTileset2D,
  data: tile2DDataType,
  dataComparator: tile2DDataType.equal,
  renderSubLayers: {type: 'function', value: (props: any) => new GeoJsonLayer(props)},
  getTileData: {type: 'function', optional: true, value: null},
  onViewportLoad: {type: 'function', optional: true, value: null},
  onTileLoad: {type: 'function', value: () => {}},
  onTileUnload: {type: 'function', value: () => {}},
  onTileError: {type: 'function', value: () => {}},
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
  zoomOffset: 0,
  visibleMinZoom: null,
  visibleMaxZoom: null
};

const TILESET_OPTION_KEYS = [
  'maxCacheSize',
  'maxCacheByteSize',
  'maxZoom',
  'minZoom',
  'tileSize',
  'refinementStrategy',
  'extent',
  'maxRequests',
  'debounceTime',
  'zoomOffset',
  'visibleMinZoom',
  'visibleMaxZoom'
] as const;

/** Props for {@link SharedTile2DLayer}. */
export type SharedTile2DLayerProps<DataT = unknown> = CompositeLayerProps & {
  /** URL template, shared tileset, or loaders.gl TileSource backing the layer. */
  data: URLTemplate | SharedTileset2D<DataT, any> | TileSource;
  /** Tileset class used when the layer creates its own internal tileset. */
  TilesetClass?: typeof SharedTileset2D;
  /** Sub-layer factory invoked for each loaded tile. */
  renderSubLayers?: (
    props: SharedTile2DLayerProps<DataT> & {
      id: string;
      data: DataT;
      _offset: number;
      tile: SharedTile2DHeader<DataT>;
    }
  ) => Layer | null | LayersList;
  /** Optional tile loader used with URL-template data. */
  getTileData?: ((props: TileLoadProps) => Promise<DataT> | DataT) | null;
  /** Callback fired when the current viewport's selected tiles are loaded. */
  onViewportLoad?: ((tiles: SharedTile2DHeader<DataT>[]) => void) | null;
  /** Callback fired when any tile loads. */
  onTileLoad?: (tile: SharedTile2DHeader<DataT>) => void;
  /** Callback fired when any tile is evicted. */
  onTileUnload?: (tile: SharedTile2DHeader<DataT>) => void;
  /** Callback fired when any tile fails to load. */
  onTileError?: (err: any, tile?: SharedTile2DHeader<DataT>) => void;
  /** Bounding box limiting tile generation. */
  extent?: number[] | null;
  /** Tile size in pixels. */
  tileSize?: number;
  /** Maximum zoom level to request. */
  maxZoom?: number | null;
  /** Minimum zoom level to request. */
  minZoom?: number | null;
  /** Maximum tile count kept in cache. */
  maxCacheSize?: number | null;
  /** Maximum byte size kept in cache. */
  maxCacheByteSize?: number | null;
  /** Shared-safe placeholder refinement strategy. */
  refinementStrategy?: SharedRefinementStrategy;
  /** Elevation bounds used during geospatial tile selection. */
  zRange?: ZRange | null;
  /** Maximum concurrent requests. */
  maxRequests?: number;
  /** Debounce interval before issuing queued requests. */
  debounceTime?: number;
  /** Integer zoom offset applied during tile selection. */
  zoomOffset?: number;
  /** The minimum zoom level at which tiles are visible. */
  visibleMinZoom?: number | null;
  /** The maximum zoom level at which tiles are visible. */
  visibleMaxZoom?: number | null;
};

/** Picking info returned from {@link SharedTile2DLayer}. */
export type SharedTile2DLayerPickingInfo<
  DataT = any,
  SubLayerPickingInfo = PickingInfo
> = SubLayerPickingInfo & {
  /** Picked tile when a tile sub-layer is hit. */
  tile?: SharedTile2DHeader<DataT>;
  /** Tile that produced the picked sub-layer. */
  sourceTile: SharedTile2DHeader<DataT>;
  /** Concrete sub-layer instance that handled the pick. */
  sourceTileSubLayer: Layer;
};

type SharedTile2DLayerState<DataT> = {
  tileset: SharedTileset2D<DataT, Viewport> | null;
  tilesetViews: Map<string, SharedTile2DView<DataT>>;
  ownsTileset: boolean;
  isLoaded: boolean;
  frameNumbers: Map<string, number>;
  tileLayers: Map<string, Layer[]>;
  unsubscribeTilesetEvents: (() => void) | null;
};

/** Composite layer that can reuse a shared tileset across layers and views. */
export default class SharedTile2DLayer<
  DataT = any,
  ExtraPropsT extends {} = {}
> extends CompositeLayer<ExtraPropsT & Required<SharedTile2DLayerProps<DataT>>> {
  /** Layer default props consumed by deck.gl prop management. */
  static defaultProps: DefaultProps = defaultProps;
  /** Stable layer name used in logs and devtools. */
  static layerName = 'SharedTile2DLayer';

  private _knownViewports: Map<string, Viewport> = new Map();

  state = null as unknown as SharedTile2DLayerState<DataT>;

  /** Initializes layer-owned tileset state. */
  initializeState(): void {
    this._knownViewports.clear();
    if (this.context.viewport) {
      this._knownViewports.set(this.context.viewport.id || 'default', this.context.viewport);
    }
    this.state = {
      tileset: null,
      tilesetViews: new Map(),
      ownsTileset: false,
      isLoaded: false,
      frameNumbers: new Map(),
      tileLayers: new Map(),
      unsubscribeTilesetEvents: null
    };
  }

  /** Finalizes owned resources and detaches from any shared tileset. */
  finalizeState(): void {
    this.state.unsubscribeTilesetEvents?.();
    for (const tilesetView of this.state.tilesetViews.values()) {
      tilesetView.finalize();
    }
    if (this.state.ownsTileset) {
      this.state.tileset?.finalize();
    }
  }

  /** Returns whether all visible sub-layers for all tracked views are loaded. */
  get isLoaded(): boolean {
    const {tilesetViews, tileLayers} = this.state;
    if (!tilesetViews.size) {
      return false;
    }
    return Boolean(
      Array.from(tilesetViews.values()).every(tilesetView =>
        tilesetView.selectedTiles?.every(tile => {
          const cachedLayers = tileLayers.get(tile.id);
          return (
            tile.isLoaded &&
            (!tile.content || !cachedLayers || cachedLayers.every(layer => layer.isLoaded))
          );
        })
      )
    );
  }

  /** Triggers updates whenever props, data, or update triggers change. */
  shouldUpdateState({changeFlags}: UpdateParameters<this>): boolean {
    return changeFlags.somethingChanged;
  }

  /** Creates, reuses, or reconfigures the backing shared tileset and per-view state. */
  updateState({changeFlags}: UpdateParameters<this>): void {
    if (this.context.viewport) {
      this._knownViewports.set(this._getViewportKey(), this.context.viewport);
    }
    const propsChanged = Boolean(
      changeFlags.propsOrDataChanged || changeFlags.updateTriggersChanged
    );
    const dataChanged =
      changeFlags.dataChanged ||
      (changeFlags.updateTriggersChanged &&
        (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getTileData));

    let {tileset, ownsTileset} = this.state;
    const nextExternalTileset = this.props.data instanceof SharedTileset2D ? this.props.data : null;
    if (nextExternalTileset && !nextExternalTileset.adapter) {
      nextExternalTileset.setOptions({adapter: sharedTile2DDeckAdapter});
    }
    const nextOwnsTileset = !nextExternalTileset;
    const nextTileset = this._resolveTileset(tileset, ownsTileset, nextExternalTileset);
    const tilesetChanged = nextTileset !== tileset || nextOwnsTileset !== ownsTileset;

    if (tilesetChanged) {
      this._releaseTileset(tileset, ownsTileset);
      tileset = nextTileset;
      ownsTileset = nextOwnsTileset;
      this.setState({
        tileset,
        tilesetViews: new Map(),
        ownsTileset,
        tileLayers: new Map(),
        frameNumbers: new Map(),
        unsubscribeTilesetEvents: nextTileset.subscribe({
          onTileLoad: this._onTileLoad.bind(this),
          onTileError: this._onTileError.bind(this),
          onTileUnload: this._onTileUnload.bind(this),
          onUpdate: () => this.setNeedsUpdate(),
          onError: error => this.raiseError(error, 'loading TileSource metadata')
        })
      });
    } else {
      this._updateExistingTileset(propsChanged, ownsTileset, Boolean(dataChanged), nextTileset);
    }

    this._updateTileset();
  }

  /** Registers additional viewports in multi-view rendering scenarios. */
  activateViewport(viewport: Viewport): void {
    const viewportKey = viewport.id || 'default';
    const previousViewport = this._knownViewports.get(viewportKey);
    this._knownViewports.set(viewportKey, viewport);
    if (!previousViewport || !viewport.equals(previousViewport)) {
      this.setNeedsUpdate();
    }
    super.activateViewport(viewport);
  }

  /** Calls the URL-template loader path for a tile when the layer owns the tileset. */
  getTileData(tile: TileLoadProps): Promise<DataT> | DataT | null {
    const {data, getTileData, fetch} = this.props;
    const {signal} = tile;
    if (!isURLTemplate(data)) {
      return null;
    }
    tile.url = getURLFromTemplate(data, tile);
    if (getTileData) {
      return getTileData(tile);
    }
    if (fetch && tile.url) {
      return fetch(tile.url, {propName: 'data', layer: this, signal});
    }
    return null;
  }

  /** Default tile sub-layer renderer, delegating to `renderSubLayers`. */
  renderSubLayers(
    props: SharedTile2DLayer['props'] & {
      id: string;
      data: DataT;
      _offset: number;
      tile: SharedTile2DHeader<DataT>;
    }
  ): Layer | null | LayersList {
    return this.props.renderSubLayers(props);
  }

  /** Hook for subclasses to provide extra sub-layer props per tile. */
  getSubLayerPropsByTile(_tile: SharedTile2DHeader<DataT>): Partial<LayerProps> | null {
    return null;
  }

  /** Adds tile references to picking info returned from sub-layers. */
  getPickingInfo(params: GetPickingInfoParams): SharedTile2DLayerPickingInfo<DataT> {
    const sourceLayer = params.sourceLayer!;
    const sourceTile: SharedTile2DHeader<DataT> = (sourceLayer.props as any).tile;
    const info = params.info as SharedTile2DLayerPickingInfo<DataT>;
    if (info.picked) {
      info.tile = sourceTile;
    }
    info.sourceTile = sourceTile;
    info.sourceTileSubLayer = sourceLayer;
    return info;
  }

  /** Forwards auto-highlight updates to the picked sub-layer. */
  protected _updateAutoHighlight(info: SharedTile2DLayerPickingInfo<DataT>): void {
    info.sourceTileSubLayer.updateAutoHighlight(info);
  }

  /** Renders cached or newly generated sub-layers for each loaded tile. */
  renderLayers(): Layer | null | LayersList {
    const {tileset, tileLayers} = this.state;
    if (!tileset) {
      return null;
    }
    return tileset.tiles.map(tile => {
      const subLayerProps = this.getSubLayerPropsByTile(tile);
      let layers = tileLayers.get(tile.id);
      if (!tile.isLoaded && !tile.content) {
        return layers;
      }
      if (!layers) {
        const rendered = this.renderSubLayers({
          ...this.props,
          ...this.getSubLayerProps({
            id: tile.id,
            updateTriggers: this.props.updateTriggers
          }),
          data: tile.content as DataT,
          _offset: 0,
          tile
        });
        layers = this._flattenTileLayers(rendered).map(layer =>
          layer.clone({tile, ...subLayerProps})
        );
        tileLayers.set(tile.id, layers);
      } else if (
        subLayerProps &&
        layers[0] &&
        Object.keys(subLayerProps).some(
          propName => layers![0].props[propName] !== subLayerProps[propName]
        )
      ) {
        layers = layers.map(layer => layer.clone(subLayerProps));
        tileLayers.set(tile.id, layers);
      }
      return layers;
    });
  }

  /** Filters tile sub-layers based on the active view-specific visibility state. */
  filterSubLayer({layer, cullRect}: FilterContext) {
    const {tile} = (layer as Layer<{tile: SharedTile2DHeader<DataT>}>).props;
    const tilesetView = this._getOrCreateTilesetView(this._getViewportKey());
    return tilesetView.isTileVisible(
      tile,
      cullRect,
      this.props.modelMatrix ? new Matrix4(this.props.modelMatrix) : null
    );
  }

  private _resolveTileset(
    currentTileset: SharedTileset2D<DataT, Viewport> | null,
    ownsCurrentTileset: boolean,
    nextExternalTileset: SharedTileset2D<DataT, Viewport> | null
  ): SharedTileset2D<DataT, Viewport> {
    if (nextExternalTileset) {
      return nextExternalTileset;
    }
    if (currentTileset && ownsCurrentTileset) {
      return currentTileset;
    }
    return new this.props.TilesetClass(this._getTilesetOptions());
  }

  private _releaseTileset(
    tileset: SharedTileset2D<DataT, Viewport> | null,
    ownsTileset: boolean
  ): void {
    this.state.unsubscribeTilesetEvents?.();
    for (const tilesetView of this.state.tilesetViews.values()) {
      tilesetView.finalize();
    }
    if (ownsTileset) {
      tileset?.finalize();
    }
  }

  private _updateExistingTileset(
    propsChanged: boolean,
    ownsTileset: boolean,
    dataChanged: boolean,
    tileset: SharedTileset2D<DataT, Viewport>
  ): void {
    if (!propsChanged) {
      return;
    }
    if (ownsTileset) {
      tileset.setOptions(this._getTilesetOptions(), {replace: true});
      if (dataChanged) {
        tileset.reloadAll();
        return;
      }
    }
    this.state.tileLayers.clear();
  }

  _getTilesetOptions(): SharedTileset2DProps<DataT, Viewport> {
    const tileSource = isTileSource(this.props.data) ? this.props.data : undefined;
    const options: SharedTileset2DProps<DataT, Viewport> = {
      adapter: sharedTile2DDeckAdapter,
      getTileData: tileSource ? undefined : this.getTileData.bind(this),
      onTileLoad: () => {},
      onTileError: () => {},
      onTileUnload: () => {}
    };

    if (tileSource) {
      options.tileSource = tileSource;
    }
    for (const key of TILESET_OPTION_KEYS) {
      if (Object.hasOwn(this.props, key)) {
        options[key] = this.props[key] as never;
      }
    }

    return options;
  }

  private _updateTileset(): void {
    const {zRange, modelMatrix} = this.props;
    let anyTilesetChanged = false;

    for (const [viewportKey, viewport] of this._knownViewports) {
      this._prunePlaceholderViewportView(viewportKey);
      const tilesetView = this._getOrCreateTilesetView(viewportKey);
      const frameNumber = tilesetView.update(viewport, {zRange, modelMatrix});
      const previousFrameNumber = this.state.frameNumbers.get(viewportKey);
      const tilesetChanged = previousFrameNumber !== frameNumber;
      anyTilesetChanged ||= tilesetChanged;

      if (tilesetView.isLoaded && tilesetChanged) {
        this._onViewportLoad(tilesetView);
      }
      if (tilesetChanged) {
        this.state.frameNumbers.set(viewportKey, frameNumber);
      }
    }

    const nextIsLoaded = this.isLoaded;
    const loadingStateChanged = this.state.isLoaded !== nextIsLoaded;
    if (loadingStateChanged) {
      for (const tilesetView of this.state.tilesetViews.values()) {
        if (tilesetView.isLoaded) {
          this._onViewportLoad(tilesetView);
        }
      }
    }

    if (anyTilesetChanged) {
      this.setState({frameNumbers: new Map(this.state.frameNumbers)});
    }
    this.state.isLoaded = nextIsLoaded;
  }

  _onViewportLoad(tilesetView: SharedTile2DView<DataT>): void {
    if (tilesetView.selectedTiles) {
      this.props.onViewportLoad?.(tilesetView.selectedTiles);
    }
  }

  _onTileLoad(tile: SharedTile2DHeader<DataT>): void {
    this.state.tileLayers.delete(tile.id);
    this.props.onTileLoad(tile);
    this.setNeedsUpdate();
  }

  _onTileError(error: any, tile: SharedTile2DHeader<DataT>): void {
    this.state.tileLayers.delete(tile.id);
    this.props.onTileError(error, tile);
    this.setNeedsUpdate();
  }

  _onTileUnload(tile: SharedTile2DHeader<DataT>): void {
    this.state.tileLayers.delete(tile.id);
    this.props.onTileUnload(tile);
  }

  private _getViewportKey(): string {
    return this.context.viewport?.id || 'default';
  }

  private _prunePlaceholderViewportView(viewportKey: string): void {
    const placeholderViewportKey = 'DEFAULT-INITIAL-VIEWPORT';
    if (viewportKey !== placeholderViewportKey) {
      const placeholderView = this.state.tilesetViews.get(placeholderViewportKey);
      if (placeholderView) {
        placeholderView.finalize();
        this.state.tilesetViews.delete(placeholderViewportKey);
        this.state.frameNumbers.delete(placeholderViewportKey);
      }
    }
  }

  private _getOrCreateTilesetView(viewportKey: string): SharedTile2DView<DataT> {
    let tilesetView = this.state.tilesetViews.get(viewportKey);
    if (!tilesetView) {
      const tileset = this.state.tileset;
      if (!tileset) {
        throw new Error('SharedTile2DLayer tileset was not initialized.');
      }
      tilesetView = new SharedTile2DView(tileset);
      this.state.tilesetViews.set(viewportKey, tilesetView);
    }
    return tilesetView;
  }

  private _flattenTileLayers(
    rendered: Layer | null | LayersList
  ): Layer<{tile?: SharedTile2DHeader<DataT>}>[] {
    return flatten(rendered as any, Boolean) as Layer<{tile?: SharedTile2DHeader<DataT>}>[];
  }
}
