/* eslint-disable no-template-curly-in-string */
import {ScenegraphLayer, SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {OBJLoader} from '@loaders.gl/obj';

import {makeLayerDemo} from './demo-base';
import {DATA_URI} from '../constants/defaults';

export const ScenegraphLayerDemo = makeLayerDemo({
  Layer: ScenegraphLayer,
  getTooltip: '({object}) => object && `${object.name}\n${object.address}`',
  props: `{
    data: '${DATA_URI}/bart-stations.json',
    pickable: true,
    scenegraph: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoxAnimated/glTF-Binary/BoxAnimated.glb',
    getPosition: d => d.coordinates,
    getOrientation: d => [0, Math.random() * 180, 90],
    _animations: {
      '*': {speed: 5}
    },
    sizeScale: 500,
    _lighting: 'pbr'
  }`
});

export const SimpleMeshLayerDemo = makeLayerDemo({
  Layer: SimpleMeshLayer,
  dependencies: ['https://unpkg.com/@loaders.gl/obj@beta/dist/dist.min.js'],
  imports: {OBJLoader},
  getTooltip: '({object}) => object && `${object.name}\n${object.address}`',
  props: `{
    data: '${DATA_URI}/bart-stations.json',
    pickable: true,
    mesh: '${DATA_URI}/humanoid_quad.obj',
    getPosition: d => d.coordinates,
    getColor: d => [Math.sqrt(d.exits), 140, 0],
    getOrientation: d => [0, Math.random() * 180, 0],
    sizeScale: 30,
    loaders: [OBJLoader]
  }`
});
