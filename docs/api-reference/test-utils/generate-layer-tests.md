# generateLayerTests

This utility generates a series of test cases to be used with [testLayer](../test-utils/test-layer.md) that checks the conformance of a layer class.

## Example (Vitest)

```ts
import {test, expect} from 'vitest';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils/vitest';
import {GeoJsonLayer} from '@deck.gl/layers';

test('GeoJsonLayer#conformance', () => {
  const testCases = generateLayerTests({
    Layer: GeoJsonLayer,
    sampleProps: {
      data: SAMPLE_GEOJSON
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onAfterUpdate: ({layer, subLayers}) => {
      expect(layer.state.features).toBeTruthy();
      const expected = layer.props.stroked ? 2 : 1;
      expect(subLayers.length).toBe(expected);
    }
  });

  testLayer({Layer: GeoJsonLayer, testCases, onError: err => expect(err).toBeFalsy()});
});
```

## Example (tape)

```js
import test from 'tape-promise/tape';
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

```ts
import {generateLayerTests} from '@deck.gl/test-utils/vitest';

generateLayerTests({Layer, sampleProps, assert, onError});
```

* `Layer` (object) - the layer component class to test
* `sampleProps` (object, Optional) - a list of props to use as the basis for all generated tests. Can be used to supply a meaningful set of `data`.
* `assert` (Function, optional) - callback when checking a condition. Receives two arguments:
  - `condition` - a value that is expected to be truthy
  - `comment` (string) - information about the check
* `onBeforeUpdate` - custom callback to be added to each [test case](../test-utils/test-layer.md).
* `onAfterUpdate` - custom callback to be added to each [test case](../test-utils/test-layer.md).
