This is a standalone version of the TextLayer example on [deck.gl](http://deck.gl) website.

![tagmap](https://raw.githubusercontent.com/rivulet-zhang/rivulet-zhang.github.io/master/dataRepo/static/tagmap.png)

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

### Data format

Sample data can be found [here](https://rivulet-zhang.github.io/dataRepo/tagmap/hashtags10k.json), showing [Twitter](https://developer.twitter.com/) hashtags with geolocations.

To use your own data, check out
the [documentation of TextLayer](../../../docs/api-reference/layers/text-layer.md).

### Basemap

The basemap in this example is provided by [CARTO free basemap service](https://carto.com/basemaps). To use an alternative base map solution, visit [this guide](https://deck.gl/docs/get-started/using-with-map#using-other-basemap-services)
