## Example: Use deck.gl with react-map-gl and Mapbox

Uses [Vite](https://vitejs.dev/) to bundle and serve files.

## Usage

To run this example, you need a [Mapbox access token](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/). You can either set an environment variable:

```bash
export MapboxAccessToken=<mapbox_access_token>
```

Or set `MAPBOX_TOKEN` directly in `app.jsx`.

Other options can be found at [using with Mapbox GL](../../../../docs/developer-guide/base-maps/using-with-mapbox.md).

Install dependencies once from the deck.gl repository root:

```bash
# From the deck.gl repository root
yarn install
```

Commands:
* `yarn start` is the development target, to serve the app and hot reload.
* `yarn build` is the production target, to create the final bundle and write to disk.
