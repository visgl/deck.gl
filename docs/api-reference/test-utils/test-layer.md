# testLayer

The `testLayer` utility initializes a layer, test layer updates and draw calls on a series of new props, and allow test suites to inspect the result.

The `testLayerAsync` utility is like `testLayer`, but designed for layers that need to resolve resources asynchronously.

## Example

Example of layer unit tests using `tape`. The test utility itself is test framework agnostic.

```js
import test from 'tape-catch';
import {testLayer, testLayerAsync} from '@deck.gl/test-utils';
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
      onAfterUpdate({layer, oldState}) {
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
      onAfterUpdate({subLayers}) {
        const pathLayer = subLayers.find(layer => layer.id.endsWith('linestrings'));
        t.is(pathLayer.props.widthScale, 3, 'widthScale is passed to sub layer');
      }
    }
  ]});

  t.end();
});
```


## Usage

```js
testLayer({Layer, spies, testCases, onError});
await testLayerAsync({Layer, spies, testCases, onError});
```

* `Layer` (Object) - the layer component class to test
* `testCases` (Array) - a list of test cases, as described below.
* `viewport` (`Viewport`, Optional) - a viewport instance to use for the tests.
* `spies` (Array, Optional) - names of layer class methods to spy on.
* `onError` (Function, Optional) - callback after each operation with potential errors. Called with two arguments:
  - `error` (`Error`|`null`)
  - `title` (String) - name of the operation.


### Test Cases

Test cases specified as objects and are run sequentially. Each test case provided to `testLayer` specifies what properties are going to be updated.

A test case is an object with the following fields:

* `title` (String) - title of the test case
* `props` (Object) - specifies a complete new set of props
* `updateProps` (Object) - specifies an incremental prop change (overrides props from previous test case)
* `spies` (Array, Optional) - names of layer class methods to spy on. Overrides the list that was sent to `testLayer`.
* `onBeforeUpdate` (Function, Optional) - callback invoked before the layer props are updated. Receives a single argument `info`:
  - `info.testCase` (Object) - the current test case
  - `info.layer` (`Layer`) - the old layer
* `onAfterUpdate` (Function, Optional) - callback invoked after the layer props have been updated. This allows the test case to verify that the layer's state has been correctly updated, or that certain functions (spies) have been called etc. Receives a single argument `info`:
`{layer, oldState, subLayers, subLayer, spies: spyMap}`.
  - `info.testCase` (Object) - the current test case
  - `info.layer` (`Layer`) - the updated layer
  - `info.oldState` (Object) - layer state before the update
  - `info.subLayers` (Array) - sub layers rendered, if the layer is composite
  - `info.subLayer` (`Layer`) - the first sub layer rendered, if the layer is composite
  - `info.spies` (Object) - key are layer method names and values are [spies](https://github.com/uber-web/probe.gl/blob/master/docs/api-reference/test-utils/make-spy.md#methods-and-fields-on-the-wrapped-function).


Note that `onAfterUpdate` is called immediately after the props are updated. If the layer contains asynchronous props, they may not have been loaded at this point.

When using `TestLayerAsync`, `onAfterUpdate` is called multiple times until all resources are loaded.


## Source

[modules/test-utils/src/lifecycle-test.js](https://github.com/visgl/deck.gl/blob/master/modules/test-utils/src/lifecycle-test.js)
