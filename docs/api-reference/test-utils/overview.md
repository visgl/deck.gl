# @deck.gl/test-utils

A set of utilities to facilitate testing deck.gl layers. Tests can be run:

* Completely in Node.js (lifecycle tests only).
* Completely in the Browser (lifecycle and rendering tests).
* From Node in a controlled Browser instance (with [probe.gl](https://uber-web.github.io/probe.gl)'s `BrowserTestDriver`).


## Installation

The deck.gl test utilities are published as a separate npm module that is only intended to be used during development. Install it as as a "dev dependency" as follows:

```bash
npm install --save-dev @deck.gl/test-utils
```

or

```bash
yarn add -D @deck.gl/test-utils
```

You typically want the major and minor version of ` @deck.gl/test-utils` to match the version of `@deck.gl/core` that you are using. i.e. you want to use `5.2.x` and `5.2.y` together. Check and if necessary edit your `package.json` to make sure things align.


## Layer Conformance Tests

Layer conformance tests are designed to verify deck.gl that layers update their internal state correctly in response to various props and prop changes. The layer update test support includes test drivers to initialize a layer and then run a sequence of successive updates, with facilities for validating the layer after each change, and also provides functions to initialize, update and render layers in a test environment.

Note that internally in deck.gl, updates are handled by the deck.gl layer "lifecycle" and these tests are therefore also called "lifecycle tests". Lifecycle tests are less demanding of the WebGL environment than rendering tests described below and are thus easily integrated in traditional Node.js unit test suites (e.g. based on `tape`, `jest` or similar unit test frameworks).


## Layer Rendering Tests

Rendering tests are a key feature of deck.gl's test utils. Rendering tests involve rendering layers with known inputs and performing pixel-comparison between the results against "golden images".

Currently, rendering tests requires running layers with predefined props and views in a controlled Chrome instance, reporting values back to Node.js.


## Testing Applications instead of Layers

The current test utilities are focused on testing of layers. This might seem to make them less suited for testing deck.gl code in applications. Still, there are techniques that can be used to get parts of the application's rendering stack tested.

Applications that render multiple layers can e.g. render them with mock application data, and compare the result against a golden image.

> More direct support for application testing is under consideration. Future support might include rendering layers directly in Node.js under headless gl, enabling apps to be tested in CI environments, as well as support for "snapshotting" deck.gl output inside live applications and comparing against golden images.
