// Note: This file will either be moved back to deck.gl or reformatted to web-monorepo standards
// Disabling lint temporarily to facilitate copying code in and out of this repo
/* eslint-disable */

// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import {default as GLTFMaterialParser} from './gltf-material-parser';
import {Layer, project32, phongLighting, picking, COORDINATE_SYSTEM, log} from '@deck.gl/core';
import GL from '@luma.gl/constants';
import {Model, Geometry, Texture2D, isWebGL2, pbr} from '@luma.gl/core';
import {hasFeature, FEATURES} from '@luma.gl/webgl';

import {MATRIX_ATTRIBUTES, shouldComposeModelMatrix} from '../utils/matrix';

import vs from './simple-mesh-layer-vertex.glsl';
import fs from './simple-mesh-layer-fragment.glsl';

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
    } else {
      return new Geometry(data);
    }
  } else if (data.positions || data.POSITION) {
    validateGeometryAttributes(data, useMeshColors);
    return new Geometry({
      attributes: data
    });
  }
  throw Error('Invalid mesh');
}

const DEFAULT_COLOR = [0, 0, 0, 255];

const defaultProps = {
  mesh: {value: null, type: 'object', async: true},
  texture: {type: 'image', value: null, async: true},
  sizeScale: {type: 'number', value: 1, min: 0},
  // Whether the color attribute in a mesh will be used
  // This prop will be removed and set to true in next major release
  _useMeshColors: {type: 'boolean', value: false},

  // _instanced is a hack to use world position instead of meter offsets in mesh
  // TODO - formalize API
  _instanced: true,
  // NOTE(Tarek): Quick and dirty wireframe. Just draws
  // the same mesh with LINE_STRIPS. Won't follow edges
  // of the original mesh.
  wireframe: false,
  // Optional material for 'lighting' shader module
  material: true,
  getPosition: {type: 'accessor', value: x => x.position},
  getColor: {type: 'accessor', value: DEFAULT_COLOR},
  isDebugMode: false,

  // yaw, pitch and roll are in degrees
  // https://en.wikipedia.org/wiki/Euler_angles
  // [pitch, yaw, roll]
  getOrientation: {type: 'accessor', value: [0, 0, 0]},
  getScale: {type: 'accessor', value: [1, 1, 1]},
  getTranslation: {type: 'accessor', value: [0, 0, 0]},
  // 4x4 matrix
  getTransformMatrix: {type: 'accessor', value: []}
};

export default class SimpleMeshLayer extends Layer {
  getShaders() {
    const {material, isDebugMode} = this.props;
    const transpileToGLSL100 = !isWebGL2(this.context.gl);

    const defines = {};
    if (hasFeature(this.context.gl, FEATURES.GLSL_DERIVATIVES)) {
      defines.DERIVATIVES_AVAILABLE = 1;
    }
    if (isDebugMode) {
      defines.INSTANCE_PICKING_MODE = 1;
    }
    const modules = [project32, phongLighting, picking];
    if (material) {
      modules.push(pbr);
    }

    return super.getShaders({
      vs,
      fs,
      modules,
      transpileToGLSL100,
      defines
    });
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();

    attributeManager.addInstanced({
      instancePositions: {
        transition: true,
        type: GL.DOUBLE,
        fp64: this.use64bitPositions(),
        size: 3,
        accessor: 'getPosition'
      },
      instanceColors: {
        type: GL.UNSIGNED_BYTE,
        transition: true,
        size: this.props.colorFormat.length,
        normalized: true,
        accessor: 'getColor',
        defaultValue: [0, 0, 0, 255]
      },
      instanceModelMatrix: MATRIX_ATTRIBUTES
    });

    this.state.attributeManager.add({
      pickingColors: {
        type: GL.UNSIGNED_BYTE,
        size: 3,
        noAlloc: true,
        update: this.calculatePickingColors
      }
    });

    this.setState({
      // Avoid luma.gl's missing uniform warning
      // TODO - add feature to luma.gl to specify ignored uniforms?
      emptyTexture: new Texture2D(this.context.gl, {
        data: new Uint8Array(4),
        width: 1,
        height: 1
      })
    });
  }

