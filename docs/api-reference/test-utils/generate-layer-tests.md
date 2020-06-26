# generateLayerTests

This utility generates a series of test cases to be used with [testLayer](/docs/api-reference/test-utils/test-layer.md) that checks the conformance of a layer class.

## Example

Example of layer unit tests using `tape`. The test utility itself is test framework agnostic.

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


## Usage

```js
generateLayerTests({Layer, sampleProps, assert, onError});
```

* `Layer` (Object) - the layer component class to test
* `sampleProps` (Object, Optional) - a list of props to use as the basis for all generated tests. Can be used to supply a meaningful set of `data`.
* `assert` (Function, optional) - callback when checking a condition. Receives two arguments:
  - `condition` - a value that is expected to be truthy
  - `comment` (String) - information about the check
* `onBeforeUpdate` - custom callback to be added to each [test case](/docs/api-reference/test-utils/test-layer.md).
* `onAfterUpdate` - custom callback to be added to each [test case](/docs/api-reference/test-utils/test-layer.md).
