# deck.gl Examples

Package-managed deck.gl examples are installed as Yarn workspaces from the
repository root. You can still copy an example folder to your own project, but
replace any `workspace:*` deck.gl dependencies with published version ranges
before installing it outside this monorepo.

## Examples Catalog

### [Get-Started Examples](./get-started)

These are intended to be absolutely minimal (in terms of application code,
package.json, bundler config etc) examples of how to get deck.gl and a base
map working together.

* **[Pure JS](./get-started/pure-js)** Applications without depending any additional framework. Bundled and served with [Vite](https://vitejs.dev).
* **[React](./get-started/react)** React examples using `@deck.gl/react` and `react-map-gl`. Bundled and served with [Vite](https://vitejs.dev).
* **[Scripting](./get-started/scripting)** HTML single-file examples that can be opened directly in a browser.


### [Website Examples](./website)

These are stand-alone versions of the examples in the [deck.gl
website](https://deck.gl), with smaller uncompressed data sets to make it easy to understand
how they work.


### [Playground](./playground)

This is the [deck.gl
playground demo](https://deck.gl/playground), showcasing declaratively defining layers using `@deck.gl/json`.


### [Scripting Gallery](./gallery)

This contains the source of the [deck.gl
gallery page](https://deck.gl/gallery), showcasing scripting with pre-bundled deck.gl modules.


### [Layer Browser](./layer-browser)

The Layer Browser enables testing of props for all official layers and effects.
This is the main example used for testing layers during development of deck.gl.


### [Experimental Examples](./experimental)

These are examples that use experimental deck.gl features, or implement features that we consider adding to the deck.gl API. We think they are useful to advanced users, but not yet mature enough to be an "official" example on the website.


## Installing and Running

Install dependencies once from the deck.gl repository root:

```bash
yarn install
```

Then run an example from its own directory:

```bash
cd examples/get-started/pure-js/basic
yarn start
```

Refer to the README in each example directory for app-specific instructions.


### Running Examples Against deck.gl Source Code

Examples that support local-source development have a `start-local` script in
their `package.json`:

```bash
yarn start-local
```
