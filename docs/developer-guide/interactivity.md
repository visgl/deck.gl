# Adding Interactivity

> This article discusses interacting with data (i.e. selecting, or picking objects). Viewport controls (panning, zooming etc) are discussed in [Controllers](/docs/api-reference/map-controller.md).

## Overview

deck.gl includes a powerful picking engine that enables the application to precisely determine what object and layer is rendered on a certain pixel on the screen. This picking engine can either be called directly by an application (which is then typically implementing its own event handling), or it can be called automatically by the basic built-in event handling in deck.gl

### What can be Picked?

The "picking engine" identifies which object in which layer is at the given coordinates. While usually intuitive, what constitutes a pickable "object" is defined by each layer. Typically, it corresponds to one of the data entries that is passed in via `prop.data`. For example, in [Scatterplot Layer](/docs/layers/scatterplot-layer.md), an object is an element in the `props.data` array that is used to render one circle. In [GeoJson Layer](/docs/layers/geojson-layer.md), an object is a GeoJSON feature in the `props.data` feature collection that is used to render one point, path or polygon.

### Enabling Picking

Picking can be enabled or disabled on a layer-by-layer basis. To enable picking on a layer, set its [`pickable`](/docs/api-reference/layer.md#-pickable-boolean-optional-) prop to `true`. This value is `false` by default.

### The Picking Info Object

The picking engine returns "picking info" objects which contains a variety of fields describing what layer and object was picked.

| Key      | Value |
| ---      | --- |
| `layer`  | The layer that the picked object belongs to. Only layers with the `pickable` prop set to true can be picked. |
| `index`  | The index of the object in the layer that was picked. |
| `object` | The object that was picked. This is typically an entry in the layer's `props.data` array, but can vary from layer to layer. |
| `x`      | Mouse position x relative to the viewport. |
| `y`      | Mouse position y relative to the viewport. |
| `coordinate` | Mouse position in geospatial coordinates. Only applies if `layer.props.coordinateSystem` is a geospatial mode such as `COORDINATE_SYSTEM.LNGLAT`. |

> Specific deck.gl Layers may add additional fields to the picking `info` object. Check the documentation of each layer.


## Example: Display a Tooltip for Hovered Object

### Using Pure JS

```js
<canvas id="deck-canvas"></canvas>
<div id="tooltip" style="position: absolute; z-index: 1; pointer-events: none;"></div>
```

```js
import {Deck} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

const deck = new Deck({
  canvas: 'deck-canvas',
  initialViewState: {longitude: -122.45, latitude: 37.78, zoom: 12},
  controller: true,
  layers: [
    new ScatterplotLayer({
      data: [
        {position: [-122.45, 37.78], message: 'Hover over me'}
      ],
      getPosition: d => d.position,
      getRadius: 1000,
      getFillColor: [255, 255, 0],
      // Enable picking
      pickable: true,
      // Update tooltip
      onHover: info => setTooltip(info.object, info.x, info.y)
    })
  ]
});

function setTooltip(object, x, y) {
  const el = document.getElementById('tooltip');
  if (object) {
    el.innerHTML = object.message;
    el.style.display = 'block';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
  } else {
    el.style.display = 'none';
  }
}
```

### Using React

```js
import React from 'react';
import {DeckGL, ScatterplotLayer} from 'deck.gl';

class App extends React.Component {

  _renderTooltip() {
    const {hoveredObject, pointerX, pointerY} = this.state || {};
    return hoveredObject && (
      <div style={{position: 'absolute', zIndex: 1, pointerEvents: 'none', left: pointerX, top: pointerY}}>
        { hoveredObject.message }
      </div>
    );
  }

  render() {
    const layers = [
      new ScatterplotLayer({
        data: [
          {position: [-122.45, 37.78], message: 'Hover over me'}
        ],
        getPosition: d => d.position,
        getRadius: 1000,
        getFillColor: [255, 255, 0],
        // Enable picking
        pickable: true,
        // Update app state
        onHover: info => this.setState({
          hoveredObject: info.object,
          pointerX: info.x,
          pointerY: info.y
        })
      })
    ];

    return (
      <DeckGL initialViewState={{longitude: -122.45, latitude: 27.78, zoom: 12}}
          controller={true}
          layers={layers} >
        { this._renderTooltip() }
      </DeckGL>
    );
  }
}
```

## Calling the Picking Engine Directly

The picking engine is exposed through the [`Deck.pickObject`](/docs/api-reference/deck.md) and [`Deck.pickObjects`](/docs/api-reference/deck.md) methods. These methods allow you to query what layers and objects within those layers are under a specific point or within a specified rectangle. They return `Picking Info` objects as described below.

`pickObject` allows an application to define its own event handling. When it comes to how to actually do event handling in a browser, there are many options. In a React application, perhaps the simplest is to just use React's "synthetic" event handling together with `pickObject`:

```js
class MyComponent extends React.Component {
  ...
  onClickHandler = (event) => {
    const pickInfo = this.deckGL.pickObject({x: event.clientX, y: event.clientY, ...});
    console.log(pickInfo.coordinate);
  }

  render() {
    return (
      <div onClick={this.onClickHandler}>
        <DeckGL ref={deck => { this.deckGL = deck; }} .../>
      </div>
    );
  }
}
```

Also note that by directly calling `queryObject`, integrating deck.gl into an existing application often becomes easier since you don't have to change the application's existing approach to event handling.

## Using the Built-in Event-Handling

For applications that have basic event handling needs, deck.gl has built-in support for handling selected pointer events. When the application registers callbacks, deck.gl automatically tracks these events, runs the picking engine and calls application callbacks with a single parameter `info` which contains the resulting picking info object.

The following event handlers are supported:

- `onHover`
- `onClick`
- `onDragStart`
- `onDrag`
- `onDragEnd`

A event handler function is called with two parameters: `info` that contains the object being interacted with, and `event` that contains the pointer event.

There are two ways to subscribe to the built-in picking event handling:

* Specify callbacks for each pickable layer by passing [event handler props](/docs/api-reference/layer.md#interaction-properties):

```js
const layer = new ScatterplotLayer({
    ...
    pickable: true,
    onHover: (info, event) => console.log('Hovered:', info, event),
    onClick: (info, event) => console.log('Clicked:', info, event)
});
```

* Specify callbacks for all pickable layers by setting [event handler props](/docs/api-reference/react/deckgl.md#event-callbacks) of the `DeckGL` canvas:

```js
<DeckGL
    ...
    onHover={this._onHover}
    onClick={this._onClick}
/>
```

### Behavior of Built-in Event Handling

Picking events are triggered based on *pickable objects*:

* A `click` event is triggered every time the pointer clicked on an object in a pickable layer.
* A `hover` event is triggered every time the hovered object of a pickable layer changes.

When an event is fired, the `onHover` or `onClick` callback of the affected layer is called first. If the callback returns a truthy value, the event is marked as handled. Otherwise, the event will bubble up to the `DeckGL` canvas and be visible to its `onHover` and `onClick` callbacks.


## Under The Hood

If you are using the core layers, all has been taken care of.

If you are implementing a custom layer, read more about
[how picking is implemented](/docs/developer-guide/custom-layers/picking.md).
