import type {NumericArray} from '@math.gl/core';
import {parsePBRMaterial, ParsedPBRMaterial} from '@luma.gl/gltf';
import {pbr} from '@luma.gl/shadertools';
import {Model} from '@luma.gl/engine';
import type {MeshAttribute, MeshAttributes} from '@loaders.gl/schema';
import type {UpdateParameters, DefaultProps, LayerContext} from '@deck.gl/core';
import {SimpleMeshLayer, SimpleMeshLayerProps} from '@deck.gl/mesh-layers';

import vs from './mesh-layer-vertex.glsl';
import fs from './mesh-layer-fragment.glsl';

export type Mesh = {
  attributes: MeshAttributes;
  indices?: MeshAttribute;
};

function validateGeometryAttributes(attributes: MeshAttributes) {
  const positionAttribute = attributes.positions || attributes.POSITION;
  const vertexCount = positionAttribute.value.length / positionAttribute.size;
  const hasColorAttribute = attributes.COLOR_0 || attributes.colors;
  if (!hasColorAttribute) {
    attributes.colors = {
      size: 4,
      value: new Uint8Array(vertexCount * 4).fill(255),
      normalized: true
    };
  }
}

const defaultProps: DefaultProps<MeshLayerProps> = {
  pbrMaterial: {type: 'object', value: null},
  featureIds: {type: 'array', value: null, optional: true}
};

/** All properties supported by MeshLayer. */
export type MeshLayerProps<DataT = unknown> = _MeshLayerProps & SimpleMeshLayerProps<DataT>;

/** Properties added by MeshLayer. */
type _MeshLayerProps = {
  /**
   * PBR material object. _lighting must be pbr for this to work
   */
  pbrMaterial?: any; // TODO add type when converting Tile3DLayer

  /**
   * List of feature ids.
   */
  featureIds?: NumericArray | null;
};

export default class MeshLayer<DataT = any, ExtraProps extends {} = {}> extends SimpleMeshLayer<
  DataT,
  Required<_MeshLayerProps> & ExtraProps
> {
  static layerName = 'MeshLayer';
  static defaultProps = defaultProps;

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
          type: 'uint8',
          size: 3,
          noAlloc: true,
          // eslint-disable-next-line @typescript-eslint/unbound-method
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
      // eslint-disable-next-line camelcase
      u_Camera: this.state.model.uniforms.project_uCameraPosition,
      pickFeatureIds: Boolean(featureIds)
    });

    super.draw(opts);
  }

  protected getModel(mesh: Mesh): Model {
    const {id, pbrMaterial} = this.props;
    const parsedPBRMaterial = this.parseMaterial(pbrMaterial, mesh);
    // Keep material to explicitly remove textures
    this.setState({parsedPBRMaterial});
    const shaders = this.getShaders();
    validateGeometryAttributes(mesh.attributes);
    const model = new Model(this.context.device, {
      ...this.getShaders(),
      id,
      geometry: mesh,
      bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
      defines: {
        ...shaders.defines,
        ...parsedPBRMaterial?.defines,
        HAS_UV_REGIONS: mesh.attributes.uvRegions ? 1 : 0
      },
      parameters: parsedPBRMaterial?.parameters,
      isInstanced: true
    });

    return model;
  }

  updatePbrMaterialUniforms(pbrMaterial) {
    const {model} = this.state;
    if (model) {
      const {mesh} = this.props;
      const parsedPBRMaterial = this.parseMaterial(pbrMaterial, mesh as Mesh);
      // Keep material to explicitly remove textures
      this.setState({parsedPBRMaterial});
      model.setBindings(parsedPBRMaterial.bindings);
      model.setUniforms(parsedPBRMaterial.uniforms);
    }
  }

  parseMaterial(pbrMaterial, mesh: Mesh): ParsedPBRMaterial {
    const unlit = Boolean(
      pbrMaterial.pbrMetallicRoughness && pbrMaterial.pbrMetallicRoughness.baseColorTexture
    );

    return parsePBRMaterial(
      this.context.device,
      {unlit, ...pbrMaterial},
      {NORMAL: mesh.attributes.normals, TEXCOORD_0: mesh.attributes.texCoords},
      {
        pbrDebug: false,
        lights: true,
        useTangents: false
      }
    );
  }

  calculateFeatureIdsPickingColors(attribute) {
    // This updater is only called if featureIds is not null
    const featureIds = this.props.featureIds!;
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

  finalizeState(context: LayerContext) {
    super.finalizeState(context);
    this.state.parsedPBRMaterial?.generatedTextures.forEach(texture => texture.destroy());
    this.setState({parsedPBRMaterial: null});
  }
}
