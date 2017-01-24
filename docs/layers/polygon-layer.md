# Polygon Layer

The Polygon Layer renders filled polygons.
* The polypgons can be simple or complex (complex polygons are polygons with holes).
   * A simple polygon specified as an array of vertices, each vertice being an array
     of two or three numbers
   * A complex polygon is specified as an array of simple polygons, the
     first polygon representing the outer outline, and the remaining polygons
     representing holes. These polygons are expected to not intersect.

    import {PolygonLayer} from 'deck.gl';

    new PolygonLayer({
      data: [
      	[],
      	[]
      ]
    });

Remarks:
* This layer only renders filled polygons. If you need to render polygon
  outlines, use the [`PathLayer`](/docs/layers/path-layer.md)
* Polygons are always closed, i.e. there is an implicit line segment between
  the first and last vertices, when those vertices are not equal.
* The specification of complex polygons intentionally follows the GeoJson
  conventions for representing polugons with holes.

Inherits from all [Base Layer properties](/docs/layers/base-layer.md).


## Layer-specific Properties

### Accessors

#### `getPolygon` (Function, optional)

- default: object => object

Like any deck.gl layer, the polygon accepts a data prop which is expected to
be an iterable container of objects, and an accessor
that extracts a polygon (simple or complex) from each object.

This accessor returns the polygon corresponding to an object in the `data` stream.


#### `getColor` (Function, optional)

The fill color for the polygon




