This is a minimal standalone version of the Mapbox Integration example
on [deck.gl](http://deck.gl) website.

Note that this example demonstrates using deck.gl [as a Mapbox addon](https://medium.com/vis-gl/deckgl-and-mapbox-better-together-47b29d6d4fb1). This approach subjects to API and behavior changes in the Mapbox GL JS library. For alternative ways to use deck.gl with Mapbox, visit the project templates in [get-started](/examples/get-started).


### Usage

Copy the content of this folder to your project. 

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

### Basemap

The basemap in this example is provided by [CARTO free basemap service](https://carto.com/basemaps). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services-or-your-own)
