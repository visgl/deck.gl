# Using with Unit Test Frameworks

Lifecycle test functions are designed to allow for intregration with different unit test frameworks. Some of the details depend on the test framework you are using. deck.gl itself uses `tape` so the tests in the deck.gl repository contain extensive examples of `tape` integration, but it should also be straightforward to integrate with other unit testing frameworks.


## Example

The lifecycle test drivers simplify testing of successive updates of a layer. This example uses `tape`.

```js
import test from 'tape-catch';
import * as FIXTURES from 'deck.gl/test/data/geojson-data';
import {testLayer} from '@deck.gl/test-utils';

import {GeoJsonLayer} from '@deck.gl/layers';

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
