// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';

import {Layer, CompositeLayer, LayerManager, Viewport, MapView} from '@deck.gl/core';
import {renderLayerPass} from '@deck.gl/core/lib/render-layer-pass';
import {layerIndexResolver} from '@deck.gl/core/passes/layers-pass';
import DrawLayersPass from '@deck.gl/core/passes/draw-layers-pass';
import PickLayersPass from '@deck.gl/core/passes/pick-layers-pass';
import {ScatterplotLayer} from '@deck.gl/layers';
import {device} from '@deck.gl/test-utils/vitest';
import {Buffer, Texture} from '@luma.gl/core';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {getGLParameters} from '@luma.gl/webgl';
import {GL} from '@luma.gl/webgl/constants';
import type {CanvasContext} from '@luma.gl/core';

class TestLayer extends Layer {
  initializeState() {}
}

class RecordingLayer extends TestLayer {
  draw({parameters}) {
    (this.props as any).onDraw({viewport: this.context.viewport.id, parameters});
  }
}

class TestCompositeLayer extends CompositeLayer {
  filterSubLayer({layer, viewport}) {
    const {viewportId} = layer.props;
    return !viewportId || viewportId === viewport.id;
  }

  renderLayers() {
    const {subLayers} = this.props;

    return subLayers.map(props =>
      props.children
        ? new TestCompositeLayer(
            this.getSubLayerProps({id: props.id, subLayers: props.children}),
            props
          )
        : new TestLayer(this.getSubLayerProps({id: props.id}), props)
    );
  }
}

