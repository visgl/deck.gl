# deck.gl

A WebGL overlay suite consists of multiple layers.

## Installation

```
npm install --save deck.gl
```

## Usage

```
import {
  WebGLOverlay,
  /* import layers here */
} from 'deck.gl';

const mapState = {
  latitude: 37.55,
  longitude: -122.2,
  zoom: 9,
  ...
}

<WebGLOverlay
  width={1920}
  height={1080}
  mapState={mapState},  // optional
  layers={[/* put layer instances here */]}
/>
```
---

### WebGLOverlay:

* **webgl-overlay**
A react component that takes in viewport parameters, layer instances and
generates an overlay consists of single/multiple layers sharing the same
rendering context. Internally, the webgl-overlay initializes a WebGL context
attached to a canvas element, sets up the animation loop and calls provided
callbacks on initial load and for each rendering frames. The webgl-overlay
also handles events propagation across layers, and prevents unnecessary
calculation taking advantage of the react lifecycle functions.

  **Parameters**
  * `width` (number, required) width of the canvas
  * `height` (number, required) height of the canvas
  * `mapState` [object, optional] viewport information, used to determine
  whether a re-calcualtion should be triggered

  **Callbacks**
  * `onAfterRender` [function, optional] callback after rendering is finished
  for the current frame

### Supported Layers:

* #### Choropleth Layer
The Choropleth Layer takes in [GeoJson](http://geojson.org/) formatted data and
renders it as interactive choropleths.

  **Common Parameters**

  * `id` (string, required): layer ID
  * `width` (number, required) width of the layer
  * `height` (number, required) height of the layer
  * `opacity` (number, required) opacity of the layer
  * `layerIndex` [number, optional, default=0] index of the layer
  * `isPickable` [bool, optional, default=false] whether layer responses to
  mouse events

  **Layer-specific Parameters**

  * `data` (object, required) input data in GeoJson format
  * `drawContour` [bool, optional, default=false] draw choropleth contour if
  true, else fill choropleth area

  **Callbacks**

  * `onChoroplethHovered` [function, optional] bubbles choropleth properties
  when mouse hovering
  * `onChoroplethClicked` [function, optional] bubbles choropleth properties
  when mouse clicking

* #### Hexagon Layer
  The Hexagon Layer takes in a list of hexagon objects and renders them as
  interactive hexagons.

    **Common Parameters**

    * `id` (string, required): layer ID
    * `width` (number, required) width of the layer
    * `height` (number, required) height of the layer
    * `opacity` (number, required) opacity of the layer
    * `layerIndex` [number, optional, default=0] index of the layer
    * `isPickable` [bool, optional, default=false] whether layer responses to
    mouse events

    **Layer-specific Parameters**

    * `data` (array, required) array of hexagon objects: [{ centroid, vertices,
    color }, ...]
    * `dotRadius` [number, optional, default=10] radius of each hexagon
    * `elevation` [number, optional, default=0.02] height scale of hexagons
    * `lightingEnabled` [bool, optional, default=false] whether lighting is
    enabled

    **Callbacks**

    * `onHexagonHovered` [function, optional] bubbles selection index when mouse
    hovering
    * `onHexagonClicked` [function, optional] bubbles selection index when mouse
    clicking

* #### Scatterplot Layer
  The Scatterplot Layer takes in and renders an array of latitude and longitude
  coordinated points.

    **Common Parameters**

    * `id` (string, required): layer ID
    * `width` (number, required) width of the layer
    * `height` (number, required) height of the layer
    * `opacity` (number, required) opacity of the layer
    * `layerIndex` [number, optional, default=0] index of the layer
    * `isPickable` [bool, optional, default=false] whether layer responses to
    mouse events

    **Layer-specific Parameters**

    * `data` (array, required) array of objects: [{ position, color }, ...]
    * `radius` [number, optional, default=10] radius of each marker

* #### Arc Layer
  The Arc Layer takes in paired latitude and longitude coordinated points and
  render them as arcs that links the starting and ending points.

    **Common Parameters**

    * `id` (string, required): layer ID
    * `width` (number, required) width of the layer
    * `height` (number, required) height of the layer
    * `opacity` (number, required) opacity of the layer
    * `layerIndex` [number, optional, default=0] index of the layer
    * `isPickable` [bool, optional, default=false] whether layer responses to
    mouse events

    **Layer-specific Parameters**

    * `data` (array, required) array of objects: [{ position: {x0, y0, x1, y1},
    color }, ...]

* #### Grid Layer
  The Grid Layer takes in an array of latitude and longitude coordinated points,
  aggregates them into histogram bins and renders as a grid.

    **Common Parameters**

    * `id` (string, required): layer ID
    * `width` (number, required) width of the layer
    * `height` (number, required) height of the layer
    * `opacity` (number, required) opacity of the layer
    * `layerIndex` [number, optional, default=0] index of the layer
    * `isPickable` [bool, optional, default=false] whether layer responses to
    mouse events

    **Layer-specific Parameters**

    * `data` (array, required) array of objects: [{ position, color }, ...]
    * `unitWidth` [number, optional, default=100] unit width of the bins
    * `unitHeight` [number, optional, default=100] unit height of the bins


## Example
```
npm run start
```

## Data source

https://data.sfgov.org/
