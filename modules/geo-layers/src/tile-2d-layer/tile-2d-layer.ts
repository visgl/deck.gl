// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  CompositeLayer,
  type CompositeLayerProps,
  Layer,
  type LayersList,
  type LayerProps,
  type UpdateParameters,
  type PickingInfo,
  type GetPickingInfoParams,
  type DefaultProps,
  type FilterContext,
  type Viewport,
  _flatten as flatten
} from '@deck.gl/core';
import {GeoJsonLayer} from '@deck.gl/layers';
import {Matrix4} from '@math.gl/core';
import type {TileSource} from '@loaders.gl/loader-utils';

import {
  Tileset2D,
  Tile2DHeader,
  type TileLoadProps,
  type ZRange,
  type RefinementStrategy,
  STRATEGY_DEFAULT
} from '../tileset-2d/index';
import {Tile2DView} from '../tileset-2d/tile-2d-view';
import {tile2DDeckAdapter} from '../tileset-2d/deck-tileset-adapter';
import {type URLTemplate, getURLFromTemplate} from '../tileset-2d/utils';
import {urlType} from '../tileset-2d/index';

/** Tests whether a value looks like a loaders.gl {@link TileSource}. */
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

/** Tests whether a value is a supported URL-template input for tiled requests. */
function isURLTemplate(value: unknown): value is URLTemplate {
  return (
    value === null ||
    typeof value === 'string' ||
    (Array.isArray(value) && value.every(url => typeof url === 'string'))
  );
}

/** Prop-type validator for `data` inputs accepted by {@link Tile2DLayer}. */
const tile2DDataType = {
  type: 'object' as const,
  value: null as URLTemplate | Tileset2D | TileSource,
  validate: (value, propType) =>
    (propType.optional && value === null) ||
    value instanceof Tileset2D ||
    isTileSource(value) ||
    isURLTemplate(value),
  equal: (value1, value2) =>
    isURLTemplate(value1) && isURLTemplate(value2)
      ? urlType.equal(value1, value2)
      : value1 === value2
};