test('LayersPass#layerIndexResolver', () => {
  const TEST_CASES = [
    {
      title: 'nesting',
      layers: [
        new TestCompositeLayer({
          id: 'layer-1',
          subLayers: [
            {
              id: 'layer-1-1',
              children: [
                {
                  id: 'layer-1-1-1',
                  children: [{id: 'layer-1-1-1-1'}, {id: 'layer-1-1-1-2'}]
                },
                {
                  id: 'layer-1-1-2',
                  children: [{id: 'layer-1-1-2-1'}, {id: 'layer-1-1-2-2'}]
                }
              ]
            }
          ]
        })
      ],
      expected: {
        'layer-1': 0,
        'layer-1-1': 0,
        'layer-1-1-1': 0,
        'layer-1-1-1-1': 0,
        'layer-1-1-1-2': 1,
        'layer-1-1-2': 2,
        'layer-1-1-2-1': 2,
        'layer-1-1-2-2': 3
      }
    },
    {
      title: 'visibility',
      layers: [
        new TestLayer({id: 'layer-1'}),
        new TestLayer({id: 'layer-2', visible: false}),
        new TestLayer({id: 'layer-3'}),
        new TestCompositeLayer({
          id: 'layer-4',
          visible: false,
          subLayers: [{id: 'layer-4-1'}, {id: 'layer-4-2'}]
        }),
        new TestCompositeLayer({
          id: 'layer-5',
          subLayers: [
            {
              id: 'layer-5-1',
              children: [
                {id: 'layer-5-1-1'},
                {id: 'layer-5-1-2'},
                {id: 'layer-5-1-3', visible: false}
              ]
            },
            {id: 'layer-5-2'},
            {
              id: 'layer-5-3',
              children: [{id: 'layer-5-3-1'}, {id: 'layer-5-3-2'}]
            }
          ]
        })
      ],
      expected: {
        'layer-1': 0,
        'layer-2': 1,
        'layer-3': 1,
        'layer-4': 2,
        'layer-4-1': 2,
        'layer-4-2': 2,
        'layer-5': 2,
        'layer-5-1': 2,
        'layer-5-1-1': 2,
        'layer-5-1-2': 3,
        'layer-5-1-3': 4,
        'layer-5-2': 4,
        'layer-5-3': 5,
        'layer-5-3-1': 5,
        'layer-5-3-2': 6
      }
    },
    {
      title: 'index override',
      layers: [
        new TestLayer({id: 'layer-1'}),
        new TestCompositeLayer({
          id: 'layer-2',
          subLayers: [
            {
              id: 'layer-2-1',
              _offset: 0,
              children: [
                {id: 'layer-2-1-1', _offset: 2},
                {id: 'layer-2-1-2', _offset: 1},
                {id: 'layer-2-1-3', _offset: 0}
              ]
            },
            {
              id: 'layer-2-2',
              _offset: 0,
              children: [
                {id: 'layer-2-2-1'},
                {id: 'layer-2-2-2'},
                {
                  id: 'layer-2-2-3',
                  children: [{id: 'layer-2-2-3-1'}, {id: 'layer-2-2-3-2'}]
                },
                {id: 'layer-2-2-4'}
              ]
            },
            {
              id: 'layer-2-3',
              children: [{id: 'layer-2-3-1'}, {id: 'layer-2-3-2'}, {id: 'layer-2-3-3'}]
            }
          ]
        }),
        new TestLayer({id: 'layer-3', _offset: 0}),
        new TestLayer({id: 'layer-4'})
      ],
      expected: {
        'layer-1': 0,
        'layer-2': 1,
        'layer-2-1': 1,
        'layer-2-1-1': 3,
        'layer-2-1-2': 2,
        'layer-2-1-3': 1,
        'layer-2-2': 1,
        'layer-2-2-1': 1,
        'layer-2-2-2': 2,
        'layer-2-2-3': 3,
        'layer-2-2-3-1': 3,
        'layer-2-2-3-2': 4,
        'layer-2-2-4': 5,
        'layer-2-3': 6,
        'layer-2-3-1': 6,
        'layer-2-3-2': 7,
        'layer-2-3-3': 8,
        'layer-3': 0,
        'layer-4': 9
      }
    }
  ];

  for (const testCase of TEST_CASES) {
    const resolver = layerIndexResolver();
    const resolver2 = layerIndexResolver();

    const layerManager = new LayerManager(device, {});
    layerManager.setLayers(testCase.layers);
    const layers = layerManager.getLayers();

    console.log(testCase.title);
    for (const layer of layers) {
      const result = resolver(layer, !layer.isComposite && layer.props.visible);
      const expected = testCase.expected[layer.id];
      expect(result, layer.id).toBe(expected);

      // Should yield the same result even if parent layer is not resolved first
      if (!layer.isComposite) {
        const result2 = resolver2(layer, layer.props.visible);
        expect(result2, layer.id).toBe(expected);
      }
    }
  }
});

test('LayersPass#shouldDrawLayer', () => {
  const layers = [
    new TestCompositeLayer({
      id: 'test-composite',
      subLayers: [
        {
          id: 'test-sub-1',
          children: [
            {id: 'test-sub-1A', viewportId: 'A'},
            {id: 'test-sub-1B', viewportId: 'B'}
          ]
        },
        {
          id: 'test-sub-2'
        }
      ]
    }),
    new TestLayer({
      id: 'test-primitive',
      visible: false
    }),
    new TestLayer({
      id: 'test-primitive-visible'
    })
  ];

  const layerManager = new LayerManager(device, {});
  const layersPass = new DrawLayersPass(device);
  layerManager.setLayers(layers);

  const layerFilterCalls = [];
  let renderStats = layersPass.render({
    viewports: [new Viewport({id: 'A'})],
    layers: layerManager.getLayers(),
    layerFilter: ({layer}) => {
      layerFilterCalls.push(layer.id);
      return true;
    },
    onViewportActive: layerManager.activateViewport,
    onError: err => expect(err).toBeFalsy()
  })[0];
  expect(layerFilterCalls, 'layerFilter is called twice').toEqual([
    'test-composite',
    'test-primitive-visible'
  ]);
  expect(
    renderStats.totalCount === 7 && renderStats.compositeCount === 2,
    'Total # of layers'
  ).toBeTruthy();
  expect(renderStats.visibleCount, '# of rendered layers').toBe(3); // test-sub-1A, test-sub-2, test-primitive-visible

  renderStats = layersPass.render({
    viewports: [new Viewport({id: 'B'})],
    layers: layerManager.getLayers(),
    layerFilter: ({layer}) => layer.id !== 'test-composite',
    onViewportActive: layerManager.activateViewport,
    onError: err => expect(err).toBeFalsy()
  })[0];
  expect(
    renderStats.totalCount === 7 && renderStats.compositeCount === 2,
    'Total # of layers'
  ).toBeTruthy();
  expect(renderStats.visibleCount, '# of rendered layers').toBe(1); // test-primitive-visible
});

