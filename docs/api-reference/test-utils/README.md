# @deck.gl/test-utils (Experimental)

Utilities for testing deck.gl layers.

Includes test drivers to initialize, update and render layers.


## Usage

```js
import {experimental} from '@deck.gl/test-utils';
const {...} = experimental;
...
```


## Base Methods


### testInitializeLayer({layer, viewport})


### testUpdateLayer({layer, viewport, newProps})


### testDrawLayer({layer, uniforms = {}})


## Tape Methods

### testLayerUpdates(t, {LayerComponent, testCases})

Initialize a layer, test layer update on a series of newProps, assert on the resulting layer

Note: Updates are called sequentially. updateProps will be merged with previous props

* `t` (`Function`) - test function
* `opt` (`Object`) - test options
* `opt.LayerComponent` (`Object`) - The layer component class
* `opt.testCases` (`Array`) - A list of testCases
* `opt.testCases.INITIAL_PROPS` (`Object`) - The initial prop to initialize the layer with
* `opt.testCases.UPDATES` (`Array`) - The list of updates to update
* `opt.testCases.UPDATES.updateProps` (`Object`) - updated props
* `opt.testCases.UPDATES.assert` (`Function`) - callbacks with updated layer, and oldState


### testSubLayerUpdateTriggers(t, {FunctionsToSpy, LayerComponent, testCases})

Initialize a parent layer and its subLayer, update the parent layer a series of newProps, assert on the updated subLayer.

Note: Updates are called sequentially. updateProps will be merged with previous props

* `t` (`Function`) - test function
* `opt` (`Object`) - test options
* `opt.FunctionsToSpy` (`Object`) - Functions that spied by spy
* `opt.LayerComponent` (`Object`) - The layer component class
* `opt.testCases` (`Array`) - A list of testCases
* `opt.testCases.INITIAL_PROPS` (`Object`) - The initial prop to initialize the layer with
* `opt.testCases.UPDATES` (`Array`) - The list of updates to update
* `opt.testCases.UPDATES.updateProps` (`Object`) - updated props
* `opt.testCases.UPDATES.assert` (`Function`) - callbacks with updated layer, and oldState


## Remarks
