import {SimpleMeshLayer, ScenegraphLayer} from '@deck.gl/mesh-layers';
import {registerLoaders} from '@loaders.gl/core';
import {GLTFLoader} from '@loaders.gl/gltf';
import {GLTFEnvironment} from '@luma.gl/experimental';
import GL from '@luma.gl/constants';

import * as dataSamples from '../data-samples';

registerLoaders([GLTFLoader]);

const GLTF_BASE_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/luma.gl/examples/gltf/';

const CUBE_1x1x1 =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/layer-browser/cube_1x1x1.glb';

const CUBE_FACE_TO_DIRECTION = {
  [GL.TEXTURE_CUBE_MAP_POSITIVE_X]: 'right',
  [GL.TEXTURE_CUBE_MAP_NEGATIVE_X]: 'left',
  [GL.TEXTURE_CUBE_MAP_POSITIVE_Y]: 'top',
  [GL.TEXTURE_CUBE_MAP_NEGATIVE_Y]: 'bottom',
  [GL.TEXTURE_CUBE_MAP_POSITIVE_Z]: 'front',
  [GL.TEXTURE_CUBE_MAP_NEGATIVE_Z]: 'back'
};

const IMAGE_BASED_LIGHTING_ENVIRONMENT = {
  brdfLutUrl: `${GLTF_BASE_URL}/brdfLUT.png`,
  getTexUrl: (type, dir, mipLevel) =>
    `${GLTF_BASE_URL}/papermill/${type}/${type}_${CUBE_FACE_TO_DIRECTION[dir]}_${mipLevel}.jpg`
};

const SimpleMeshLayerExample = {
  layer: SimpleMeshLayer,
  props: {
    id: 'mesh-layer',
    data: dataSamples.points,
    mesh:
      'https://raw.githubusercontent.com/uber-web/loaders.gl/e8e7f724cc1fc1d5882125b13e672e44e5ada14e/modules/ply/test/data/cube_att.ply',
    sizeScale: 40,
    getPosition: d => d.COORDINATES,
    getColor: d => [Math.random() * 255, Math.random() * 255, Math.random() * 255],
    getTransformMatrix: d => [
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      0,
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      0,
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      0,
      0,
      0,
      Math.random() * 10000,
      1
    ]
  }
};

const ScenegraphLayerExample = {
  layer: ScenegraphLayer,
  props: {
    id: 'scenegraph-layer',
    data: dataSamples.points,
    pickable: true,
    sizeScale: 50,
    scenegraph:
      'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb',
    getPosition: d => d.COORDINATES,
    getOrientation: d => [Math.random() * 360, Math.random() * 360, Math.random() * 360],
    getTranslation: d => [0, 0, Math.random() * 10000],
    getScale: [1, 1, 1],
    _lighting: 'flat'
  }
};

const ScenegraphLayerPbrExample = {
  layer: ScenegraphLayer,
  props: {
    id: 'scenegraph-layer-pbr',
    data: dataSamples.points,
    pickable: true,
    sizeScale: 50,
    scenegraph:
      'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb',
    getPosition: d => d.COORDINATES,
    getOrientation: d => [Math.random() * 360, Math.random() * 360, Math.random() * 360],
    getTranslation: d => [0, 0, Math.random() * 10000],
    getScale: [1, 1, 1],
    _lighting: 'pbr'
  }
};

const ScenegraphLayerPbrIblExample = {
  layer: ScenegraphLayer,
  props: {
    id: 'scenegraph-layer-pbr-ibl',
    data: dataSamples.points.slice(0, 5),
    pickable: true,
    sizeScale: 50,
    scenegraph:
      'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    getPosition: d => d.COORDINATES,
    getOrientation: [0, 0, 90],
    getTranslation: d => [0, 0, 1000],
    getScale: [10, 10, 10],
    _lighting: 'pbr',
    _imageBasedLightingEnvironment: ({gl}) =>
      new GLTFEnvironment(gl, IMAGE_BASED_LIGHTING_ENVIRONMENT)
  }
};

const ScenegraphLayerMinMaxExample = {
  layer: ScenegraphLayer,
  props: {
    id: 'scenegraph-layer-minmax',
    data: dataSamples.points,
    pickable: true,
    sizeScale: 80,
    scenegraph: CUBE_1x1x1,
    getPosition: d => d.COORDINATES,
    getOrientation: [0, 0, 0],
    getTranslation: d => [0, 0, 0],
    getScale: [1, 1, 1],
    _lighting: 'pbr',
    sizeMinPixels: 5,
    sizeMaxPixels: 50
  }
};

/* eslint-disable quote-props */
export default {
  'Mesh Layers': {
    SimpleMeshLayer: SimpleMeshLayerExample,
    ScenegraphLayer: ScenegraphLayerExample,
    'ScenegraphLayer (PBR)': ScenegraphLayerPbrExample,
    'ScenegraphLayer (PBR+IBL)': ScenegraphLayerPbrIblExample,
    'ScenegraphLayer Min/Max Pixels': ScenegraphLayerMinMaxExample
  }
};