  updateState({props, oldProps, changeFlags}) {
    super.updateState({props, oldProps, changeFlags});

    if (props.mesh !== oldProps.mesh || changeFlags.extensionsChanged) {
      this.state.model?.delete();
      if (props.mesh) {
        this.state.model = this.getModel(props.mesh);

        const attributes = props.mesh.attributes || props.mesh;
        this.setState({
          hasNormals: Boolean(attributes.NORMAL || attributes.normals)
        });
      }
      this.getAttributeManager().invalidateAll();
    }

    if (props.texture !== oldProps.texture) {
      this.setTexture(props.texture);
    }

    if (props.material !== oldProps.material) {
      this.setMaterial(props.material);
    }

    if (this.state.model) {
      this.state.model.setDrawMode(this.props.wireframe ? GL.LINE_STRIP : GL.TRIANGLES);
    }
  }

  finalizeState() {
    super.finalizeState();

    this.state.emptyTexture.delete();
  }

  draw({uniforms}) {
    if (!this.state.model) {
      return;
    }

    const {viewport} = this.context;
    const {sizeScale, coordinateSystem, _instanced} = this.props;

    this.state.model
      .setUniforms(uniforms)
      .setUniforms({
        sizeScale,
        composeModelMatrix: !_instanced || shouldComposeModelMatrix(viewport, coordinateSystem),
        flatShading: !this.state.hasNormals,
        // Needed for PBR (TODO: find better way to get it)
        u_Camera: this.state.model.getUniforms().project_uCameraPosition
      })
      .draw();
  }

  getModel(mesh) {
    let materialParser = null;
    if (this.props.material) {
      const material = this.props.material;
      const unlit = Boolean(
        material.pbrMetallicRoughness && material.pbrMetallicRoughness.baseColorTexture
      );
      materialParser = new GLTFMaterialParser(this.context.gl, {
        attributes: {NORMAL: mesh.attributes.normals, TEXCOORD_0: mesh.attributes.texCoords},
        material: {unlit, ...material},
        pbrDebug: false,
        imageBasedLightingEnvironment: null,
        lights: true,
        useTangents: false
      });
    }

    const shaders = this.getShaders();

    const customDefines = {};
    if (mesh.attributes.uvRegions) {
      customDefines.HAS_UV_REGION = 1;
    }

    const model = new Model(this.context.gl, {
      ...this.getShaders(),
      id: this.props.id,
      geometry: getGeometry(mesh, this.props._useMeshColors),
      defines: {...shaders.defines, ...materialParser?.defines, ...customDefines},
      parameters: materialParser?.parameters,
      isInstanced: true
    });

    const {texture} = this.props;
    const {emptyTexture} = this.state;
    if (materialParser) {
      model.setUniforms(materialParser.uniforms);
    } else {
      model.setUniforms({
        sampler: texture || emptyTexture,
        hasTexture: Boolean(texture)
      });
    }

    return model;
  }

  setTexture(texture) {
    if (!this.props.material) {
      const {emptyTexture, model} = this.state;

      // props.mesh may not be ready at this time.
      // The sampler will be set when `getModel` is called
      model?.setUniforms({
        sampler: texture || emptyTexture,
        hasTexture: Boolean(texture)
      });
    }
  }

  setMaterial(material) {
    if (!material) {
      return;
    }
    const {model} = this.state;
    if (model) {
      const unlit = Boolean(
        material.pbrMetallicRoughness && material.pbrMetallicRoughness.baseColorTexture
      );
      const {mesh} = this.props;
      const materialParser = new GLTFMaterialParser(this.context.gl, {
        attributes: {NORMAL: mesh.attributes.normals, TEXCOORD_0: mesh.attributes.texCoords},
        material: {unlit, ...material},
        pbrDebug: false,
        imageBasedLightingEnvironment: null,
        lights: true,
        useTangents: false
      });

      model.setUniforms(materialParser.uniforms);
    }
  }

  calculatePickingColors(attribute) {
    if (!this.props.mesh.attributes.featureIds) {
      return;
    }

    const featuresIds = this.props.mesh.attributes.featureIds.value;
    const value = new Uint8ClampedArray(featuresIds.length * attribute.size);

    for (let index = 0; index < featuresIds.length; index++) {
      const color = this.encodePickingColor(featuresIds[index]);

      value[index * 3] = color[0];
      value[index * 3 + 1] = color[1];
      value[index * 3 + 2] = color[2];
    }

    attribute.value = value;
  }
}

SimpleMeshLayer.layerName = 'SimpleMeshLayer';
SimpleMeshLayer.defaultProps = defaultProps;
