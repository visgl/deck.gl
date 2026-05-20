This is a standalone high resolution image example using TileLayer and BitmapLayer, with non-geospatial coordinates
on the [deck.gl](http://deck.gl) website.

### Usage

From the deck.gl repository root, install workspace dependencies and run this example from its directory.

```bash
# From the deck.gl repository root
yarn install

# From this example directory
yarn start
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
