## Example: Use deck.gl with MapTiler

Uses [Vite](https://vitejs.dev/) to bundle and serve files.

## Usage

To run this example, you need a [MapTiler API key](https://cloud.maptiler.com/account/keys/). You can either set an environment variable:

```bash
export MapTilerApiKey=<YOUR_MAPTILER_API_KEY_HERE>
```

Or set `maptilersdk.config.apiKey` directly in `app.jsx`.

To install dependencies:

```bash
npm install
# or
yarn
```

Commands:
* `npm start` is the development target, to serve the app and hot reload.
* `npm run build` is the production target, to create the final bundle and write to disk.

### Basemap

The basemap in this example is provided by [MapTiler](https://www.maptiler.com/maps/). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services)
