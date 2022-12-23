import test from 'tape-promise/tape';

import {Layer, CompositeLayer, LayerManager, Viewport} from '@deck.gl/core';
import {layerIndexResolver} from '@deck.gl/core/passes/layers-pass';
import DrawLayersPass from '@deck.gl/core/passes/draw-layers-pass';
import {device} from '@deck.gl/test-utils';
import {GL, Framebuffer, getParameters} from '@luma.gl/webgl-legacy';

class TestLayer extends Layer {
  initializeState() {}
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

test('LayersPass#layerIndexResolver', t => {
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

    t.comment(testCase.title);
    for (const layer of layers) {
      const result = resolver(layer, !layer.isComposite && layer.props.visible);
      const expected = testCase.expected[layer.id];
      t.is(result, expected, layer.id);

      // Should yield the same result even if parent layer is not resolved first
      if (!layer.isComposite) {
        const result2 = resolver2(layer, layer.props.visible);
        t.is(result2, expected, layer.id);
      }
    }
  }

  t.end();
});

test('LayersPass#shouldDrawLayer', t => {
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
    onError: t.notOk
  })[0];
  t.deepEqual(
    layerFilterCalls,
    ['test-composite', 'test-primitive-visible'],
    'layerFilter is called twice'
  );
  t.ok(renderStats.totalCount === 7 && renderStats.compositeCount === 2, 'Total # of layers');
  t.is(renderStats.visibleCount, 3, '# of rendered layers'); // test-sub-1A, test-sub-2, test-primitive-visible

  renderStats = layersPass.render({
    viewports: [new Viewport({id: 'B'})],
    layers: layerManager.getLayers(),
    layerFilter: ({layer}) => layer.id !== 'test-composite',
    onViewportActive: layerManager.activateViewport,
    onError: t.notOk
  })[0];
  t.ok(renderStats.totalCount === 7 && renderStats.compositeCount === 2, 'Total # of layers');
  t.is(renderStats.visibleCount, 1, '# of rendered layers'); // test-primitive-visible

  t.end();
});

test('LayersPass#GLViewport', t => {
  const layers = [
    new TestLayer({
      id: 'test'
    })
  ];

  const layerManager = new LayerManager(device, {});
  const layersPass = new DrawLayersPass(device);
  const framebuffer = new Framebuffer(device, {width: 100, height: 100});
  layerManager.setLayers(layers);

  const testCases = [
    {
      name: 'default framebuffer',
      viewport: {},
      expectedGLViewport: [0, 0, 1, 1]
    },
    {
      name: 'default framebuffer offset',
      viewport: {
        x: 0.5,
        y: 0.3
      },
      expectedGLViewport: [0.5, -0.30000000000000004, 1, 1]
    },
    {
      name: 'external framebuffer',
      target: framebuffer,
      viewport: {},
      expectedGLViewport: [0, 99, 1, 1]
    },
    {
      name: 'external framebuffer pixel ratio 2',
      target: framebuffer,
      viewport: {},
      moduleParameters: {
        devicePixelRatio: 2
      },
      expectedGLViewport: [0, 98, 2, 2]
    },
    {
      name: 'external framebuffer fill viewport',
      target: framebuffer,
      viewport: {x: 0, y: 0, width: 100, height: 100},
      expectedGLViewport: [0, 0, 100, 100]
    },
    {
      name: 'external framebuffer offset',
      target: framebuffer,
      viewport: {x: 5, y: 10, width: 30, height: 30},
      expectedGLViewport: [5, 60, 30, 30]
    },
    {
      name: 'external framebuffer offset pixel ratio 2',
      target: framebuffer,
      viewport: {x: 5, y: 10, width: 30, height: 30},
      moduleParameters: {
        devicePixelRatio: 2
      },
      expectedGLViewport: [10, 20, 60, 60]
    }
  ];

  for (const {name, target, viewport, moduleParameters, expectedGLViewport} of testCases) {
    layersPass.render({
      target,
      viewports: [new Viewport({id: 'A', ...viewport})],
      layers: layerManager.getLayers(),
      onViewportActive: layerManager.activateViewport,
      moduleParameters,
      onError: t.notOk
    });

    t.deepEqual(
      getParameters(device, GL.VIEWPORT),
      expectedGLViewport,
      `${name} sets viewport correctly`
    );
  }

  t.end();
});
