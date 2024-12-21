import {
  Color,
  CompositeLayer,
  CompositeLayerProps,
  DefaultProps,
  Layer,
  LayersList,
  Material,
  Texture,
  UpdateParameters
} from '@deck.gl/core';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import type {MeshAttributes} from '@loaders.gl/schema';
import {TileLayerProps} from '../tile-layer/tile-layer';
import Tile2DHeader from '../tile-layer/tile-2d-header';
import {Bounds, TileLoadProps, ZRange} from '../tile-layer/types';
declare type URLTemplate = string | string[];
declare type ElevationDecoder = {
  rScaler: number;
  gScaler: number;
  bScaler: number;
  offset: number;
};
declare type TerrainLoadProps = {
  bounds: Bounds;
  elevationData: string | null;
  elevationDecoder: ElevationDecoder;
  meshMaxError: number;
  signal?: AbortSignal;
};
declare type MeshAndTexture = [MeshAttributes | null, Texture | null];
/** All properties supported by TerrainLayer */
export declare type TerrainLayerProps = _TerrainLayerProps &
  TileLayerProps<MeshAndTexture> &
  CompositeLayerProps;
/** Props added by the TerrainLayer */
declare type _TerrainLayerProps = {
  /** Image url that encodes height data. **/
  elevationData: URLTemplate;
  /** Image url to use as texture. **/
  texture?: URLTemplate | null;
  /** Martini error tolerance in meters, smaller number -> more detailed mesh. **/
  meshMaxError?: number;
  /** Bounding box of the terrain image, [minX, minY, maxX, maxY] in world coordinates. **/
  bounds?: Bounds | null;
  /** Color to use if texture is unavailable. **/
  color?: Color;
  /** Object to decode height data, from (r, g, b) to height in meters. **/
  elevationDecoder?: ElevationDecoder;
  /** Whether to render the mesh in wireframe mode. **/
  wireframe?: boolean;
  /** Material props for lighting effect. **/
  material?: Material;
};
/** Render mesh surfaces from height map images. */
export default class TerrainLayer<ExtraPropsT = {}> extends CompositeLayer<
  ExtraPropsT & Required<_TerrainLayerProps & Required<TileLayerProps<MeshAndTexture>>>
> {
  static defaultProps: DefaultProps<TerrainLayerProps>;
  static layerName: string;
  state: {
    isTiled?: boolean;
    terrain: MeshAttributes;
    zRange?: ZRange | null;
  };
  updateState({props, oldProps}: UpdateParameters<this>): void;
  loadTerrain({
    elevationData,
    bounds,
    elevationDecoder,
    meshMaxError,
    signal
  }: TerrainLoadProps): Promise<MeshAttributes> | null;
  getTiledTerrainData(tile: TileLoadProps): Promise<MeshAndTexture>;
  renderSubLayers(
    props: TileLayerProps<MeshAndTexture> & {
      id: string;
      data: MeshAndTexture;
      tile: Tile2DHeader<MeshAndTexture>;
    }
  ): SimpleMeshLayer<any, {}>;
  onViewportLoad(tiles?: Tile2DHeader<MeshAndTexture>[]): void;
  renderLayers(): Layer | null | LayersList;
}
export {};
// # sourceMappingURL=terrain-layer.d.ts.map
