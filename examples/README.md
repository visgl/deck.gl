# deck.gl Examples

All deck.gl examples are set up to be "stand-alone", which means that
you can copy the example folder to your own environment, run `yarn` or `npm install`
and `npm start` and within minutes have a running, minimal app that you can
start modifying and experimenting with.

## Examples Catalog

### [Get-Started Examples](./get-started)

These are intended to be absolutely minimal (in terms of application code,
package.json, webpack config etc) examples of how to get deck.gl and a base
map working together.

* **[Pure JS](./get-started/pure-js)** Applications without depending any additional framework. Bundled with
  webpack and served with webpack-dev-server.
* **[React](./get-started/react)** React exmples using `@deck.gl/react` and `react-map-gl`. Bundled with
  webpack and served with webpack-dev-server. Transpiled with Babel.
* **[Scripting](./get-started/scripting)** HTML single-file examples that can be  opened directly in a browser.


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

Most example apps can be run by installing the dependencies with either `yarn` or with `npm install`, then `npm run start`. Refer to the README in each example directory for app-specific instructions.


### Running Examples Against deck.gl Source Code

Most examples are set up so that they can be run either
against the local source code (enabling debugging of deck.gl itself,
with hot reloading) or against an installed version of deck.gl
(enables testing that things work with the published version).

Examples that support this mode have a `start-local` script in their
`package.json`.

Look at the `webpack.config.local.js` in this directory for details.
