This is a minimal standalone version of the Old Maps (BitmapLayer) example
on [deck.gl](http://deck.gl) website.

### Usage

Copy the content of this folder to your project. 

```bash
# install dependencies
npm install
# or
yarn
# bundle and serve the app with vite
npm start
```

### Data source

The scanned historical maps are georeferenced by the community on [Map Warper](https://mapwarper.net). Each warped map was downloaded once as a Web Mercator image and is hosted in [deck.gl-data](https://github.com/visgl/deck.gl-data/tree/master/examples/old-maps), then placed on the basemap with the map's bounding box. The original sources of the scans are unknown.

To use your own images, check out
the [documentation of BitmapLayer](../../../docs/api-reference/layers/bitmap-layer.md).

### Basemap

The basemap in this example is provided by [CARTO free basemap service](https://carto.com/basemaps). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services)
