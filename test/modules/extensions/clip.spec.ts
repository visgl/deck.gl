// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {LayerManager, MapView} from '@deck.gl/core';
import {ClipExtension} from '@deck.gl/extensions';
import {GeoJsonLayer, PathLayer, ScatterplotLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {testLayer} from '@deck.gl/test-utils/vitest';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {geojsonToBinary} from '@loaders.gl/gis';

import {geojson} from 'deck.gl-test/data';

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