/** Default prop values for {@link Tile2DLayer}. */
const defaultProps: DefaultProps<Tile2DLayerProps> = {
  TilesetClass: Tileset2D,
  data: tile2DDataType,
  dataComparator: tile2DDataType.equal,
  viewIds: {type: 'array', optional: true, value: null, compare: true},
  renderSubLayers: {type: 'function', value: (props: any) => new GeoJsonLayer(props)},
  getTileData: {type: 'function', optional: true, value: null},
  onViewportLoad: {type: 'function', optional: true, value: null},
  onTileLoad: {type: 'function', value: () => {}},
  onTileUnload: {type: 'function', value: () => {}},
  onTileError: {type: 'function', value: error => console.error(error)},
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

/** Internal defaults used to detect whether layer props were explicitly overridden. */
const TILE2D_LAYER_DEFAULT_OPTION_VALUES = {
  maxCacheSize: null,
  maxCacheByteSize: null,
  maxZoom: null,
  minZoom: 0,
  tileSize: 512,
  refinementStrategy: STRATEGY_DEFAULT,
  extent: null,
  maxRequests: 6,
  debounceTime: 0,
  zoomOffset: 0,
  visibleMinZoom: null,
  visibleMaxZoom: null
} as const;

/** Props for {@link Tile2DLayer}. */
export type Tile2DLayerProps<DataT = unknown> = CompositeLayerProps & {
  /** URL template, shared tileset, or loaders.gl TileSource backing the layer. */
  data: URLTemplate | Tileset2D<DataT, any> | TileSource;
  /** View IDs that select and render tiles; null includes every active view. */
  viewIds?: string[] | null;
  /** Tileset class used when the layer creates its own internal tileset. */
  TilesetClass?: typeof Tileset2D;
  /** Sub-layer factory invoked for each loaded tile. */
  renderSubLayers?: (
    props: Tile2DLayerProps<DataT> & {
      /** Stable identifier assigned by the tileset. */
      id: string;
      /** Content, or a promise resolving to content while loading. */
      data: DataT;
      /** Tile-local rendering offset reserved for sublayer compatibility. */
      _offset: number;
      /** Tile cache entry associated with these sublayer props. */
      tile: Tile2DHeader<DataT>;
    }
  ) => Layer | null | LayersList;
  /** Optional tile loader used with URL-template data. */
  getTileData?: ((props: TileLoadProps) => Promise<DataT> | DataT) | null;
  /** Reports settled selected tiles and the viewport independently for each enabled view. */
  onViewportLoad?: ((tiles: Tile2DHeader<DataT>[], viewport: Viewport) => void) | null;
  /** Callback fired when any tile loads. */
  onTileLoad?: (tile: Tile2DHeader<DataT>) => void;
  /** Callback fired when any tile is evicted. */
  onTileUnload?: (tile: Tile2DHeader<DataT>) => void;
  /** Callback fired when any tile fails to load. */
  onTileError?: (err: any, tile?: Tile2DHeader<DataT>) => void;
  /** Bounding box limiting tile generation. */
  extent?: number[] | null;
  /** Tile size in pixels. */
  tileSize?: number;
  /** Maximum zoom level to request. */
  maxZoom?: number | null;
  /** Minimum zoom level to request. */
  minZoom?: number | null;
  /** Cache high-water mark; selected and visible tiles are never evicted to meet it. */
  maxCacheSize?: number | null;
  /** Maximum byte size kept in cache. */
  maxCacheByteSize?: number | null;
  /** Placeholder refinement strategy. */
  refinementStrategy?: RefinementStrategy;
  /** Elevation bounds used during geospatial tile selection. */
  zRange?: ZRange | null;
  /** Maximum concurrent requests. */
  maxRequests?: number;
  /** Debounce interval before issuing queued requests. */
  debounceTime?: number;
  /** Integer zoom offset applied during tile selection. */
  zoomOffset?: number;
  /** Lower bound for rendering a viewport. */
  visibleMinZoom?: number | null;
  /** Upper bound for rendering a viewport. */
  visibleMaxZoom?: number | null;
};

/** Picking info returned from {@link Tile2DLayer}. */
export type Tile2DLayerPickingInfo<
  DataT = any,
  SubLayerPickingInfo = PickingInfo
> = SubLayerPickingInfo & {
  /** Picked tile when a tile sub-layer is hit. */
  tile?: Tile2DHeader<DataT>;
  /** Tile that produced the picked sub-layer. */
  sourceTile: Tile2DHeader<DataT>;
  /** Concrete sub-layer instance that handled the pick. */
  sourceTileSubLayer: Layer;
};

/** Internal mutable state owned by {@link Tile2DLayer}. */
type Tile2DLayerState<DataT> = {
  /** Shared or owned tileset used by the layer. */
  tileset: Tileset2D<DataT, any> | null;
  /** Per-viewport traversal state. */
  tilesetViews: Map<string, Tile2DView<DataT>>;
  /** Whether the layer owns and should finalize the tileset. */
  ownsTileset: boolean;
  /** Cached aggregate load state. */
  isLoaded: boolean;
  /** Last frame number observed for each viewport. */
  frameNumbers: Map<string, number>;
  /** Views whose selection was loaded at their previous traversal update. */
  loadedViewIds: Set<string>;
  /** Cached sub-layers per tile id. */
  tileLayers: Map<string, Layer[]>;
  /** Subscription disposer for tileset events. */
  unsubscribeTilesetEvents: (() => void) | null;
};

/** Composite layer that can reuse a shared {@link Tileset2D} across layers and views. */
export class Tile2DLayer<DataT = any, ExtraPropsT extends {} = {}> extends CompositeLayer<
  ExtraPropsT & Required<Tile2DLayerProps<DataT>>
> {
  /** Layer default props consumed by deck.gl prop management. */
  static defaultProps: DefaultProps = defaultProps;
  /** Stable layer name used in logs and devtools. */
  static layerName = 'Tile2DLayer';

  /** Viewports currently known to this layer during multi-view rendering. */
  private _knownViewports: Map<string, Viewport> = new Map();

  /** Internal layer state shared across render passes. */
  state = null as unknown as Tile2DLayerState<DataT>;

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
      loadedViewIds: new Set(),
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
    const nextExternalTileset = this.props.data instanceof Tileset2D ? this.props.data : null;
    if (nextExternalTileset && !nextExternalTileset.adapter) {
      nextExternalTileset.setOptions({adapter: tile2DDeckAdapter});
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
        loadedViewIds: new Set(),
        unsubscribeTilesetEvents: nextTileset.subscribe({
          onTileLoad: tile => this._getCurrentTilesetLayer()._onTileLoad(tile),
          onTileError: (error, tile) => this._getCurrentTilesetLayer()._onTileError(error, tile),
          onTileUnload: tile => this._getCurrentTilesetLayer()._onTileUnload(tile),
          onUpdate: () => this._getCurrentTilesetLayer().setNeedsUpdate(),
          onError: error =>
            this._getCurrentTilesetLayer().raiseError(error, 'loading TileSource metadata')
        })
      });
    } else {
      this._updateExistingTileset(propsChanged, ownsTileset, Boolean(dataChanged), nextTileset);
    }

    this._updateTileset();
  }

  /** Routes asynchronous cache events to the matched layer after state transfers. */
  private _getCurrentTilesetLayer(): this {
    return (this.getCurrentLayer() || this) as this;
  }

  /** Resolves whether to reuse a shared tileset, reuse an owned tileset, or create a new one. */
  private _resolveTileset(
    currentTileset: Tileset2D<DataT, any> | null,
    ownsCurrentTileset: boolean,
    nextExternalTileset: Tileset2D<DataT, any> | null
  ): Tileset2D<DataT, any> {
    if (nextExternalTileset) {
      return nextExternalTileset;
    }
    if (currentTileset && ownsCurrentTileset) {
      return currentTileset;
    }
    return new this.props.TilesetClass(this._getTilesetOptions());
  }

  /** Tears down subscriptions and per-view state for the outgoing tileset. */
  private _releaseTileset(tileset: Tileset2D<DataT, any> | null, ownsTileset: boolean): void {
    this.state.unsubscribeTilesetEvents?.();
    for (const tilesetView of this.state.tilesetViews.values()) {
      tilesetView.finalize();
    }
    if (ownsTileset) {
      tileset?.finalize();
    }
  }

  /** Applies prop updates to an existing tileset without replacing it. */
  private _updateExistingTileset(
    propsChanged: boolean,
    ownsTileset: boolean,
    dataChanged: boolean,
    tileset: Tileset2D<DataT, any>
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

  /** Resolves the current tileset configuration from layer props. */
  _getTilesetOptions(): Record<string, unknown> {
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
      zoomOffset,
      visibleMinZoom,
      visibleMaxZoom
    } = this.props;

    const tileSource = isTileSource(this.props.data) ? this.props.data : undefined;
    const options = {
      tileSource,
      adapter: tile2DDeckAdapter,
      getTileData: tileSource ? undefined : this.getTileData.bind(this),
      onTileLoad: () => {},
      onTileError: () => {},
      onTileUnload: () => {}
    } as Record<string, unknown>;

    this._assignTilesetOptionIfExplicit(
      options,
      'maxCacheSize',
      maxCacheSize,
      TILE2D_LAYER_DEFAULT_OPTION_VALUES.maxCacheSize
    );
    this._assignTilesetOptionIfExplicit(
      options,
      'maxCacheByteSize',
      maxCacheByteSize,
      TILE2D_LAYER_DEFAULT_OPTION_VALUES.maxCacheByteSize
    );
    this._assignTilesetOptionIfExplicit(
      options,
      'maxZoom',
      maxZoom,
      TILE2D_LAYER_DEFAULT_OPTION_VALUES.maxZoom
    );
    this._assignTilesetOptionIfExplicit(
      options,
      'minZoom',
      minZoom,
      TILE2D_LAYER_DEFAULT_OPTION_VALUES.minZoom
    );
    this._assignTilesetOptionIfExplicit(
      options,
      'tileSize',
      tileSize,
      TILE2D_LAYER_DEFAULT_OPTION_VALUES.tileSize
    );
    this._assignTilesetOptionIfExplicit(
      options,
      'refinementStrategy',
      refinementStrategy,
      TILE2D_LAYER_DEFAULT_OPTION_VALUES.refinementStrategy
    );
    this._assignTilesetOptionIfExplicit(
      options,
      'extent',
      extent,
      TILE2D_LAYER_DEFAULT_OPTION_VALUES.extent
    );
    this._assignTilesetOptionIfExplicit(
      options,
      'maxRequests',
      maxRequests,
      TILE2D_LAYER_DEFAULT_OPTION_VALUES.maxRequests
    );
    this._assignTilesetOptionIfExplicit(
      options,
      'debounceTime',
      debounceTime,
      TILE2D_LAYER_DEFAULT_OPTION_VALUES.debounceTime
    );
    this._assignTilesetOptionIfExplicit(
      options,
      'zoomOffset',
      zoomOffset,
      TILE2D_LAYER_DEFAULT_OPTION_VALUES.zoomOffset
    );

    this._assignTilesetOptionIfExplicit(options, 'visibleMinZoom', visibleMinZoom, null);
    this._assignTilesetOptionIfExplicit(options, 'visibleMaxZoom', visibleMaxZoom, null);
    return options;
  }

  /** Updates traversal and releases consumers outside the layer's active view IDs. */
  private _updateTileset(): void {
    const {zRange, modelMatrix} = this.props;
    let anyTilesetChanged = false;
    const activeViewports = (
      this.context.layerManager?.getViewports() || Array.from(this._knownViewports.values())
    ).filter(viewport => this._isViewEnabled(viewport.id));
    const activeIds = new Set(activeViewports.map(viewport => viewport.id));
    for (const [id, view] of this.state.tilesetViews) {
      if (!activeIds.has(id)) {
        view.finalize();
        this.state.tilesetViews.delete(id);
        this.state.frameNumbers.delete(id);
        this.state.loadedViewIds.delete(id);
      }
    }
    this._knownViewports = new Map(activeViewports.map(viewport => [viewport.id, viewport]));

    for (const [viewportKey, viewport] of this._knownViewports) {
      this._prunePlaceholderViewportView(viewportKey);
      const tilesetView = this._getOrCreateTilesetView(viewportKey);
      const frameNumber = tilesetView.update(viewport, {zRange, modelMatrix});
      const previousFrameNumber = this.state.frameNumbers.get(viewportKey);
      const tilesetChanged = previousFrameNumber !== frameNumber;
      anyTilesetChanged ||= tilesetChanged;

      if (tilesetView.isLoaded) {
        if (tilesetChanged || !this.state.loadedViewIds.has(viewportKey)) {
          this._onViewportLoad(tilesetView, viewport);
        }
        this.state.loadedViewIds.add(viewportKey);
      } else {
        this.state.loadedViewIds.delete(viewportKey);
      }
      if (tilesetChanged) {
        this.state.frameNumbers.set(viewportKey, frameNumber);
      }
    }

    if (anyTilesetChanged) {
      this.setState({frameNumbers: new Map(this.state.frameNumbers)});
    }
    this.state.isLoaded = this.isLoaded;
  }

  /** Emits the viewport-load callback for one view. */
  _onViewportLoad(
    tilesetView: Tile2DView<DataT>,
    viewport: Viewport = this.context.viewport
  ): void {
    if (tilesetView.selectedTiles) {
      this.props.onViewportLoad?.(tilesetView.selectedTiles, viewport);
    }
  }

  /** Clears cached sub-layers when a tile loads. */
  _onTileLoad(tile: Tile2DHeader<DataT>): void {
    this.state.tileLayers.delete(tile.id);
    this.props.onTileLoad(tile);
    this.setNeedsUpdate();
  }

  /** Clears cached sub-layers when a tile errors. */
  _onTileError(error: any, tile: Tile2DHeader<DataT>): void {
    this.state.tileLayers.delete(tile.id);
    this.props.onTileError(error, tile);
    this.setNeedsUpdate();
  }

  /** Removes cached sub-layers when a tile is evicted. */
  _onTileUnload(tile: Tile2DHeader<DataT>): void {
    this.state.tileLayers.delete(tile.id);
    this.props.onTileUnload(tile);
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
    props: Tile2DLayer['props'] & {
      /** Stable identifier assigned by the tileset. */
      id: string;
      /** Content, or a promise resolving to content while loading. */
      data: DataT;
      /** Tile-local rendering offset reserved for sublayer compatibility. */
      _offset: number;
      /** Tile cache entry associated with these sublayer props. */
      tile: Tile2DHeader<DataT>;
    }
  ): Layer | null | LayersList {
    return this.props.renderSubLayers(props);
  }

  /** Hook for subclasses to provide extra sub-layer props per tile. */
  getSubLayerPropsByTile(_tile: Tile2DHeader<DataT>, _layer?: Layer): Partial<LayerProps> | null {
    return null;
  }

  /** Adds tile references to picking info returned from sub-layers. */
  getPickingInfo(params: GetPickingInfoParams): Tile2DLayerPickingInfo<DataT> {
    const {sourceLayer} = params;
    if (!sourceLayer) {
      throw new Error('Tile2DLayer picking info requires a source layer.');
    }
    const sourceTile: Tile2DHeader<DataT> = (sourceLayer.props as any).tile;
    const info = params.info as Tile2DLayerPickingInfo<DataT>;
    if (info.picked) {
      info.tile = sourceTile;
    }
    info.sourceTile = sourceTile;
    info.sourceTileSubLayer = sourceLayer;
    return info;
  }

  /** Forwards auto-highlight updates to the picked sub-layer. */
  protected _updateAutoHighlight(info: Tile2DLayerPickingInfo<DataT>): void {
    info.sourceTileSubLayer.updateAutoHighlight(info);
  }

  /** Renders cached or newly generated sub-layers for each loaded tile. */
  renderLayers(): Layer | null | LayersList {
    const {tileset, tileLayers} = this.state;
    if (!tileset) {
      return null;
    }
    return tileset.tiles.map(tile => {
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
          data: tile.content,
          _offset: 0,
          tile
        });
        layers = this._flattenTileLayers(rendered).map(layer =>
          layer.clone({tile, ...this.getSubLayerPropsByTile(tile, layer)})
        );
        tileLayers.set(tile.id, layers);
      } else {
        layers = layers.map(layer => {
          const props = this.getSubLayerPropsByTile(tile, layer);
          return props && Object.keys(props).some(key => layer.props[key] !== props[key])
            ? layer.clone(props)
            : layer;
        });
        tileLayers.set(tile.id, layers);
      }
      return layers;
    });
  }

  /** Filters tile sub-layers based on the active view-specific visibility state. */
  filterSubLayer({layer, cullRect, viewport}: FilterContext) {
    const viewportKey = viewport?.id || this._getViewportKey();
    if (!this._isViewEnabled(viewportKey)) return false;
    const {tile} = (
      layer as Layer<{
        /** Tile cache entry associated with these sublayer props. */ tile: Tile2DHeader<DataT>;
      }>
    ).props;
    const tilesetView = this.state.tilesetViews.get(viewportKey);
    if (!tilesetView) return false;
    return tilesetView.isTileVisible(
      tile,
      cullRect,
      this.props.modelMatrix ? new Matrix4(this.props.modelMatrix) : null
    );
  }

  /** Returns the active viewport key used to isolate per-view traversal state. */
  private _getViewportKey(): string {
    return this.context.viewport?.id || 'default';
  }

  /** Tests whether traversal and drawing are enabled for a view ID. */
  private _isViewEnabled(viewId: string): boolean {
    return !this.props.viewIds || this.props.viewIds.includes(viewId);
  }

  /** Copies a tileset option only when the layer prop was explicitly set. */
  private _assignTilesetOptionIfExplicit(
    options: Record<string, unknown>,
    key: string,
    value: unknown,
    defaultValue: unknown
  ): void {
    if (!this._isDefaultOptionValue(value, defaultValue)) {
      options[key] = value;
    }
  }

  /** Tests whether a layer prop still has its default value. */
  private _isDefaultOptionValue(value: unknown, defaultValue: unknown): boolean {
    if (Array.isArray(value) || Array.isArray(defaultValue)) {
      return (
        Array.isArray(value) &&
        Array.isArray(defaultValue) &&
        value.length === defaultValue.length &&
        value.every((entry, index) => entry === defaultValue[index])
      );
    }
    return value === defaultValue;
  }

  /** Drops the bootstrap placeholder viewport after a real viewport is known. */
  private _prunePlaceholderViewportView(viewportKey: string): void {
    const placeholderViewportKey = 'DEFAULT-INITIAL-VIEWPORT';
    if (viewportKey !== placeholderViewportKey) {
      const placeholderView = this.state.tilesetViews.get(placeholderViewportKey);
      if (placeholderView) {
        placeholderView.finalize();
        this.state.tilesetViews.delete(placeholderViewportKey);
        this.state.frameNumbers.delete(placeholderViewportKey);
        this.state.loadedViewIds.delete(placeholderViewportKey);
      }
    }
  }

  /** Returns the per-viewport traversal state, creating it on demand. */
  private _getOrCreateTilesetView(viewportKey: string): Tile2DView<DataT> {
    let tilesetView = this.state.tilesetViews.get(viewportKey);
    if (!tilesetView) {
      const tileset = this.state.tileset;
      if (!tileset) {
        throw new Error('Tile2DLayer tileset was not initialized.');
      }
      tilesetView = new Tile2DView(tileset);
      this.state.tilesetViews.set(viewportKey, tilesetView);
    }
    return tilesetView;
  }

  /** Registers additional viewports in multi-view rendering scenarios. */
  activateViewport(viewport: Viewport): void {
    const viewportKey = viewport.id || 'default';
    if (this._isViewEnabled(viewportKey)) {
      const previousViewport = this._knownViewports.get(viewportKey);
      this._knownViewports.set(viewportKey, viewport);
      if (!previousViewport || !viewport.equals(previousViewport)) {
        this.setNeedsUpdate();
      }
    }
    super.activateViewport(viewport);
  }

  /** Normalizes nested render output into a flat tile sub-layer array. */
  private _flattenTileLayers(rendered: Layer | null | LayersList): Layer<{
    /** Tile cache entry associated with these sublayer props. */ tile?: Tile2DHeader<DataT>;
  }>[] {
    return flatten(rendered as any, Boolean) as Layer<{
      /** Tile cache entry associated with these sublayer props. */ tile?: Tile2DHeader<DataT>;
    }>[];
  }
}

export default Tile2DLayer;