test('LayersPass#viewParameters', () => {
  const drawCalls = [];
  const layers = [
    new RecordingLayer({
      id: 'test',
      parameters: {
        depthWriteEnabled: true,
        blend: false
      },
      onDraw: drawCall => drawCalls.push(drawCall)
    })
  ];

  const layerManager = new LayerManager(device, {
    deck: {
      props: {
        parameters: {
          blend: true,
          depthWriteEnabled: false,
          depthCompare: 'less',
          blendColorSrcFactor: 'src-alpha'
        }
      }
    } as any
  });
  const layersPass = new DrawLayersPass(device);
  layerManager.setLayers(layers);

  const views = {
    A: new MapView({
      id: 'A',
      parameters: {
        depthCompare: 'always',
        cullMode: 'back'
      }
    }),
    B: new MapView({
      id: 'B',
      parameters: {
        depthCompare: 'greater',
        cullMode: 'none'
      }
    })
  };

  layersPass.render({
    viewports: [new Viewport({id: 'A'}), new Viewport({id: 'B'})],
    views,
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    onError: err => expect(err).toBeFalsy()
  });

  expect(drawCalls, 'layer drawn once in each view').toHaveLength(2);
  expect(drawCalls[0].viewport, 'first viewport id').toBe('A');
  expect(drawCalls[0].parameters, 'view parameters are merged for view A').toMatchObject({
    blend: false,
    depthWriteEnabled: true,
    depthCompare: 'always',
    blendColorSrcFactor: 'src-alpha',
    cullMode: 'back'
  });
  expect(drawCalls[1].viewport, 'second viewport id').toBe('B');
  expect(drawCalls[1].parameters, 'view parameters are merged for view B').toMatchObject({
    blend: false,
    depthWriteEnabled: true,
    depthCompare: 'greater',
    blendColorSrcFactor: 'src-alpha',
    cullMode: 'none'
  });
});

