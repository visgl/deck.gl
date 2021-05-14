import {GLTFMaterialParser} from '@luma.gl/experimental';
import {Model, Geometry, pbr} from '@luma.gl/core';
import {log} from '@deck.gl/core';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';

import vs from './mesh-layer-vertex.glsl';
import fs from './mesh-layer-fragment.glsl';

function validateGeometryAttributes(attributes, useMeshColors) {
  const hasColorAttribute = attributes.COLOR_0 || attributes.colors;
  const useColorAttribute = hasColorAttribute && useMeshColors;
  if (!useColorAttribute) {
    attributes.colors = {constant: true, value: new Float32Array([1, 1, 1])};
  }
  log.assert(
    attributes.positions || attributes.POSITION,
    'no "postions" or "POSITION" attribute in mesh'
  );
}

/*
 * Convert mesh data into geometry
 * @returns {Geometry} geometry
 */
function getGeometry(data, useMeshColors) {
  if (data.attributes) {
    validateGeometryAttributes(data.attributes, useMeshColors);
    if (data instanceof Geometry) {
      return data;
    }
    return new Geometry(data);
  } else if (data.positions || data.POSITION) {
    validateGeometryAttributes(data, useMeshColors);
    return new Geometry({
      attributes: data
    });
  }
  throw Error('Invalid mesh');
}

const defaultProps = {
  // flat or pbr
  _lighting: {type: 'string', value: 'flat'},
  // PBR material object. _lighting must be pbr for this to work
  pbrMaterial: {type: 'object', value: null}
};

export default class _MeshLayer extends SimpleMeshLayer {
  getShaders() {
    const {_lighting} = this.props;
    const shaders = super.getShaders();
    const modules = shaders.modules;

    if (_lighting === 'pbr') {
      modules.push(pbr);
    }

    return {...shaders, vs, fs};
  }

  updateState({props, oldProps, changeFlags}) {
    super.updateState({props, oldProps, changeFlags});
    if (props._lighting !== oldProps._lighting && props._lighting === 'pbr') {
      this.setPbrMaterial(props.pbrMaterial);
    }
  }

  draw({uniforms}) {
    this.state.model.setUniforms({
      // Needed for PBR (TODO: find better way to get it)
      u_Camera: this.state.model.getUniforms().project_uCameraPosition
    });
    super.draw({uniforms});
  }

  getModel(mesh) {
    let materialParser = null;
    if (this.props._lighting === 'pbr') {
      const pbrMaterial = this.props.pbrMaterial;
      const unlit = Boolean(
        pbrMaterial.pbrMetallicRoughness && pbrMaterial.pbrMetallicRoughness.baseColorTexture
      );
      materialParser = new GLTFMaterialParser(this.context.gl, {
        attributes: {NORMAL: mesh.attributes.normals, TEXCOORD_0: mesh.attributes.texCoords},
        material: {unlit, ...pbrMaterial},
        pbrDebug: false,
        imageBasedLightingEnvironment: null,
        lights: true,
        useTangents: false
      });
    }

    const shaders = this.getShaders();

    const model = new Model(this.context.gl, {
      ...this.getShaders(),
      id: this.props.id,
      geometry: getGeometry(mesh, this.props._useMeshColors),
      defines: {...shaders.defines, ...materialParser?.defines},
      parameters: materialParser?.parameters,
      isInstanced: true
    });

    if (this.props._lighting === 'flat') {
      const {texture} = this.props;
      const {emptyTexture} = this.state;
      model.setUniforms({
        sampler: texture || emptyTexture,
        hasTexture: Boolean(texture)
      });
    }

    return model;
  }

  setTexture(texture) {
    if (!this.props.pbrMaterial) {
      super.setTexture(texture);
    }
  }

  setPbrMaterial(pbrMaterial) {
    if (!pbrMaterial) {
      return;
    }
    const {model} = this.state;
    if (model) {
      const unlit = Boolean(
        pbrMaterial.pbrMetallicRoughness && pbrMaterial.pbrMetallicRoughness.baseColorTexture
      );
      const {mesh} = this.props;
      const materialParser = new GLTFMaterialParser(this.context.gl, {
        attributes: {NORMAL: mesh.attributes.normals, TEXCOORD_0: mesh.attributes.texCoords},
        material: {unlit, ...pbrMaterial},
        pbrDebug: false,
        imageBasedLightingEnvironment: null,
        lights: true,
        useTangents: false
      });

      model.setUniforms(materialParser.uniforms);
    }
  }
}

_MeshLayer.layerName = '_MeshLayer';
_MeshLayer.defaultProps = defaultProps;
