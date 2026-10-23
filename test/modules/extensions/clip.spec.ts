// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {
  LayerManager,
  MapView,
  WebMercatorViewport,
  _GlobeViewport as GlobeViewport
} from '@deck.gl/core';
import {ClipExtension} from '@deck.gl/extensions';
import {lngLatToMercatorCommon} from '@deck.gl/extensions/utils/projection-utils';
import {GeoJsonLayer, PathLayer, ScatterplotLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {getLayerUniforms, testLayer, device} from '@deck.gl/test-utils/vitest';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {geojsonToBinary} from '@loaders.gl/gis';

import {geojson, polygons, points} from 'deck.gl-test/data';

const webglTest = device.type === 'webgl' ? test : test.skip;

class DashArclengthPathLayer extends PathLayer {
  static layerName = 'DashArclengthPathLayer';

  getShaders() {
    const shaders = super.getShaders();
    return {
      ...shaders,
      defines: {...shaders.defines, DASH_ENABLED: 1}
    };
  }
}

test('ClipExtension#clipByInstance', () => {
  const checkLayer = (layer, expectedClipByInstance) => {
    expect(
      layer.state.clipByInstance,
      `${layer.constructor.layerName} clipByInstance prop: ${layer.props.clipByInstance} actual: ${expectedClipByInstance}`
    ).toBe(expectedClipByInstance);
  };

  const testCases = [
    {
      props: {
        id: 'clipByInstance:default',
        data: geojson,
        stroked: false,
        extensions: [new ClipExtension()]
      },
      onAfterUpdate: ({subLayers}) => {
        for (const layer of subLayers) {
          if (layer.id.includes('points')) {
            checkLayer(layer, true);
          } else {
            checkLayer(layer, false);
          }
        }
      }
    },
    {
      updateProps: {
        id: 'clipByInstance:true',
        clipByInstance: true
      },
      onAfterUpdate: ({subLayers}) => {
        for (const layer of subLayers) {
          checkLayer(layer, true);
        }
      }
    },
    {
      updateProps: {
        id: 'clipByInstance:false',
        clipByInstance: false
      },
      onAfterUpdate: ({subLayers}) => {
        for (const layer of subLayers) {
          checkLayer(layer, false);
        }
      }
    }
  ];

  testLayer({Layer: GeoJsonLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

webglTest('ClipExtension#bounds uniform per viewport', () => {
  const SF = {longitude: -122.42694203247012, latitude: 37.751537058389985, zoom: 11.5};
  const SIZE = {width: 800, height: 450};
  const mercatorViewport = new WebMercatorViewport({...SF, ...SIZE});
  const globeViewport = new GlobeViewport({...SF, ...SIZE});
  // Deliberately reversed corners: the geometry-mode bounds must be re-ordered to min/max
  const clipBounds: [number, number, number, number] = [-122.39, 37.78, -122.47, 37.73];

  const [ax, ay] = lngLatToMercatorCommon([clipBounds[0], clipBounds[1]]);
  const [bx, by] = lngLatToMercatorCommon([clipBounds[2], clipBounds[3]]);
  const mercatorBounds = [Math.min(ax, bx), Math.min(ay, by), Math.max(ax, bx), Math.max(ay, by)];

  const expectBounds = (layer, expected: number[], message: string) => {
    const {bounds} = getLayerUniforms(layer, 'clip');
    expect(bounds, `${message}: has bounds`).toHaveLength(4);
    for (let i = 0; i < 4; i++) {
      expect(bounds[i], `${message}: bounds[${i}]`).toBeCloseTo(expected[i], 6);
    }
  };

  // Geometry mode: bounds are compared with project_common_position_to_flat(geometry.position),
  // i.e. Mercator common space on both flat and globe viewports
  testLayer({
    Layer: SolidPolygonLayer,
    onError: err => expect(err).toBeFalsy(),
    testCases: [
      {
        title: 'WebMercatorViewport',
        viewport: mercatorViewport,
        props: {
          data: polygons,
          getPolygon: f => f,
          clipBounds,
          extensions: [new ClipExtension()]
        },
        onAfterUpdate: ({layer}) => {
          expect(layer.state.clipByInstance).toBe(false);
          expectBounds(layer, mercatorBounds, 'mercator geometry mode');
        }
      },
      {
        title: 'GlobeViewport',
        viewport: globeViewport,
        updateProps: {},
        onAfterUpdate: ({layer}) => {
          expect(layer.state.clipByInstance).toBe(false);
          // Not the sphere XYZ that layer.projectPosition() yields on the globe
          const sphere = layer.projectPosition([clipBounds[0], clipBounds[1], 0]);
          expect(Math.hypot(sphere[0], sphere[1], sphere[2])).toBeCloseTo(256, 3);
          expectBounds(layer, mercatorBounds, 'globe geometry mode');
        }
      }
    ]
  });

  // Instance mode: bounds are compared with geometry.worldPosition (raw lng/lat) in every view
  testLayer({
    Layer: ScatterplotLayer,
    onError: err => expect(err).toBeFalsy(),
    testCases: [
      {
        title: 'WebMercatorViewport',
        viewport: mercatorViewport,
        props: {
          data: points,
          getPosition: d => d.COORDINATES,
          clipBounds,
          extensions: [new ClipExtension()]
        },
        onAfterUpdate: ({layer}) => {
          expect(layer.state.clipByInstance).toBe(true);
          expectBounds(layer, clipBounds, 'mercator instance mode');
        }
      },
      {
        title: 'GlobeViewport',
        viewport: globeViewport,
        updateProps: {},
        onAfterUpdate: ({layer}) => {
          expect(layer.state.clipByInstance).toBe(true);
          expectBounds(layer, clipBounds, 'globe instance mode');
        }
      }
    ]
  });
});

test('ClipExtension#WebGPU GeoJson sublayers', async ({skip}) => {
  const webgpuDevice = await getWebGPUTestDevice();
  if (!webgpuDevice) {
    skip();
    return;
  }

  const viewport = new MapView().makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: 0, latitude: 0, zoom: 1}
  });
  const features = [
    {type: 'Feature', properties: {}, geometry: {type: 'Point', coordinates: [0, 0]}},
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [-1, 0],
          [1, 0]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-1, -1],
            [1, -1],
            [1, 1],
            [-1, 1],
            [-1, -1]
          ]
        ]
      }
    }
  ];

  for (const [format, data] of [
    ['geojson', {type: 'FeatureCollection', features}],
    ['binary', geojsonToBinary(features as any)]
  ] as const) {
    const errors: Error[] = [];
    const layerManager = new LayerManager(webgpuDevice, {viewport});
    layerManager.setProps({onError: error => errors.push(error)});

    const layer = new GeoJsonLayer({
      id: `webgpu-clip-extension-${format}`,
      data: data as any,
      clipBounds: [-0.5, -0.5, 0.5, 0.5],
      extensions: [new ClipExtension()]
    });

    webgpuDevice.handle.pushErrorScope('validation');
    layerManager.setLayers([layer]);

    const scatterplotLayer = layerManager.layers.find(
      currentLayer => currentLayer instanceof ScatterplotLayer
    );
    const pathLayers = layerManager.layers.filter(
      currentLayer => currentLayer instanceof PathLayer
    );
    const solidPolygonLayer = layerManager.layers.find(
      currentLayer => currentLayer instanceof SolidPolygonLayer
    );

    expect(errors, format).toEqual([]);
    expect(scatterplotLayer?.state.clipByInstance, `${format} points clip by instance`).toBe(true);
    expect(
      pathLayers.length,
      `${format} creates line and polygon stroke sublayers`
    ).toBeGreaterThan(0);
    for (const pathLayer of pathLayers) {
      expect(pathLayer.state.clipByInstance, `${format} ${pathLayer.id} clips by geometry`).toBe(
        false
      );
    }
    expect(solidPolygonLayer?.state.clipByInstance, `${format} polygons clip by geometry`).toBe(
      false
    );

    await webgpuDevice.handle.queue.onSubmittedWorkDone();
    expect(await webgpuDevice.handle.popErrorScope(), format).toBeNull();

    layerManager.finalize();
  }
});

