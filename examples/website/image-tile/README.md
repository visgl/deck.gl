This is a standalone high resolution image example using TileLayer and BitmapLayer, with non-geospatial coordinates
on the [deck.gl](http://deck.gl) website.

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

A DeepZoom pyramid was created from a [source image](http://lroc.sese.asu.edu/posts/293).
If you have [libvips](https://github.com/libvips/libvips) installed,
you can run something from the command line like:

```bash
vips dzsave wac_nearside.tif moon.image --tile-size 512 --overlap 0
```

For more information, check out
the [documentation of TileLayer](../../../docs/api-reference/geo-layers/tile-layer.md).
