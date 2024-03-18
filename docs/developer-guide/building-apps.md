# Building Apps

This article contains additional information on options for how to build deck.gl.


## Optimizing for Bundle Size

deck.gl and luma.gl provide a lot of functionality and the amount of code these libraries contain will of course impact the size of your application bundle and your startup load time.

There are multiple techniques used in JavaScript.


### Choosing an entry point

When installed from npm, deck.gl and related libraries come with two separate distributions.

| Directory     | `mainField` | Description   |
| ---        | ---         | --- |
| `dist/es5` | `main`      | All code is transpiled to be compatible with the most commonly adopted evergreen browsers (see below). Exports/imports are transpiled into `commonjs` requires. The main reason to use this distribution is under Node.js (e.g. unit tests), or if your bundler does not support tree-shaking using `import`/`export`. |
| `dist/esm` | `module`    | Same as `dist/es5`, except `export` and `import` statements are left untranspiled to enable tree shaking. |

You will have to check the documentation of your particular bundler to see what configuration options are available. Webpack picks `module` main field over `main` if it is available. You can also explicitly choose one distribution by specifying a `resolve.mainFields` array.

The transpilation target is set to `>0.2%, maintained node versions, not ie 11, not dead, not chrome 49` resolved by [browserslist](https://github.com/browserslist/browserslist). To support older or less common browsers, you may use `@babel/preset-ev` in your babel settings and include `node_modules`.


### About Tree-Shaking

deck.gl was designed from the start to leverage tree-shaking. This technique has been talked about for quite some time but has been slow in actually providing the expected benefits. With the combination of webpack 4 and babel 7 we are finally starting to see significant results, so you may want to experiment with upgrading your bundler if you are not getting results.

Note that tree-shaking still has limitations:

* At least in webpack, tree shaking is done by the uglifier, which is typically only run on production builds, so it is typically not possible to assess the benefits of tree shaking during development. In addition, this makes it even harder to make statements about bundle size impact from looking at bundle sizes in development builds. The recommendation is to always measure impact on your final production builds.
* Static dependency analyzers err on the side of safety and will still include any symbol it is not sure will never be used.
* This is compounded by the fact that there are side effects in various language feature that complicate or defeat current static dependency analysis techniques, causing "dead code" to still be bundled. The good news is that the analyzers are getting better.
* Naturally, an application that uses all the functionality offered by the library will benefit little from tree shaking, whereas a small app that only uses a few layers should expect bigger savings.


### Bundle Size Numbers

So, what bundle size impact should you expect? When do you know if you have set up your bundler optimally. To help answer these questions, we provide some numbers you can compare against. deck.gl has scripts that measure the size of a minified bundle after each build, which allows us to provide comparison numbers between releases.

| Entry point | 8.5 Bundle (Compressed) | 8.4 Bundle (Compressed) | Comments |
| ---  | ---                     | ---                 | ---                 |
| esm  | 398 KB (115 KB)         | 485 KB (128 KB)     | Transpiled, tree-shaking enabled   |
| es5  | 686 KB (178 KB)         | 812 KB (197 KB)     | Transpiled, no tree-shaking |

Notes:

* Numbers represent the bundle size of a minimal application, bundled with Webpack 4, which means that the untranspiled and the ESM distribution results benefit from some tree shaking.
* The number in parenthesis is the compressed bundle size. This is how much bigger you might expect your gzipped bundle to get by adding deck.gl as a dependency to your application.


### Future Work

This is not the final word on deck.gl bundle size. More work is being done to reduce the size of deck.gl and we are confident that even as future releases will have more functionality, we will be able to keep the library code from growing and, more importantly, make deck.gl even more "tree shakeable", with the intention that apps should only "pay for what they use".


## Remarks

* **Optimizing for minified code** - Due to inclusion of sourcemaps etc, the bundle size impact of deck.gl tends to look more significant in development builds than in the final production builds. While reducing the size of the development libraries is also desirable, the current goal is to ensure the impact of adding deck.gl on the final, minified/uglified application bundle is as small as possible.
* Compressed bundle sizes are calculated using `gzip -9`. Consider using slower `brotli` compression for static assets, it typically provides an additional 20% reduction.
