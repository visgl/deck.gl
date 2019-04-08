<div align="center">
  <img src="https://cdn.pbrd.co/images/vAmSmehU.png" />
</div>

## Example: Use deck.gl with react-map-gl and Browserify

Uses the [browserify](https://github.com/substack/node-browserify) JavaScript
bundler and applies the [babelify](https://github.com/babel/babelify) "transform",
which runs the babel transpiler on the source code, transpiling JSX and ES6
to ES5 JavaScript.


## Usage

To run this example, you need a [Mapbox access token](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/). You can either set an environment variable:

```bash
export MapboxAccessToken=<mapbox_access_token>
```

Or set `MAPBOX_TOKEN` directly in `app.js`.

Other options can be found at [using with Mapbox GL](../../../../docs/get-started/using-with-mapbox-gl.md).

To install dependencies:

```bash
npm install
# or
yarn
```

Commands:
* `npm start` is the development target, to serves the app and hot reload.
* `npm run build` is the production target, to create the final bundle and write to disk.