test('renderLayerPass#WebGPU renders and picks each repeated world separately', async ({skip}) => {
  const webgpuDevice = await getWebGPUTestDevice();
  if (!webgpuDevice) {
    skip();
  }

  const width = 1152;
  const height = 128;
  const view = new MapView({repeat: true});
  const viewport = view.makeViewport({
    width,
    height,
    viewState: {longitude: 0, latitude: 0, zoom: 0}
  });
  const subViewports = viewport.subViewports!;
  expect(subViewports, 'the viewport includes three visible world copies').toHaveLength(3);

  const colorTexture = webgpuDevice.createTexture({
    format: 'rgba8unorm',
    width,
    height,
    usage: Texture.RENDER | Texture.COPY_SRC
  });
  const framebuffer = webgpuDevice.createFramebuffer({
    width,
    height,
    colorAttachments: [colorTexture],
    depthStencilAttachment: 'depth24plus'
  });
  const readbackOptions = {x: 0, y: height / 2, width, height: 1};
  const readbackLayout = colorTexture.computeMemoryLayout(readbackOptions);
  const readbackBuffer = webgpuDevice.createBuffer({
    byteLength: readbackLayout.byteLength,
    usage: Buffer.COPY_DST | Buffer.MAP_READ
  });
  const layer = new ScatterplotLayer({
    id: 'webgpu-repeated-world',
    data: [{position: [0, 0]}],
    getPosition: point => point.position,
    getFillColor: [255, 0, 0, 255],
    radiusMinPixels: 8,
    pickable: true
  });
  const layerManager = new LayerManager(webgpuDevice, {viewport});
  const layersPass = new DrawLayersPass(webgpuDevice);
  const pickLayersPass = new PickLayersPass(webgpuDevice);
  const submit = vi.spyOn(webgpuDevice, 'submit');

  try {
    layerManager.setProps({
      onError: error => {
        throw error;
      }
    });
    layerManager.setLayers([layer]);
    submit.mockClear();

    const renderStats = renderLayerPass(layersPass, {
      target: framebuffer,
      viewports: [viewport],
      views: {[view.id]: view},
      layers: layerManager.getLayers(),
      onViewportActive: layerManager.activateViewport,
      pass: 'webgpu-repeat-regression'
    });
    expect(renderStats, 'one render result is returned for each world copy').toHaveLength(3);
    expect(submit, 'each world copy is submitted in its own pass').toHaveBeenCalledTimes(3);

    colorTexture.readBuffer(readbackOptions, readbackBuffer);
    const pixels = await readbackBuffer.readAsync(0, readbackLayout.byteLength);
    const worldColors = subViewports.map(subViewport => {
      const pixelIndex = Math.round(subViewport.project([0, 0])[0]) * 4;
      return Array.from(pixels.subarray(pixelIndex, pixelIndex + 4));
    });

    expect(worldColors, 'each world copy is visible at its projected position').toEqual([
      [255, 0, 0, 255],
      [255, 0, 0, 255],
      [255, 0, 0, 255]
    ]);

    submit.mockClear();
    const {decodePickingColor, stats: pickingStats} = renderLayerPass(pickLayersPass, {
      pickingFBO: framebuffer,
      deviceRect: {x: 0, y: 0, width, height},
      viewports: [viewport],
      views: {[view.id]: view},
      layers: layerManager.getLayers(),
      onViewportActive: layerManager.activateViewport,
      pass: 'webgpu-repeat-picking-regression',
      pickZ: false
    });

    expect(pickingStats, 'one picking result is returned for each world copy').toHaveLength(3);
    expect(submit, 'each world copy is picked in its own pass').toHaveBeenCalledTimes(3);

    colorTexture.readBuffer(readbackOptions, readbackBuffer);
    const pickingPixels = await readbackBuffer.readAsync(0, readbackLayout.byteLength);
    const pickedWorlds = subViewports.map(subViewport => {
      const pixelIndex = Math.round(subViewport.project([0, 0])[0]) * 4;
      return decodePickingColor?.(pickingPixels.subarray(pixelIndex, pixelIndex + 4));
    });

    expect(
      pickedWorlds.map(pickedWorld => pickedWorld?.pickedLayer.id),
      'each world copy decodes to the pickable layer'
    ).toEqual([layer.id, layer.id, layer.id]);
    for (const pickedWorld of pickedWorlds) {
      expect(pickedWorld?.pickedObjectIndex, 'the selected object index is preserved').toBe(0);
      expect(pickedWorld?.pickedViewports, 'the logical viewport is recorded exactly once').toEqual(
        [viewport]
      );
    }
  } finally {
    submit.mockRestore();
    readbackBuffer.destroy();
    layerManager.finalize();
    framebuffer.destroy();
    colorTexture.destroy();
  }
});

