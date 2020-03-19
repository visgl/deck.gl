import test from 'tape-catch';

import {Layer, CompositeLayer, LayerManager} from '@deck.gl/core';
import {layerIndexResolver} from '@deck.gl/core/passes/layers-pass';
import {gl} from '@deck.gl/test-utils';

class TestLayer extends Layer {
  initializeState() {}
}

class TestCompositeLayer extends CompositeLayer {
  renderLayers() {
    const {subLayers} = this.props;

    return subLayers.map(
      props =>
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

    const layerManager = new LayerManager(gl, {});
    layerManager.setLayers(testCase.layers);
    const layers = layerManager.getLayers();

    t.comment(testCase.title);
    for (const layer of layers) {
      const result = resolver(layer, !layer.isComposite && layer.props.visible);
      const expected = testCase.expected[layer.id];
      t.is(result, expected, layer.id);
    }
  }

  t.end();
});
