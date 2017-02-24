# Customizing Existing Layers

It is often possible to modify the behavior of an existing layer using
either using an composite (or "adaptor") layer, or through subclassing.

## Composing Layers

### Adaptor Layers

Sometimes an existing layer renders the right thing, but it would be desirable
that it had another interface (different accessors), or performed aggregation on
its data.

Examples could be:
* Creating an `S2Layer` with an accessor that takes
  [S2](https://code.google.com/archive/p/s2-geometry-library/)
  tokens, uses the S2 library to calculates the polygons corresponding
  to that cell, and renders it using e.g. the PolygonLayer.
* Adding aggregation to an existing layer.
  By default, deck.gl layers render one graphical element for each element in
  the `data` prop. But in some cases, e.g. heatmaps, the data needs to be
  aggregated (or "binned") into cells before rendering. An adaptor in
  the form of a composite layer is a great way of organizing this.

In fact several core deck.gl layers, like the GeoJsonLayer and the GridLayer
are written as composite "adapter" layers.


##$ Collection Layers

Often a more complex visualization consists of a number of layers that are
rendered after breaking down a common set of props. It can be helpful
to collect the code that does this breakdown into a single composite layer.


### Considerations when using Composite Layers

* Forwarding properties
* Map `updateTriggers`
* Picking index handling.


## Subclassing Layers

deck.gl layers are designed to be subclassed in order to add features.
Subclassing allows redefining both layer life cycle methods as well as
the vertex and/or fragment shaders.

If a small feature is missing from a layer, subclassing can often be a
good technique to add it.

## Example - Adding per-segment color to PathLayer

```
// Example by @dcposch
import {PathLayer} from 'deck.gl';

// Accesor: `getColor` (Function, optional)
// Returns an color (array of numbers, RGBA) or array of colors (array of arrays).

export default MultiColorPathLayer extends PathLayer {
   calculateColors(attribute) {
     const {data, getColor} = this.props;
     const {paths, pointCount} = this.state;
     const {size} = attribute;
     const colors = new Uint8ClampedArray(pointCount * size * 2);

      let i = 0;
      paths.forEach((path, index) => {
        const color = getColor(data[index], index) || DEFAULT_COLOR;
        if (Array.isArray(color[0])) {
          if (color.length !== path.length) {
            throw new Error('PathLayer getColor() returned a color array, but the number of '
             `colors returned doesn't match the number of points in the path. Index ${index}`);
          }
          color.forEach((pointColor) => {
            const alpha = isNaN(pointColor[3]) ? 255 : pointColor[3];
            // two copies for outside edge and inside edge each
            colors[i++] = pointColor[0];
            colors[i++] = pointColor[1];
            colors[i++] = pointColor[2];
            colors[i++] = alpha;
            colors[i++] = pointColor[0];
            colors[i++] = pointColor[1];
            colors[i++] = pointColor[2];
            colors[i++] = alpha;
          });
        } else {
          const pointColor = color;
          if (isNaN(pointColor[3])) {
            pointColor[3] = 255;
          }
          for (let ptIndex = 0; ptIndex < path.length; ptIndex++) {
            // two copies for outside edge and inside edge each
            colors[i++] = pointColor[0];
            colors[i++] = pointColor[1];
            colors[i++] = pointColor[2];
            colors[i++] = pointColor[3];
            colors[i++] = pointColor[0];
            colors[i++] = pointColor[1];
            colors[i++] = pointColor[2];
            colors[i++] = pointColor[3];
          }
        }
      });
     attribute.value = colors;
   }
}
```
