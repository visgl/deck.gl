import {Layer} from '@deck.gl/core';
import {RequestScheduler} from '@loaders.gl/loader-utils';
import {TileBoundingBox, TileIndex, TileLoadProps} from './types';
export declare type TileLoadDataProps<DataT = any> = {
  requestScheduler: RequestScheduler;
  getData: (props: TileLoadProps) => Promise<DataT>;
  onLoad: (tile: Tile2DHeader<DataT>) => void;
  onError: (error: any, tile: Tile2DHeader<DataT>) => void;
};
export default class Tile2DHeader<DataT = any> {
  index: TileIndex;
  isVisible: boolean;
  isSelected: boolean;
  parent: Tile2DHeader | null;
  children: Tile2DHeader[] | null;
  content: DataT | null;
  state?: number;
  layers?: Layer[] | null;
  id: string;
  bbox: TileBoundingBox;
  zoom: number;
  userData?: Record<string, any>;
  private _abortController;
  private _loader;
  private _loaderId;
  private _isLoaded;
  private _isCancelled;
  private _needsReload;
  constructor(index: TileIndex);
  get data(): Promise<DataT | null> | DataT | null;
  get isLoaded(): boolean;
  get isLoading(): boolean;
  get needsReload(): boolean;
  get byteLength(): number;
  private _loadData;
  loadData(opts: TileLoadDataProps): Promise<void>;
  setNeedsReload(): void;
  abort(): void;
}
// # sourceMappingURL=tile-2d-header.d.ts.map
