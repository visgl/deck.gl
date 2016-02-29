# deck.gl

A WebGL overlay suite providing of multiple layers.

![screenshot](screenshot.png)

Design goals:
- Enable highly performant WebGL overlays in 2 and 3 dimensions.
- Support efficient WebGl in a data flow architecture application using React.
- Special focus on buffer management, allowing both automatic buffer updates
  but also full application control of buffer allocation and management
- Comes with tested, performant layers for basic data visualization use cases.
- Allows easy creation of custom WebGL layers by subclassing `Layer`.


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
  * `longitude` (number, required) longitude of the map center
  * `latitude` (number, required) latitude of the map center
  * `zoom` (number, required) zoom level of the map

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
  * `longitude` (number, required) longitude of the map center
  * `latitude` (number, required) latitude of the map center
  * `zoom` (number, required) zoom level of the map
  * `opacity` (number, required) opacity of the layer
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
    * `isPickable` [bool, optional, default=false] whether layer responses to
    mouse events

    **Layer-specific Parameters**

    * `data` (array, required) array of objects: [{ position, color }, ...]
    * `unitWidth` [number, optional, default=100] unit width of the bins
    * `unitHeight` [number, optional, default=100] unit height of the bins


## Notes on data and buffer management

deck.gl Layers were designed with data flow architectures like React in mind.

### Data Management with Buffer update callbacks

The `data` property will accept any containers that can be iterated over using
ES6 for-of iteration, this includes e.g. native Arrays, ES6 Sets and Maps,
all Immutable.js containers etc. The notable exception are native JavaScript
object maps. It is recommended to use ES6 Maps instead.

It is recommended, but not required, to use immutable data (containers AND
objects) as it ensures that changes to `data` property trigger a rerender. 
(See the notes on `rerenderCount` and `updateCount` properties.)

The layer will expect each object to provide a number of "attributes" that it
can use to set the GL buffers. By default, the layer will look for these
attributes to be available as fields directly on the objects during iteration
over the supplied data set. To gain more control of attribute access and/or
to do on-the-fly calculation of attributes, 

#### Manual Buffer Management

For ultimate performance and control of updates, the application can do its
own management of the glbuffers. Each Layer can accept buffers directly as
props.

**Note:** The application can provide some buffers and let others be managed
by the layer. As an example management of the `pickingColors` buffer is
normally left to the layer.

**Note**: A layer only renders when a property change is detected. For
performance reasons, property change detection uses shallow compare,
which means that mutating an element inside a buffer or a mutable data array
does not register as a property change, and thus does not trigger a rerender.
To force trigger a render after mutating buffers, simply increment the
`renderCount` property. To force trigger a buffer update after mutating data,
increment the `updateCount` property.


WebGL layers need to populate typed array buffers
Callbacks will 


## Example
```
npm run start
```

## Data source

https://data.sfgov.org/
