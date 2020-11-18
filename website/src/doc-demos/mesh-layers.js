import {
  ScenegraphLayer
} from '@deck.gl/mesh-layers';
import {registerLoaders} from '@loaders.gl/core';
import {GLTFLoader} from '@loaders.gl/gltf';

import makeLayerDemo from './layer-demo';
import {DATA_URI} from '../constants/defaults';

registerLoaders([GLTFLoader]);

export const ScenegraphLayerDemo = makeLayerDemo({
  getTooltip: ({object}) => `${object.name}\n${object.address}`,
  layer: new ScenegraphLayer({
    data: `${DATA_URI}/bart-stations.json`,
    pickable: true,
    scenegraph: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoxAnimated/glTF-Binary/BoxAnimated.glb',
    getPosition: d => d.coordinates,
    getOrientation: d => [0, Math.random() * 180, 90],
    _animations: {
      '*': {speed: 5}
    },
    sizeScale: 500,
    _lighting: 'pbr'
  })
});
