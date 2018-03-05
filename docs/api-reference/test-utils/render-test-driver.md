# RenderTestDriver (Test Automation Class, Node.js only, Experimental)

Helper class primarily intended for automating browser tests from Node.js or shell scripts. A `RenderTestDriver` does the following:
* starts a Chrome browser instance,
* starts a server (typically a webpack-dev-server) that bundles a test script.
* the test script renders a set of tests (described below), compares the output against golden images
* the test script returns a pass/fail value to the RenderTestDriver which ultimately passes back a `0` (success) or `1` failure to the invoking shell.
* closes down all processes and browser tabs.

> Requires Chrome version 64 or higher

References:
* For details on how the automation works, see the [probe.gl](https://uber-web.github.io/probe.gl/#/documentation) [`BrowserDriver`](https://uber-web.github.io/probe.gl/#/documentation/api-reference-testing/browserdriver) class.
* For details on test case format etc see [`TestRenderer`](./docs/api-reference/test-utils/test-renderer.md).

## Methods

### constructor

`new RenderTestDriver()`


### run