## Example: Use deck.gl with Google Maps

Uses [Vite](https://vitejs.dev/) to bundle and serve files.

## Usage

To run this example, you need a [Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key) and a [map id](https://developers.google.com/maps/documentation/javascript/webgl#vector-id). You can either set an environment variable:

```bash
export GoogleMapsAPIKey=<google_maps_api_key>
export GoogleMapsMapId=<google_maps_map_id>
```

Or set the `GOOGLE_MAPS_API_KEY` and `GOOGLE_MAP_ID` variables in `app.js`.

Install dependencies once from the deck.gl repository root:

```bash
# From the deck.gl repository root
yarn install
```

Commands:
* `yarn start` is the development target, to serve the app and hot reload.
* `yarn build` is the production target, to create the final bundle and write to disk.
