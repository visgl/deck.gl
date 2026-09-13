# @deck.gl/test-utils

A set of utilities to facilitate testing deck.gl layers. Tests can be run:

* Completely in Node.js (lifecycle tests only).
* Completely in the Browser (lifecycle and rendering tests).
* From Node in a controlled Browser instance (with [probe.gl](https://uber-web.github.io/probe.gl)'s `BrowserTestDriver`).


## Installation

The deck.gl test utilities are published as a separate npm module that is only intended to be used during development. Install it as as a "dev dependency" as follows:

```bash
npm install --save-dev @deck.gl/test-utils
# or
yarn add -D @deck.gl/test-utils
```

You typically want the major and minor version of ` @deck.gl/test-utils` to match the version of `@deck.gl/core` that you are using. i.e. you want to use `9.0.x` and `9.0.y` together. Check and if necessary edit your `package.json` to make sure things align.


## Using with Vitest

`@deck.gl/test-utils` ships a dedicated Vitest entry point at `@deck.gl/test-utils/vitest` that automatically wires up `vi.spyOn()` for layer method spies. This is the recommended way to test deck.gl layers with Vitest.

### Quick Start

```bash
npm install --save-dev @deck.gl/test-utils vitest @vitest/browser playwright
```

Import from the vitest-specific entry point:

```ts
import {test, expect} from 'vitest';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils/vitest';
```

### Setup

Layer tests require a real WebGL2 context, so tests must run in [Vitest Browser Mode](https://vitest.dev/guide/browser/) with Playwright. JSDOM does not support WebGL and is not a supported environment for `@deck.gl/test-utils`.

Install browser testing dependencies:

```bash
npm install --save-dev @vitest/browser playwright
```

Configure `vitest.config.ts`:

```ts
import {defineConfig} from 'vitest/config';
import {playwright} from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: playwright({
        launchOptions: {
          args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
        }
      }),
      instances: [{browser: 'chromium'}],
      headless: true
    }
  }
});
```

Write a test:

```ts
import {test, expect} from 'vitest';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils/vitest';
import {ScatterplotLayer} from '@deck.gl/layers';

test('ScatterplotLayer', () => {
  const testCases = generateLayerTests({
    Layer: ScatterplotLayer,
    sampleProps: {
      data: [{position: [0, 0]}],
      getPosition: d => d.position
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy()
  });

  testLayer({Layer: ScatterplotLayer, testCases, onError: err => expect(err).toBeFalsy()});
});
```

See [testLayer](./test-layer.md) for the full API and more examples including custom layer tests.


## Layer Conformance Tests

Layer conformance tests are designed to verify deck.gl that layers update their internal state correctly in response to various props and prop changes. The layer update test support includes test drivers to initialize a layer and then run a sequence of successive updates, with facilities for validating the layer after each change, and also provides functions to initialize, update and render layers in a test environment.

Note that internally in deck.gl, updates are handled by the deck.gl layer "lifecycle" and these tests are therefore also called "lifecycle tests". Lifecycle tests are less demanding of the WebGL2/WebGPU environment than rendering tests described below and are thus easily integrated in traditional Node.js unit test suites (e.g. based on `tape`, `jest` or similar unit test frameworks).


## Rendering Tests

Rendering tests involve creating a `Deck` instance with known props, capturing the pixel output of the canvas, and then comparing the result against a "golden image". Tools such as [puppeteer](https://pptr.dev/) and [Selenium](https://www.selenium.dev/) have extensive capabilities that allow programatical control of such a process. 

One of the core features of this module is to validate layers through rendering tests. This is supported through [SnapshotTestRunner](./snapshot-test-runner.md), which works with probe.gl's [BrowserTestDriver](https://uber-web.github.io/probe.gl/docs/modules/test-utils/browser-test-driver) (which uses Puppeteer) out of the box but can also work with a custom testing stack with some plumbing.

The current test utilities are focused on the testing of layers. To test the render output of an application that uses deck.gl, a common technique is to run a rendering test of the whole application using mock input.

Future work might include running rendering tests directly in Node.js using a Node implementation of WebGPU.
