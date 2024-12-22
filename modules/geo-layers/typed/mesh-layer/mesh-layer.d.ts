import type {NumericArray} from '@math.gl/core';
import {GLTFMaterialParser} from '@luma.gl/experimental';
import {Model} from '@luma.gl/webgl-legacy';
import type {MeshAttribute, MeshAttributes} from '@loaders.gl/schema';
import type {UpdateParameters, DefaultProps, LayerContext} from '@deck.gl/core';
import {SimpleMeshLayer, SimpleMeshLayerProps} from '@deck.gl/mesh-layers';
export declare type Mesh = {
  attributes: MeshAttributes;
  indices?: MeshAttribute;
};
/** All properties supported by MeshLayer. */
export declare type MeshLayerProps<DataT = any> = _MeshLayerProps<DataT> &
  SimpleMeshLayerProps<DataT>;
/** Properties added by MeshLayer. */
declare type _MeshLayerProps<DataT> = {
  /**
   * PBR material object. _lighting must be pbr for this to work
   */
  pbrMaterial?: any;
  /**
   * List of feature ids.
   */
  featureIds?: NumericArray | null;
};
export default class MeshLayer<DataT = any, ExtraProps = {}> extends SimpleMeshLayer<
  DataT,
  Required<_MeshLayerProps<DataT>> & ExtraProps
> {
  static layerName: string;
  static defaultProps: DefaultProps<MeshLayerProps<any>>;
  getShaders(): any;
  initializeState(): void;
  updateState(params: UpdateParameters<this>): void;
  draw(opts: any): void;
  protected getModel(mesh: Mesh): Model;
  updatePbrMaterialUniforms(pbrMaterial: any): void;
  parseMaterial(pbrMaterial: any, mesh: any): GLTFMaterialParser;
  calculateFeatureIdsPickingColors(attribute: any): void;
  finalizeState(context: LayerContext): void;
}
export {};
// # sourceMappingURL=mesh-layer.d.ts.map
