import {
  Accessor,
  Color,
  CompositeLayer,
  CompositeLayerProps,
  FilterContext,
  GetPickingInfoParams,
  Layer,
  LayersList,
  PickingInfo,
  UpdateParameters,
  Viewport
} from '@deck.gl/core';
import {Tileset3D, Tile3D} from '@loaders.gl/tiles';
import {Tiles3DLoader} from '@loaders.gl/3d-tiles';
/** All properties supported by Tile3DLayer */
export declare type Tile3DLayerProps<DataT = any> = _Tile3DLayerProps<DataT> &
  CompositeLayerProps<DataT>;
/** Props added by the Tile3DLayer */
declare type _Tile3DLayerProps<DataT> = {
  /** Color Accessor for point clouds. **/
  getPointColor?: Accessor<DataT, Color>;
  /** Global radius of all points in pixels. **/
  pointSize?: number;
  /** A loader which is used to decode the fetched tiles.
   * @deprecated Use `loaders` instead
   */
  loader?: typeof Tiles3DLoader;
  /** Called when Tileset JSON file is loaded. **/
  onTilesetLoad?: (tile: Tileset3D) => void;
  /** Called when a tile in the tileset hierarchy is loaded. **/
  onTileLoad?: (tile: Tile3D) => void;
  /** Called when a tile is unloaded. **/
  onTileUnload?: (tile: Tile3D) => void;
  /** Called when a tile fails to load. **/
  onTileError?: (tile: Tile3D, url: string, message: string) => void;
  /** (Experimental) Accessor to change color of mesh based on properties. **/
  _getMeshColor?: (tile: Tile3D) => Color;
};
/** Render 3d tiles data formatted according to the [3D Tiles Specification](https://www.opengeospatial.org/standards/3DTiles) and [`ESRI I3S`](https://github.com/Esri/i3s-spec) */
export default class Tile3DLayer<DataT = any, ExtraPropsT = {}> extends CompositeLayer<
  ExtraPropsT & Required<_Tile3DLayerProps<DataT>>
> {
  static defaultProps: any;
  static layerName: string;
  state: {
    activeViewports: {};
    frameNumber?: number;
    lastUpdatedViewports: {
      [viewportId: string]: Viewport;
    } | null;
    layerMap: {
      [layerId: string]: any;
    };
    tileset3d: Tileset3D | null;
  };
  initializeState(): void;
  get isLoaded(): boolean;
  shouldUpdateState({changeFlags}: UpdateParameters<this>): boolean;
  updateState({props, oldProps, changeFlags}: UpdateParameters<this>): void;
  activateViewport(viewport: Viewport): void;
  getPickingInfo({info, sourceLayer}: GetPickingInfoParams): PickingInfo;
  filterSubLayer({layer, viewport}: FilterContext): boolean;
  protected _updateAutoHighlight(info: PickingInfo): void;
  private _loadTileset;
  private _onTileLoad;
  private _onTileUnload;
  private _updateTileset;
  private _getSubLayer;
  private _makePointCloudLayer;
  private _make3DModelLayer;
  private _makeSimpleMeshLayer;
  renderLayers(): Layer | null | LayersList;
}
export {};
// # sourceMappingURL=tile-3d-layer.d.ts.map
