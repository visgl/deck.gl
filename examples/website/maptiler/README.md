This is a minimal standalone version of the MapTiler Integration example
on [deck.gl](http://deck.gl) website.

Note that this example demonstrates using deck.gl [as a Mapbox addon](https://medium.com/vis-gl/deckgl-and-mapbox-better-together-47b29d6d4fb1). This approach subjects to API and behavior changes in the Mapbox GL JS library. For alternative ways to use deck.gl with Mapbox, visit the project templates in [get-started](/examples/get-started).


### Usage

Copy the content of this folder to your project. 

To run this example, you need a [MapTiler API key](https://cloud.maptiler.com/account/keys/). You can either set an environment variable:

```bash
export MapTilerApiKey=<YOUR_MAPTILER_API_KEY_HERE>
```

Or set `maptilersdk.config.apiKey` directly in `app.jsx`.


```bash
# install dependencies
npm install
# or
yarn
# bundle and serve the app with vite
npm start
```

### Basemap

The basemap in this example is provided by [MapTiler](https://www.maptiler.com/maps/). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services)
