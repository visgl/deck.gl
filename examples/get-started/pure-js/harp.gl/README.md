<div align="center">
   <img width="150" heigth="150" src="https://webpack.js.org/assets/icon-square-big.svg" />
</div>

## Example: Use deck.gl with harp.gl

Uses [Webpack](https://github.com/webpack/webpack) to bundle files and serves it
with [webpack-dev-server](https://webpack.js.org/guides/development/#webpack-dev-server).

## Usage

To run this example, you need a [HERE maps API key](https://developer.here.com/). You can either set an environment variable:

```bash
export HereApiKey=<your_api_key>
```

Or set `API_KEY` directly in `app.js`.

To install dependencies:

```bash
npm install
# or
yarn
```

Commands:
* `npm start` is the development target, to serve the app and hot reload.
* `npm run build` is the production target, to create the final bundle and write to disk.
