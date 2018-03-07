<p class="badges">
  <img src="https://img.shields.io/badge/Node.js-v8.0-blue.svg?style=flat-square" alt="Node" />
</p>

# RenderTestDriver (Test Automation Class)

> Requires Chrome version 64 or higher

Helper class primarily intended for automating browser tests from Node.js shell scripts. A `RenderTestDriver` starts a Chrome browser instance and a server and opens a page with a URL that loads a script from the server. The script that runs in the browser is expected to be using the [`TestRenderer`](./docs/api-reference/test-utils/test-renderer.md) class.

For details on how the automation works, see the [probe.gl](https://uber-web.github.io/probe.gl/#/documentation) [`BrowserDriver`](https://uber-web.github.io/probe.gl/#/documentation/api-reference-testing/browserdriver) class.


## Usage

In your node.js start script:
```js
// This is the script that runs in Node.js and starts the browser
const {RenderTestDriver} = require('deck.gl-test-utils');
new RenderTestDriver().run({
  process: 'webpack-dev-server',
  parameters: ['--env.render']
});
```

## Methods

### constructor

Creates a `RenderTestDriver` instance.

`new RenderTestDriver()`


### run

`renderTestDriver.run()`

Runs the tests:
* starts a Chrome browser instance,
* starts a server (typically a webpack-dev-server) that bundles a test script.
* the test script renders a set of tests (described below), compares the output against golden images
* closes down all processes and browser tabs.
* the test script returns a pass/fail value to the `RenderTestDriver` which ultimately passes back a `0` (success) or `1` failure to the invoking shell.
