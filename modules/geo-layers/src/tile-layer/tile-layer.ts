import {
  assert,
  CompositeLayer,
  CompositeLayerProps,
  Layer,
  LayerProps,
  UpdateParameters,
  _flatten as flatten
} from '@deck.gl/core';
import {GeoJsonLayer} from '@deck.gl/layers';
import {LayersList} from 'modules/core/src/lib/layer-manager';
import Tile2DHeader from './tile-2d-header';

import Tileset2D, {RefinementStrategy, STRATEGY_DEFAULT, Tileset2DProps} from './tileset-2d';
import {TileLoadProps, ZRange} from './types';
import {urlType, getURLFromTemplate} from './utils';

const defaultProps = {
  TilesetClass: Tileset2D,
  data: [],
  dataComparator: urlType.equals,
  renderSubLayers: {type: 'function', value: props => new GeoJsonLayer(props), compare: false},
  getTileData: {type: 'function', optional: true, value: null, compare: false},
  // TODO - change to onViewportLoad to align with Tile3DLayer
  onViewportLoad: {type: 'function', optional: true, value: null, compare: false},
  onTileLoad: {type: 'function', value: tile => {}, compare: false},
  onTileUnload: {type: 'function', value: tile => {}, compare: false},
  // eslint-disable-next-line
  onTileError: {type: 'function', value: err => console.error(err), compare: false},
  extent: {type: 'array', optional: true, value: null, compare: true},
  tileSize: 512,
  maxZoom: null,
  minZoom: 0,
  maxCacheSize: null,
  maxCacheByteSize: null,
  refinementStrategy: STRATEGY_DEFAULT,
  zRange: null,
  maxRequests: 6,
  zoomOffset: 0
};

/** All props supported by the TileLayer */
export type TileLayerProps<DataT> = _TileLayerProps<DataT> & CompositeLayerProps<DataT>;

/** Props added by the TileLayer */
type _TileLayerProps<DataT> = {
  /**
   * Optionally implement a custom indexing scheme.
   */
  TilesetClass: typeof Tileset2D;
  /**
   * Renders one or an array of Layer instances.
   */
  renderSubLayers?: (
    props: TileLayerProps<DataT> & {
      id: string;
      data: any;
      _offset: number;
      tile: Tile2DHeader;
    }
  ) => LayersList;
  /**
   * If supplied, `getTileData` is called to retrieve the data of each tile.
   */
  getTileData?: (props: TileLoadProps) => Promise<DataT> | DataT;

  /** Called when all tiles in the current viewport are loaded. */
  onViewportLoad?: (tiles: Tile2DHeader[]) => void;

  /** Called when a tile successfully loads. */
  onTileLoad?: (tile: Tile2DHeader) => void;

  /** Called when a tile is cleared from cache. */
  onTileUnload?: (tile: Tile2DHeader) => void;

  /** Called when a tile failed to load. */
  onTileError?: (err: any) => void;

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
   * This offset changes the zoom level at which the tiles are fetched.
   *
   * Needs to be an integer.
   *
   * @default 0
   */
  zoomOffset?: number;
};

/**
 * The TileLayer is a composite layer that makes it possible to visualize very large datasets.
 *
 * Instead of fetching the entire dataset, it only loads and renders what's visible in the current viewport.
 */
export default class TileLayer<DataT = any, ExtraPropsT = {}> extends CompositeLayer<
  ExtraPropsT & Required<_TileLayerProps<DataT>>
> {
  static defaultProps = defaultProps as any;
  static layerName = 'TileLayer';

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
    return this.state?.tileset?.selectedTiles.every(
      tile => tile.isLoaded && tile.layers && tile.layers.every(layer => layer.isLoaded)
    );
  }

  shouldUpdateState({changeFlags}): boolean {
    return changeFlags.somethingChanged;
  }

  updateState({changeFlags}: UpdateParameters<TileLayer>) {
    assert(this.state);

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
        this.state.tileset.tiles.forEach(tile => {
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
      zoomOffset,

      getTileData: this.getTileData.bind(this),
      onTileLoad: this._onTileLoad.bind(this),
      onTileError: this._onTileError.bind(this),
      onTileUnload: this._onTileUnload.bind(this)
    };
  }

  _updateTileset(): void {
    assert(this.state && this.context);
    const {tileset} = this.state;
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
    assert(this.state);

    const {tileset} = this.state;
    const {onViewportLoad} = this.props;

    if (onViewportLoad) {
      onViewportLoad(tileset.selectedTiles);
    }
  }

  _onTileLoad(tile: Tile2DHeader): void {
    this.props.onTileLoad(tile);
    tile.layers = null;

    this.setNeedsUpdate();
  }

  _onTileError(error: any, tile: Tile2DHeader) {
    this.props.onTileError(error);
    tile.layers = null;

    this.setNeedsUpdate();
  }

  _onTileUnload(tile: Tile2DHeader) {
    this.props.onTileUnload(tile);
  }

  // Methods for subclass to override

  getTileData(tile: TileLoadProps) {
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
    props: _TileLayerProps<DataT> & {
      id: string;
      data: any;
      _offset: number;
      tile: Tile2DHeader;
    }
  ): LayersList {
    return this.props.renderSubLayers(props);
  }

  getSubLayerPropsByTile(tile: Tile2DHeader): Partial<LayerProps> | null {
    return null;
  }

  getPickingInfo({info, sourceLayer}) {
    info.tile = sourceLayer.props.tile;
    return info;
  }

  _updateAutoHighlight(info) {
    if (info.sourceLayer) {
      info.sourceLayer.updateAutoHighlight(info);
    }
  }

  renderLayers(): Layer[] | null {
    assert(this.state);
    return this.state.tileset.tiles.map((tile: Tile2DHeader) => {
      const subLayerProps = this.getSubLayerPropsByTile(tile);
      // cache the rendered layer in the tile
      if (!tile.isLoaded && !tile.content) {
        // nothing to show
      } else if (!tile.layers) {
        const layers = this.renderSubLayers({
          ...this.props,
          id: `${this.id}-${tile.id}`,
          data: tile.content,
          _offset: 0,
          tile
        });
        tile.layers = (flatten(layers, Boolean) as Layer[]).map(layer =>
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

  filterSubLayer({layer}) {
    return layer.props.tile.isVisible;
  }
}
