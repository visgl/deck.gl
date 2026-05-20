This is a minimal standalone version of the ArcGIS Integration example
on [deck.gl](http://deck.gl) website.

Note that this example demonstrates using deck.gl as an ArcGIS addon. This approach subjects to API and behavior changes in the ArcGIS for JavaScript library. For other base map options, visit the project templates in [get-started](/examples/get-started).

### Usage

From the deck.gl repository root, install workspace dependencies and run this example from its directory.

```bash
# From the deck.gl repository root
yarn install

# From this example directory
yarn start
```

### Data Source

The 3D buildings data is provided by [Precision Light Works (PLW)](https://www.precisionlightworks.com/) and served from [ESRI](https://www.arcgis.com/home/item.html?id=d3344ba99c3f4efaa909ccfbcc052ed5).

To build your own application with deck.gl and ArcGIS for JavaScript, check out the [documentation of @deck.gl/arcgis module](../../../docs/api-reference/arcgis/overview.md)
