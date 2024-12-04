// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
import {Matrix4} from '@math.gl/core';
import {registerLoaders} from '@loaders.gl/core';
import {GLTFLoader} from '@loaders.gl/gltf';

// Register the proper loader for scenegraph.gltf
registerLoaders(GLTFLoader);

import {meshSampleData} from 'deck.gl-test/data';

export default [
  {
    name: 'scenegraph-layer-frame-1',
    viewState: {
      latitude: 37.75,
      longitude: -122.45,
      zoom: 16,
      pitch: 30,
      bearing: 0
    },
    onBeforeRender: ({deck, layers}) => {
      deck.animationLoop.timeline.pause();
      deck.animationLoop.timeline.setTime(0);
    },
    layers: [
      new ScenegraphLayer({
        id: 'scenegraph-layer',
        data: meshSampleData,
        scenegraph: './test/data/BoxAnimated.glb',
        coordinateOrigin: [-122.45, 37.75, 0],
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT_OFFSETS,
        getPosition: d => [d.position[0] / 1e5, d.position[1] / 1e5, 10],
        getOrientation: d => d.orientation,
        _animations: {
          '*': {speed: 5}
        },
        sizeScale: 30,
        _lighting: 'pbr'
      })
    ],
    goldenImage: './test/render/golden-images/scenegraph-layer-frame-1.png'
  },
  {
    name: 'scenegraph-layer-frame-2',
    viewState: {
      latitude: 37.75,
      longitude: -122.45,
      zoom: 16,
      pitch: 30,
      bearing: 0
    },
    onBeforeRender: ({deck, layers}) => {
      deck.animationLoop.timeline.pause();
      deck.animationLoop.timeline.setTime(400);
    },
    layers: [
      new ScenegraphLayer({
        id: 'scenegraph-layer',
        data: meshSampleData,
        scenegraph: './test/data/BoxAnimated.glb',
        coordinateOrigin: [-122.45, 37.75, 0],
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT_OFFSETS,
        getPosition: d => [d.position[0] / 1e5, d.position[1] / 1e5, 10],
        getOrientation: d => d.orientation,
        _animations: {
          '*': {speed: 5}
        },
        sizeScale: 30,
        _lighting: 'pbr'
      })
    ],
    goldenImage: './test/render/golden-images/scenegraph-layer-frame-2.png'
  },
  {
    name: 'scenegraph-layer-frame-3',
    viewState: {
      latitude: 37.75,
      longitude: -122.45,
      zoom: 16,
      pitch: 30,
      bearing: 0
    },
    onBeforeRender: ({deck, layers}) => {
      deck.animationLoop.timeline.pause();
      deck.animationLoop.timeline.setTime(1000);
    },
    layers: [
      new ScenegraphLayer({
        id: 'scenegraph-layer',
        data: meshSampleData,
        scenegraph: './test/data/BoxAnimated.glb',
        coordinateOrigin: [-122.45, 37.75, 0],
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT_OFFSETS,
        getPosition: d => [d.position[0] / 1e5, d.position[1] / 1e5, 10],
        getOrientation: d => d.orientation,
        _animations: {
          '*': {speed: 5}
        },
        sizeScale: 30,
        _lighting: 'pbr'
      })
    ],
    goldenImage: './test/render/golden-images/scenegraph-layer-frame-3.png'
  },
  ...['flat', 'pbr'].map(lighting => ({
    name: `scenegraph-layer-duck-${lighting}`,
    viewState: {
      latitude: 37.75,
      longitude: -122.45,
      zoom: 16,
      pitch: 30,
      bearing: 0
    },
    layers: [
      new ScenegraphLayer({
        id: `scenegraph-layer-${lighting}`,
        data: meshSampleData,
        scenegraph:
          'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb',
        coordinateOrigin: [-122.45, 37.75, 0],
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT_OFFSETS,
        getPosition: d => [d.position[0] / 1e5, d.position[1] / 1e5, 10],
        getOrientation: (d, {index}) => [-3 * index, -0.5 * index, 0],
        sizeScale: 50,
        _lighting: lighting
      })
    ],
    goldenImage: `./test/render/golden-images/scenegraph-layer-duck-${lighting}.png`
  }))
];
