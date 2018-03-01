# deck.gl-test-utils (Experimental)

A set of utilities to facilitate testing deck.gl layers in applications.


## Note on Test Modes

tests can be run completely in Node.js, completely in the Browser, or from Node in a controlled Browser instance (`TestDriver` classes). Some of the details depend on the test framework you are using.


## Rendering Tests

The most comprehensive form of testing is arguably rendering tests. This involves rendering layers with known inputs and comparing the results against "golden images".

Current support involves running layers in a controller Chrome instance, reporting values back to Node.js.

> Future support might include rendering layers directly in Node.js under headless gl.


## Update Tests

> Note: The update test utilities should be revised to work with the new Deck component and also made independent of `tape`.

In addition to full rendering tests, it is also possible to test deck.gl layers update correctly. Updates are handled by the deck.gl layer "lifecycle" and these tests are therefore also called "lifecycle tests". Lifecycle tests are less demanding of the WebGL environment and are thus more suitable to integration in traditional Node.js unit test suites (e.g. based on `tape` or similar frameworks).

deck.gl's lifecycle test support includes test drivers to initialize, update and render layers.


## Usage

```js
import {experimental} from 'deck.gl-test-utils';
const {...} = experimental;
...
```

The lifecycle test drivers can also simplify testing of successive updates of a layer
```js
import {experimental} from 'deck.gl-test-utils';
const {...} = experimental;
...
```

## Functions

### testLayer

Initialize a layer, test layer update on a series of newProps, assert on the resulting layer

Initialize a parent layer and its subLayer, update the parent layer a series of newProps, assert on the updated subLayer.

`testLayer({Layer, testCases})`

* `Layer` (`Object`) - The layer component class
* `testCases` (`Array`) - A list of testCases

Test cases are an array of objects with the following fields:
* `title` (`String`) - title of the test case
* `PROPS` (`Object`) - The initial prop to initialize the layer with
* `UPDATES` (`Array`) - The list of updates to update
* `UPDATES.updateProps` (`Object`) - updated props
* `testCases.UPDATES.assert` (`Function`) - callbacks with updated layer, and oldState

Notes:
* Updates are called sequentially. updateProps will be merged
with previous props


## Remarks
