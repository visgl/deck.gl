This is a minimal standalone version of the GeoJsonLayer example
on [deck.gl](http://deck.gl) website that demonstrates viewport animation using 'AnimatationMapController'.

### Usage
Copy the content of this folder to your project. Run
```
npm install
npm start
```

### Data format
Sample data is stored in [deck.gl Example Data](https://github.com/uber-common/deck.gl-data/tree/master/examples/geojson). To use your own data, checkout
the [documentation of GeoJsonLayer](../../docs/layers/geojson-layer.md).

### Viewport animation
Viewports pitch and bearing are animated between two sets of values repeatedly.
An easing function is provided to simulate elastic in and out animation.
