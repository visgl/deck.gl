import type {NumericArray} from '@math.gl/core';
import {GLTFMaterialParser} from '@luma.gl/experimental';
import {Model, pbr} from '@luma.gl/core';
import GL from '@luma.gl/constants';
import type {MeshAttribute, MeshAttributes} from '@loaders.gl/schema';
import type {UpdateParameters} from '@deck.gl/core';
import {SimpleMeshLayer, SimpleMeshLayerProps} from '@deck.gl/mesh-layers';

import vs from './mesh-layer-vertex.glsl';
import fs from './mesh-layer-fragment.glsl';

export type Mesh = {
  attributes: MeshAttributes;
  indices?: MeshAttribute;
};

function validateGeometryAttributes(attributes) {
  const hasColorAttribute = attributes.COLOR_0 || attributes.colors;
  if (!hasColorAttribute) {
    attributes.colors = {constant: true, value: new Float32Array([1, 1, 1])};
  }
}

const defaultProps = {
  pbrMaterial: {type: 'object', value: null},
  featureIds: {type: 'array', value: null, optional: true}
};

/** All properties supported by _MeshLayer. */
export type _MeshLayerProps<DataT = any> = __MeshLayerProps<DataT> & SimpleMeshLayerProps<DataT>;

/** Properties added by _MeshLayer. */
type __MeshLayerProps<DataT = any> = {
  /**
   * PBR material object. _lighting must be pbr for this to work
   */
  pbrMaterial?: any; // TODO add type when converting Tile3DLayer

  /**
   * List of feature ids.
   */
  featureIds: NumericArray;
};

export default class _MeshLayer<DataT = any, ExtraProps = {}> extends SimpleMeshLayer<
  DataT,
  Required<__MeshLayerProps> & ExtraProps
> {
  static layerName = '_MeshLayer';
  static defaultProps: any = defaultProps;

  getShaders() {
    const shaders = super.getShaders();
    const modules = shaders.modules;
    modules.push(pbr);
    return {...shaders, vs, fs};
  }

  initializeState() {
    const {featureIds} = this.props;
    super.initializeState();

    const attributeManager = this.getAttributeManager();
    if (featureIds) {
      // attributeManager is always defined in a primitive layer
      attributeManager!.add({
        featureIdsPickingColors: {
          type: GL.UNSIGNED_BYTE,
          size: 3,
          noAlloc: true,
          update: this.calculateFeatureIdsPickingColors
        }
      });
    }
  }

  updateState(params: UpdateParameters<this>) {
    super.updateState(params);

    const {props, oldProps} = params;
    if (props.pbrMaterial !== oldProps.pbrMaterial) {
      this.updatePbrMaterialUniforms(props.pbrMaterial);
    }
  }

  draw(opts) {
    const {featureIds} = this.props;
    if (!this.state.model) {
      return;
    }
    this.state.model.setUniforms({
      // Needed for PBR (TODO: find better way to get it)
      u_Camera: this.state.model.getUniforms().project_uCameraPosition,
      u_pickFeatureIds: Boolean(featureIds)
    });

    super.draw(opts);
  }

  protected getModel(mesh: Mesh): Model {
    const {id, pbrMaterial} = this.props;
    const materialParser = this.parseMaterial(pbrMaterial, mesh);
    const shaders = this.getShaders();
    validateGeometryAttributes(mesh.attributes);
    const model = new Model(this.context.gl, {
      ...this.getShaders(),
      id,
      geometry: mesh,
      defines: {
        ...shaders.defines,
        ...materialParser?.defines,
        HAS_UV_REGIONS: mesh.attributes.uvRegions
      },
      parameters: materialParser?.parameters,
      isInstanced: true
    });

    return model;
  }

  updatePbrMaterialUniforms(pbrMaterial) {
    const {model} = this.state;
    if (model) {
      const {mesh} = this.props;
      const materialParser = this.parseMaterial(pbrMaterial, mesh);
      model.setUniforms(materialParser.uniforms);
    }
  }

  parseMaterial(pbrMaterial, mesh) {
    const unlit = Boolean(
      pbrMaterial.pbrMetallicRoughness && pbrMaterial.pbrMetallicRoughness.baseColorTexture
    );
    const materialParser = new GLTFMaterialParser(this.context.gl, {
      attributes: {NORMAL: mesh.attributes.normals, TEXCOORD_0: mesh.attributes.texCoords},
      material: {unlit, ...pbrMaterial},
      pbrDebug: false,
      imageBasedLightingEnvironment: null,
      lights: true,
      useTangents: false
    });
    return materialParser;
  }

  calculateFeatureIdsPickingColors(attribute) {
    const {featureIds} = this.props;
    const value = new Uint8ClampedArray(featureIds.length * attribute.size);

    const pickingColor = [];
    for (let index = 0; index < featureIds.length; index++) {
      this.encodePickingColor(featureIds[index], pickingColor);

      value[index * 3] = pickingColor[0];
      value[index * 3 + 1] = pickingColor[1];
      value[index * 3 + 2] = pickingColor[2];
    }

    attribute.value = value;
  }
}
