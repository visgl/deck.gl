# Building Apps

This article discusses considerations in building and deploying applications that contain deck.gl.


## Package Format

Starting from v9.0, deck.gl is fully [ES module](https://nodejs.org/api/packages.html) compliant with support for both ESM-style `import` and CommonJS-style `require()`.

When installed from npm, each submodule provides the following entry points:

| Entry     | Type | Description   |
| ---        | ---         | --- |
| `dist/index.js` | ESM (import)      | Code is only lightly transpiled to target ES2020. Tree-shakable. |
| `dist/index.cjs` | CommonJS (require)    | Code is bundled without dependencies, and transpiled to target Node16. Not tree-shakable. |
| `dist.min.js` | UMD (script tag) | Code is bundled with dependencies, and transpiled to target `['chrome110', 'firefox110', 'safari15']` then minified. |
| `dist/dist.dev.js` | UMD (script tag) | Same as above, but not minified. |

Although the packages are designed to work with the widest range of use cases, it's going to be much easier if you work with an up-to-date development framework.

### Known issues

- Some older bundlers may not support the latest syntax featuers (e.g. Webpack 4 does not recognize optional chaining). You need to use a Babel plugin  and tell it to include `node_modules` with `@babel/preset-ev`.
- Frameworks such as `Next.js` and `Gatsby` leverage Server Side Rendering to improve page loading performance. For projects that do not use `type: "module"` in their package.json, SSR may fail with an error message `Error: require() of ES Module 'xxx'`. This is because some of deck.gl's upstream dependencies, such as `d3`, have opted to become ESM-only and no longer support `require()`. See [possible solutions](https://github.com/visgl/deck.gl/issues/7735).
- Although enormous efforts have been put into converting the deck.gl and its upstream libraries' code base into TypeScript, some part of the legacy code paths may not meet strict type requirements, such as `noImplicitAny` and `strictNullChecks`. You may need to set `skipLibCheck: true` in your project's `tsconfig` to unblock compilation.


## Bundle Size

deck.gl provides a lot of functionality and the amount of code these libraries contain will unsurprisingly impact the size of your application bundle and your startup load time.

deck.gl is designed from the ground up to be highly extensible. Visualization types are supported by different layers; additional layer features can be added by layer extensions; more data formats can be supported by loaders.gl submodules. The core is fairly lean, and each functionality is self-contained, so that applications do not have to bundle things that they don't need. Because modern build tools support tree shaking, most new features added do not have a visible size impact on existing applications.

Starting with v9.4, applications that only target WebGL2 can further reduce bundle size by configuring their bundler to resolve the custom [`package.json` export condition](https://nodejs.org/api/packages.html#conditional-exports) `visgl:webgl-only`. Packages that contain WebGPU implementations, including `@deck.gl/core`, `@deck.gl/layers`, and the `@deck.gl/*-layers` packages, then resolve to builds with WebGPU branches and WGSL shader sources removed while preserving their normal public API and tree-shaking behavior. The default export remains WebGPU-enabled, so applications that use WebGPU should not enable this condition. Refer to your build tool's documentation for adding custom conditions: [esbuild `conditions`](https://esbuild.github.io/api/#conditions), [Vite `resolve.conditions`](https://vite.dev/config/shared-options.html#resolve-conditions) (also available in [Vitest through Vite configuration](https://vitest.dev/config/)), [Rollup `exportConditions`](https://github.com/rollup/plugins/tree/master/packages/node-resolve#exportconditions), [webpack `resolve.conditionNames`](https://webpack.js.org/configuration/resolve/#resolveconditionnames), or [Rspack `resolve.conditionNames`](https://rspack.dev/config/resolve.html#resolveconditionnames).

deck.gl maintainers are conscious about how design decisions and code changes impact bundle size. The test harness has a script that evaluates the size of a minified bundle after each build. The following numbers are offered for your reference.

| Imports        | Bundle size | Compressed | Bundle size (WebGL only) | Compressed (WebGL only) | Comments |
| ---            | ---         | ---        | ---                      | ---                     | ---      |
| Deck + Layer   | 504.9 kb    | 146.8 kb   | 493.6 kb                 | 144.5 kb                | Minimal core; baseline      |
| DeckGL (React) | 13.6 kb     | 5.2 kb     | 13.6 kb                  | 5.2 kb                  |          |
| HexagonLayer   | 50.9 kb     | 14.4 kb    | 40.2 kb                  | 12.5 kb                 |          |
| GeoJsonLayer   | 167.4 kb    | 46.9 kb    | 129.6 kb                 | 39.5 kb                 | Includes the most commonly used primitive layers:<br/> ScatterplotLayer, IconLayer, TextLayer, PathLayer, PolygonLayer  |
| MVTLayer       | 283.4 kb    | 82.1 kb    | 245.6 kb                 | 74.6 kb                 | GeoJsonLayer + TileLayer + MVT loader  |
| Tile3DLayer    | 355.4 kb    | 106.1 kb   | 343.9 kb                 | 103.7 kb                | ScenegraphLayer + SimpleMeshLayer + GLTF loader + 3D tiles loader   |

* Numbers measured using v9.4.0-alpha.2.
* Each row is an independent bundle that exposes only the listed class or classes. Rows after the first externalize `@deck.gl/core` and its direct `@luma.gl/*` dependencies to show their incremental impact on an application that already includes the core bundle.
* Bundled and minified by esbuild targeting evergreen browsers using `--tsconfig=test/size/tsconfig.json`. The WebGL-only columns additionally use `--conditions=visgl:webgl-only`.
* Compressed bundle sizes are calculated using `gzip -9`. Consider using slower `brotli` compression for static assets, it typically provides an additional 20% reduction.