test('LayersPass#uses the supplied canvas context for viewport and clear passes', () => {
  const layer = new TestLayer({id: 'canvas-context-layer'});
  const layerManager = new LayerManager(device, {});
  const layersPass = new DrawLayersPass(device);
  const framebuffer = device.createFramebuffer({
    width: 60,
    height: 40,
    colorAttachments: ['rgba8unorm']
  });
  const canvasContext = {
    getCurrentFramebuffer: () => framebuffer,
    getDrawingBufferSize: () => [60, 40],
    cssToDeviceRatio: () => 2
  } as CanvasContext;
  const viewport = new Viewport({id: 'canvas-context-view', x: 2, y: 3, width: 10, height: 8});

  layerManager.setLayers([layer]);
  const beginRenderPass = vi.spyOn(device, 'beginRenderPass');
  layersPass.render({
    canvasContext,
    views: {[viewport.id]: new MapView({id: viewport.id, clear: true})},
    viewports: [viewport],
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport
  });

  expect(
    // @ts-expect-error glParameters not exposed
    layerManager.context.renderPass.glParameters.viewport,
    'viewport uses the supplied drawing-buffer height and pixel ratio'
  ).toEqual([4, 18, 20, 16]);
  expect(beginRenderPass).toHaveBeenCalledTimes(2);
  expect(beginRenderPass.mock.calls[0][0].framebuffer).toBe(framebuffer);
  expect(beginRenderPass.mock.calls[1][0].framebuffer).toBe(framebuffer);

  beginRenderPass.mockRestore();
  layerManager.finalize();
  framebuffer.destroy();
});

test('LayersPass#GLViewport', () => {
  const layers = [
    new TestLayer({
      id: 'test'
    })
  ];

  const layerManager = new LayerManager(device, {});
  const layersPass = new DrawLayersPass(device);
  const framebuffer = device.createFramebuffer({
    width: 100,
    height: 100,
    colorAttachments: ['rgba8unorm']
  });
  // Browser-mode Playwright can expose a higher CSS-to-device ratio than headless/unit
  // environments. Derive the expected GL viewport from the active device ratio so this
  // test validates the coordinate conversion logic instead of hardcoding a 1x assumption.
  const [, drawingBufferHeight] = device.canvasContext.getDrawingBufferSize();
  layerManager.setLayers(layers);

  const testCases = [
    {
      name: 'default framebuffer',
      viewport: {}
    },
    {
      name: 'default framebuffer offset',
      viewport: {
        x: 0.5,
        y: 0.3
      }
    },
    {
      name: 'external framebuffer',
      target: framebuffer,
      viewport: {}
    },
    {
      name: 'external framebuffer pixel ratio 2',
      target: framebuffer,
      viewport: {},
      shaderModuleProps: {
        project: {
          devicePixelRatio: 2
        }
      }
    },
    {
      name: 'external framebuffer fill viewport',
      target: framebuffer,
      viewport: {x: 0, y: 0, width: 100, height: 100}
    },
    {
      name: 'external framebuffer offset',
      target: framebuffer,
      viewport: {x: 5, y: 10, width: 30, height: 30}
    },
    {
      name: 'external framebuffer offset pixel ratio 2',
      target: framebuffer,
      viewport: {x: 5, y: 10, width: 30, height: 30},
      shaderModuleProps: {
        project: {
          devicePixelRatio: 2
        }
      }
    }
  ];

  for (const {name, target, viewport, shaderModuleProps} of testCases) {
    layersPass.render({
      target,
      viewports: [new Viewport({id: 'A', ...viewport})],
      layers: layerManager.getLayers(),
      onViewportActive: layerManager.activateViewport,
      shaderModuleProps,
      onError: err => expect(err).toBeFalsy()
    });

    const pixelRatio =
      shaderModuleProps?.project?.devicePixelRatio ?? device.canvasContext.cssToDeviceRatio();
    const height = target ? target.height : drawingBufferHeight;
    const dimensions = new Viewport({id: 'A', ...viewport});
    const expectedGLViewport = [
      dimensions.x * pixelRatio,
      height - (dimensions.y + dimensions.height) * pixelRatio,
      dimensions.width * pixelRatio,
      dimensions.height * pixelRatio
    ];

    expect(
      // @ts-expect-error glParameters not exposed
      layerManager.context.renderPass.glParameters.viewport,
      `${name} sets viewport correctly`
    ).toEqual(expectedGLViewport);
  }
});
