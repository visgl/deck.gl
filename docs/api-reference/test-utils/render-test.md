# RenderTest (Test Automation Class)

Uses a [`SceneRenderer`](/docs/api-reference/test-utils/scene-renderer.md) to render a series of layer views in succession, comparing the output of each against a "golden image".


## Usage

In the test script that is to run in the browser: set up and run a render test

```js
import {RenderTest} from '@deck.gl/test-utils';
import {TEST_CASES} from './test-cases';

const renderTest = new RenderTest({
  testCases: TEST_CASES,
  width: 800,
  height: 450,
  // Max color delta in the YIQ difference metric for two pixels to be considered the same
  colorDeltaThreshold: 255 * 0.05,
  // Percentage of pixels that must be the same for the test to pass
  testPassThreshold: 0.99
});

renderTest.run();
```

In `test-cases.js`:

```js
import {PathLayer} from 'deck.gl';

export default [{
  name: 'path-lnglat',
  viewState: {
    latitude: 37.751537058389985,
    longitude: -122.42694203247012,
    zoom: 11.5,
    pitch: 0,
    bearing: 0
  },
  layers: [
    new PathLayer({
      id: 'path-lnglat',
      data: dataSamples.zigzag,
      opacity: 0.6,
      getPath: f => f.path,
      getColor: f => [128, 0, 0],
      getWidth: f => 100,
      widthMinPixels: 1,
      pickable: true
    })
  ],
  referenceImageUrl: './golden-images/path-lnglat.png'
}];
```

## Constructor

```js
import {RenderTest} from '@deck.gl/test-utils';
const renderTest = new RenderTest({
  testCases, width, height, colorDeltaThreshold, testPassThreshold,
});
```

* `testCases` (`Array`) - an array of objects describing each scene to be rendered. The following fields are available to define test cases:
  + `name`
  + `views` (defaults to `[new MapView()]`)
  + `viewState`
  + `layers`
  + `referenceImage`
  For more information see the scene format description in [`SceneRenderer`](/docs/api-reference/test-utils/scene-renderer.md).
* `width` - Width to render, must match the size of your golden image
* `height` - Height to render, must match the size of your golden image
* `colorDeltaThreshold` - Max color delta in the YIQ difference metric for two pixels to be considered the same |
* `testPassThreshold` - Percentage of pixels that must be the same for the test to pass


## Methods

##### `run`

Run the render tests

```js
renderTest.run();
```


## Source

[modules/test-utils/src/render-test.js](https://github.com/uber/deck.gl/tree/6.3-release/modules/test-utils/src/render-test.js)
