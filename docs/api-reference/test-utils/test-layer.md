# testLayer (Test Function)


## Usage

Example of layer unit tests using `tape`. Any unit test framework can be used.

```js
import test from 'tape-catch';
import * as FIXTURES from 'deck.gl/test/data/geojson-data';
import {testLayer} from '@deck.gl/test-utils';

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


## Description

Initialize a layer, test layer update on a series of newProps, assert on the resulting layer

Initialize a parent layer and its subLayer, update the parent layer a series of newProps, assert on the updated subLayer.

```js
testLayer({Layer, spies, testCases});
```

* `Layer` (`Object`) - The layer component class
* `spies` (`Array`) - Array of Layer class methods to spy on.
* `testCases` (`Array`) - A list of test cases, as described below.


## Test Cases

Test cases specified as objects and are run sequentially. Each test case provided to `testLayer` specifies what properties are going to be updated.

A test case is an object with the following fields:

* `title` (`String`) - title of the test case
* `props` (`Object`) - Specifies a complete new set of props
* `updateProps` (`Object`) - Specifies an incremental prop change (overrides props from previous test case)
* `spies`=`[]` (`Array`) - The list of updates to update
* `assert`=`null` (`Function`) - Callback, see below


## Writing assert Functions

Each test case provided to `testLayer` specifies what properties are going to be updated. However it is also possible to specify an `assert` function that gets called after those properties have been updated.

The `assert` function in the test case allows the test suite to verify that the layer's state has been correctly updated, or that certain functions (spies) have been called etc.

Assert functions, when supplied, are called with the following properties:

* `layer`
* `oldState`
* `subLayers`
* `spies`


## Source

[modules/test-utils/src/lifecycle-test.js](https://github.com/uber/deck.gl/tree/6.4-release/modules/test-utils/src/lifecycle-test.js)
