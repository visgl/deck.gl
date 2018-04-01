# Building deck.gl

This article contains additional information on options for how to build deck.gl.


## Optimizing for Bundle Size

deck.gl and luma.gl provide a lot of functionality and the amount of code these libraries contain will of course impact the size of your application bundle and your startup load time.

There are multiple techniques used in JavaScript.


### Choosing a dist folder

When installed from npm, deck.gl and related libraries come with three separate `dist` sub folders.

| Folder     | `mainField` | Description   |
| ---        | ---         | --- |
| `dist/es5` | `main`      | All code is transpiled into ES5 and exports/imports are transpiled into `commonjs` requires. The main reason to use this distribution is if your bundler does not support tree-shaking using `import`/`export` |
| `dist/esm` | `module`    | Same as `dist/es5`, except |
| `dist/es6` | `esnext`    | This distribution uses `babel-preset-env` and with very few exceptions essentially untranspiled ES6/ES2015 code. This is the smallest distribution, that will three-shake best, and is intended to be the best choice if you are only targeting "evergreen" browsers. |

You will have to check the documentation of your particular bundler to see what configuration options are available.

Webpack 4 allows you to choose the folder by specifying a `resolve.mainFields` array.

Webpack 2 and later will pick `module` mainfield over `main` if it is available


### About Tree-Shaking

deck.gl was designed from the start to leverage tree-shaking. This technique has been talked about for quite some time but has been slow in actually providing the expected benefits. With the combination of webpack 4 and babel 7 we are finally starting to see significant results, so you may want to experiment with upgrading your bundler if you are not getting results.

Note that tree-shaking still has limitations:
* the analyzers tend to err on the side of safety and will still include any symbol it is not sure will never be used.
* This is compounded by the fact that there are side effects in various language that complicate or defeat the analysis, but the good news is that the analyzers are getting better.
* Naturally, and application that uses all the functionality offered by the library will benefit little from tree-shaking, whereas a small app that only uses a few layers should expect bigger savings.


### Bundle Size Number

So, what bundle size impact should you expect? When do you know if you have set up your bundler optimally. To help answer these questions, we provide some numbers you can compare against. deck.gl has scripts that measure the size of a minified bundle after each build, which allows us to provide comparison numbers between releases.

> TBA - Table needs updating

| Dist | 5.1.4 Bundle (Compressed) | 5.2.0 Bundle (Compressed) | Comments |
| ---  | ---                       | ---                       | --- |
| ES6  | N/A                       | 560 KB (160 KB)           | New dist in 5.2.0                |
| ESM  | 320 KB (80 KB)            | 712 KB (176 KB)           | Transpiled, tree-shaking enabled |
| ES5  | 388 KB (88 KB)            |                           | 100% Transpiled to ES5           |

Note that these numbers are not the final word on deck.gl bundle size. There is more work that is being done to reduce the size of deck.gl and we are confident that even as fture releases will have more functionality, we will be able to make the library code smaller and, importantly, even more "tree shakeable", with the intention that apps should only "pay for what they use".


## Remarks

* **Optmizing for minified code** - Due to inclusion of sourcemaps etc, the bundle size impact of deck.gl tends to look more significant in development builds than in the final production builds. While reducing the size of the development libraries is also desirable, the current goal is to ensure the impact of adding deck.gl on the final, minified/uglified application bundle is as small as possible.
