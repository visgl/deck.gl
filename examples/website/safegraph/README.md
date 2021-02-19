This is a minimal standalone version of the Mapbox Integration example
on [deck.gl](http://deck.gl) website.

Note that this example demonstrates using deck.gl [as a Mapbox addon](https://medium.com/vis-gl/deckgl-and-mapbox-better-together-47b29d6d4fb1). This approach subjects to API and behavior changes in the Mapbox GL JS library. For alternative ways to use deck.gl with Mapbox, visit the project templates in [get-started](/examples/get-started).


### Usage

Copy the content of this folder to your project. 

To run this example, you need a [Mapbox access token](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/). You can either set an environment variable:

```bash
export MapboxAccessToken=<mapbox_access_token>
```

Or set `MAPBOX_TOKEN` directly in `app.js`.

Other options can be found at [using with Mapbox GL](../../../docs/get-started/using-with-mapbox-gl.md).

```bash
# install dependencies
npm install
# or
yarn
# bundle and serve the app with webpack
npm start
```


### Data Source

To build your own application with deck.gl as Mapbox custom layers, check out the [documentation of @deck.gl/mapbox module](../../../docs/api-reference/mapbox/overview.md)
