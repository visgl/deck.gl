# deck.gl-test-utils

A set of utilities to facilitate testing deck.gl layers. Tests can be run:
* completely in Node.js (lifecycle tests only).
* completely in the Browser (lifecycle and rendering tests).
* from Node in a controlled Browser instance (`TestDriver` classes).


## Installing

The deck.gl test utilities are published as a separate npm module that is only intended to be used during development. Install it as as a "dev dependency" as follows:
```
npm install --save-dev deck.gl-test-utils
```
or
```
yarn add -D deck.gl-test-utils
```

You typically want the major and minor version of `deck.gl-test-utils` to match the version of `deck.gl` that you are using. i.e. you want to use `5.2.x` and `5.2.y` together. Check and if necessary edit your `package.json` to make sure things align.


## Layer Update Tests

An easy way to get started with the test framework to test layers is to use the layer updates tests to verify deck.gl layers update correctly. deck.gl's update, or "lifecycle" test support includes test drivers to initialize, update and render layers.

Updates are handled by the deck.gl layer "lifecycle" and these tests are therefore also called "lifecycle tests". Lifecycle tests are less demanding of the WebGL environment and are thus more suitable to integration in traditional Node.js unit test suites (e.g. based on `tape` or similar frameworks).


## Layer Rendering Tests

Rendering tests are a key feature of deck.gl's test utils. Rendering tests involve rendering layers with known inputs and comparing the results against "golden images".

Currently, rendering tests requires running layers with predefined props and views in a controlled Chrome instance, reporting values back to Node.js.


## Testing Applications instead of Layers

The current test utilities are focused on testing of layers. This might seem to make them less suited for testing deck.gl code in applications. Still, there are techniques that can be used to get parts of the application's rendering stack tested.

Applications that render multiple layers can e.g. render them with mock application data, and compare the result against a golden image.

> More direct support for application testing is under consideration. Future support might include rendering layers directly in Node.js under headless gl, enabling apps to be tested in CI environments, as well as support for "snapshotting" deck.gl output inside live applications and comparing against golden images.


## Integration with Unit Test Frameworks

Lifecycle test functions are designed to allow them to be intregrated with different unit test frameworks. Some of the details depend on the test framework you are using. deck.gl itself uses tape so the tests in the deck.gl repository contain extensive examples of tape integration, but other frameworks should be easy to integrate with.


## Usage

The lifecycle test drivers simplify testing of successive updates of a layer. This example uses tape.
```js
import test from 'tape-catch';
import * as FIXTURES from 'deck.gl/test/data/geojson-data';
import {testLayer} from 'deck.gl-test-utils';

import {GeoJsonLayer} from 'deck.gl';

test('GeoJsonLayer#tests', t => {
  testLayer({Layer: GeoJsonLayer, testCases: [
  	// Each array object represents a test case. The layer will be updated with
  	// the new `props` and the `assert` function will be called so that the application
  	// can do additional checks (beyond verifying that the layer doesn't
  	// crash during the update)
    {props: {data}},
    {props: {data, pickable: true}},
    {
      props: {
        data: Object.assign({}, data)
      },
      assert({layer, oldState}) {
        t.ok(layer.state, 'should update layer state');
        t.ok(layer.state.features !== oldState.features, 'should update features');
      }
    },
    {
      props: {
        lineWidthScale: 3
      },
      assert({layer, oldState}) {
        t.ok(layer.state, 'should update layer state');
        const subLayers = layer.renderLayers().filter(Boolean);
        t.equal(subLayers.length, 2, 'should render 2 subLayers');
      }
    }
  ]});

  t.end();
});
```