test('ClipExtension#WebGPU PathLayer dash arclength with billboard', async ({skip}) => {
  const webgpuDevice = await getWebGPUTestDevice();
  if (!webgpuDevice) {
    skip();
    return;
  }

  const viewport = new MapView().makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: 0, latitude: 0, zoom: 1, pitch: 45}
  });
  const errors: Error[] = [];
  const layerManager = new LayerManager(webgpuDevice, {viewport});
  layerManager.setProps({onError: error => errors.push(error)});
  const layer = new DashArclengthPathLayer({
    id: 'webgpu-clip-dash-arclength-billboard',
    data: [
      {
        path: [
          [-1, 0, 0],
          [1, 0, 100]
        ]
      }
    ],
    getPath: path => path.path,
    billboard: true,
    clipBounds: [-0.5, -0.5, 0.5, 0.5],
    extensions: [new ClipExtension()]
  });

  webgpuDevice.handle.pushErrorScope('validation');
  layerManager.setLayers([layer]);

  expect(errors).toEqual([]);
  expect(layer.state.clipByInstance, 'PathLayer clips interpolated geometry').toBe(false);
  expect(layer.getShaders().defines.DASH_ENABLED, 'dash arclength branch is compiled').toBe(1);
  await webgpuDevice.handle.queue.onSubmittedWorkDone();
  expect(await webgpuDevice.handle.popErrorScope()).toBeNull();

  layerManager.finalize();
});
