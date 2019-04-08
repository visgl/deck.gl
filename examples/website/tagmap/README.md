This is a standalone version of the TagMap example built upon [deck.gl](http://deck.gl).

![tagmap](https://raw.githubusercontent.com/rivulet-zhang/rivulet-zhang.github.io/master/dataRepo/static/tagmap.png)

### Usage

Copy the content of this folder to your project. 

To see the base map, you need a [Mapbox access token](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/). You can either set an environment variable:

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

### Data format
Sample data can be found [here](https://rivulet-zhang.github.io/dataRepo/tagmap/hashtags10k.json).
