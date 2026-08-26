This is a minimal standalone version of the PathStyleExtension example on the [deck.gl](https://deck.gl) website.

The example uses PathLayer to draw a street diagram with solid, dashed, justified, and offset paths.

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

### Path styling

The example demonstrates how to:

- supply dash patterns with `getDashArray` and choose meter or pixel units with `dashUnits`;
- continue dash phase across an entire path with `dashMode: 'path'`;
- fit a pattern to a path with `dashJustified`;
- make dash gaps pickable with `dashGapPickable`;
- offset paths from their centerline with `getOffset`;
- use `updateTriggers` to reactively update accessor-driven styles.

Click a rendered feature to inspect the values used to draw it. See the [PathStyleExtension documentation](../../../docs/api-reference/extensions/path-style-extension.md) and [PathLayer documentation](../../../docs/api-reference/layers/path-layer.md) for the complete API.

### Data format

The sample is a pinned street-design snapshot from the City of Seattle Department of Transportation. Replace it with any data that can supply paths and styling attributes to PathLayer.

### Basemap

The basemap is provided by the [CARTO free basemap service](https://carto.com/basemaps). To use a different basemap, see the [base map guide](../../../docs/get-started/using-with-map.md).
