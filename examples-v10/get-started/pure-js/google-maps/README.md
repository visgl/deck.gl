## Example: Use deck.gl with Google Maps

Uses [Vite](https://vitejs.dev/) to bundle and serve files.

## Usage

To run this example, you need a [Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key) and a [map id](https://developers.google.com/maps/documentation/javascript/webgl#vector-id). You can either set an environment variable:

```bash
export GoogleMapsAPIKey=<google_maps_api_key>
export GoogleMapsMapId=<google_maps_map_id>
```

Or set the `GOOGLE_MAPS_API_KEY` and `GOOGLE_MAP_ID` variables in `app.js`.

To install dependencies:

```bash
npm install
# or
yarn
```

Commands:
* `npm start` is the development target, to serve the app and hot reload.
* `npm run build` is the production target, to create the final bundle and write to disk.
