## Example: Use deck.gl with harp.gl

Uses [Webpack](https://github.com/webpack/webpack) to bundle files and serves it
with [webpack-dev-server](https://webpack.js.org/guides/development/#webpack-dev-server).

## Usage

To run this example, you need a [HERE maps API key](https://developer.here.com/). You can either set an environment variable:

```bash
export HereApiKey=<your_api_key>
```

Or set `API_KEY` directly in `app.js`.

Install dependencies once from the deck.gl repository root:

```bash
# From the deck.gl repository root
yarn install
```

Commands:
* `yarn start` is the development target, to serve the app and hot reload.
* `yarn build` is the production target, to create the final bundle and write to disk.
