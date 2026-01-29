This is a minimal standalone version of the DeckGL React widgets example
on [deck.gl](http://deck.gl) website.

## Usage

To run this example, you need a [Mapbox access token](https://docs.mapbox.com/help/tutorials/get-started-tokens-api/). You can either set an environment variable:

```bash
export MapboxAccessToken=<mapbox_access_token>
```

Or set `MAPBOX_TOKEN` directly in `app.jsx`.

Other options can be found at [using with Mapbox GL](https://deck.gl/docs/get-started/using-with-mapbox-gl).

```bash
# install dependencies
npm install
# or
yarn
# bundle and serve the app with vite
npm start
```

## Data format

Sample data is from [Natural Earth](http://www.naturalearthdata.com/) via [geojson.xyz](http://geojson.xyz/).

## Features

This example demonstrates:
- Using React.StrictMode with deck.gl widgets
- Integrating DeckGL with react-map-gl
- Using declarative widget components (FullscreenWidget, ZoomWidget, CompassWidget)
- Proper cleanup of widgets in StrictMode to avoid duplicate widget instances
