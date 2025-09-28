# InteractionTestRunner

Client-side utility for browser-based deck.gl interaction tests.

This class is intended to be used with `BrowserTestDriver` from `@probe.gl/test-utils`. Together they support the following workflow:

* Launch a Puppeteer instance (headless or non-headless) to run a test application
* In the test application, create a deck.gl canvas.
* For each test case, dispatch a sequence of keyboard/mouse events, and check the updated state.
* Proceed to the next test case until done.

## Example

See [SnapshotTestRunner](../test-utils/snapshot-test-runner.md) for Node side set up instructions.

In your script that is run on the browser:

```js
const {InteractionTestRunner} = require('@deck.gl/test-utils');

const TEST_CASES = [
  {
    name: 'MapController',
    events: [
      {type: 'drag', startX: 400, startY: 200, endX: 300, endY: 200, steps: 3}
    ],
    onBeforeEvents: ({deck}) => ({viewport: deck.getViewports[0]}),
    onAfterEvents: ({deck, context}) => {
      const oldViewport = context.viewport;
      const newViewport = deck.getViewports[0];
      t.ok(newViewport.longitude > oldViewport.longitude, 'map moved');
    }
  }
];

new TestRender({
  width: 800,
  height: 600,
  initialViewState: {
    longitude: -122.4,
    latitude: 37.8,
    zoom: 12
  },
  controller: true
})
  .add(TEST_CASES)
  .run()
  .then(window.browserTestDriver_finish);
```

## Methods

### constructor(props: Object)

```js
new InteractionTestRunner(deckProps)
```

Create a InteractionTestRunner instance. The `deckProps` argument is passed to the [Deck](../core/deck.md) constructor.

### add(testCase: Array|object)

Add one or a list of test cases. Each test case may contain the following fields:
 
* `name` (string) - name of the test case.
* `events` (Array) - a sequence of inputs to dispatch. See [Event](#event) section below.
* `onBeforeEvents` (Function, optional) - called before the events are dispatched. Receives the following arguments:
  - `deck` - the Deck instance.
* `onAfterEvents` (Function, optional) - called after the events are dispatched. Receives the following arguments:
  - `deck` - the Deck instance.
  - `layers` - the rendered layers.
  - `context` - the return value of `onBeforeEvents`.

### run(options: Object)

Run all test cases.

Options:

* `timeout` (number) - time to wait for each test case to resolve (by calling the `done` callback) before aborting, in milliseconds. Default `2000`.

Returns: a `Promise` that resolves when all test cases are done.


## Members

### isHeadless

Whether the test is being run in headless mode. In headless mode, Chromium uses software render which behaves slightly differently from non-headless. Image diffing tolerance may need to be adjusted accordingly.


## Event

An event is a javascript descriptor of emulated user input. The following event types are supported:

### keypress

Press a key on the keyboard.

- `type: 'keypress'`
- `key` (string) - see https://github.com/GoogleChrome/puppeteer/blob/master/lib/USKeyboardLayout.js
- `delay` (number) - the time between keydown and keyup. Default `0`.
- `shiftKey` (boolean) - whether to press the key with the shift key down. Default `false`.
- `ctrlKey` (boolean) - whether to press the key with the control key down. Default `false`.
- `metaKey` (boolean) - whether to press the key with the meta key down. Default `false`.


### click

Click the mouse at a given screen coordinate.

- `type: 'click'`
- `x` (number) - the screen x of the click.
- `y` (number) - the screen y of the click.
- `button` (string) - `'left'`, `'right'` or `'middle'`.
- `delay` (number) - the time between mousedown and mouse up. Default `0`.
- `shiftKey` (boolean) - whether to click with the shift key pressed. Default `false`.
- `ctrlKey` (boolean) - whether to click with the control key pressed. Default `false`.
- `metaKey` (boolean) - whether to click with the meta key pressed. Default `false`.


### mousemove

Move the mouse to a given screen coordinate.

- `type: 'mousemove'`
- `x` (number) - the screen x to move the pointer to.
- `y` (number) - the screen y to move the pointer to.
- `steps` (number) - how many intermediate mousemove events to generate, default `1`.


### drag

Drag the mouse from a given screen coordinate to another.

- `type: 'drag'`
- `startX` (number) - the screen x to drag from.
- `startY` (number) - the screen y to drag from.
- `endX` (number) - the screen x to drag to.
- `endY` (number) - the screen y to drag to.
- `button` (string) - `'left'`, `'right'` or `'middle'`.
- `steps` (number) - how many intermediate mousemove events to generate, default `1`.
- `shiftKey` (boolean) - whether to click with the shift key pressed. Default `false`.
- `ctrlKey` (boolean) - whether to click with the control key pressed. Default `false`.
- `metaKey` (boolean) - whether to click with the meta key pressed. Default `false`.


### wait

Idle for a given period of time before the next event.

- `wait` (number) - the timeout in milliseconds.

