import {Layer, DefaultProps, LayerContext, Material} from '@deck.gl/core';
import {Model, Texture2D} from '@luma.gl/webgl-legacy';
import type {LayerProps, UpdateParameters, Accessor, Position, Color} from '@deck.gl/core';
import type {MeshAttribute, MeshAttributes} from '@loaders.gl/schema';
import type {Geometry as GeometryType} from '@luma.gl/engine';
import {GLTFMaterialParser} from '@luma.gl/experimental';
declare type Mesh =
  | GeometryType
  | {
      attributes: MeshAttributes;
      indices?: MeshAttribute;
    }
  | MeshAttributes;
declare type _SimpleMeshLayerProps<DataT> = {
  mesh: string | Mesh | Promise<Mesh> | null;
  texture?: string | Texture2D | Promise<Texture2D>;
  /** Customize the [texture parameters](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter). */
  textureParameters?: Record<number, number> | null;
  /** Anchor position accessor. */
  getPosition?: Accessor<DataT, Position>;
  /** Color value or accessor.
   * If `mesh` does not contain vertex colors, use this color to render each object.
   * If `mesh` contains vertex colors, then the two colors are mixed together.
   * Use `[255, 255, 255]` to use the original mesh colors.
   * If `texture` is assigned, then both colors will be ignored.
   * @default [0, 0, 0, 255]
   */
  getColor?: Accessor<DataT, Color>;
  /**
   * Orientation in [pitch, yaw, roll] in degrees.
   * @see https://en.wikipedia.org/wiki/Euler_angles
   * @default [0, 0, 0]
   */
  getOrientation?: Accessor<DataT, [number, number, number]>;
  /**
   * Scaling factor of the model along each axis.
   * @default [1, 1, 1]
   */
  getScale?: Accessor<DataT, [number, number, number]>;
  /**
   * Translation from the anchor point, [x, y, z] in meters.
   * @default [0, 0, 0]
   */
  getTranslation?: Accessor<DataT, [number, number, number]>;
  /**
   * TransformMatrix. If specified, `getOrientation`, `getScale` and `getTranslation` are ignored.
   */
  getTransformMatrix?: Accessor<DataT, number[]>;
  /**
   * Multiplier to scale each geometry by.
   * @default 1
   */
  sizeScale?: number;
  /**
   * @deprecated Whether to color pixels using vertex colors supplied in the mesh (the `COLOR_0` or `colors` attribute).
   * If set to `false` vertex colors will be ignored.
   * This prop will be removed and set to always true in the next major release.
   * @default false
   */
  _useMeshColors?: boolean;
  /**
   * (Experimental) If rendering only one instance of the mesh, set this to false to treat mesh positions
   * as deltas of the world coordinates of the anchor.
   * E.g. in LNGLAT coordinates, mesh positions are interpreted as meter offsets by default.
   * setting _instanced to false interpreted mesh positions as lnglat deltas.
   * @default true
   */
  _instanced?: true;
  /**
   * Whether to render the mesh in wireframe mode.
   * @default false
   */
  wireframe?: false;
  /**
   * Material props for lighting effect.
   *
   * @default true
   * @see https://deck.gl/docs/developer-guide/using-lighting#constructing-a-material-instance
   */
  material?: Material;
};
export declare type SimpleMeshLayerProps<DataT = any> = _SimpleMeshLayerProps<DataT> &
  LayerProps<DataT>;
/** Render a number of instances of an arbitrary 3D geometry. */
export default class SimpleMeshLayer<DataT = any, ExtraPropsT = {}> extends Layer<
  ExtraPropsT & Required<_SimpleMeshLayerProps<DataT>>
> {
  static defaultProps: DefaultProps<SimpleMeshLayerProps<any>>;
  static layerName: string;
  state: {
    materialParser?: GLTFMaterialParser;
    model?: Model;
    emptyTexture: Texture2D;
    hasNormals?: boolean;
  };
  getShaders(): any;
  initializeState(): void;
  updateState(params: UpdateParameters<this>): void;
  finalizeState(context: LayerContext): void;
  draw({uniforms}: {uniforms: any}): void;
  protected getModel(mesh: Mesh): Model;
  private setTexture;
}
export {};
// # sourceMappingURL=simple-mesh-layer.d.ts.map
