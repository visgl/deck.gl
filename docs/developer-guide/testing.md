# Testing Layers and Applications

Testing WebGL code is much harder than testing regular JavaScript. GPU and browser dependent commands may not run under Node. Rendering behavior differs cross platforms and hardware. Since it draws into a canvas, there is also no precisely verifiable output.

The [@deck.gl/test-utils](/docs/api-reference/test-utils/overview.md) module is used to ensure the quality and stability of the deck.gl framework. It is also available for those who need to test their own custom layers and/or deck.gl applications.


## Unit Tests for deck.gl Layers

Lifecycle test functions are designed to allow for intregration with different unit test frameworks. Some of the details depend on the test framework you are using. deck.gl itself uses `tape` so the tests in the deck.gl repository contain extensive examples of `tape` integration, but it should also be straightforward to integrate with other unit testing frameworks.

### Example

Using [testLayer](/docs/api-reference/test-utils/test-layer.md) util to instantiate a layer and test a series of prop updates:

```js
import test from 'tape-catch';
import {testLayer} from '@deck.gl/test-utils';
import {GeoJsonLayer} from '@deck.gl/layers';

test('GeoJsonLayer#tests', t => {
  testLayer({Layer: GeoJsonLayer, testCases: [
    // Test case 1
    {
      props: {data: []}
    },
    // Test case 2
    {
      props: {
        data: SAMPLE_GEOJSON
      },
      assert({layer, oldState}) {
        t.ok(layer.state.features !== oldState.features, 'should update features');
        t.is(subLayers.length, 2, 'should render 2 subLayers');
      }
    },
    // Test case 3
    {
      updateProps: {
        // will be merged with the previous props
        lineWidthScale: 3
      },
      assert({subLayers}) {
        const pathLayer = subLayers.find(layer => layer.id.endsWith('linestrings'));
        t.is(pathLayer.props.widthScale, 3, 'widthScale is passed to sub layer');
      }
    }
  ]});

  t.end();
});
```

The [generateLayerTests](/docs/api-reference/test-utils/generate-layer-tests.md) utility automatically generates a series of test cases for `testLayers` based on the layer class' default props. It is useful for checking the conformance of a layer class:

```js
import test from 'tape-catch';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {GeoJsonLayer} from '@deck.gl/layers';

test('GeoJsonLayer#tests', t => {
  
  const testCases = generateLayerTests({
    Layer: GeoJsonLayer,
    sampleProps: {
      data: SAMPLE_GEOJSON
    },
    assert: ({layer, subLayers}) => {
      t.ok(layer.state.features, 'should update features');
      t.is(subLayers.length, layer.props.stroked ? 2 : 1, 'correct number of sublayers');
    }
  });

  testLayer({Layer: GeoJsonLayer, testCases});

  t.end();
});
```


## Integration Tests

While unit tests are good at capturing issues in layer initialization and prop updates, they do not guarantee that the layer will be correctly rendered to screen. Some issues in e.g. the WebGL shaders can only be spotted in an integration test.

The `@deck.gl/test-utils` module offers a [SnapshotTestRunner](/docs/api-reference/test-utils/snapshot-test-runner.md) that works with the [probe.gl](https://uber-web.github.io/probe.gl) library's [`BrowserTestDriver`](https://github.com/uber-web/probe.gl/blob/master/docs/api-reference/test-utils/browser-test-driver.md) class to perform this task. Together, they enable the following scenario:

* start a controlled Chromium browser instance
* start a server (we use a webpack-dev-server) that bundles a test script.
* the test script renders a set of tests (described below), compares the output against golden images and report the result back to the Node process
* closes down all processes and browser tabs.
* the node process exists with a `0` (success) or `1` if any test failed.

### Example

In your node.js start script:

```js
// This is the script that runs in Node.js and starts the browser
const {BrowserTestDriver} = require('@probe.gl/test-utils');
new BrowserTestDriver().run({
  server: {
    // Bundles and serves the browser script
    command: 'webpack-dev-server',
    arguments: ['--env.render-test']
  },
  headless: true
});
```

In your script that is run on the browser:

```js
const {SnapshotTestRunner} = require('@deck.gl/test-utils');
const {ScatterplotLayer} = require('@deck.gl/layers');

const TEST_CASES = [
  {
    name: 'ScatterplotLayer',
    // `Deck` props
    viewState: {
      longitude: -122.4,
      latitude: 37.8,
      zoom: 12,
      pitch: 20
    },
    layers: [
      new ScatterplotLayer({
        id: 'circles',
        data: './data/scatterplot.json',
        getPosition: d => d.position,
        getRadius: d => d.size,
        getFillColor: [255, 0, 0]
      })
    ],
    // `done` must be called when ready for screenshot and compare
    onAfterRender: ({layers, done}) => {
      if (layers[0].props.data.length) {
        // data is loaded
        done();
      }
    },
    // Target rendering result
    goldenImage: './test/render/golden-images/scatterplot.png'
  }
];

new TestRender({width: 800, height: 600})
  .add(TEST_CASES)
  .run({
    onTestFail: window.browserTestDriver_fail
  })
  .then(window.browserTestDriver_finish);
```
